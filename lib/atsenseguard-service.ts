/**
 * ATSenseGuard Dedicated Service & API Layer
 * Provides clean abstractions for analysis, authentication, user history, and feedback.
 */

export interface JobSuitMatch {
  matchedSkills: Array<{ name: string; supportedByProject?: boolean; details?: string }>;
  partialSkills: Array<{ name: string; reason?: string }>;
  missingSkills: Array<{ name: string; importance?: string }>;
}

export interface JobStepStep {
  stepNumber: number;
  title: string;
  type: string;
  description: string;
  difficulty?: string;
  estimatedDuration?: string;
  learningResources?: string[];
  projectIdea?: string;
  resumeBulletSuggestion?: string;
}

export interface JobStepRoadmap {
  targetRole: string;
  steps: JobStepStep[];
  predictedMatchAfterRoadmap: number;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  overallScore: number;
  keywordMatchRate: number;
  readabilityScore: number;
  structureScore: number;
  experienceRelevance: number;
  formattingStatus: 'Excellent' | 'Good' | 'Needs Improvement';
  matchedKeywords: string[];
  missingKeywords: string[];
  jobSuitMatch?: JobSuitMatch;
  jobStepRoadmap?: JobStepRoadmap;
  improvements: Array<{
    type: 'critical' | 'warning' | 'positive';
    message: string;
    suggestion: string;
  }>;
  sectionScores: {
    summary: number;
    experience: number;
    skills: number;
    education: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: 'Free' | 'Pro Member';
  createdAt: string;
  savedResumesCount: number;
  analysesCount: number;
}

export interface FeedbackData {
  name: string;
  email: string;
  type: 'Suggestion' | 'Bug Report' | 'Feature Request' | 'General Feedback';
  message: string;
}

export const MAX_FREE_ANALYSES = 1;

// --- Local Storage Helpers & Event Dispatching ---

export function getTrialCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem('atsenseguard_trial_count') || localStorage.getItem('jobsync_trial_count');
  return count ? parseInt(count, 10) : 0;
}

export function incrementTrialCount(): number {
  if (typeof window === 'undefined') return 0;
  const current = getTrialCount();
  const next = Math.min(MAX_FREE_ANALYSES, current + 1);
  localStorage.setItem('atsenseguard_trial_count', next.toString());
  localStorage.setItem('jobsync_trial_count', next.toString());
  dispatchAuthChange();
  return next;
}

export const useTrialCount = incrementTrialCount;

export function resetTrialCount(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('atsenseguard_trial_count', '0');
  localStorage.setItem('jobsync_trial_count', '0');
  dispatchAuthChange();
}

export function getAuthState(): { isAuthenticated: boolean; user: UserProfile | null; trialCount: number } {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null, trialCount: 0 };
  }
  const isAuth = localStorage.getItem('atsenseguard_authenticated') === 'true';
  const userData = localStorage.getItem('atsenseguard_user_profile');
  const user = userData ? JSON.parse(userData) : null;
  const trialCount = getTrialCount();
  return { isAuthenticated: isAuth, user, trialCount };
}

export function dispatchAuthChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('atsenseguard_auth_changed'));
    window.dispatchEvent(new Event('jobsync_auth_changed'));
  }
}

// --- API Service Abstractions ---

