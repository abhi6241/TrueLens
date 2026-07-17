import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.db.session import get_db
from app.models.analysis import Analysis
from app.schemas.analysis import AnalysisCreate, AnalysisResponse, DashboardStats, ClaimVerify
from app.core.auth import get_current_user
from app.models.user import User


router = APIRouter()

# Helper to generate mock analysis data
def create_mock_analysis(
    title: str, 
    author: str, 
    publication: str, 
    published_date: str,
    trust_score: int,
    bias_rating: str,
    sentiment_tone: str,
    sentiment_score: float,
    is_clickbait: bool = False,
    is_sensational: bool = False,
    is_verified_author: bool = True,
    summary: str = "",
    claims: list = None,
    url: Optional[str] = None,
    filename: Optional[str] = None
) -> Analysis:
    return Analysis(
        id=str(uuid.uuid4()),
        url=url,
        filename=filename,
        title=title,
        author=author,
        publication=publication,
        published_date=published_date,
        trust_score=trust_score,
        bias_rating=bias_rating,
        sentiment_tone=sentiment_tone,
        sentiment_score=sentiment_score,
        is_clickbait=is_clickbait,
        is_sensational=is_sensational,
        is_verified_author=is_verified_author,
        summary=summary,
        claims=claims or []
    )

# Static mock items
MOCK_SARAH_JENKINS = {
    "title": "The Unseen Costs of AI Adoption in Enterprise Environments",
    "author": "Sarah Jenkins",
    "publication": "Global Tech News",
    "published_date": "Oct 24, 2024",
    "trust_score": 75,
    "bias_rating": "Lean Left",
    "sentiment_tone": "Cautious",
    "sentiment_score": -0.2,
    "is_clickbait": False,
    "is_sensational": True,
    "is_verified_author": True,
    "summary": "This article examines the secondary impacts of integrating AI into large-scale enterprise workflows. The author focuses primarily on the displacement of entry-level knowledge workers and the hidden costs associated with retraining staff. While acknowledging the productivity gains reported by executives, the piece relies heavily on qualitative interviews with mid-level managers who express concern over degraded team cohesion and increased burnout related to adapting to new algorithmic systems.",
    "claims": [
        {
            "claim": "AI implementation costs run 300% over budget on average.",
            "status": "Misleading Context",
            "details": "Industry studies show a 40-60% overrun. The 300% figure originates from a single anecdotal case study cited in 2022."
        },
        {
            "claim": "Entry-level administrative roles decreased by 15% in Q3.",
            "status": "Verified",
            "details": "Matches recent Bureau of Labor Statistics data for the administrative sector."
        }
    ]
}

MOCK_REUTERS = {
    "title": "Economic Policies Face New Scrutiny Amid Global Shifts",
    "author": "Marcus Aurelius",
    "publication": "Reuters",
    "published_date": "Oct 24, 2024",
    "trust_score": 92,
    "bias_rating": "Center",
    "sentiment_tone": "Neutral",
    "sentiment_score": 0.0,
    "is_clickbait": False,
    "is_sensational": False,
    "is_verified_author": True,
    "summary": "A detailed report analyzing global trade adjustments and regulatory updates. Central banks are evaluating structural shifts in currency reserves and interest rates.",
    "claims": [
        {
            "claim": "Inflation projections have stabilized at 2.1%.",
            "status": "Verified",
            "details": "Backed by official aggregate reports from primary economic indicators."
        }
    ]
}

MOCK_WSJ = {
    "title": "Market Reactions to the Recent Federal Reserve Rate Hike",
    "author": "David Ricardo",
    "publication": "WSJ",
    "published_date": "Oct 24, 2024",
    "trust_score": 88,
    "bias_rating": "Lean Right",
    "sentiment_tone": "Optimistic",
    "sentiment_score": 0.4,
    "is_clickbait": False,
    "is_sensational": False,
    "is_verified_author": True,
    "summary": "This article reviews the market trends following the Federal Reserve's rate updates. Analysts note strong bond yields and banking stock performance.",
    "claims": [
        {
            "claim": "Small cap stocks showed a 5% gain after rate hikes.",
            "status": "Verified",
            "details": "Corroborated by index tracking reports."
        }
    ]
}

