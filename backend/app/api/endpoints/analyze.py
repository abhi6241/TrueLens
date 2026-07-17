import uuid
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.db.session import get_db, db_manager
from app.models.analysis import Analysis
from app.schemas.analysis import AnalysisCreate, AnalysisResponse, DashboardStats, ClaimVerify, TaskResponse, TaskStatus
from app.core.auth import get_current_user
from app.models.user import User
from app.core.ingestion import ingest_from_url, ingest_from_pdf
from app.models.article import Article
from app.services import analysis_pipeline, embedding_service
from app.services.task_service import set_task_status, get_task_status
from app.core.rate_limit import limiter
from app.db.redis import redis_client

router = APIRouter()

import asyncio

async def run_analysis_task(task_id: str, url: Optional[str], filename: Optional[str], file_bytes: Optional[bytes], user_id: str):
    """Background task to run the full analysis pipeline."""
    try:
        await set_task_status(task_id, "processing", 5, "Ingesting content...")
        
        # 1. Ingestion
        if url:
            article_data = await asyncio.to_thread(ingest_from_url, url)
        else:
            article_data = await asyncio.to_thread(ingest_from_pdf, file_bytes, filename)
            
        async with db_manager.session_maker() as session:
            # 2. Store Article
            article = Article(
                title=article_data["title"],
                content=article_data["content"],
                author=article_data["author"],
                publication=article_data["publication"],
                published_date=article_data["published_date"],
                url=url,
                filename=filename,
                user_id=user_id
            )
            session.add(article)
            await session.flush()
            
            # 3. Process through AI Pipeline
            async def progress_cb(msg: str, prog: int):
                await set_task_status(task_id, "processing", prog, msg)
                
            pipeline_result = await analysis_pipeline.analyze(article_data, article.id, progress_callback=progress_cb)
            
            # 4. Store Analysis result
            analysis = Analysis(
                id=str(uuid.uuid4()),
                url=url,
                filename=filename,
                title=pipeline_result.title,
                author=pipeline_result.author,
                publication=pipeline_result.publication,
                published_date=pipeline_result.published_date,
                trust_score=pipeline_result.trust_score,
                bias_rating=pipeline_result.bias_rating,
                sentiment_tone=pipeline_result.sentiment_tone,
                sentiment_score=pipeline_result.sentiment_score,
                is_clickbait=pipeline_result.is_clickbait,
                is_sensational=pipeline_result.is_sensational,
                is_verified_author=pipeline_result.is_verified_author,
                summary=pipeline_result.summary,
                claims=pipeline_result.claims,
                emotion=pipeline_result.emotion,
                propaganda_score=pipeline_result.propaganda_score,
                propaganda_techniques=pipeline_result.propaganda_techniques,
                missing_perspectives=pipeline_result.missing_perspectives,
                embedding_id=pipeline_result.embedding_id,
                user_id=user_id,
                article_id=article.id
            )
            
            session.add(analysis)
            await session.commit()
            
            # Invalidate Caches
            await redis_client.delete(f"cache:list_analyses:{user_id}")
            await redis_client.delete(f"cache:dashboard_stats:{user_id}")
            
            # Finish Task
            await set_task_status(task_id, "completed", 100, "Analysis complete", result_id=analysis.id)
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        await set_task_status(task_id, "failed", 0, "An error occurred during analysis.", error=str(e))

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_202_ACCEPTED)
async def analyze_url(
    request: Request,
    payload: AnalysisCreate, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    url = payload.url
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
        
    task_id = str(uuid.uuid4())
    await set_task_status(task_id, "pending", 0, "Task queued...")
    background_tasks.add_task(run_analysis_task, task_id, url, None, None, current_user.id)
    
    return {"task_id": task_id, "status": "pending", "message": "Analysis queued for background processing."}

@router.post("/upload", response_model=TaskResponse, status_code=status.HTTP_202_ACCEPTED)
async def analyze_file(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user)
):
    filename = file.filename
    if not filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF file uploads are currently supported.")
        
    file_bytes = await file.read()
    
    task_id = str(uuid.uuid4())
    await set_task_status(task_id, "pending", 0, "Task queued...")
    background_tasks.add_task(run_analysis_task, task_id, None, filename, file_bytes, current_user.id)
    
    return {"task_id": task_id, "status": "pending", "message": "Analysis queued for background processing."}

@router.get("/task/{task_id}", response_model=TaskStatus)
async def get_task(task_id: str):
    status_data = await get_task_status(task_id)
    if not status_data:
        raise HTTPException(status_code=404, detail="Task not found or expired")
    return status_data

