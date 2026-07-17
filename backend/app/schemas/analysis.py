from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl

class ClaimVerify(BaseModel):
    claim: str
    status: str
    details: str

class AnalysisCreate(BaseModel):
    url: Optional[str] = None

class AnalysisResponse(BaseModel):
    id: str
    url: Optional[str] = None
    filename: Optional[str] = None
    title: str
    author: str
    publication: str
    published_date: str
    trust_score: int
    bias_rating: str
    sentiment_tone: str
    sentiment_score: float
    is_clickbait: bool
    is_sensational: bool
    is_verified_author: bool
    summary: str
    claims: List[ClaimVerify]
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_analyzed: int
    verified_facts: int
    avg_trust_score: int
    saved_reports: int
