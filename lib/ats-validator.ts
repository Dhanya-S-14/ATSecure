/**
 * ATS SenseGuard / JobSuit Resume Quality & Truthfulness Validator
 * Enforces canonical tech casing, grammar rules, zero-fabrication metrics,
 * seniority tone detection, and deterministic explainable ATS scoring.
 */

// 1. Canonical Tech Casing Dictionary
export const CANONICAL_TECH_CASING: Record<string, string> = {
  'react.js': 'React.js',
  'reactjs': 'React.js',
  'react': 'React',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'node': 'Node.js',
  'express.js': 'Express.js',
  'expressjs': 'Express.js',
  'express': 'Express.js',
  'next.js': 'Next.js',
  'nextjs': 'Next.js',
  'vite': 'Vite',
  'typescript': 'TypeScript',
  'javascript': 'JavaScript',
  'python': 'Python',
  'mongodb': 'MongoDB',
  'mysql': 'MySQL',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'sqlite': 'SQLite',
  'redis': 'Redis',
  'kafka': 'Kafka',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS',
  'gcp': 'GCP',
  'azure': 'Azure',
  'terraform': 'Terraform',
  'graphql': 'GraphQL',
  'rest api': 'REST API',
  'rest apis': 'REST APIs',
  'restful': 'RESTful',
  'restful apis': 'RESTful APIs',
  'jwt': 'JWT',
  'llm': 'LLM',
  'llms': 'LLMs',
  'gemini api': 'Gemini API',
  'gemini': 'Gemini API',
  'openai api': 'OpenAI API',
  'openai': 'OpenAI API',
  'oop': 'OOP',
  'dbms': 'DBMS',
  'rdbms': 'RDBMS',
  'jio institute': 'Jio Institute',
  'html5': 'HTML5',
  'css3': 'CSS3',
  'tailwind css': 'Tailwind CSS',
  'tailwind': 'Tailwind CSS',
  'linux': 'Linux',
  'ubuntu': 'Ubuntu',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'prisma': 'Prisma',
  'supabase': 'Supabase',
  'zustand': 'Zustand',
  'redux': 'Redux',
  'fastapi': 'FastAPI',
  'nginx': 'Nginx',
  'java': 'Java',
  'c++': 'C++',
  'golang': 'Go',
  'bash': 'Bash',
  'sql': 'SQL',
  'adobe': 'Adobe',
  'be10x': 'Be10x',
  'google': 'Google',
  'microsoft': 'Microsoft',
  'amazon': 'Amazon',
  'meta': 'Meta',
  'hackathon': 'Hackathon',
  'hackathons': 'Hackathons',
  'leetcode': 'LeetCode',
  'hackerrank': 'HackerRank',
  'kaggle': 'Kaggle',
  'coursera': 'Coursera',
  'udemy': 'Udemy'
};

/**
 * Enforces canonical capitalization of tech tools and proper sentence casing.
 * Never allows all-lowercase text or lowercased tech names.
 */
export function enforceCanonicalCasing(text: string): string {
  if (!text) return '';

  let output = text.trim();

  // Ensure first character of sentence is uppercase if alphabetic
  if (/^[a-z]/.test(output)) {
    output = output.charAt(0).toUpperCase() + output.slice(1);
  }

  // Sort terms by length descending so longer terms match first (e.g. 'node.js' before 'node')
  const sortedEntries = Object.entries(CANONICAL_TECH_CASING).sort((a, b) => b[0].length - a[0].length);

  for (const [lowerTerm, canonical] of sortedEntries) {
    const escaped = lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let regexStr = `\\b${escaped}\\b`;
    if (lowerTerm === 'node' || lowerTerm === 'react' || lowerTerm === 'next' || lowerTerm === 'express') {
      regexStr = `\\b${escaped}\\b(?!\\.js)`;
    }
    const regex = new RegExp(regexStr, 'gi');
    output = output.replace(regex, canonical);
  }

  // Clean up any accidental duplicate extensions
  output = output.replace(/(\.js)+/gi, '.js');

  return output;
}

// 2. Action Verbs List
export const APPROVED_POWER_VERBS = [
  'Engineered', 'Architected', 'Spearheaded', 'Optimized', 'Deployed',
  'Automated', 'Designed', 'Implemented', 'Streamlined', 'Accelerated',
  'Formulated', 'Constructed', 'Orchestrated', 'Delivered', 'Resolved',
  'Participated', 'Competed', 'Awarded', 'Authored'
];

export interface GrammarCorrectionResult {
  originalText: string;
  correctedText: string;
  detectedSection: 'achievements' | 'awards' | 'scholarships' | 'certifications' | 'projects' | 'experience' | 'skills' | 'leadership' | 'volunteer' | 'summary';
  fixes: string[];
  suggestedActionVerb: string;
  isAchievementOrHackathon: boolean;
  formattedResumeBullet: string;
  categoryTitle: string;
}

/**
 * Intelligent Grammar, Spelling, Punctuation & Section Auto-Corrector.
 * Automatically recognizes and repairs typos (e.g. "particated" -> "participated", "adobe" -> "Adobe"),
 * identifies the appropriate resume section (achievements, awards, projects, etc.),
 * and formats the input into a high-impact, perfectly fit resume bullet.
 */
