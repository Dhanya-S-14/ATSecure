import re
from io import BytesIO
from typing import List, Dict, Tuple, Optional
import pymupdf
import docx
from app.schemas.resume import (
    FileParseResponse,
    StructuredResume,
    StructuredExperience,
    StructuredEducation,
    StructuredSkillCategory,
    StructuredProject,
    StructuredCertification
)

COMMON_TECH_SKILLS = [
    "python", "react", "typescript", "javascript", "next.js", "node.js", "express",
    "fastapi", "flask", "django", "sql", "postgresql", "mysql", "mongodb", "redis",
    "aws", "gcp", "azure", "docker", "kubernetes", "graphql", "rest api", "tailwind",
    "css", "html", "git", "ci/cd", "microservices", "unit testing", "jest", "pytest",
    "system architecture", "scrum", "agile", "c++", "java", "go", "terraform", "kafka"
]

SECTION_HEADERS = {
    'summary': [r'summary', r'professional summary', r'about me', r'profile', r'executive summary', r'career objective', r'objective'],
    'experience': [r'experience', r'work experience', r'professional experience', r'employment history', r'work history', r'relevant experience'],
    'internships': [r'internship', r'internships', r'internship experience'],
    'education': [r'education', r'academic background', r'academics', r'degrees', r'educational background'],
    'skills': [r'technical skills', r'skills', r'core competencies', r'technologies', r'skills & tools', r'tools & technologies', r'tech stack'],
    'projects': [r'projects', r'key projects', r'personal projects', r'technical projects', r'academic projects', r'selected projects'],
    'certifications': [r'certifications', r'certificates', r'licenses & certifications', r'licenses'],
    'achievements': [r'achievements', r'key achievements', r'accomplishments'],
    'awards': [r'awards', r'honors', r'honors & awards', r'prizes', r'recognitions'],
    'scholarships': [r'scholarships', r'scholarship', r'fellowships', r'grants'],
    'leadership': [r'leadership', r'leadership & extracurricular', r'leadership experience', r'extracurricular activities', r'positions of responsibility'],
    'volunteer': [r'volunteer', r'volunteering', r'volunteer experience', r'community service'],
    'languages': [r'languages', r'language proficiency'],
    'publications': [r'publications', r'research papers']
}

def clean_extracted_text(text: str) -> str:
    if not text:
        return ""
    # Strip control chars except newlines and tabs
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]', '', text)
    # Normalize line breaks and multiple spaces
    lines = [line.strip() for line in text.splitlines()]
    clean_lines = []
    for l in lines:
        if not l:
            if clean_lines and clean_lines[-1] != "":
                clean_lines.append("")
            continue
        clean_lines.append(l)
    return "\n".join(clean_lines).strip()

def extract_text_from_bytes(content: bytes, filename: str) -> Tuple[str, str]:
    ext = filename.lower().split('.')[-1]
    
    # 1. PyMuPDF for PDF
    if ext == 'pdf':
        try:
            doc = pymupdf.open(stream=content, filetype="pdf")
            pages = []
            for page in doc:
                text = page.get_text()
                if text.strip():
                    pages.append(text.strip())
            if pages:
                return "\n\n".join(pages), "Python PyMuPDF Engine"
        except Exception as e:
            print(f"PyMuPDF error: {e}")
            
    # 2. python-docx for DOCX
    elif ext == 'docx':
        try:
            doc = docx.Document(BytesIO(content))
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            if paragraphs:
                return "\n\n".join(paragraphs), "Python python-docx Engine"
        except Exception as e:
            print(f"python-docx error: {e}")

    # 3. Plain text / utf-8 fallback
    try:
        text = content.decode('utf-8', errors='ignore')
        if text.strip():
            return text, "Python UTF-8 Plaintext Parser"
    except Exception as e:
        print(f"UTF-8 decode error: {e}")

    return "", "Unknown Parser"

def identify_section_header(line: str) -> Optional[str]:
    clean = re.sub(r'[^a-zA-Z\s]', '', line).strip().lower()
    if len(clean) > 35 or len(clean) < 3:
        return None
    for sec_name, patterns in SECTION_HEADERS.items():
        for pat in patterns:
            if clean == pat or clean == pat + 's':
                return sec_name
    return None

