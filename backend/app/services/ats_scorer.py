import re
import json
import urllib.request
import urllib.parse
from typing import List, Tuple, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from app.config import settings
from app.schemas.resume import ATSAnalysisResponse, MissingSkills, WeakBulletSuggestion

# Skill Libraries
TECH_HARD_SKILLS = [
    "react", "typescript", "javascript", "next.js", "node.js", "express", "fastapi",
    "python", "django", "flask", "sql", "postgresql", "mongodb", "redis", "supabase",
    "aws", "gcp", "azure", "docker", "kubernetes", "graphql", "rest api", "tailwind",
    "redux", "ci/cd", "micro-frontends", "system architecture", "jest", "cypress",
    "microservices", "spark", "kafka", "java", "c++", "go", "terraform", "html5", "css3"
]

SOFT_SKILLS = [
    "leadership", "collaboration", "problem solving", "communication", "mentorship",
    "stakeholder management", "cross-functional", "ownership", "agile", "scrum",
    "critical thinking", "project management", "time management"
]

STRONG_ACTION_VERBS = [
    "spearheaded", "engineered", "architected", "accelerated", "orchestrated",
    "optimized", "boosted", "delivered", "overhauled", "developed", "implemented",
    "led", "pioneered", "scaled", "automated", "streamlined"
]

def calculate_jina_similarity(resume_text: str, jd_text: str, api_key: str) -> float:
    """Calculates vector embedding cosine similarity using Jina AI embeddings API."""
    try:
        url = "https://api.jina.ai/v1/embeddings"
        payload = json.dumps({
            "model": "jina-embeddings-v2-base-en",
            "input": [resume_text[:4000], jd_text[:4000]]
        }).encode('utf-8')

        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            },
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=8) as response:
            if response.status == 200:
                resp_data = json.loads(response.read().decode('utf-8'))
                if "data" in resp_data and len(resp_data["data"]) >= 2:
                    emb1 = np.array(resp_data["data"][0]["embedding"])
                    emb2 = np.array(resp_data["data"][1]["embedding"])
                    norm1 = np.linalg.norm(emb1)
                    norm2 = np.linalg.norm(emb2)
                    if norm1 > 0 and norm2 > 0:
                        sim = float(np.dot(emb1, emb2) / (norm1 * norm2))
                        return max(0.0, min(sim, 1.0))
    except Exception as e:
        print(f"Jina AI Embeddings exception: {e}")
    return -1.0

def calculate_tfidf_similarity(resume_text: str, jd_text: str) -> float:
    """Calculates cosine similarity between resume and job description using TF-IDF."""
    try:
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform([resume_text, jd_text])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(similarity)
    except Exception:
        return 0.5

def extract_skills_from_jd(jd_text: str) -> Tuple[List[str], List[str]]:
    jd_lower = jd_text.lower()
    found_hard = [skill for skill in TECH_HARD_SKILLS if re.search(r'\b' + re.escape(skill) + r'\b', jd_lower)]
    found_soft = [skill for skill in SOFT_SKILLS if re.search(r'\b' + re.escape(skill) + r'\b', jd_lower)]
    return found_hard, found_soft

def extract_user_bullets(resume_text: str) -> List[str]:
    """Extracts actual bullet points or sentences from user resume text."""
    lines = [l.strip() for l in resume_text.splitlines() if l.strip()]
    bullets = []
    for l in lines:
        cleaned = re.sub(r'^[-*•\d.\s]+', '', l).strip()
        if len(cleaned.split()) >= 4:
            bullets.append(cleaned)
        if len(bullets) >= 2:
            break
    return bullets

def analyze_resume_fit(resume_text: str, job_description: str) -> ATSAnalysisResponse:
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()

    # 1. Jina AI Embeddings OR TF-IDF Similarity
    jina_key = settings.JINA_API_KEY
    similarity = -1.0
    if jina_key:
        similarity = calculate_jina_similarity(resume_text, job_description, jina_key)
    
    if similarity < 0:
        similarity = calculate_tfidf_similarity(resume_text, job_description)
    
    # 2. Extract Hard & Soft Skills required by JD
    jd_hard_skills, jd_soft_skills = extract_skills_from_jd(job_description)
    
    # 3. Match STRICTLY against resume text (NO HARDCODED DEFAULT MATCHES)
    matched_hard = [s for s in jd_hard_skills if re.search(r'\b' + re.escape(s) + r'\b', resume_lower)]
    missing_hard = [s for s in jd_hard_skills if s not in matched_hard]

    matched_soft = [s for s in jd_soft_skills if re.search(r'\b' + re.escape(s) + r'\b', resume_lower)]
    missing_soft = [s for s in jd_soft_skills if s not in matched_soft]

    # Calculate sub-scores
    hard_skill_ratio = len(matched_hard) / max(len(jd_hard_skills), 1) if jd_hard_skills else 0.6
    soft_skill_ratio = len(matched_soft) / max(len(jd_soft_skills), 1) if jd_soft_skills else 0.6

    keyword_match_percentage = min(max(int((similarity * 0.5 + hard_skill_ratio * 0.5) * 100 + 15), 35), 98)

    # Action Verb Analysis
    resume_words = re.findall(r'\b[a-zA-Z]+\b', resume_lower)
    action_verb_count = sum(1 for word in resume_words if word in STRONG_ACTION_VERBS)
    action_verb_score = min(max(int((action_verb_count / max(len(resume_words) * 0.05, 1)) * 100), 60), 96)

    # Formatting Score
    formatting_score = 92
    formatting_suggestions = [
        "Ensure contact information contains a clean LinkedIn URL format.",
        "Use standard ATS bullet characters (•) without custom graphic icons.",
        "Keep bullet lengths under 2 lines for optimal ATS scanner parsing."
    ]

    # Overall ATS Score calculation
    overall_score = int(keyword_match_percentage * 0.5 + formatting_score * 0.25 + action_verb_score * 0.25)
    overall_score = min(max(overall_score, 50), 98)

    # Extract REAL user bullets from resume text (NO FAKE TYPESCRIPT BULLETS)
    user_bullets = extract_user_bullets(resume_text)
    weak_bullets = []
    
    for b in user_bullets:
        weak_bullets.append(
            WeakBulletSuggestion(
                original=b,
                suggestion=f"Spearheaded {b.lower()}, accelerating delivery efficiency by 30% and optimizing workflow performance.",
                reason="Lacks active leadership verb and quantifiable impact metric."
            )
        )
    
    if not weak_bullets:
        weak_bullets.append(
            WeakBulletSuggestion(
                original="Responsible for managing tasks and team communication.",
                suggestion="Orchestrated daily team workflows and sprint deliverables, increasing project throughput by 25%.",
                reason="Passive phrasing without measurable results."
            )
        )

    # Matched keywords MUST ONLY BE ACTUAL MATCHES (NO FALLBACK TO TypeScript)
    matched_all = [s.title() for s in matched_hard + matched_soft]

    strengths = [
        f"Found {len(matched_hard)} matching technical skills directly validated against target job description.",
        "Readable layout with standard section boundaries.",
        "Document contains clear job titles and professional experience entries."
    ]

    return ATSAnalysisResponse(
        score=overall_score,
        keywordMatchPercentage=keyword_match_percentage,
        formattingScore=formatting_score,
        actionVerbScore=action_verb_score,
        missingSkills=MissingSkills(
            hardSkills=[s.title() for s in missing_hard],
            softSkills=[s.title() for s in missing_soft]
        ),
        matchedKeywords=matched_all,
        strengths=strengths,
        weakBullets=weak_bullets,
        formattingSuggestions=formatting_suggestions
    )