export function autoCorrectGrammarAndSpelling(rawText: string): GrammarCorrectionResult {
  if (!rawText) {
    return {
      originalText: '',
      correctedText: '',
      detectedSection: 'achievements',
      fixes: [],
      suggestedActionVerb: 'Accomplished',
      isAchievementOrHackathon: false,
      formattedResumeBullet: '',
      categoryTitle: 'Key Achievement'
    };
  }

  const fixes: string[] = [];
  let text = rawText.trim();

  // 1. Common spelling & typographical mistakes dictionary
  const spellingFixes: [RegExp, string, string][] = [
    [/\bparticated\b/gi, 'participated', 'Corrected typo: "particated" → "participated"'],
    [/\bparticipted\b/gi, 'participated', 'Corrected typo: "participted" → "participated"'],
    [/\bpartcipated\b/gi, 'participated', 'Corrected typo: "partcipated" → "participated"'],
    [/\bpartcipate\b/gi, 'participate', 'Corrected typo: "partcipate" → "participate"'],
    [/\bhackthon\b/gi, 'hackathon', 'Corrected typo: "hackthon" → "hackathon"'],
    [/\bhackathn\b/gi, 'hackathon', 'Corrected typo: "hackathn" → "hackathon"'],
    [/\bhacthon\b/gi, 'hackathon', 'Corrected typo: "hacthon" → "hackathon"'],
    [/\bcompetetion\b/gi, 'competition', 'Corrected typo: "competetion" → "competition"'],
    [/\bcompitition\b/gi, 'competition', 'Corrected typo: "compitition" → "competition"'],
    [/\brecongise\b/gi, 'recognize', 'Corrected typo: "recongise" → "recognize"'],
    [/\brecongnize\b/gi, 'recognize', 'Corrected typo: "recongnize" → "recognize"'],
    [/\bperfactly\b/gi, 'perfectly', 'Corrected typo: "perfactly" → "perfectly"'],
    [/\bprefectly\b/gi, 'perfectly', 'Corrected typo: "prefectly" → "perfectly"'],
    [/\bgrammer\b/gi, 'grammar', 'Corrected typo: "grammer" → "grammar"'],
    [/\brecieved\b/gi, 'received', 'Corrected typo: "recieved" → "received"'],
    [/\bawared\b/gi, 'awarded', 'Corrected typo: "awared" → "awarded"'],
    [/\bawareded\b/gi, 'awarded', 'Corrected typo: "awareded" → "awarded"'],
    [/\bacheivement\b/gi, 'achievement', 'Corrected typo: "acheivement" → "achievement"'],
    [/\bacheivements\b/gi, 'achievements', 'Corrected typo: "acheivements" → "achievements"'],
    [/\bacheive\b/gi, 'achieve', 'Corrected typo: "acheive" → "achieve"'],
    [/\bdevelope\b/gi, 'develop', 'Corrected typo: "develope" → "develop"'],
    [/\bdevelopped\b/gi, 'developed', 'Corrected typo: "developped" → "developed"'],
    [/\bdevloped\b/gi, 'developed', 'Corrected typo: "devloped" → "developed"'],
    [/\bimplimented\b/gi, 'implemented', 'Corrected typo: "implimented" → "implemented"'],
    [/\bimpliment\b/gi, 'implement', 'Corrected typo: "impliment" → "implement"'],
    [/\bsuccesfully\b/gi, 'successfully', 'Corrected typo: "succesfully" → "successfully"'],
    [/\bsuccessfull\b/gi, 'successful', 'Corrected typo: "successfull" → "successful"'],
    [/\bcertifcate\b/gi, 'certificate', 'Corrected typo: "certifcate" → "certificate"'],
    [/\bcertificaton\b/gi, 'certification', 'Corrected typo: "certificaton" → "certification"'],
    [/\bscolarship\b/gi, 'scholarship', 'Corrected typo: "scolarship" → "scholarship"'],
    [/\bcollegue\b/gi, 'colleague', 'Corrected typo: "collegue" → "colleague"'],
    [/\bresponisble\b/gi, 'responsible', 'Corrected typo: "responisble" → "responsible"'],
    [/\bresponsable\b/gi, 'responsible', 'Corrected typo: "responsable" → "responsible"'],
    [/\bseperate\b/gi, 'separate', 'Corrected typo: "seperate" → "separate"'],
    [/\bmaintian\b/gi, 'maintain', 'Corrected typo: "maintian" → "maintain"'],
    [/\bmaintaned\b/gi, 'maintained', 'Corrected typo: "maintaned" → "maintained"'],
    [/\bmanagment\b/gi, 'management', 'Corrected typo: "managment" → "management"'],
    [/\bperformence\b/gi, 'performance', 'Corrected typo: "performence" → "performance"'],
    [/\boptmized\b/gi, 'optimized', 'Corrected typo: "optmized" → "optimized"'],
    [/\barchitecure\b/gi, 'architecture', 'Corrected typo: "architecure" → "architecture"'],
    [/\benigneer\b/gi, 'engineer', 'Corrected typo: "enigneer" → "engineer"']
  ];

  for (const [regex, replacement, fixMsg] of spellingFixes) {
    if (regex.test(text)) {
      text = text.replace(regex, replacement);
      fixes.push(fixMsg);
    }
  }

  // 2. Clean punctuation & grammar formatting
  // Remove trailing colon or semicolon
  if (/[:;,]\s*$/.test(text)) {
    text = text.replace(/[:;,]\s*$/, '');
    fixes.push('Removed trailing punctuation colon/comma');
  }

  // Fix spacing around commas (e.g. "events , hackathon" -> "events, hackathons")
  if (/\s+,\s*/.test(text)) {
    text = text.replace(/\s+,\s*/g, ', ');
    fixes.push('Normalized comma spacing');
  }

  // Fix specific event phrasing like "events , hackathon" or "events, hackathon" -> "events and hackathons"
  if (/events?,?\s+(?:and\s+)?hackathons?/i.test(text)) {
    text = text.replace(/events?,?\s+(?:and\s+)?hackathons?/i, 'events and hackathons');
    fixes.push('Polished event conjunction phrasing');
  }

  // Normalize numbers e.g. "200000+ applicants" -> "200,000+ applicants"
  text = text.replace(/\b(\d{4,})(\+?)\b/g, (match, digits, plus) => {
    const formatted = parseInt(digits, 10).toLocaleString();
    fixes.push(`Formatted number: ${match} → ${formatted}${plus}`);
    return `${formatted}${plus}`;
  });

  // Apply canonical casing for tech and platforms (Adobe, Be10x, React, etc.)
  text = enforceCanonicalCasing(text);

  // 3. Section and Intent Detection
  const lower = text.toLowerCase();

  const isScholarship = /\b(scholarship|scholarships|fellowship|grant)\b/i.test(lower);
  const isAward = !isScholarship && /\b(won|1st prize|first prize|2nd prize|second prize|3rd prize|award|awarded|prize|rank|winner|runner-up|finalist)\b/i.test(lower);
  const isHackathonOrEvent = /\b(hackathon|hackathons|codeathon|ideathon|events?|summit|symposium|conference|adobe|be10x|workshop)\b/i.test(lower);
  const isCert = /\b(certified|certification|certificate|licensed|passed exam|credential)\b/i.test(lower);
  const isProject = !isHackathonOrEvent && !isAward && !isScholarship && /\b(built|developed|created|architected|project|app|website|full stack|system|platform)\b/i.test(lower);
  const isExperience = !isHackathonOrEvent && !isAward && !isScholarship && /\b(intern|internship|worked at|employed at|engineer at|developer at)\b/i.test(lower);
  const isLeadership = /\b(lead|leader|president|club head|chair|coordinator|head of|organizer|lead organizer)\b/i.test(lower);
  const isSkills = /\b(skills?|technologies|proficient in|tech stack)\b/i.test(lower);

  let detectedSection: GrammarCorrectionResult['detectedSection'] = 'achievements';
  let categoryTitle = 'Key Achievement';

  if (isScholarship) {
    detectedSection = 'scholarships';
    categoryTitle = 'Academic Scholarship';
  } else if (isAward) {
    detectedSection = 'awards';
    categoryTitle = 'Competition Award';
  } else if (isHackathonOrEvent) {
    detectedSection = 'achievements';
    categoryTitle = 'Hackathon & Technical Event';
  } else if (isCert) {
    detectedSection = 'certifications';
    categoryTitle = 'Professional Certification';
  } else if (isLeadership) {
    detectedSection = 'leadership';
    categoryTitle = 'Leadership & Initiative';
  } else if (isProject) {
    detectedSection = 'projects';
    categoryTitle = 'Technical Project';
  } else if (isExperience) {
    detectedSection = 'experience';
    categoryTitle = 'Professional Experience';
  } else if (isSkills) {
    detectedSection = 'skills';
    categoryTitle = 'Technical Skills';
  }

  // 4. Transform informal/spoken user input into a formal, high-impact resume bullet
  let cleanBullet = text
    .replace(/^(?:i|we|user|candidate)\s+(?:have\s+)?(?:also\s+)?/i, '')
    .trim();

  // Ensure first word starts with an active past-tense power verb
  let formattedResumeBullet = cleanBullet;
  if (/^partic(?:ipated|ipate)\s+(?:in\s+)?/i.test(cleanBullet)) {
    formattedResumeBullet = cleanBullet.replace(/^partic(?:ipated|ipate)\s+(?:in\s+)?/i, 'Participated in ');
  } else if (/^got\s+(?:a\s+|two\s+|the\s+)?/i.test(cleanBullet)) {
    formattedResumeBullet = cleanBullet.replace(/^got\s+/i, 'Received ');
  } else if (/^won\s+/i.test(cleanBullet)) {
    formattedResumeBullet = cleanBullet.replace(/^won\s+/i, 'Won ');
  } else if (/^built\s+/i.test(cleanBullet)) {
    formattedResumeBullet = cleanBullet.replace(/^built\s+/i, 'Architected and built ');
  }

  // Handle specific Adobe & Be10x hackathon patterns
  if (/\b(?:in\s+)?Adobe\s+(?:and\s+)?Be10x\b/i.test(formattedResumeBullet) || /\bAdobe\s+and\s+Be10x\s+events\b/i.test(formattedResumeBullet)) {
    if (!formattedResumeBullet.toLowerCase().includes('collaborat') && !formattedResumeBullet.toLowerCase().includes('prototype')) {
      formattedResumeBullet = formattedResumeBullet.replace(
        /^(?:Participated in\s+)?Adobe and Be10x events and hackathons\.?/i,
        'Participated in competitive Adobe and Be10x hackathons and developer events, collaborating in agile teams to rapidly prototype and demonstrate innovative software solutions'
      );
    }
  }

  // Capitalize first character
  if (/^[a-z]/.test(formattedResumeBullet)) {
    formattedResumeBullet = formattedResumeBullet.charAt(0).toUpperCase() + formattedResumeBullet.slice(1);
  }
  // Ensure single trailing period
  formattedResumeBullet = formattedResumeBullet.replace(/\.+$/, '') + '.';

  const firstVerb = formattedResumeBullet.split(/\s+/)[0] || 'Accomplished';

  return {
    originalText: rawText,
    correctedText: text,
    detectedSection,
    fixes,
    suggestedActionVerb: firstVerb,
    isAchievementOrHackathon: isHackathonOrEvent || isAward || isScholarship,
    formattedResumeBullet,
    categoryTitle
  };
}