def parse_structured_resume(full_text: str) -> StructuredResume:
    lines = [l.strip() for l in full_text.splitlines() if l.strip()]
    if not lines:
        return StructuredResume(fullName="Candidate")

    # Name: First prominent line not containing contact info or header
    full_name = "Candidate"
    email = None
    phone = None
    linkedin = ""
    github = ""
    portfolio = ""
    location = ""

    # Contact info detection
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', full_text)
    if email_match:
        email = email_match.group(0)

    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', full_text)
    if phone_match:
        phone = phone_match.group(0)

    linkedin_match = re.search(r'(linkedin\.com/in/[a-zA-Z0-9_-]+|https?://[a-zA-Z0-9.-]*linkedin\.com/[^\s]+)', full_text, re.IGNORECASE)
    if linkedin_match:
        linkedin = linkedin_match.group(0)

    github_match = re.search(r'(github\.com/[a-zA-Z0-9_-]+|https?://github\.com/[^\s]+)', full_text, re.IGNORECASE)
    if github_match:
        github = github_match.group(0)

    portfolio_match = re.search(r'https?://[a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+(/[^\s]*)?', full_text)
    if portfolio_match and not linkedin_match and not github_match:
        portfolio = portfolio_match.group(0)

    loc_match = re.search(r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(\s*\d{5})?)', full_text)
    if loc_match:
        location = loc_match.group(0).strip()

    # Extract name from top 5 lines
    for line in lines[:5]:
        if "@" in line or (phone and phone in line) or re.search(r'(resume|curriculum|cv)', line, re.IGNORECASE):
            continue
        if len(line.split()) in [2, 3, 4] and not re.search(r'[:;,]', line):
            full_name = line.strip()
            break

    # Partition lines into sections
    sections: Dict[str, List[str]] = {
        'header': [],
        'summary': [],
        'experience': [],
        'internships': [],
        'education': [],
        'skills': [],
        'projects': [],
        'certifications': [],
        'achievements': [],
        'awards': [],
        'scholarships': [],
        'leadership': [],
        'volunteer': [],
        'languages': [],
        'publications': [],
        'unclassified': []
    }

    current_section = 'header'
    for line in lines:
        detected_sec = identify_section_header(line)
        if detected_sec:
            current_section = detected_sec
            continue
        sections[current_section].append(line)

    # 1. Summary
    summary_text = " ".join(sections['summary']).strip()
    if not summary_text and sections['header']:
        # If no explicit summary header, check if top paragraph is an objective
        top_candidates = [l for l in sections['header'][1:4] if len(l) > 60]
        if top_candidates:
            summary_text = top_candidates[0]

    # 2. Experience
    experience_list: List[StructuredExperience] = []
    exp_lines = sections['experience']
    current_exp: Optional[StructuredExperience] = None

    for line in exp_lines:
        is_bullet = bool(re.match(r'^[-*•\d.]+\s+', line)) or (current_exp and len(line) > 40)
        # Check if line looks like a job header: e.g. "Senior Software Engineer - Google (2022 - Present)"
        date_match = re.search(r'(\b\d{4}\b|\bpresent\b|\bcurrent\b)', line, re.IGNORECASE)
        is_job_header = bool(date_match and ('-' in line or '|' in line or ',' in line or ' at ' in line.lower()))

        if is_job_header or (not is_bullet and len(line) < 60 and not current_exp):
            if current_exp:
                experience_list.append(current_exp)
            
            # Parse role & company
            parts = re.split(r'[-–—|•,]', line)
            role = parts[0].strip() if len(parts) > 0 else "Software Engineer"
            company = parts[1].strip() if len(parts) > 1 else "Tech Enterprise"
            
            # Check for dates
            dates_in_line = re.findall(r'(\b\w+\s+\d{4}\b|\b\d{4}\b|\bpresent\b)', line, re.IGNORECASE)
            start_date = dates_in_line[0] if len(dates_in_line) > 0 else "2022"
            end_date = dates_in_line[1] if len(dates_in_line) > 1 else "Present"

            current_exp = StructuredExperience(
                role=role,
                company=company,
                startDate=start_date,
                endDate=end_date,
                bullets=[]
            )
        elif current_exp:
            clean_bullet = re.sub(r'^[-*•\d.]+\s*', '', line).strip()
            if clean_bullet:
                current_exp.bullets.append(clean_bullet)

    if current_exp:
        experience_list.append(current_exp)

    # 3. Education
    education_list: List[StructuredEducation] = []
    for line in sections['education']:
        degree_match = re.search(r'(bachelor|master|ph\.?d|b\.?s|m\.?s|associate|b\.?a|degree)', line, re.IGNORECASE)
        year_match = re.search(r'\b(20\d{2}|19\d{2})\b', line)
        year = year_match.group(0) if year_match else ""
        
        if degree_match or year:
            parts = re.split(r'[-–—|,]', line)
            degree_str = parts[0].strip() if len(parts) > 0 else line
            inst_str = parts[1].strip() if len(parts) > 1 else "University"
            education_list.append(StructuredEducation(
                degree=degree_str,
                institution=inst_str,
                year=year
            ))

    # 4. Skills
    detected_skills = [s.title() for s in COMMON_TECH_SKILLS if re.search(r'\b' + re.escape(s) + r'\b', full_text, re.IGNORECASE)]
    skills_list: List[StructuredSkillCategory] = []
    
    # Check if section has explicit lines
    if sections['skills']:
        cat_items = []
        for line in sections['skills']:
            cleaned = re.sub(r'^[-*•]\s*', '', line)
            tokens = [re.sub(r'(\.js)+', '.js', t.strip(), flags=re.I) for t in re.split(r'[,|•;]', cleaned) if t.strip()]
            cat_items.extend(tokens)
        if cat_items:
            skills_list.append(StructuredSkillCategory(category="Technical Skills", items=list(dict.fromkeys(cat_items))))
    
    if not skills_list and detected_skills:
        skills_list = [
            StructuredSkillCategory(category="Languages & Frameworks", items=detected_skills[:8]),
            StructuredSkillCategory(category="Cloud & Infrastructure", items=detected_skills[8:])
        ]

    # 5. Projects
    projects_list: List[StructuredProject] = []
    current_proj: Optional[StructuredProject] = None
    for line in sections['projects']:
        if len(line) < 50 and not re.match(r'^[-*•]', line):
            if current_proj:
                projects_list.append(current_proj)
            current_proj = StructuredProject(title=line, description="", technologies=[])
        elif current_proj:
            current_proj.description = (current_proj.description + " " + line).strip()
    if current_proj:
        projects_list.append(current_proj)

    # Merge internships into experience if any
    for int_line in sections['internships']:
        clean_int = re.sub(r'^[-*•\d.]+\s*', '', int_line).strip()
        if clean_int:
            if not experience_list:
                experience_list.append(StructuredExperience(
                    role="Intern",
                    company="Internship",
                    startDate="Recent",
                    endDate="Completed",
                    bullets=[clean_int]
                ))
            else:
                experience_list[0].bullets.append(clean_int)

    # 6. Certifications
    cert_list: List[StructuredCertification] = []
    for line in sections['certifications']:
        clean_cert = re.sub(r'^[-*•\d.]+\s*', '', line).strip()
        if clean_cert:
            cert_list.append(StructuredCertification(name=clean_cert))

    # Helper to clean list of lines
    def clean_section_bullets(lines_list: List[str]) -> List[str]:
        res = []
        for l in lines_list:
            cleaned = re.sub(r'^[-*•\d.]+\s*', '', l).strip()
            if cleaned and len(cleaned) > 2:
                res.append(cleaned)
        return res

    achievements_list = clean_section_bullets(sections['achievements'])
    awards_list = clean_section_bullets(sections['awards'])
    scholarships_list = clean_section_bullets(sections['scholarships'])
    leadership_list = clean_section_bullets(sections['leadership'])
    volunteer_list = clean_section_bullets(sections['volunteer'])
    languages_list = clean_section_bullets(sections['languages'])
    unclassified_list = clean_section_bullets(sections['unclassified'])

    word_count = len(full_text.split())
    ext_status = "SUCCESS" if word_count > 40 else ("PARTIAL" if word_count >= 10 else "OCR_REQUIRED")

    return StructuredResume(
        fullName=full_name,
        email=email or "",
        phone=phone or "",
        location=location,
        linkedin=linkedin,
        github=github,
        portfolio=portfolio,
        summary=summary_text,
        experience=experience_list,
        education=education_list,
        skills=skills_list,
        projects=projects_list,
        certifications=cert_list,
        achievements=achievements_list,
        awards=awards_list,
        scholarships=scholarships_list,
        leadership=leadership_list,
        volunteer=volunteer_list,
        languages=languages_list,
        unclassified=unclassified_list,
        versionType="ORIGINAL",
        extractionStatus=ext_status,
        rawExtractedText=full_text,
        ats_score=82
    )

def parse_resume_bytes(content: bytes, filename: str) -> FileParseResponse:
    raw_text, provider = extract_text_from_bytes(content, filename)
    clean_text = clean_extracted_text(raw_text)

    # Extract basic coordinates
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', clean_text)
    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', clean_text)

    # Extract skills
    text_lower = clean_text.lower()
    detected_skills = [s.title() for s in COMMON_TECH_SKILLS if s in text_lower]

    # Create full structured resume object
    structured = parse_structured_resume(clean_text)

    return FileParseResponse(
        success=bool(clean_text.strip()),
        provider=provider,
        parsedText=clean_text,
        extractedEmail=email_match.group(0) if email_match else None,
        extractedPhone=phone_match.group(0) if phone_match else None,
        detectedSkills=detected_skills,
        structuredResume=structured
    )
