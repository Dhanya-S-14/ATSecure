'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Sparkles,
  Layers,
  History,
  Target,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  Activity,
  Wand2,
  FileText,
  Sliders,
  HelpCircle,
  User,
  ArrowRight,
  Upload,
  CheckCircle2,
  FileUp
} from 'lucide-react';
import { UserProfile, authLogoutApi } from '@/lib/atsenseguard-service';
import { ResumeData } from '@/lib/types';
import { INITIAL_RESUME } from '@/lib/utils';
import { extractTextFromFile, parseRawTextToResume } from '@/lib/pdf-parser';
import { calculateDeterministicAtsScore } from '@/lib/ats-validator';

import InteractiveResumeTailor from './InteractiveResumeTailor';
import AdvancedATSAnalysisView from './AdvancedATSAnalysisView';
import JobDescriptionMatcherView from './JobDescriptionMatcherView';
import MissingKeywordsView from './MissingKeywordsView';
import SectionHealthCheckView from './SectionHealthCheckView';
import ResumeVersionsView from './ResumeVersionsView';
import CareerRoadmapView from './CareerRoadmapView';
import PdfComplianceAuditView from './PdfComplianceAuditView';

export type DashboardFeatureTab =
  | 'tailor'
  | 'analysis'
  | 'matcher'
  | 'keywords'
  | 'health'
  | 'versions'
  | 'roadmap'
  | 'compliance';

interface AuthenticatedDashboardProps {
  user: UserProfile;
  onOpenAnalyzer: () => void;
  initialTab?: DashboardFeatureTab;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenHowItWorks?: () => void;
}