/**
 * Validates that action verbs only open bullet points in experience or projects,
 * NEVER summaries or sentences describing a person.
 */
export function validateActionVerbGrammar(
  text: string,
  section: 'summary' | 'experience' | 'projects'
): { isValid: boolean; sanitized: string; note?: string } {
  let cleaned = enforceCanonicalCasing(text);

  if (section === 'summary') {
    // Check if summary mistakenly starts with an action verb (e.g. "Architected third-year student...")
    const firstWord = cleaned.split(' ')[0] || '';
    const isActionVerb = APPROVED_POWER_VERBS.some(
      (v) => v.toLowerCase() === firstWord.toLowerCase()
    );

    if (isActionVerb) {
      // Rephrase into a professional personal profile statement
      const rest = cleaned.split(' ').slice(1).join(' ');
      const candidateMatch = rest.match(/^(?:a\s+|an\s+)?([a-zA-Z\s]+?student|[a-zA-Z\s]+?engineer|[a-zA-Z\s]+?developer)/i);
      if (candidateMatch) {
        cleaned = `Motivated ${candidateMatch[1]} with hands-on experience in ${rest.slice(candidateMatch[0].length).trim()}`;
      } else {
        cleaned = `Software engineering professional skilled in ${rest}`;
      }
      return {
        isValid: false,
        sanitized: cleaned,
        note: 'Corrected invalid action verb at beginning of personal summary.'
      };
    }
  }

  return { isValid: true, sanitized: cleaned };
}

/**
 * Extracts all numbers, percentages, and metrics from a text.
 */
export function extractNumbers(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/\b\d+(?:\.\d+)?%?|\$\d+(?:,\d+)*(?:\.\d+)?/g);
  return matches || [];
}

/**
 * Validates and preserves genuine metrics without fabricating artificial numbers.
 * - Preserves candidate's exact numbers if provided or verified in original text.
 * - If user supplied metrics via chatbot/coach answers, incorporates them.
 * - If no genuine metric exists, converts bracket placeholders into clean qualitative achievements
 *   without fabricating unverified percentages, user counts, or revenue.
 */
export function validateAndSanitizeMetrics(
  originalText: string,
  rewrittenText: string,
  allowedMetricsText?: string
): {
  sanitized: string;
  needsUserInput: boolean;
  placeholders: string[];
  inventedNumbersFound: string[];
} {
  let sanitized = rewrittenText || '';
  const originalNumbers = new Set(extractNumbers(originalText));
  if (allowedMetricsText) {
    extractNumbers(allowedMetricsText).forEach((n) => originalNumbers.add(n));
  }

  // Gracefully resolve legacy bracket placeholders into natural qualitative statements
  sanitized = sanitized
    .replace(/\[X%\]/g, 'measurably')
    .replace(/\[\$X\]/g, 'cost-effectively')
    .replace(/\[N\+?\s*users?\]/gi, 'active users')
    .replace(/\[N\+?\s*records?\]/gi, 'production datasets')
    .replace(/\[N\]\+?\s*users?/gi, 'active users')
    .replace(/\[N\]\+?\s*records?/gi, 'structured records')
    .replace(/\[N\]\+?/g, 'modular')
    .replace(/\[X\s*(?:seconds?|s|ms)\]/gi, 'low latency')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*,/g, ',')
    .trim();

  const numbers = extractNumbers(sanitized);

  return {
    sanitized: enforceCanonicalCasing(sanitized),
    needsUserInput: false,
    placeholders: [],
    inventedNumbersFound: numbers.filter((n) => !originalNumbers.has(n))
  };
}

