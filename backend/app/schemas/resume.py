import uuid
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnalyzeRequest(BaseModel):
    resumeText: str = Field(..., description="Full text content of the candidate's resume")
    jobDescription: str = Field(..., description="Full text description of the target job posting")

class MissingSkills(BaseModel):
    hardSkills: List[str] = Field(default_factory=list)
    softSkills: List[str] = Field(default_factory=list)

class WeakBulletSuggestion(BaseModel):
    original: str
    suggestion: str
    reason: str

class ATSAnalysisResponse(BaseModel):
    score: int
    keywordMatchPercentage: int
    formattingScore: int
    actionVerbScore: int
    missingSkills: MissingSkills
    matchedKeywords: List[str]
    strengths: List[str]
    weakBullets: List[WeakBulletSuggestion]
    formattingSuggestions: List[str]
    engine: Optional[str] = "ATsecure Python NLP Engine"

class BulletRewriteRequest(BaseModel):
    bullet: str
    targetRole: Optional[str] = ""
    keywords: Optional[List[str]] = Field(default_factory=list)
    instructions: Optional[str] = ""

class BulletRewriteResponse(BaseModel):
    original: str
    tailored: str
    impactScoreBoost: int
    improvements: List[str]

class StructuredExperience(BaseModel):
    id: str = Field(default_factory=lambda: f"exp_{uuid.uuid4().hex[:10]}")
    company: str = ""
    role: str = ""
    location: Optional[str] = ""
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    bullets: List[str] = Field(default_factory=list)

class StructuredEducation(BaseModel):
    id: str = Field(default_factory=lambda: f"edu_{uuid.uuid4().hex[:10]}")
    institution: str = ""
    degree: str = ""
    fieldOfStudy: Optional[str] = ""
    year: Optional[str] = ""
    gpa: Optional[str] = ""

class StructuredSkillCategory(BaseModel):
    category: str
    items: List[str] = Field(default_factory=list)

class StructuredProject(BaseModel):
    id: str = Field(default_factory=lambda: f"proj_{uuid.uuid4().hex[:10]}")
    title: str = ""
    description: Optional[str] = ""
    technologies: List[str] = Field(default_factory=list)
    link: Optional[str] = ""

class StructuredCertification(BaseModel):
    id: str = Field(default_factory=lambda: f"cert_{uuid.uuid4().hex[:10]}")
    name: str = ""
    issuer: Optional[str] = ""
    year: Optional[str] = ""

class StructuredResume(BaseModel):
    id: Optional[str] = "res_user_active"
    title: Optional[str] = "My Resume"
    fullName: str = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""
    summary: Optional[str] = ""
    experience: List[StructuredExperience] = Field(default_factory=list)
    education: List[StructuredEducation] = Field(default_factory=list)
    skills: List[StructuredSkillCategory] = Field(default_factory=list)
    projects: List[StructuredProject] = Field(default_factory=list)
    certifications: List[StructuredCertification] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    awards: List[str] = Field(default_factory=list)
    scholarships: List[str] = Field(default_factory=list)
    leadership: List[str] = Field(default_factory=list)
    volunteer: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    unclassified: List[str] = Field(default_factory=list)
    versionType: Optional[str] = "ORIGINAL"
    extractionStatus: Optional[str] = "SUCCESS"
    rawExtractedText: Optional[str] = ""
    ats_score: Optional[int] = 78
    created_at: Optional[str] = ""

class FileParseResponse(BaseModel):
    success: bool
    provider: str
    parsedText: str
    extractedEmail: Optional[str] = None
    extractedPhone: Optional[str] = None
    detectedSkills: List[str] = Field(default_factory=list)
    structuredResume: Optional[StructuredResume] = None
