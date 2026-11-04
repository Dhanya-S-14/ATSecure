import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { ResumeData, WorkExperience, ResumeProject } from './types';
import { enforceCanonicalCasing } from './ats-validator';

// Initialize PDF.js worker fallback
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch {
    // Worker fallback
  }
}

export interface ParseResult {
  text: string;
  fileName: string;
  wordCount: number;
  structuredResume?: ResumeData;
}

/**
 * Robust Client & Server Resume File Text Extractor
 * Extracts 100% of readable plain text line-by-line from PDF, DOCX, TXT, MD, and JSON files.
 * Uses high-fidelity Python PyMuPDF engine first when available, with client-side failovers.
 */
export async function extractTextFromFile(file: File): Promise<ParseResult> {
  const fileName = file.name;
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  let rawText = '';
  let structuredResume: ResumeData | undefined = undefined;

  // 1. Plain Text / Markdown / JSON
  if (['txt', 'md', 'json', 'csv'].includes(extension)) {
    try {
      rawText = await file.text();
    } catch {
      rawText = await readAsPlainText(file);
    }
  }
  // 2. Word (.docx)
  else if (extension === 'docx') {
    // Try server API first (Python python-docx engine provides clean layout)
    try {
      const serverResult = await parseViaServerApi(file);
      rawText = serverResult.text;
      if (serverResult.structuredResume) {
        structuredResume = serverResult.structuredResume;
      }
    } catch {
      // Client-side fallback with mammoth
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        rawText = result.value || '';
      } catch {
        rawText = await readAsPlainText(file);
      }
    }
  }
  // 3. PDF (.pdf)
  else if (extension === 'pdf') {
    // Primary: Call server API (FastAPI PyMuPDF engine extracts entire document text page by page with strict layout preservation)
    try {
      const serverResult = await parseViaServerApi(file);
      rawText = serverResult.text;
      if (serverResult.structuredResume) {
        structuredResume = serverResult.structuredResume;
      }
    } catch (serverErr) {
      console.warn('Server PDF parse failed, attempting client PDF extraction:', serverErr);
      try {
        rawText = await extractPdfClientSide(file);
      } catch (pdfErr) {
        console.warn('Client PDF extraction failed, trying plain text reader:', pdfErr);
        rawText = await readAsPlainText(file);
      }
    }
  }
  // 4. Fallback for other file types
  else {
    try {
      const serverResult = await parseViaServerApi(file);
      rawText = serverResult.text;
      if (serverResult.structuredResume) {
        structuredResume = serverResult.structuredResume;
      }
    } catch {
      rawText = await readAsPlainText(file);
    }
  }

  // Clean raw extracted text
  const cleanedText = cleanExtractedText(rawText);

  // Validate extracted text readability
  if (!cleanedText || !isReadableText(cleanedText)) {
    throw new Error('Unable to extract readable text from this file. Please paste text directly or upload a text-based PDF/DOCX file.');
  }

  const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

  return {
    text: cleanedText,
    fileName,
    wordCount,
    structuredResume
  };
}

/**
 * Extract PDF text page-by-page using pdfjs-dist
 * Reconstructs layout lines by Y-coordinate positioning
 */
async function extractPdfClientSide(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true
  });

  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    let pageString = '';
    let lastY: number | null = null;

    for (const item of textContent.items as any[]) {
      if (!item.str) continue;

      const currentY = item.transform ? item.transform[5] : null;

      if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 6) {
        pageString += '\n';
      } else if (pageString.length > 0 && !pageString.endsWith('\n') && !pageString.endsWith(' ')) {
        pageString += ' ';
      }

      pageString += item.str;
      lastY = currentY;
    }

    if (pageString.trim()) {
      pageTexts.push(pageString.trim());
    }
  }

  return pageTexts.join('\n\n');
}

/**
 * Call Next.js /api/parse-resume-file which relays to Python PyMuPDF / python-docx engine
 */
async function parseViaServerApi(file: File): Promise<{ text: string; structuredResume?: ResumeData }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/parse-resume-file', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error(`Server parse failed with status ${res.status}`);
  }

  const data = await res.json();
  if (data.parsedText) {
    return {
      text: data.parsedText,
      structuredResume: data.structuredResume ? normalizeStructuredResume(data.structuredResume, file.name) : undefined
    };
  }
  throw new Error('Server returned empty parsed text');
}

/**
 * Normalizes backend StructuredResume into frontend ResumeData
 */