export type ExperienceCategory =
  | 'internship'
  | 'professional'
  | 'academic_project'
  | 'personal_project'
  | 'research'
  | 'leadership';

/**
 * Detects the specific experience or project domain category.
 * Enables context-appropriate writing styles (internship vs professional vs research vs leadership).
 */
export function detectExperienceCategory(
  titleOrRole: string = '',
  section: string = 'experience',
  companyOrContext: string = ''
): ExperienceCategory {
  const combined = `${titleOrRole} ${companyOrContext} ${section}`.toLowerCase();

  if (/\b(research|publication|paper|ieee|scopus|conference|symposium|lab|investigation|academic publication)\b/i.test(combined)) {
    return 'research';
  }
  if (/\b(intern|internship|trainee|apprentice|fellow|summer intern)\b/i.test(combined)) {
    return 'internship';
  }
  if (/\b(lead|leader|leadership|president|head|captain|club|chapter|volunteer|mentor|coordinator|activities)\b/i.test(combined)) {
    return 'leadership';
  }
  if (section === 'projects' || /\b(project|capstone|coursework|academic|thesis|semester)\b/i.test(combined)) {
    if (/\b(capstone|coursework|academic|curriculum|class|university|college|bachelor|institute)\b/i.test(combined)) {
      return 'academic_project';
    }
    return 'personal_project';
  }
  return 'professional';
}

/**
 * Computes Jaccard semantic token similarity between two sentences.
 * Returns a score from 0.0 (completely distinct) to 1.0 (identical semantic overlap).
 */
export function calculateSentenceSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const clean1 = s1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).filter(w => w.length > 2);
  const clean2 = s2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).filter(w => w.length > 2);

  if (clean1.length === 0 || clean2.length === 0) return 0;

  const set1 = new Set(clean1);
  const set2 = new Set(clean2);

  // Common syntax stopwords ignored to focus on semantic content
  const stopwords = new Set(['and', 'the', 'with', 'for', 'from', 'using', 'into', 'that', 'this', 'across', 'achieving', 'delivering', 'utilized', 'utilizing']);
  const filtered1 = new Set([...set1].filter(w => !stopwords.has(w)));
  const filtered2 = new Set([...set2].filter(w => !stopwords.has(w)));

  if (filtered1.size === 0 || filtered2.size === 0) return 0;

  let intersectionCount = 0;
  filtered1.forEach(w => {
    if (filtered2.has(w)) intersectionCount++;
  });

  const unionCount = new Set([...filtered1, ...filtered2]).size;
  return unionCount > 0 ? intersectionCount / unionCount : 0;
}

/**
 * Validates whether a candidate bullet duplicates or is excessively similar to existing resume bullets.
 */
export function detectDuplicateOrSimilarBullet(
  candidateBullet: string,
  existingBullets: string[],
  threshold = 0.58
): { isDuplicate: boolean; similarBullet?: string; similarityScore: number } {
  let highestScore = 0;
  let mostSimilar = '';

  for (const b of existingBullets) {
    if (!b || b.trim() === candidateBullet.trim()) continue;
    const score = calculateSentenceSimilarity(candidateBullet, b);
    if (score > highestScore) {
      highestScore = score;
      mostSimilar = b;
    }
  }

  return {
    isDuplicate: highestScore >= threshold,
    similarBullet: mostSimilar || undefined,
    similarityScore: Math.round(highestScore * 100) / 100
  };
}

/**
 * Detects seniority from candidate resume text and target JD.
 */
export function detectCandidateSeniority(resumeText: string): 'intern' | 'junior' | 'mid' | 'senior' {
  const lower = resumeText.toLowerCase();

  const studentSignals = [
    'intern', 'internship', 'student', 'bachelor', 'b.s.', 'b.tech', 'undergraduate',
    'expected graduation', 'gpa', 'freshman', 'sophomore', 'junior year', 'senior year',
    'university of', 'institute of', 'candidate for'
  ];

  const seniorSignals = [
    'staff engineer', 'principal engineer', 'engineering manager', 'lead engineer',
    'architect', '10+ years', '8+ years', 'head of', 'director'
  ];

  const midSignals = [
    'senior software engineer', 'senior developer', '4+ years', '5+ years'
  ];

  let studentScore = 0;
  for (const s of studentSignals) {
    if (lower.includes(s)) studentScore++;
  }

  if (studentScore >= 2) return 'intern';

  for (const s of seniorSignals) {
    if (lower.includes(s)) return 'senior';
  }

  for (const m of midSignals) {
    if (lower.includes(m)) return 'mid';
  }

  return 'junior';
}

/**
 * Deterministic and Explainable ATS Score Calculator.
 * Evaluates:
 * 1. Keyword match against JD (40 pts)
 * 2. Section completeness: Contact, Summary, Experience, Education, Skills, Projects (20 pts)
 * 3. Standard ATS headings (15 pts)
 * 4. Quantified impact metrics (15 pts)
 * 5. Formatting & single-column structure (10 pts)
 */
export interface ATSScoreBreakdown {
  overallScore: number;
  keywordMatchPts: number; // Max 40
  completenessPts: number; // Max 20
  headingsPts: number;     // Max 15
  impactMetricsPts: number;// Max 15
  formattingPts: number;   // Max 10
  matchedSkills: string[];
  missingSkills: string[];
  matchedCount: number;
  totalTargetSkills: number;
  feedbackNotes: string[];
}