export async function analyzeResumeApi(params: {
  resumeText: string;
  jobDescription?: string;
  isBasic?: boolean;
}): Promise<AnalysisResult> {
  try {
    const geminiKey = typeof window !== 'undefined'
      ? (localStorage.getItem('GEMINI_API_KEY') || localStorage.getItem('AI_API_KEY') || '')
      : '';

    const response = await fetch('/api/analyze-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(geminiKey ? { 'x-gemini-api-key': geminiKey } : {})
      },
      body: JSON.stringify({
        resumeText: params.resumeText,
        jobDescription: params.jobDescription || '',
        geminiApiKey: geminiKey
      })
    });

    if (!response.ok) {
      throw new Error(`API response error: ${response.statusText}`);
    }

    const data = await response.json();

    const matchedKeywords: string[] = Array.isArray(data.matchedKeywords) ? data.matchedKeywords : [];
    const missingHard: string[] = data.missingSkills?.hardSkills || [];
    const missingSoft: string[] = data.missingSkills?.softSkills || [];
    const missingKeywords: string[] = [...missingHard, ...missingSoft];

    const improvements: Array<{
      type: 'critical' | 'warning' | 'positive';
      message: string;
      suggestion: string;
    }> = [];

    if (missingKeywords.length > 0) {
      improvements.push({
        type: 'critical',
        message: `Missing ${missingKeywords.length} Target Keywords`,
        suggestion: `Consider incorporating target skills like: ${missingKeywords.slice(0, 4).join(', ')}.`
      });
    }

    if (data.weakBullets && data.weakBullets.length > 0) {
      data.weakBullets.forEach((wb: any) => {
        improvements.push({
          type: 'warning',
          message: wb.reason || 'Bullet Point Impact Density',
          suggestion: `Original: "${wb.original}" → Suggested Rewrite: "${wb.suggestion}"`
        });
      });
    } else {
      improvements.push({
        type: 'warning',
        message: 'Bullet point metric density',
        suggestion: 'Quantify achievements with measurable percentages or numbers (e.g. "Increased throughput by 35%").'
      });
    }

    if (data.strengths && data.strengths.length > 0) {
      data.strengths.forEach((st: string) => {
        improvements.push({
          type: 'positive',
          message: 'Resume Strength Identified',
          suggestion: st
        });
      });
    }

    const score = data.score || 80;

    const result: AnalysisResult = {
      id: 'anl_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      overallScore: score,
      keywordMatchRate: data.keywordMatchPercentage || 75,
      readabilityScore: data.formattingScore || 90,
      structureScore: data.actionVerbScore || 85,
      experienceRelevance: Math.min(score + 2, 98),
      formattingStatus: score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement',
      matchedKeywords,
      missingKeywords,
      jobSuitMatch: data.jobSuitMatch,
      jobStepRoadmap: data.jobStepRoadmap,
      improvements,
      sectionScores: {
        summary: Math.min(score + 3, 98),
        experience: Math.max(score - 2, 60),
        skills: Math.min(score + 5, 100),
        education: 90
      }
    };

    if (typeof window !== 'undefined') {
      const existingStr = localStorage.getItem('atsenseguard_history') || '[]';
      const existing = JSON.parse(existingStr);
      localStorage.setItem('atsenseguard_history', JSON.stringify([result, ...existing]));
    }

    return result;
  } catch (err) {
    console.error('Failed to analyze resume via API:', err);
    throw err;
  }
}

export async function authRegisterApi(name: string, email: string): Promise<UserProfile> {
  await new Promise((res) => setTimeout(res, 800));
  const user: UserProfile = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name: name || 'Demo Member',
    email: email || 'user@atsenseguard.ai',
    plan: 'Pro Member',
    createdAt: new Date().toISOString(),
    savedResumesCount: 2,
    analysesCount: 4
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('atsenseguard_authenticated', 'true');
    localStorage.setItem('atsenseguard_user_profile', JSON.stringify(user));
    localStorage.setItem('jobsync_is_authenticated', 'true');
    localStorage.setItem('jobsync_user_data', JSON.stringify({ name: user.name, email: user.email, isRegistered: true }));
    dispatchAuthChange();
  }

  return user;
}

export async function authLoginApi(email: string): Promise<UserProfile> {
  await new Promise((res) => setTimeout(res, 800));
  const nameFromEmail = email.split('@')[0].replace('.', ' ');
  const nameFormatted = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

  const user: UserProfile = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name: nameFormatted || 'Alex Vance',
    email: email,
    plan: 'Pro Member',
    createdAt: new Date().toISOString(),
    savedResumesCount: 3,
    analysesCount: 7
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('atsenseguard_authenticated', 'true');
    localStorage.setItem('atsenseguard_user_profile', JSON.stringify(user));
    localStorage.setItem('jobsync_is_authenticated', 'true');
    localStorage.setItem('jobsync_user_data', JSON.stringify({ name: user.name, email: user.email, isRegistered: true }));
    dispatchAuthChange();
  }

  return user;
}

export async function authLogoutApi(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('atsenseguard_authenticated');
    localStorage.removeItem('atsenseguard_user_profile');
    localStorage.removeItem('jobsync_is_authenticated');
    localStorage.removeItem('jobsync_user_data');
    dispatchAuthChange();
  }
}

export async function getAnalysisHistoryApi(): Promise<AnalysisResult[]> {
  if (typeof window === 'undefined') return [];
  const historyStr = localStorage.getItem('atsenseguard_history');
  return historyStr ? JSON.parse(historyStr) : [];
}

export async function submitFeedbackApi(data: FeedbackData): Promise<{ success: boolean; message: string }> {
  await new Promise((res) => setTimeout(res, 700));
  return {
    success: true,
    message: 'Thank you for your feedback! Our engineering team will review it shortly.'
  };
}