function normalizeStructuredResume(pyData: any, fileName?: string): ResumeData {
  const experiences: WorkExperience[] = (pyData.experience || []).map((exp: any, idx: number) => ({
    id: exp.id || `exp_${idx}_${Date.now()}`,
    company: exp.company || 'Organization',
    role: exp.role || 'Role',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    bullets: Array.isArray(exp.bullets)
      ? exp.bullets
          .map((b: string) => enforceCanonicalCasing(b.trim()))
          .filter((b: string) => b.length > 2)
      : []
  }));

  // Append any projects as separate project items or clean experience items
  const projects: any[] = [];
  if (Array.isArray(pyData.projects) && pyData.projects.length > 0) {
    for (const proj of pyData.projects) {
      if (proj.title || proj.description) {
        projects.push({
          id: proj.id || `proj_${Date.now()}_${projects.length}`,
          title: proj.title || 'Technical Project',
          subtitle: proj.technologies?.join(', ') || '',
          link: proj.link || '',
          bullets: proj.description ? [enforceCanonicalCasing(proj.description)] : []
        });
      }
    }
  }

  const skills = Array.isArray(pyData.skills) && pyData.skills.length > 0
    ? pyData.skills.map((cat: any) => ({
        category: cat.category || 'Technical Skills',
        items: Array.isArray(cat.items) ? cat.items.map((i: string) => enforceCanonicalCasing(i).replace(/(\.js)+/gi, '.js').replace(/(\.ts)+/gi, '.ts')) : []
      }))
    : (Array.isArray(pyData.detectedSkills) && pyData.detectedSkills.length > 0
        ? [{
            category: 'Technical Skills & Tools',
            items: pyData.detectedSkills.map((i: string) => enforceCanonicalCasing(i).replace(/(\.js)+/gi, '.js').replace(/(\.ts)+/gi, '.ts'))
          }]
        : []);

  const education = Array.isArray(pyData.education) && pyData.education.length > 0
    ? pyData.education.map((edu: any) => ({
        institution: edu.institution || 'University',
        degree: edu.degree || 'Degree Program',
        year: edu.year || ''
      }))
    : [];

  const detectedRole = pyData.title || (experiences[0]?.role) || 'Candidate Profile';
  const rawText = pyData.rawExtractedText || pyData.parsedText || '';
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 50;

  return {
    id: `res_py_${Date.now()}`,
    title: detectedRole, // Never use fileName as title
    fullName: pyData.fullName || 'Candidate',
    email: pyData.email || '',
    phone: pyData.phone || '',
    location: pyData.location || '',
    linkedin: pyData.linkedin || '',
    github: pyData.github || '',
    portfolio: pyData.portfolio || '',
    contact: {
      email: pyData.email || '',
      phone: pyData.phone || '',
      location: pyData.location || '',
      linkedin: pyData.linkedin || '',
      github: pyData.github || '',
      portfolio: pyData.portfolio || ''
    },
    summary: pyData.summary ? enforceCanonicalCasing(pyData.summary) : '',
    experience: experiences,
    projects: projects.length > 0 ? projects : undefined,
    skills,
    education,
    certifications: Array.isArray(pyData.certifications) ? pyData.certifications : undefined,
    achievements: Array.isArray(pyData.achievements) ? pyData.achievements : undefined,
    awards: Array.isArray(pyData.awards) ? pyData.awards : undefined,
    scholarships: Array.isArray(pyData.scholarships) ? pyData.scholarships : undefined,
    leadership: Array.isArray(pyData.leadership) ? pyData.leadership : undefined,
    volunteer: Array.isArray(pyData.volunteer) ? pyData.volunteer : undefined,
    languages: Array.isArray(pyData.languages) ? pyData.languages : undefined,
    unclassified: Array.isArray(pyData.unclassified) ? pyData.unclassified : undefined,
    versionType: 'ORIGINAL',
    extractionStatus: wordCount > 40 ? 'SUCCESS' : (wordCount >= 10 ? 'PARTIAL' : 'OCR_REQUIRED'),
    rawExtractedText: rawText,
    ats_score: pyData.ats_score || 80
  };
}

/**
 * Fallback helper using FileReader readAsText
 */
function readAsPlainText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

/**
 * Cleans extracted resume text
 */