export default function AuthenticatedDashboard({
  user,
  onOpenAnalyzer,
  initialTab = 'tailor',
  onOpenProfile,
  onOpenSettings,
  onOpenHowItWorks
}: AuthenticatedDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardFeatureTab>(initialTab);

  // Single Source of Truth for Resume Data across ALL 8 Features!
  const [activeResume, setActiveResume] = useState<ResumeData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('atsecure_active_resume');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.skills)) {
            parsed.skills = parsed.skills.map((cat: any) => ({
              ...cat,
              items: (cat.items || []).map((i: string) => i.replace(/(\.js)+/gi, '.js').replace(/(\.ts)+/gi, '.ts'))
            }));
          }
          return parsed;
        }
      } catch {}
    }
    const cloned: ResumeData = JSON.parse(JSON.stringify(INITIAL_RESUME));
    if (user.name) {
      cloned.fullName = user.name;
    }
    return cloned;
  });

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('atsecure_active_resume_file') || null;
    }
    return null;
  });

  // Global Active Target Job across all 8 features
  const [activeTargetJob, setActiveTargetJob] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('atsecure_target_job');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  // Synchronize Target Job across all dashboard components
  useEffect(() => {
    const handleJobSync = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('atsecure_target_job');
          if (saved) {
            setActiveTargetJob(JSON.parse(saved));
          } else {
            setActiveTargetJob(null);
          }
        } catch {}
      }
    };

    window.addEventListener('atsecure_target_job_updated', handleJobSync);
    window.addEventListener('storage', handleJobSync);
    return () => {
      window.removeEventListener('atsecure_target_job_updated', handleJobSync);
      window.removeEventListener('storage', handleJobSync);
    };
  }, []);

  const handleClearTargetJob = () => {
    setActiveTargetJob(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('atsecure_target_job');
      window.dispatchEvent(new CustomEvent('atsecure_target_job_updated', { detail: null }));
    }
  };

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadNotification, setUploadNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Top Section Direct PDF / DOCX Upload Handler
  const handleTopFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    try {
      const extracted = await extractTextFromFile(file);
      const parsed = parseRawTextToResume(extracted.text, extracted.fileName);
      if (user.name && (!parsed.fullName || parsed.fullName === 'Candidate')) {
        parsed.fullName = user.name;
      }
      setActiveResume(parsed);
      setUploadedFileName(extracted.fileName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('atsecure_active_resume', JSON.stringify(parsed));
        localStorage.setItem('atsecure_active_resume_file', extracted.fileName);
      }
      const score = calculateDeterministicAtsScore(parsed).overallScore;
      setUploadNotification(
        `✅ Successfully loaded "${extracted.fileName}" for ${parsed.fullName}! ATS Score: ${score}/100. All 8 features are now analyzing your uploaded resume.`
      );
      setActiveTab('tailor');
      setTimeout(() => setUploadNotification(null), 6000);
    } catch (err: any) {
      alert(err?.message || 'Failed to extract text from file. Please ensure it is a valid PDF or DOCX file.');
    } finally {
      setIsUploadingPdf(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUpdateResume = (updated: ResumeData) => {
    setActiveResume(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('atsecure_active_resume', JSON.stringify(updated));
    }
  };

  const currentScore = calculateDeterministicAtsScore(activeResume).overallScore;

  const tools = [
    {
      id: 'tailor' as DashboardFeatureTab,
      title: '1. AI Resume Tailor (Live Studio)',
      badge: 'Core Feature',
      desc: 'Click ANY word on the left resume preview to get AI rewrites in the chatbot with 1-click replace.',
      icon: Wand2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'analysis' as DashboardFeatureTab,
      title: '2. Advanced ATS Diagnostic Suite',
      badge: '4 Pillars',
      desc: 'Full deep-dive parse with structural, readability, formatting, and keyword scores.',
      icon: FileCheck2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'matcher' as DashboardFeatureTab,
      title: '3. Job Description Matcher',
      badge: 'Live Match',
      desc: 'Compare your resume against target postings (Stripe, Vercel, OpenAI) for skill alignment.',
      icon: Layers,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      id: 'keywords' as DashboardFeatureTab,
      title: '4. Missing Keyword Injector',
      badge: 'Taxonomy',
      desc: 'Search & inject high-converting industry skills missing from your active draft.',
      icon: Sparkles,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      id: 'health' as DashboardFeatureTab,
      title: '5. Section Health & XYZ Audit',
      badge: 'Google XYZ',
      desc: 'Audit summary, experience, and skills hierarchy with Google XYZ achievement metrics.',
      icon: Activity,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10'
    },
    {
      id: 'versions' as DashboardFeatureTab,
      title: '6. Role Variants & Saved Vault',
      badge: '3 Variants',
      desc: 'Manage role-specific versions (Full-Stack, Cloud Specialist, AI Systems Engineer).',
      icon: Target,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    },
    {
      id: 'roadmap' as DashboardFeatureTab,
      title: '7. AI Career Roadmap & Interview Prep',
      badge: '90-Day Plan',
      desc: '30-60-90 day milestone roadmap and tailored STAR-method interview answers.',
      icon: TrendingUp,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10'
    },
    {
      id: 'compliance' as DashboardFeatureTab,
      title: '8. PDF Formatting & ATS Audit',
      badge: 'OCR Verified',
      desc: 'Single-column structure validation and verified ATS compliant PDF export.',
      icon: ShieldCheck,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10'
    }
  ];

  return (
    <div className="py-6 sm:py-8 space-y-8 animate-fadeIn text-[var(--text-heading)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Hidden file input for top banner resume upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleTopFileUpload}
        className="hidden"
      />

      {/* Top Welcome Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] p-6 sm:p-8 text-[var(--text-heading)] shadow-xl border border-[var(--border-default)]">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-body)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>ATSecure Platform Unlocked • Pro Active Member</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-heading)] tracking-tight">
            Welcome back, {user.name || 'megaverma'}!
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium leading-relaxed max-w-2xl">
            "One resume is not perfect for every job. ATSecure optimizes your resume for the exact role and ATS algorithm you are applying to."
          </p>

          {/* Active Uploaded Resume Details Badge */}
          <div className="flex flex-wrap items-center gap-2.5 p-3 px-4 rounded-2xl bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-xs">
            <span className="font-bold text-[var(--brand-primary)] flex items-center gap-1.5">
              <FileText className="w-4 h-4 shrink-0" />
              <span>Active Resume:</span>
            </span>
            <span className="font-extrabold text-[var(--text-heading)]">{activeResume.fullName}</span>
            {uploadedFileName && (
              <span className="text-[11px] text-[var(--text-muted)] font-mono">({uploadedFileName})</span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold text-[10px] border border-emerald-500/30">
              ATS Score: {currentScore}/100
            </span>
            <span className="text-[11px] text-[var(--text-muted)] ml-auto hidden sm:inline">
              {activeResume.experience.length} Experience Roles • {activeResume.skills.flatMap(s => s.items).length} Skills Loaded
            </span>
          </div>

          {/* Action Buttons in Banner */}
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('tailor')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'tailor'
                  ? 'bg-[var(--brand-primary)] text-white shadow-[var(--brand-primary)]/25 ring-2 ring-[var(--brand-primary)]/50'
                  : 'bg-[var(--brand-primary)] hover:brightness-110 text-white'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>Launch AI Resume Tailor Studio</span>
            </button>

            {/* Cover Letter Button */}
            <Link
              href="/cover-letter"
              className="px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--bg-card)] text-[var(--text-heading)] border border-[var(--border-default)] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>Launch Cover Letter Studio</span>
            </Link>

            {/* Direct PDF Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPdf}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--bg-card)] text-[var(--text-heading)] border border-[var(--border-default)] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Upload your resume file (.pdf, .docx) to power all 8 dashboard features"
            >
              <Upload className={`w-3.5 h-3.5 text-[var(--brand-primary)] ${isUploadingPdf ? 'animate-bounce' : ''}`} />
              <span>{isUploadingPdf ? 'Parsing Resume...' : 'Upload New PDF File'}</span>
            </button>
            {/* Upload Job Description Button */}
            <button
              type="button"
              onClick={() => setActiveTab('matcher')}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--bg-card)] text-[var(--text-heading)] border border-[var(--border-default)] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Target className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>Upload Job Description</span>
            </button>

            {onOpenHowItWorks && (
              <button
                type="button"
                onClick={onOpenHowItWorks}
                className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--bg-card)] text-[var(--text-body)] font-bold text-xs border border-[var(--border-default)] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>How It Works Guide</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => authLogoutApi()}
              className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-heading)] font-bold text-xs border border-[var(--border-default)] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--brand-primary)]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Upload Notification Banner */}
      {uploadNotification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadNotification}</span>
        </div>
      )}

      {/* Target Job Global Synchronization Banner */}
      {activeTargetJob ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[var(--brand-primary)]/10 via-[var(--brand-primary)]/5 to-purple-500/10 border border-[var(--brand-primary)]/30 text-[var(--text-heading)] shadow-md flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center shrink-0 shadow-md shadow-[var(--brand-primary)]/20">
              <Target className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30">
                  Target Role Active & Synced
                </span>
                <span className="text-xs text-[var(--text-muted)]">Applied across all 8 features</span>
              </div>
              <h3 className="text-base font-black truncate text-[var(--text-heading)] mt-0.5">
                {activeTargetJob.title} <span className="font-semibold text-[var(--text-muted)]">at {activeTargetJob.company || 'Target Employer'}</span>
              </h3>
              {activeTargetJob.extractedKeywords?.length > 0 && (
                <p className="text-[11px] text-[var(--text-muted)] truncate max-w-xl">
                  Key Skills: <span className="text-[var(--text-secondary)] font-medium">{activeTargetJob.extractedKeywords.slice(0, 6).join(', ')}{activeTargetJob.extractedKeywords.length > 6 ? ` +${activeTargetJob.extractedKeywords.length - 6} more` : ''}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('tailor')}
              className="px-3.5 py-2 rounded-xl bg-[var(--brand-primary)] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[var(--brand-primary)]/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailor Resume Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matcher')}
              className="px-3 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] text-[var(--text-heading)] font-bold text-xs border border-[var(--border-default)] transition-colors cursor-pointer"
            >
              Compare Alignment
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('keywords')}
              className="px-3 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] text-[var(--text-heading)] font-bold text-xs border border-[var(--border-default)] transition-colors cursor-pointer"
            >
              View Keywords
            </button>
            <button
              type="button"
              onClick={handleClearTargetJob}
              title="Detach Target Job Description"
              className="px-2.5 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 font-bold text-xs border border-[var(--border-default)] transition-colors cursor-pointer"
            >
              ✕ Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-dashed border-[var(--border-default)] hover:border-[var(--brand-primary)]/50 transition-colors flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-[var(--text-muted)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center shrink-0 text-[var(--text-muted)]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[var(--text-heading)]">No Target Job Description Attached Yet</p>
              <p className="text-[11px] text-[var(--text-muted)]">Attach any job posting to automatically optimize keyword gap analysis, ATS score, and tailored achievement bullets.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('matcher')}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] font-bold text-xs border border-[var(--brand-primary)]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Select Target Job Role</span>
          </button>
        </div>
      )}

      {/* Feature Navigation Tabs Bar */}
      <div className="bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-default)] shadow-lg overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {tools.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-[var(--brand-primary)]/20'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-muted)]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : t.color}`} />
                <span>{t.title.replace(/^\d+\.\s*/, '')}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                  }`}
                >
                  {t.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-[var(--text-heading)]">Advanced Feature Suite</h2>
            <p className="text-xs text-[var(--text-muted)]">
              All 8 features actively powered by <strong>{activeResume.fullName}</strong>'s uploaded resume
            </p>
          </div>
          <span className="text-xs font-bold text-[var(--brand-primary)]">
            Active View: {tools.find((t) => t.id === activeTab)?.title}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {tools.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`p-4 rounded-2xl border transition-all space-y-2 cursor-pointer shadow-sm group ${
                  isActive
                    ? 'bg-[var(--bg-muted)] border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/40 shadow-md'
                    : 'bg-[var(--bg-card)] border-[var(--border-default)] hover:border-[var(--brand-primary)]/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${t.bgColor}`}
                  >
                    <Icon className={`w-4 h-4 ${t.color}`} />
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[var(--brand-primary)] text-white' : 'bg-[var(--bg-muted)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {isActive ? 'ACTIVE VIEW' : t.badge}
                  </span>
                </div>

                <h3 className="font-extrabold text-xs text-[var(--text-heading)] group-hover:text-[var(--brand-primary)] transition-colors">
                  {t.title}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] leading-snug line-clamp-2">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* RENDER CURRENTLY SELECTED FEATURE VIEW (POWERED BY ACTIVE USER RESUME!) */}
      <div className="pt-2">
        {activeTab === 'tailor' && (
          <InteractiveResumeTailor
            initialResume={activeResume}
            onSaveResume={handleUpdateResume}
            userProfileName={user.name}
          />
        )}

        {activeTab === 'analysis' && (
          <AdvancedATSAnalysisView
            resume={activeResume}
            onOpenTailor={() => setActiveTab('tailor')}
          />
        )}

        {activeTab === 'matcher' && (
          <JobDescriptionMatcherView
            resume={activeResume}
            onUpdateResume={handleUpdateResume}
            onOpenTailor={() => setActiveTab('tailor')}
          />
        )}

        {activeTab === 'keywords' && (
          <MissingKeywordsView
            resume={activeResume}
            onUpdateResume={handleUpdateResume}
            onOpenTailor={() => setActiveTab('tailor')}
          />
        )}

        {activeTab === 'health' && (
          <SectionHealthCheckView
            resume={activeResume}
            onOpenTailor={() => setActiveTab('tailor')}
          />
        )}

        {activeTab === 'versions' && (
          <ResumeVersionsView
            resume={activeResume}
            onUpdateResume={handleUpdateResume}
            onOpenTailor={() => setActiveTab('tailor')}
          />
        )}

        {activeTab === 'roadmap' && (
          <CareerRoadmapView
            resume={activeResume}
            onOpenTailor={() => setActiveTab('tailor')}
          />
        )}

        {activeTab === 'compliance' && (
          <PdfComplianceAuditView
            resume={activeResume}
            onOpenTailor={() => setActiveTab('tailor')}
          />
        )}
      </div>

    </div>
  );
}
