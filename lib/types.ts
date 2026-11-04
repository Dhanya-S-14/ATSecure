export type ApplicationStatus = 'Draft' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface ResumeSection {
  id: string;
  title: string;
  content: string | string[];
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeContact {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github?: string;
  portfolio?: string;
}

export interface ResumeProject {
  id: string;
  title: string;
  subtitle?: string;
  link?: string;
  bullets: string[];
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer?: string;
  year?: string;
}

export interface ResumePublication {
  id: string;
  title: string;
  year?: string;
  link?: string;
}

export type ResumeVersionType = 'ORIGINAL' | 'EDITABLE' | 'AI_TAILORED' | 'AI_BUILT';

export type ExtractionStatus = 'SUCCESS' | 'PARTIAL' | 'OCR_REQUIRED' | 'FAILED';

export interface TailorAuditChange {
  id: string;
  timestamp: string;
  section: 'summary' | 'experience' | 'projects' | 'skills' | 'achievements' | 'awards' | 'scholarships' | 'leadership' | 'certifications' | 'volunteer' | 'publications' | 'languages' | 'unclassified';
  targetId?: string;
  originalText: string;
  appliedText: string;
  title: string;
  keywordsInjected: string[];
  scoreGain: number;
}

export interface CustomResumeSection {
  id: string;
  title: string;
  items: string[];
}

export interface ResumeData {
  id: string;
  userId?: string;
  title: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github?: string;
  portfolio?: string;
  contact?: ResumeContact;
  summary: string;
  experience: WorkExperience[];
  projects?: ResumeProject[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  certifications?: ResumeCertification[];
  publications?: ResumePublication[];
  achievements?: string[];
  awards?: string[];
  scholarships?: string[];
  leadership?: string[];
  volunteer?: string[];
  languages?: string[];
  unclassified?: string[];
  customSections?: CustomResumeSection[];
  versionType?: ResumeVersionType;
  extractionStatus?: ExtractionStatus;
  rawExtractedText?: string;
  targetJobTitle?: string;
  targetJobDescription?: string;
  ats_score?: number;
  created_at?: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  role: string;
  location?: string;
  salary?: string;
  job_description: string;
  status: ApplicationStatus;
  applied_date: string;
  ats_score?: number;
  match_keywords?: string[];
  missing_keywords?: string[];
  notes?: string;
}

export interface CoverLetter {
  id: string;
  application_id: string;
  resume_id?: string;
  company: string;
  role: string;
  content: string;
  created_at: string;
}

export interface ATSAnalysisResult {
  score: number;
  keywordMatchPercentage: number;
  formattingScore: number;
  actionVerbScore: number;
  missingSkills: {
    hardSkills: string[];
    softSkills: string[];
  };
  strengths: string[];
  weakBullets: {
    original: string;
    suggestion: string;
    reason: string;
  }[];
  formattingSuggestions: string[];
  matchedKeywords: string[];
}

export type CoachIntentType =
  | 'ADD_SECTION'
  | 'UPDATE_SECTION'
  | 'DELETE_SECTION'
  | 'ADD_ACHIEVEMENT'
  | 'ADD_SKILL'
  | 'REMOVE_SKILL'
  | 'UPDATE_SKILL'
  | 'ADD_PROJECT'
  | 'UPDATE_PROJECT'
  | 'ADD_EXPERIENCE'
  | 'UPDATE_EXPERIENCE'
  | 'UPDATE_EDUCATION'
  | 'UPDATE_SUMMARY'
  | 'REWRITE_CONTENT'
  | 'IMPROVE_GRAMMAR'
  | 'IMPROVE_RESUME_BULLET'
  | 'GENERAL_RESUME_QUERY';

export interface CareerCoachStructuredAction {
  intent: CoachIntentType;
  action: 'CREATE_SECTION' | 'CREATE_SECTION_AND_ADD_ITEM' | 'ADD_ITEM' | 'UPDATE_ITEM' | 'REMOVE_ITEM' | 'UPDATE_FIELD' | 'NOOP';
  targetSection: string;
  sectionTitle: string;
  createSectionIfMissing: boolean;
  originalUserInput: string;
  suggestedContent: string;
  title?: string;
  data?: any;
  explanation: string;
  actionPerformedMessage: string;
  scoreDelta: number;
  scoreIncreaseString: string;
  grammarCorrected?: boolean;
  requiresConfirmation?: boolean;
}

export interface CareerCoachChangeItem {
  id: string;
  section: 'summary' | 'experience' | 'projects' | 'skills' | 'certifications' | 'education' | 'achievements' | 'awards' | 'scholarships' | 'leadership' | 'volunteer' | 'languages' | 'publications' | 'unclassified' | string;
  action: 'add' | 'update' | 'remove';
  title?: string;
  originalText?: string;
  appliedText: string;
  explanation: string;
  ats_score_increase?: string;
  score_delta_value?: number;
  data?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'ai';
  text: string;
  timestamp: string;
  intent?: string;
  structuredAction?: CareerCoachStructuredAction;
  changesApplied?: CareerCoachChangeItem[];
  canUndo?: boolean;
  undoData?: {
    previousResume: ResumeData;
    description: string;
  };
  suggestedAction?: {
    type: 'replace_bullet' | 'auto_added' | 'undo_added';
    targetIndex?: number;
    expId?: string;
    newText: string;
    section?: string;
  };
  suggestions?: any[];
}
