from fastapi import APIRouter, HTTPException, status
from app.schemas.resume import (
    AnalyzeRequest,
    ATSAnalysisResponse,
    BulletRewriteRequest,
    BulletRewriteResponse
)
from app.services.ats_scorer import analyze_resume_fit
from app.services.ai_service import tailor_bullet_point

router = APIRouter(prefix="/ats", tags=["ATS Fit & Scoring"])

@router.post("/analyze", response_model=ATSAnalysisResponse, status_code=status.HTTP_200_OK)
def analyze_resume(payload: AnalyzeRequest):
    if not payload.resumeText.strip() or not payload.jobDescription.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both resumeText and jobDescription must be non-empty."
        )
    return analyze_resume_fit(payload.resumeText, payload.jobDescription)

@router.post("/tailor-bullet", response_model=BulletRewriteResponse, status_code=status.HTTP_200_OK)
def tailor_bullet(payload: BulletRewriteRequest):
    if not payload.bullet.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bullet text is required."
        )
    return tailor_bullet_point(payload.bullet, payload.targetRole, payload.keywords, payload.instructions or "")