@router.post("/", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_url(
    payload: AnalysisCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    url = payload.url
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    
    # Check if this matches mock examples
    if "unseen-costs-ai-adoption" in url or "Tech Trends" in url:
        analysis = create_mock_analysis(**MOCK_SARAH_JENKINS, url=url)
    elif "fed-rate-hike" in url or "Global Markets" in url:
        analysis = create_mock_analysis(**MOCK_WSJ, url=url)
    else:
        # Default mock fallback
        analysis = create_mock_analysis(
            title=f"Analysis of URL: {url.split('//')[-1][:60]}",
            author="System Analyst AI",
            publication="Verified Source",
            published_date="Just Now",
            trust_score=82,
            bias_rating="Center",
            sentiment_tone="Neutral",
            sentiment_score=0.1,
            is_clickbait=False,
            is_sensational=False,
            is_verified_author=True,
            summary=f"This is a simulated analysis report for the URL: {url}. It shows standard neutrality and balanced factual representation.",
            claims=[
                {
                    "claim": "General information verification succeeded.",
                    "status": "Verified",
                    "details": "Database references match standard search criteria."
                }
            ],
            url=url
        )
    
    analysis.user_id = current_user.id
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    return analysis

@router.post("/upload", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_file(
    file: UploadFile = File(...), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    filename = file.filename
    # Mock PDF analysis
    analysis = create_mock_analysis(
        **MOCK_SARAH_JENKINS,
        filename=filename
    )
    analysis.title = f"Document: {filename}"
    
    analysis.user_id = current_user.id
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    return analysis

@router.get("/", response_model=List[AnalysisResponse])
async def list_analyses(
    limit: int = 10, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch user specific analyses or public/seeded analyses (user_id is None)
    result = await db.execute(
        select(Analysis)
        .where((Analysis.user_id == current_user.id) | (Analysis.user_id.is_(None)))
        .order_by(desc(Analysis.created_at))
        .limit(limit)
    )
    analyses = result.scalars().all()
    
    # If database is empty, seed it with standard mockup entries so dashboard looks perfect
    if not analyses:
        seed_items = [
            create_mock_analysis(**MOCK_REUTERS, url="https://globaltechnews.com/articles/economic-shifts"),
            create_mock_analysis(**MOCK_SARAH_JENKINS, url="https://globaltechnews.com/articles/unseen-costs-ai-adoption"),
            create_mock_analysis(**MOCK_WSJ, url="https://globaltechnews.com/articles/fed-rate-hike")
        ]
        for item in seed_items:
            db.add(item)
        await db.commit()
        
        result = await db.execute(
            select(Analysis)
            .where((Analysis.user_id == current_user.id) | (Analysis.user_id.is_(None)))
            .order_by(desc(Analysis.created_at))
            .limit(limit)
        )
        analyses = result.scalars().all()
        
    return analyses

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Calculate stats from DB specifically for the logged-in user
    result_count = await db.execute(
        select(func.count(Analysis.id)).where(Analysis.user_id == current_user.id)
    )
    total_analyzed = result_count.scalar() or 0
    
    result_avg = await db.execute(
        select(func.avg(Analysis.trust_score)).where((Analysis.user_id == current_user.id) | (Analysis.user_id.is_(None)))
    )
    avg_score = result_avg.scalar()
    avg_trust_score = int(round(avg_score)) if avg_score is not None else 85
    
    # Static fallbacks combined with db counts
    stats = DashboardStats(
        total_analyzed=1240 + total_analyzed,
        verified_facts=8932 + (total_analyzed * 2),
        avg_trust_score=avg_trust_score,
        saved_reports=156 + total_analyzed
    )
    return stats

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
        
    # Enforce security scope: only allow access to user's own reports or public reports
    if analysis.user_id and analysis.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this analysis report."
        )
        
    return analysis