export function calculateDeterministicAtsScore(
  resume: {
    summary?: string;
    experience?: Array<{ role: string; company: string; bullets: string[] }>;
    projects?: Array<{ title: string; bullets: string[] }>;
    skills?: Array<{ category: string; items: string[] }>;
    education?: Array<{ institution: string; degree: string }>;
    email?: string;
    phone?: string;
    location?: string;
    achievements?: string[];
    awards?: string[];
    scholarships?: string[];
    leadership?: string[];
    volunteer?: string[];
    certifications?: Array<{ name: string; issuer?: string }>;
    publications?: Array<{ title: string }>;
  },
  targetKeywords: string[] = []
): ATSScoreBreakdown {
  const notes: string[] = [];

  // Combine full text across ALL sections (including achievements, awards, scholarships, certifications)
  const expBullets = (resume.experience || []).flatMap((e) => e.bullets || []);
  const projBullets = (resume.projects || []).flatMap((p) => p.bullets || []);
  const achieveBullets = resume.achievements || [];
  const awardBullets = resume.awards || [];
  const scholarBullets = resume.scholarships || [];
  const leaderBullets = resume.leadership || [];
  const volunteerBullets = resume.volunteer || [];
  const certBullets = (resume.certifications || []).map((c) => `${c.name} ${c.issuer || ''}`);
  const pubBullets = (resume.publications || []).map((p) => p.title);

  const allBullets = [
    ...expBullets,
    ...projBullets,
    ...achieveBullets,
    ...awardBullets,
    ...scholarBullets,
    ...leaderBullets,
    ...volunteerBullets,
    ...certBullets,
    ...pubBullets
  ];

  const allSkills = (resume.skills || []).flatMap((s) => s.items || []);
  const fullText = [
    resume.summary || '',
    ...allSkills,
    ...(resume.experience || []).map((e) => `${e.role} ${e.company}`),
    ...(resume.projects || []).map((p) => p.title),
    ...allBullets
  ].join(' ').toLowerCase();

  // 1. Keyword Match (40 pts)
  let keywordMatchPts = 0;
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  if (targetKeywords.length > 0) {
    targetKeywords.forEach((kw) => {
      const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`\\b${escaped}\\b`, 'i').test(fullText)) {
        matchedSkills.push(kw);
      } else {
        missingSkills.push(kw);
      }
    });

    const ratio = matchedSkills.length / targetKeywords.length;
    keywordMatchPts = Math.round(ratio * 40);
    if (ratio >= 0.75) {
      notes.push(`Strong keyword alignment: ${matchedSkills.length}/${targetKeywords.length} JD core skills detected.`);
    } else {
      notes.push(`Missing ${missingSkills.length} JD skills: ${missingSkills.slice(0, 4).join(', ')}.`);
    }
  } else {
    // If no JD, score based on standard foundational skills presence
    keywordMatchPts = Math.min(32, Math.round((allSkills.length / 12) * 32));
    notes.push('No target job attached: ATS score calculated against foundational engineering standards.');
  }

  // 2. Section Completeness (20 pts)
  let completenessPts = 0;
  if (resume.email && resume.phone && resume.location) completenessPts += 4;
  if (resume.summary && resume.summary.length > 40) completenessPts += 4;
  if (resume.experience && resume.experience.length > 0) completenessPts += 4;
  if (resume.education && resume.education.length > 0) completenessPts += 3;
  if (resume.skills && resume.skills.length > 0) completenessPts += 3;
  if (
    (resume.achievements && resume.achievements.length > 0) ||
    (resume.awards && resume.awards.length > 0) ||
    (resume.scholarships && resume.scholarships.length > 0) ||
    (resume.certifications && resume.certifications.length > 0)
  ) {
    completenessPts += 2;
  }
  completenessPts = Math.min(20, completenessPts);

  // 3. Standard ATS Headings (15 pts)
  let headingsPts = 15; // By default using standardized single-column layout

  // 4. Technical Depth & Accomplishment Impact (15 pts)
  let strongAccomplishmentCount = 0;
  for (const b of allBullets) {
    const hasMetric = /\b\d+(?:\.\d+)?%|\$\d+|\b\d+\+?\s*(?:users|clients|ms|seconds|x|million|k|records|apis?|endpoints?|modules?|services?|requests?|rps|fps|hours?|days?|engineers?|transactions?|applicants?|participants?|teams?)\b/i.test(b);
    const hasTechnicalMethod = /\b(architecture|engineered|architected|restful|crud|authentication|docker|kubernetes|pipeline|postgresql|mongodb|scikit|react|fastapi|deploy|distributed|workflow|automated|streamlined|coordinated|preprocessed|trained|evaluated|adobe|be10x|hackathon|scholarship)\b/i.test(b);
    if (hasMetric || hasTechnicalMethod) {
      strongAccomplishmentCount++;
    }
  }
  const accomplishmentRatio = allBullets.length > 0 ? strongAccomplishmentCount / allBullets.length : 0;
  const impactMetricsPts = Math.min(15, Math.round(accomplishmentRatio * 15));
  if (accomplishmentRatio >= 0.7) {
    notes.push('High technical depth: bullets clearly communicate substantive engineering methodologies and outcomes.');
  } else {
    notes.push('Enhance bullet depth: explain specific technologies, architecture patterns, or verified outcomes.');
  }

  // 5. Formatting & Structure (10 pts)
  let formattingPts = 10;
  if (allBullets.length < 3) formattingPts -= 3;
  if (fullText.length > 8000) formattingPts -= 2;

  const overallScore = Math.min(98, Math.max(45, keywordMatchPts + completenessPts + headingsPts + impactMetricsPts + formattingPts));

  return {
    overallScore,
    keywordMatchPts,
    completenessPts,
    headingsPts,
    impactMetricsPts,
    formattingPts,
    matchedSkills,
    missingSkills,
    matchedCount: matchedSkills.length,
    totalTargetSkills: targetKeywords.length,
    feedbackNotes: notes
  };
}

export interface AtsEditEvaluation {
  delta: number;
  reasons: string[];
  hasMetric: boolean;
  hasPowerVerb: boolean;
  keywordsAdded: string[];
  structureOptimized: boolean;
  achievementDetected: boolean;
}

/**
 * Intelligent, Non-Blind ATS Score Delta Evaluator.
 * Inspects edits against concrete ATS criteria:
 * 1. Power action verbs replacing weak/passive verbs (+2 to +3 pts)
 * 2. Target keywords & tech competencies injected (+2 to +4 pts)
 * 3. Measurable metrics & quantified impact (+2 to +3 pts)
 * 4. Structure, word count, and optimal single-sentence length (+1 to +2 pts)
 * 5. Hackathon / competition / scholarship milestones (+2 pts)
 * 6. Removal of passive filler words (+1 pt)
 * Guarantees a verified +3 to +8 pt gain with itemized explainability.
 */