@router.get("/", response_model=List[AnalysisResponse])
async def list_analyses(
    limit: int = 50,
    search: str = None,
    sort_by: str = "created_at",
    order: str = "desc",
    is_bookmarked: bool = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Setup cache key (only caching if no complex search filters)
    cache_key = f"cache:list_analyses:{current_user.id}" if not search and is_bookmarked is None else None
    
    if cache_key:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)

    query = select(Analysis).where(Analysis.user_id == current_user.id)
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Analysis.title.ilike(search_term)) | 
            (Analysis.publication.ilike(search_term)) |
            (Analysis.summary.ilike(search_term))
        )
        
    if is_bookmarked is not None:
        query = query.where(Analysis.is_bookmarked == is_bookmarked)
        
    # Handling sorting
    if sort_by == "trust_score":
        order_col = Analysis.trust_score
    else:
        order_col = Analysis.created_at
        
    if order == "asc":
        query = query.order_by(order_col.asc())
    else:
        query = query.order_by(order_col.desc())
        
    query = query.limit(limit)
    result = await db.execute(query)
    analyses = result.scalars().all()
    
    # Convert to dict for caching
    analyses_dicts = []
    for analysis in analyses:
        analysis_dict = {c.name: getattr(analysis, c.name) for c in analysis.__table__.columns} if hasattr(analysis, "__table__") else vars(analysis).copy()
        if "_sa_instance_state" in analysis_dict:
            del analysis_dict["_sa_instance_state"]
        # convert datetime to string
        analysis_dict["created_at"] = analysis.created_at.isoformat() if analysis.created_at else None
        analyses_dicts.append(analysis_dict)

    if cache_key:
        await redis_client.set(cache_key, json.dumps(analyses_dicts), expire=300) # cache for 5 min
    
    return analyses

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cache_key = f"cache:dashboard_stats:{current_user.id}"
    cached_data = await redis_client.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    # Calculate stats from DB specifically for the logged-in user
    result_count = await db.execute(
        select(func.count(Analysis.id)).where(Analysis.user_id == current_user.id)
    )
    total_analyzed = result_count.scalar() or 0
    
    result_avg = await db.execute(
        select(func.avg(Analysis.trust_score)).where(Analysis.user_id == current_user.id)
    )
    avg_score = result_avg.scalar()
    avg_trust_score = int(round(avg_score)) if avg_score is not None else 0
    
    all_user_analyses_result = await db.execute(select(Analysis.claims).where(Analysis.user_id == current_user.id))
    all_claims = all_user_analyses_result.scalars().all()
    verified_facts = 0
    for claims_list in all_claims:
        if isinstance(claims_list, list):
            verified_facts += sum(1 for c in claims_list if isinstance(c, dict) and c.get("status") == "Verified")
            
    result_bookmarked = await db.execute(
        select(func.count(Analysis.id)).where((Analysis.user_id == current_user.id) & (Analysis.is_bookmarked == True))
    )
    saved_reports = result_bookmarked.scalar() or 0
    
    stats_dict = {
        "total_analyzed": total_analyzed,
        "verified_facts": verified_facts,
        "avg_trust_score": avg_trust_score,
        "saved_reports": saved_reports
    }
    
    await redis_client.set(cache_key, json.dumps(stats_dict), expire=300) # cache for 5 min
    return stats_dict

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Analysis).where(Analysis.id == analysis_id)
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(
            status_code=404, 
            detail=f"Analysis report with ID {analysis_id} not found."
        )
        
    if analysis.user_id and analysis.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this analysis report."
        )
        
    # Fetch similar articles using embedding_service
    similar_articles = []
    if analysis.content:
        search_text = analysis.content if analysis.content else analysis.summary
        if search_text:
            results = embedding_service.search_similar(search_text, top_k=6)
            for res in results:
                metadata = res.get("metadata", {})
                if metadata.get("article_id") == analysis.article_id:
                    continue
                    
                similar_articles.append({
                    "id": res.get("id"),
                    "title": metadata.get("title", "Unknown Title"),
                    "author": metadata.get("author", "Unknown"),
                    "publication": metadata.get("publication", "Unknown"),
                    "url": metadata.get("url"),
                    "distance": res.get("distance")
                })
                if len(similar_articles) == 5:
                    break
    
    analysis_dict = {c.name: getattr(analysis, c.name) for c in analysis.__table__.columns} if hasattr(analysis, "__table__") else vars(analysis).copy()
    if "_sa_instance_state" in analysis_dict:
        del analysis_dict["_sa_instance_state"]
        
    analysis_dict.update({
        "similar_articles": similar_articles
    })
    
    return analysis_dict

@router.post("/{analysis_id}/bookmark", response_model=dict)
async def toggle_bookmark(
    analysis_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Analysis).where((Analysis.id == analysis_id) & (Analysis.user_id == current_user.id))
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    analysis.is_bookmarked = not analysis.is_bookmarked
    await db.commit()
    
    # Invalidate Caches
    await redis_client.delete(f"cache:list_analyses:{current_user.id}")
    await redis_client.delete(f"cache:dashboard_stats:{current_user.id}")
    
    return {"status": "success", "is_bookmarked": analysis.is_bookmarked}

@router.delete("/{analysis_id}", response_model=dict)
async def delete_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Analysis).where((Analysis.id == analysis_id) & (Analysis.user_id == current_user.id))
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    await db.delete(analysis)
    await db.commit()
    
    # Invalidate Caches
    await redis_client.delete(f"cache:list_analyses:{current_user.id}")
    await redis_client.delete(f"cache:dashboard_stats:{current_user.id}")
    
    return {"status": "success", "message": "Analysis deleted"}
