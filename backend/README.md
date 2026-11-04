# ATsecure / JobSync AI — Python FastAPI Engine

High-performance Python backend service providing NLP resume parsing, TF-IDF ATS match scoring, technical skill extraction, and AI bullet point tailoring.

## 🚀 Features

- **TF-IDF & Cosine Similarity ATS Scoring**: Uses `scikit-learn` to calculate match ratio between candidate resumes and target job descriptions.
- **NLP Technical Skill Extractor**: Identifies hard skills (React, TypeScript, Python, Docker, SQL, AWS, Kubernetes, etc.) and soft skills (Leadership, Communication, Stakeholder Management).
- **PyPDF Resume Parser**: Native PDF text, email, phone number, and skill metadata extraction.
- **LLM / Gemini Bullet Tailoring**: Rewrites weak bullet points into high-impact, metric-driven achievements.
- **FastAPI Framework**: Automatic interactive OpenAPI documentation at `/docs`.

## 🛠️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Server**:
   ```bash
   python run.py
   ```
   Or using Uvicorn directly:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

3. **API Documentation**:
   - Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
   - Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

## 📡 API Endpoints

### 1. `POST /api/v1/ats/analyze`
Accepts `resumeText` and `jobDescription`, returns match score, missing skills, strengths, weak bullet rewrites, and formatting tips.

### 2. `POST /api/v1/parser/upload`
Accepts a PDF/DOCX file upload and extracts raw text, email, phone, and detected skills.

### 3. `POST /api/v1/ats/tailor-bullet`
Accepts a single bullet point and target role, returning an optimized rewrite.