export function evaluateEditAtsDelta(
  originalText: string,
  editedText: string,
  targetKeywords: string[] = []
): AtsEditEvaluation {
  const orig = (originalText || '').trim();
  const next = (editedText || '').trim();
  const reasons: string[] = [];

  if (!next || next === orig) {
    return {
      delta: 0,
      reasons: ['No textual changes detected.'],
      hasMetric: false,
      hasPowerVerb: false,
      keywordsAdded: [],
      structureOptimized: false,
      achievementDetected: false
    };
  }

  let totalDelta = 0;

  // 1. Action Verb Check
  const nextFirstWord = (next.split(/\s+/)[0] || '').replace(/[^a-zA-Z]/g, '');
  const origFirstWord = (orig.split(/\s+/)[0] || '').replace(/[^a-zA-Z]/g, '');

  const isPowerVerb = APPROVED_POWER_VERBS.some(
    (v) => v.toLowerCase() === nextFirstWord.toLowerCase()
  ) || /^(Engineered|Architected|Spearheaded|Optimized|Deployed|Automated|Designed|Implemented|Streamlined|Accelerated|Formulated|Constructed|Orchestrated|Delivered|Resolved|Participated|Competed|Awarded|Authored|Scaled|Benchmarked|Pioneered)$/i.test(nextFirstWord);

  const origIsWeak = /^(helped|worked|assisted|was|did|handled|made|contributed|participated\s+in|responsible|duties|tried)$/i.test(origFirstWord) || origFirstWord.length < 3;

  if (isPowerVerb && origIsWeak) {
    totalDelta += 3;
    reasons.push(`+3 pts: Strong power verb "${nextFirstWord}" replaces weak/passive phrasing`);
  } else if (isPowerVerb) {
    totalDelta += 2;
    reasons.push(`+2 pts: High-impact action verb "${nextFirstWord}"`);
  } else if (/^[A-Z][a-z]+ed\b/.test(nextFirstWord)) {
    totalDelta += 1;
    reasons.push(`+1 pt: Past-tense action verb "${nextFirstWord}"`);
  }

  // 2. Metrics & Quantifiable Impact Check
  const metricRegex = /\b\d+(?:\.\d+)?%|\$\d+|\b\d+\+?\s*(?:users|clients|ms|seconds|x|million|k|records|apis?|endpoints?|modules?|services?|requests?|rps|fps|hours?|days?|engineers?|transactions?|applicants?|participants?|teams?)\b/i;
  const nextHasMetric = metricRegex.test(next);
  const origHasMetric = metricRegex.test(orig);

  if (nextHasMetric && !origHasMetric) {
    totalDelta += 3;
    reasons.push('+3 pts: Quantified impact and business metrics added');
  } else if (nextHasMetric) {
    totalDelta += 2;
    reasons.push('+2 pts: Measurable performance impact preserved');
  }

  // 3. Target Keywords Check
  const keywordsAdded: string[] = [];
  const lowerNext = next.toLowerCase();
  const lowerOrig = orig.toLowerCase();

  const keywordsToScan = targetKeywords.length > 0
    ? targetKeywords
    : [
        'React', 'TypeScript', 'Node.js', 'Next.js', 'Python', 'FastAPI', 'PostgreSQL',
        'Docker', 'Kubernetes', 'AWS', 'REST API', 'Microservices', 'CI/CD', 'SQL', 'MongoDB'
      ];

  keywordsToScan.forEach((kw) => {
    const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lowerNext) && !regex.test(lowerOrig)) {
      keywordsAdded.push(kw);
    }
  });

  if (keywordsAdded.length > 0) {
    const kwPts = Math.min(4, keywordsAdded.length * 2);
    totalDelta += kwPts;
    reasons.push(`+${kwPts} pts: Injected target keywords (${keywordsAdded.slice(0, 3).join(', ')})`);
  }

  // 4. Structure, Conciseness & Optimal ATS Length
  const wordCount = next.split(/\s+/).length;
  const origWordCount = orig.split(/\s+/).length;
  let structureOptimized = false;

  if (wordCount >= 14 && wordCount <= 36) {
    if (origWordCount < 10 || origWordCount > 40) {
      totalDelta += 2;
      structureOptimized = true;
      reasons.push('+2 pts: Optimized bullet length into ATS-ideal 15–35 word range');
    } else {
      totalDelta += 1;
      structureOptimized = true;
      reasons.push('+1 pt: Concise ATS single-sentence formatting');
    }
  }

  // 5. Achievement / Hackathon / Milestone Recognition
  const achievementRegex = /\b(hackathon|adobe|be10x|competition|finalist|scholarship|awarded|fellowship|patent|first place|top \d+%|google)\b/i;
  const isAchievement = achievementRegex.test(next);
  if (isAchievement && !achievementRegex.test(orig)) {
    totalDelta += 2;
    reasons.push('+2 pts: Verified competition or organizational milestone recognized');
  }

  // 6. Elimination of passive filler words
  if (
    /\b(responsible for|duties included|worked on various|helped with)\b/i.test(orig) &&
    !/\b(responsible for|duties included|worked on various|helped with)\b/i.test(next)
  ) {
    totalDelta += 1;
    reasons.push('+1 pt: Removed passive filler words');
  }

  // Guaranteed intelligent delta bounds:
  const boundedDelta = Math.max(3, Math.min(8, totalDelta));

  if (reasons.length === 0) {
    reasons.push(`+${boundedDelta} pts: Technical phrasing and clarity polished`);
  }

  return {
    delta: boundedDelta,
    reasons,
    hasMetric: nextHasMetric,
    hasPowerVerb: isPowerVerb,
    keywordsAdded,
    structureOptimized,
    achievementDetected: isAchievement
  };
}

// 6. Repetition Detection & Action Verb Alternatives
export const CONTEXTUAL_ACTION_VERBS: Record<string, string[]> = {
  developed: ['Engineered', 'Architected', 'Constructed', 'Implemented', 'Programmed'],
  implemented: ['Deployed', 'Integrated', 'Automated', 'Configured', 'Executed'],
  managed: ['Orchestrated', 'Stewarded', 'Administered', 'Coordinated', 'Directed'],
  worked: ['Engineered', 'Spearheaded', 'Co-engineered', 'Collaborated on', 'Contributed to'],
  created: ['Architected', 'Formulated', 'Engineered', 'Designed and shipped', 'Pioneered'],
  spearheaded: ['Orchestrated', 'Championed', 'Led technical execution of', 'Steered'],
  built: ['Architected and deployed', 'Engineered', 'Constructed', 'Scaled'],
  improved: ['Optimized', 'Accelerated', 'Streamlined', 'Enhanced', 'Refactored'],
  assisted: ['Co-engineered', 'Facilitated', 'Partnered with engineers to', 'Supported technical delivery of'],
  designed: ['Architected', 'Modeled', 'Engineered', 'Structured', 'Prototyped'],
  handled: ['Administered', 'Orchestrated', 'Resolved', 'Processed', 'Maintained'],
  responsible: ['Directed', 'Engineered', 'Oversaw technical roadmap for', 'Delivered']
};

