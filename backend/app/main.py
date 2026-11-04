from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import ats, parser

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Python FastAPI backend providing TF-IDF ATS scoring, NLP keyword extraction, PyPDF resume parsing, and LLM bullet tailoring for ATsecure / JobSync AI.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Enable CORS for Next.js app communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(ats.router, prefix=settings.API_V1_STR)
app.include_router(parser.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health Check"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "engine": "Python 3.11 FastAPI + PyMuPDF + Scikit-Learn NLP"
    }

@app.get(f"{settings.API_V1_STR}/status", tags=["System Status"])
def get_system_status():
    has_gemini = bool(settings.GEMINI_API_KEY)
    return {
        "ai_active": has_gemini,
        "provider": "Google Gemini 1.5 Flash" if has_gemini else "Local Python NLP Rule Engine",
        "message": "Real Gemini 1.5 LLM is connected." if has_gemini else "Running in Local NLP Heuristic Mode. Add GEMINI_API_KEY in .env for live Gemini 1.5 calls.",
        "parsers": ["PyMuPDF (PDF)", "python-docx (DOCX)", "UTF-8 (TXT)"]
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to ATsecure Python Engine",
        "docs": "/docs",
        "health": "/health"
    }