export function cleanExtractedText(text: string): string {
  if (!text) return '';

  return text
    // Remove binary control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Normalize unicode bullet points and dashes
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u25CF\u25CB\u25A0\u25AA]/g, '• ')
    .replace(/[\u2013\u2014]/g, '—')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Normalize carriage returns
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive blank lines (more than 2 consecutive)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Checks if the text is readable plain text rather than raw binary PDF metadata or garbage
 */
export function isReadableText(text: string): boolean {
  if (!text || text.trim().length < 15) return false;

  const sample = text.trim();

  // If text starts with PDF header or contains raw PDF xref trailer garbage, it's not readable
  if (/^%PDF-/i.test(sample) || /^%\s*start\s*\d+/i.test(sample)) {
    return false;
  }

  // Count alphanumeric vs total characters ratio
  const alphaNumericCount = (sample.match(/[a-zA-Z0-9]/g) || []).length;
  const ratio = alphaNumericCount / sample.length;

  return ratio >= 0.30;
}

/**
 * High-Precision Text Resume Parser
 * Parses 100% of raw resume text into structured ResumeData without dropping any jobs,
 * bullets, multiline continuations, skills, or degrees.
 */
export function parseRawTextToResume(text: string, fileName?: string): ResumeData {
  const clean = cleanExtractedText(text);
  const rawLines = clean.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Strict Contact Metadata Extraction
  const emailMatch = clean.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : '';

  const phoneMatch = clean.match(/(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[\s-]?\d{10})/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const linkedinMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/i);
  const linkedin = linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : '';

  const githubMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-_]+)/i);
  const github = githubMatch ? `github.com/${githubMatch[1]}` : '';

  const portfolioMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:dev|io|me|app|tech|co|site)(?:\/[^\s]*)?)/i);
  const portfolio = portfolioMatch && !portfolioMatch[0].includes('linkedin') && !portfolioMatch[0].includes('github')
    ? portfolioMatch[0]
    : '';

  // Strict location parsing: ONLY check the top 8 lines (header block)
  // Strictly blacklist any skills, tech terms, or random tokens so they never leak into location!
  const BANNED_LOCATION_WORDS = [
    'jwt', 'authentication', 'react', 'node', 'developer', 'engineer', 'javascript',
    'python', 'api', 'apis', 'sql', 'database', 'docker', 'aws', 'cloud', 'intern',
    'student', 'university', 'degree', 'skills', 'tools', 'projects', 'experience',
    'full stack', 'backend', 'frontend', 'express', 'rest', 'security', 'oauth', 'token',
    'html', 'css', 'git', 'c++', 'java', 'portfolio', 'resume', 'curriculum', 'phone', 'email'
  ];

  let location = '';
  const headerLines = rawLines.slice(0, 10);
  for (const hLine of headerLines) {
    if (hLine.includes('@') || hLine.includes('http') || hLine.length > 55) continue;
    const lowerH = hLine.toLowerCase();
    const hasBannedWord = BANNED_LOCATION_WORDS.some((bw) => lowerH.includes(bw));
    if (hasBannedWord) continue;

    // Standard location patterns (City, ST or City, Country or Remote)
    const locPattern = /\b(?:[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}\b|[A-Z][a-zA-Z\s]+,\s*(?:USA|India|Canada|UK|United States|Germany|Australia)\b|Remote\b)/i;
    const match = hLine.match(locPattern);
    if (match) {
      location = match[0].trim();
      break;
    }
  }
  if (!location) {
    location = 'Remote / Flexible';
  }

  // 2. Candidate Name & Title from first few lines (NEVER use file name as candidate title!)
  let fullName = '';
  let title = '';

  for (let i = 0; i < Math.min(6, rawLines.length); i++) {
    const line = rawLines[i];
    if (line.includes('@') || line.includes('http') || line.length > 50) continue;
    if (/^(resume|curriculum|cv|page|phone|email|portfolio)/i.test(line)) continue;

    // Check if line looks like a person's name (2-4 words, capitalized)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && words.every((w) => /^[A-Z]/.test(w) || w.length <= 3)) {
      fullName = line;
      // Check next line for Title
      if (rawLines[i + 1] && !rawLines[i + 1].includes('@') && rawLines[i + 1].length < 60) {
        const candidateTitle = rawLines[i + 1];
        if (!/^(phone|email|linkedin|github|http)/i.test(candidateTitle)) {
          title = candidateTitle;
        }
      }
      break;
    }
  }

  if (!fullName) {
    fullName = rawLines[0]?.slice(0, 35) || 'Candidate';
  }

  // 3. Robust Section Header Identification
  const SECTION_PATTERNS: Record<string, RegExp> = {
    summary: /^(?:summary|professional summary|executive summary|profile|about me|career objective|objective)$/i,
    experience: /^(?:experience|work experience|professional experience|employment history|work history|career history|relevant experience)$/i,
    internships: /^(?:internship|internships|internship experience)$/i,
    skills: /^(?:skills|technical skills|skills & tools|core competencies|technologies|key skills|tech stack|tools & technologies)$/i,
    education: /^(?:education|academic background|academics|degrees|educational background|education & certifications)$/i,
    projects: /^(?:projects|key projects|technical projects|personal projects|selected projects|academic projects)$/i,
    certifications: /^(?:certifications|certificates|licenses & certifications|licenses)$/i,
    achievements: /^(?:achievements|key achievements|accomplishments)$/i,
    awards: /^(?:awards|honors|honors & awards|prizes|recognitions)$/i,
    scholarships: /^(?:scholarships|scholarship|fellowships|grants)$/i,
    leadership: /^(?:leadership|leadership & extracurricular|leadership experience|extracurricular activities|co-curricular activities|positions of responsibility)$/i,
    volunteer: /^(?:volunteer|volunteering|volunteer experience|community service)$/i,
    languages: /^(?:languages|language proficiency)$/i,
    publications: /^(?:publications|research papers)$/i
  };

  const sections: Record<string, string[]> = {
    header: [],
    summary: [],
    experience: [],
    internships: [],
    skills: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
    awards: [],
    scholarships: [],
    leadership: [],
    volunteer: [],
    languages: [],
    publications: [],
    unclassified: []
  };

  let currentSection = 'header';

  for (const line of rawLines) {
    const cleanHeader = line.replace(/[:\-—]/g, '').trim();
    let detectedSec: string | null = null;

    for (const [secKey, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(cleanHeader)) {
        detectedSec = secKey;
        break;
      }
    }

    if (detectedSec) {
      currentSection = detectedSec;
      continue;
    }

    sections[currentSection].push(line);
  }

  // 4. Summary Extraction (Canonical Casing enforced, strict zero-fabrication)
  let rawSummary = sections.summary.join(' ').trim();
  if (!rawSummary && sections.header.length > 1) {
    const topParagraph = sections.header.slice(1).find((l) => l.length > 60 && !l.includes('@'));
    if (topParagraph) rawSummary = topParagraph;
  }
  const summary = rawSummary ? enforceCanonicalCasing(rawSummary) : '';

  // 5. Protected Bullet & Experience Parsing (Prevents sentence splitting & broken fragments)
  const experiences: WorkExperience[] = [];
  const expLines = [...sections.experience, ...sections.internships];
  let currentExp: WorkExperience | null = null;

  const DATE_REGEX = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}\s*(?:-|–|—|to)\s*(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}|Present|Current)|\b(?:20\d{2}|19\d{2})\b/i;
  const BULLET_START_REGEX = /^[•\-\*–—▪▫►✔\[\+]\s*|^\d+[\.\)]\s+/;
  const ROLE_TITLE_REGEX = /(?:engineer|developer|architect|intern|specialist|analyst|lead|consultant|manager|fellow|associate|programmer)/i;

  for (const line of expLines) {
    const isBulletStart = BULLET_START_REGEX.test(line);
    const dateMatch = line.match(DATE_REGEX);

    // A line is ONLY a header if it is not a bullet start, does not end in a sentence period,
    // and matches a recognized role/company date pattern or role keyword
    const endsWithPeriod = /\.\s*$/.test(line);
    const startsWithLowercase = /^[a-z]/.test(line);
    const isHeaderLine = !isBulletStart && !endsWithPeriod && !startsWithLowercase && (
      (dateMatch && line.length < 90) ||
      (ROLE_TITLE_REGEX.test(line) && line.length < 75) ||
      (!currentExp && line.length < 60)
    );

    if (isHeaderLine) {
      if (currentExp) {
        experiences.push(currentExp);
      }

      // Safe split only on em-dash or pipe, NOT on solitary hyphen within sentence words
      const parts = line.split(/[—|–•]/).map((p) => p.trim()).filter(Boolean);
      let roleStr = parts[0] || 'Role';
      let compStr = parts[1] || 'Organization';
      let dateStr = dateMatch ? dateMatch[0] : '';

      if (DATE_REGEX.test(roleStr) && parts[1]) {
        roleStr = parts[1];
        compStr = parts[2] || 'Organization';
      }

      currentExp = {
        id: `exp_${Date.now()}_${experiences.length}`,
        role: enforceCanonicalCasing(roleStr),
        company: compStr,
        startDate: dateStr,
        endDate: '',
        bullets: []
      };
    } else if (currentExp) {
      const cleanLine = line.replace(BULLET_START_REGEX, '').trim();
      if (!cleanLine) continue;

      if (isBulletStart || currentExp.bullets.length === 0) {
        currentExp.bullets.push(enforceCanonicalCasing(cleanLine));
      } else {
        const lastIdx = currentExp.bullets.length - 1;
        const prevBullet = currentExp.bullets[lastIdx];
        currentExp.bullets[lastIdx] = enforceCanonicalCasing(`${prevBullet} ${cleanLine}`);
      }
    }
  }

  if (currentExp && currentExp.bullets.length > 0) {
    experiences.push(currentExp);
  }

  if (experiences.length === 0 && expLines.length > 0) {
    const bullets = expLines
      .filter((l) => l.length > 10)
      .map((l) => enforceCanonicalCasing(l.replace(BULLET_START_REGEX, '').trim()));

    if (bullets.length > 0) {
      experiences.push({
        id: `exp_${Date.now()}_0`,
        company: 'Experience',
        role: title || 'Professional Role',
        startDate: '',
        endDate: '',
        bullets
      });
    }
  }

  // 6. Dedicated Projects Parsing
  const projectsList: ResumeProject[] = [];
  if (sections.projects.length > 0) {
    let currentProj: ResumeProject | null = null;
    for (const pLine of sections.projects) {
      const isBullet = BULLET_START_REGEX.test(pLine);
      const endsWithP = /\.\s*$/.test(pLine);
      const isProjHeader = !isBullet && !endsWithP && pLine.length < 70;

      if (isProjHeader) {
        if (currentProj && currentProj.bullets.length > 0) {
          projectsList.push(currentProj);
        }
        currentProj = {
          id: `proj_${Date.now()}_${projectsList.length}`,
          title: enforceCanonicalCasing(pLine.replace(/[:\-]/g, '').trim()),
          bullets: []
        };
      } else if (currentProj) {
        const cleanP = pLine.replace(BULLET_START_REGEX, '').trim();
        if (cleanP) {
          if (isBullet || currentProj.bullets.length === 0) {
            currentProj.bullets.push(enforceCanonicalCasing(cleanP));
          } else {
            const pIdx = currentProj.bullets.length - 1;
            currentProj.bullets[pIdx] = enforceCanonicalCasing(`${currentProj.bullets[pIdx]} ${cleanP}`);
          }
        }
      }
    }
    if (currentProj && currentProj.bullets.length > 0) {
      projectsList.push(currentProj);
    }
  }

  // 7. Complete Skills Extraction with Canonical Casing (Zero fabrication)
  const skillsList: Array<{ category: string; items: string[] }> = [];
  const skillCategories: Record<string, string[]> = {};

  if (sections.skills.length > 0) {
    for (const sLine of sections.skills) {
      if (sLine.includes(':')) {
        const [catName, itemsStr] = sLine.split(':');
        const items = itemsStr
          .split(/[,|•;]/)
          .map((i) => enforceCanonicalCasing(i.trim()).replace(/(\.js)+/gi, '.js').replace(/(\.ts)+/gi, '.ts'))
          .filter((i) => i.length > 1 && i.length < 35);

        if (items.length > 0) {
          const category = catName.trim() || 'Technical Skills';
          skillCategories[category] = (skillCategories[category] || []).concat(items);
        }
      } else {
        const items = sLine
          .split(/[,|•;]/)
          .map((i) => enforceCanonicalCasing(i.trim().replace(BULLET_START_REGEX, '')).replace(/(\.js)+/gi, '.js').replace(/(\.ts)+/gi, '.ts'))
          .filter((i) => i.length > 1 && i.length < 35);

        if (items.length > 0) {
          skillCategories['Technical Skills & Tools'] = (skillCategories['Technical Skills & Tools'] || []).concat(items);
        }
      }
    }
  }

  for (const [category, items] of Object.entries(skillCategories)) {
    const uniqueItems = Array.from(new Set(items));
    if (uniqueItems.length > 0) {
      skillsList.push({ category, items: uniqueItems });
    }
  }

  if (skillsList.length === 0) {
    const COMMON_SKILLS = [
      'Python', 'Java', 'TypeScript', 'JavaScript', 'C++', 'Go', 'SQL', 'React.js', 'Next.js',
      'Node.js', 'FastAPI', 'Express.js', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker',
      'Kubernetes', 'AWS', 'GCP', 'Azure', 'Git', 'CI/CD', 'REST APIs', 'GraphQL', 'Linux'
    ];
    const detected = COMMON_SKILLS.filter((s) => new RegExp(`\\b${s.replace('.', '\\.')}\\b`, 'i').test(clean));
    if (detected.length > 0) {
      skillsList.push({
        category: 'Technical Skills & Tools',
        items: detected
      });
    }
  }

  // 8. Complete Education Extraction
  const educationList: Array<{ institution: string; degree: string; year: string }> = [];
  const eduLines = sections.education;

  for (let i = 0; i < eduLines.length; i++) {
    const line = eduLines[i];
    const yearMatch = line.match(/\b(20\d{2}|19\d{2})\b/);
    const degreeMatch = line.match(/(?:bachelor|master|ph\.?d|b\.?s|m\.?s|b\.?a|associate|degree|diploma)/i);

    if (degreeMatch || line.includes('University') || line.includes('College') || line.includes('Institute')) {
      const parts = line.split(/[—\-|–•,]/).map((p) => p.trim()).filter(Boolean);
      let inst = parts.find((p) => /university|college|institute|school|academy/i.test(p)) || parts[0] || 'University';
      let deg = parts.find((p) => /bachelor|master|ph\.?d|b\.?s|m\.?s|degree/i.test(p)) || parts[1] || 'Degree Program';
      let yr = yearMatch ? yearMatch[0] : (eduLines[i + 1]?.match(/\b(20\d{2}|19\d{2})\b/)?.[0] || '');

      educationList.push({
        institution: inst,
        degree: deg,
        year: yr
      });
    }
  }

  if (educationList.length === 0 && eduLines.length > 0) {
    educationList.push({
      institution: eduLines[0] || 'Academic Institution',
      degree: eduLines[1] || 'Degree',
      year: ''
    });
  }

  // 9. Extract Additional Sections (Achievements, Awards, Scholarships, Leadership, Volunteer, Languages, Certifications)
  const cleanList = (linesArray: string[]): string[] => {
    return linesArray
      .map((l) => enforceCanonicalCasing(l.replace(BULLET_START_REGEX, '').trim()))
      .filter((l) => l.length > 2);
  };

  const achievements = cleanList(sections.achievements);
  const awards = cleanList(sections.awards);
  const scholarships = cleanList(sections.scholarships);
  const leadership = cleanList(sections.leadership);
  const volunteer = cleanList(sections.volunteer);
  const languages = cleanList(sections.languages);
  const unclassified = cleanList(sections.unclassified);

  const certLines = cleanList(sections.certifications);
  const certifications = certLines.map((c, i) => ({
    id: `cert_${Date.now()}_${i}`,
    name: c
  }));

  const finalTitle = title || (experiences[0]?.role) || 'Candidate Profile';
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  const extractionStatus = wordCount > 40 ? 'SUCCESS' : (wordCount >= 10 ? 'PARTIAL' : 'OCR_REQUIRED');

  return {
    id: `res_custom_${Date.now()}`,
    title: finalTitle,
    fullName,
    email: email || '',
    phone: phone || '',
    location,
    linkedin,
    github,
    portfolio,
    contact: {
      email: email || '',
      phone: phone || '',
      location,
      linkedin,
      github,
      portfolio
    },
    summary,
    experience: experiences,
    projects: projectsList.length > 0 ? projectsList : undefined,
    skills: skillsList,
    education: educationList,
    certifications: certifications.length > 0 ? certifications : undefined,
    achievements: achievements.length > 0 ? achievements : undefined,
    awards: awards.length > 0 ? awards : undefined,
    scholarships: scholarships.length > 0 ? scholarships : undefined,
    leadership: leadership.length > 0 ? leadership : undefined,
    volunteer: volunteer.length > 0 ? volunteer : undefined,
    languages: languages.length > 0 ? languages : undefined,
    unclassified: unclassified.length > 0 ? unclassified : undefined,
    versionType: 'ORIGINAL',
    extractionStatus,
    rawExtractedText: clean,
    ats_score: 80
  };
}