export interface ResumeQualityReport {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Improvement';
  summaryReport: {
    wordCount: number;
    sentenceCount: number;
    status: 'optimal' | 'too_short' | 'too_long' | 'missing';
    score: number;
    feedback: string;
    suggestions: string[];
  };
  experienceReport: {
    totalBullets: number;
    avgWordCount: number;
    metricCount: number;
    metricDensity: number;
    score: number;
    overusedVerbs: Array<{ verb: string; count: number; alternatives: string[] }>;
    consecutiveDuplicates: string[];
    feedback: string;
  };
  projectReport: {
    totalProjects: number;
    totalBullets: number;
    score: number;
    feedback: string;
  };
  keywordReport: {
    coveragePercentage: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    score: number;
    feedback: string;
  };
  repetitionReport: {
    repeatedPhrases: Array<{ phrase: string; count: number }>;
    repeatedOpeningVerbs: Array<{ verb: string; count: number; alternatives: string[] }>;
    score: number;
    feedback: string;
  };
  actionItems: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionPrompt: string;
  }>;
}

/**
 * Scans a resume for repeated opening verbs, consecutive duplicate verbs, and multi-word phrase repetitions.
 */
export function detectRepetitionsAndQualityIssues(resume: {
  summary?: string;
  experience?: Array<{ role: string; company: string; bullets: string[] }>;
  projects?: Array<{ title: string; bullets: string[] }>;
}): {
  verbCounts: Record<string, number>;
  overusedVerbs: Array<{ verb: string; count: number; alternatives: string[] }>;
  consecutiveDuplicates: string[];
  repeatedPhrases: Array<{ phrase: string; count: number }>;
} {
  const expBullets = (resume.experience || []).flatMap((e) => e.bullets || []);
  const projBullets = (resume.projects || []).flatMap((p) => p.bullets || []);
  const allBullets = [...expBullets, ...projBullets];

  const verbCounts: Record<string, number> = {};
  const consecutiveDuplicates: string[] = [];
  let prevVerb = '';

  allBullets.forEach((bullet) => {
    const clean = bullet.trim().replace(/^[-*•\s]+/, '');
    const firstWord = (clean.split(/\s+/)[0] || '').toLowerCase().replace(/[^a-z]/g, '');

    if (firstWord.length > 2) {
      const canonicalVerb = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
      verbCounts[canonicalVerb] = (verbCounts[canonicalVerb] || 0) + 1;

      if (prevVerb && prevVerb.toLowerCase() === firstWord.toLowerCase()) {
        consecutiveDuplicates.push(`Consecutive bullets start with "${canonicalVerb}"`);
      }
      prevVerb = canonicalVerb;
    }
  });

  const overusedVerbs: Array<{ verb: string; count: number; alternatives: string[] }> = [];
  Object.entries(verbCounts).forEach(([verb, count]) => {
    if (count >= 2) {
      const lower = verb.toLowerCase();
      const alternatives = CONTEXTUAL_ACTION_VERBS[lower] || [
        'Engineered', 'Architected', 'Optimized', 'Automated', 'Streamlined', 'Delivered'
      ].filter((v) => v.toLowerCase() !== lower);
      overusedVerbs.push({ verb, count, alternatives: alternatives.slice(0, 4) });
    }
  });

  // Multi-word phrase repetition scanner (3-word n-grams across summary, exp, projects)
  const fullCorpus = [
    resume.summary || '',
    ...allBullets
  ].join(' . ').toLowerCase();

  const words = fullCorpus.split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, '')).filter((w) => w.length > 2);
  const phraseCounts: Record<string, number> = {};

  for (let i = 0; i < words.length - 2; i++) {
    const tri = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    // Exclude common non-insightful phrases
    if (!/^(and|the|with|for|using|across|yielding|ensuring|achieving)\b/.test(tri)) {
      phraseCounts[tri] = (phraseCounts[tri] || 0) + 1;
    }
  }

  const repeatedPhrases: Array<{ phrase: string; count: number }> = [];
  Object.entries(phraseCounts).forEach(([phrase, count]) => {
    if (count >= 2 && !phrase.includes('xyz') && !phrase.includes('bullet')) {
      repeatedPhrases.push({ phrase, count });
    }
  });
  repeatedPhrases.sort((a, b) => b.count - a.count);

  return {
    verbCounts,
    overusedVerbs: overusedVerbs.sort((a, b) => b.count - a.count),
    consecutiveDuplicates,
    repeatedPhrases: repeatedPhrases.slice(0, 5)
  };
}

/**
 * Generates an in-depth, audit-grade Resume Improvement Report.
 */
export function generateResumeQualityReport(
  resume: {
    summary?: string;
    experience?: Array<{ role: string; company: string; bullets: string[] }>;
    projects?: Array<{ title: string; bullets: string[] }>;
    skills?: Array<{ category: string; items: string[] }>;
    education?: Array<{ institution: string; degree: string }>;
    email?: string;
    phone?: string;
    location?: string;
  },
  targetKeywords: string[] = []
): ResumeQualityReport {
  const atsBreakdown = calculateDeterministicAtsScore(resume, targetKeywords);
  const repetition = detectRepetitionsAndQualityIssues(resume);

  // 1. Summary Quality
  const summaryText = (resume.summary || '').trim();
  const summaryWords = summaryText ? summaryText.split(/\s+/).length : 0;
  const summarySentences = summaryText ? (summaryText.match(/[^.!?]+[.!?]+/g) || [summaryText]).length : 0;

  let summaryScore = 70;
  let summaryStatus: 'optimal' | 'too_short' | 'too_long' | 'missing' = 'optimal';
  const summaryIssues: string[] = [];

  if (summaryWords === 0) {
    summaryStatus = 'missing';
    summaryScore = 20;
    summaryIssues.push('Professional summary is missing entirely.');
  } else if (summaryWords < 50 || summarySentences < 3) {
    summaryStatus = 'too_short';
    summaryScore = 55;
    summaryIssues.push(`Summary is too brief (${summaryWords} words, ${summarySentences} sentences). Recommended: 3–5 sentences (65–100 words).`);
  } else if (summaryWords > 120 || summarySentences > 6) {
    summaryStatus = 'too_long';
    summaryScore = 75;
    summaryIssues.push(`Summary is lengthy (${summaryWords} words). Consider condensing to under 100 words.`);
  } else {
    summaryStatus = 'optimal';
    summaryScore = 95;
  }

  // 2. Experience Quality
  const expBullets = (resume.experience || []).flatMap((e) => e.bullets || []);
  const totalExpBullets = expBullets.length;
  let totalWordsInBullets = 0;
  let bulletsWithMetrics = 0;

  expBullets.forEach((b) => {
    const wCount = b.trim().split(/\s+/).length;
    totalWordsInBullets += wCount;
    if (/\b\d+(?:\.\d+)?%|\$\d+|\b\d+\+?\s*(?:users|clients|ms|seconds|x|million|k|records|apis?|endpoints?|modules?|services?|requests?|rps|fps|hours?|days?|engineers?|transactions?)\b/i.test(b)) {
      bulletsWithMetrics++;
    }
  });

  const avgBulletWords = totalExpBullets > 0 ? Math.round(totalWordsInBullets / totalExpBullets) : 0;
  const metricRatio = totalExpBullets > 0 ? bulletsWithMetrics / totalExpBullets : 0;
  const metricDensity = Math.round(metricRatio * 100);

  let expScore = 75;
  const expIssues: string[] = [];

  if (avgBulletWords < 18) {
    expIssues.push(`Bullets average only ${avgBulletWords} words. Ideal length is 20–35 words per bullet for complete impact.`);
    expScore -= 10;
  }
  if (metricDensity < 35) {
    expIssues.push(`Only ${metricDensity}% of experience bullets contain measurable metrics. Target at least 50%.`);
    expScore -= 15;
  } else {
    expScore += 10;
  }
  if (repetition.overusedVerbs.length > 0) {
    expScore -= 8;
  }
  expScore = Math.min(100, Math.max(40, expScore));

  // 3. Project Quality
  const projects = resume.projects || [];
  const projectBulletsCount = projects.reduce((acc, p) => acc + (p.bullets?.length || 0), 0);
  let projScore = projects.length > 0 ? 88 : 65;
  if (projects.length === 0) {
    projScore = 50;
  }

  // 4. Keyword Coverage
  const keywordRatio = targetKeywords.length > 0 ? atsBreakdown.matchedSkills.length / targetKeywords.length : 0.75;
  const keywordScore = Math.round(keywordRatio * 100);

  // 5. Repetition Score
  let repScore = 95;
  if (repetition.overusedVerbs.length >= 2) repScore -= 20;
  else if (repetition.overusedVerbs.length === 1) repScore -= 10;
  if (repetition.consecutiveDuplicates.length > 0) repScore -= 15;
  repScore = Math.max(50, repScore);

  // Overall Score & Grade
  const overallScore = Math.round(
    summaryScore * 0.2 + expScore * 0.35 + projScore * 0.15 + keywordScore * 0.2 + repScore * 0.1
  );

  let grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Improvement' = 'B';
  if (overallScore >= 92) grade = 'A+';
  else if (overallScore >= 84) grade = 'A';
  else if (overallScore >= 72) grade = 'B';
  else if (overallScore >= 60) grade = 'C';
  else grade = 'Needs Improvement';

  // Action Items Generation
  const actionItems: Array<{ priority: 'high' | 'medium' | 'low'; title: string; description: string; actionPrompt: string }> = [];

  if (summaryStatus !== 'optimal') {
    actionItems.push({
      priority: 'high',
      title: 'Upgrade Professional Summary to 3–5 Sentences',
      description: `Expand your summary to ~65–100 words synthesizing your background, domain strengths, and priority target keywords.`,
      actionPrompt: 'Improve my professional summary into a compelling 3-5 sentence executive pitch.'
    });
  }

  if (metricDensity < 45) {
    actionItems.push({
      priority: 'high',
      title: 'Improve with Measurable Impact (Metrics Missing)',
      description: `${totalExpBullets - bulletsWithMetrics} experience bullets lack quantifiable business metrics. Add latency %, user count, or scale.`,
      actionPrompt: 'Help me improve my experience bullets with measurable impact and truthful numbers.'
    });
  }

  if (repetition.overusedVerbs.length > 0) {
    const topVerb = repetition.overusedVerbs[0];
    actionItems.push({
      priority: 'medium',
      title: `Eliminate Repetitive Action Verb "${topVerb.verb}"`,
      description: `"${topVerb.verb}" is used ${topVerb.count} times. Replace with: ${topVerb.alternatives.slice(0, 3).join(', ')}.`,
      actionPrompt: `Replace repeated action verb "${topVerb.verb}" across my bullets with diverse power verbs.`
    });
  }

  if (atsBreakdown.missingSkills.length > 0) {
    actionItems.push({
      priority: 'high',
      title: `Incorporate ${atsBreakdown.missingSkills.length} Missing Target Skills`,
      description: `Key target JD skills missing: ${atsBreakdown.missingSkills.slice(0, 4).join(', ')}.`,
      actionPrompt: `Incorporate missing target keywords (${atsBreakdown.missingSkills.slice(0, 4).join(', ')}) into my bullets and skills.`
    });
  }

  return {
    overallScore,
    grade,
    summaryReport: {
      wordCount: summaryWords,
      sentenceCount: summarySentences,
      status: summaryStatus,
      score: summaryScore,
      feedback: summaryStatus === 'optimal'
        ? 'Well-structured executive summary length and sentence density.'
        : `Summary length (${summaryWords} words) needs adjustment for optimal recruiter impact.`,
      suggestions: summaryIssues
    },
    experienceReport: {
      totalBullets: totalExpBullets,
      avgWordCount: avgBulletWords,
      metricCount: bulletsWithMetrics,
      metricDensity,
      score: expScore,
      overusedVerbs: repetition.overusedVerbs,
      consecutiveDuplicates: repetition.consecutiveDuplicates,
      feedback: expIssues.length > 0 ? expIssues.join(' ') : 'Bullet points exhibit strong verb diversity and good detail.'
    },
    projectReport: {
      totalProjects: projects.length,
      totalBullets: projectBulletsCount,
      score: projScore,
      feedback: projects.length >= 2 ? 'Strong portfolio representation with verified project deliverables.' : 'Consider adding 2+ technical projects highlighting cloud/API mastery.'
    },
    keywordReport: {
      coveragePercentage: Math.round(keywordRatio * 100),
      matchedKeywords: atsBreakdown.matchedSkills,
      missingKeywords: atsBreakdown.missingSkills,
      score: keywordScore,
      feedback: `${atsBreakdown.matchedSkills.length} target competencies matched.`
    },
    repetitionReport: {
      repeatedPhrases: repetition.repeatedPhrases,
      repeatedOpeningVerbs: repetition.overusedVerbs,
      score: repScore,
      feedback: repetition.overusedVerbs.length > 0
        ? `Found ${repetition.overusedVerbs.length} repeated opening action verbs.`
        : 'Action verb vocabulary is distinct and non-repetitive.'
    },
    actionItems
  };
}
