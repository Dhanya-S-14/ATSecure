'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Zap,
  Target,
  FileCheck2,
  X,
  Cpu,
  Copy,
  Check,
  Download,
  Share2,
  RefreshCw,
  Wand2
} from 'lucide-react';
import { INITIAL_RESUME } from '@/lib/utils';
import { ATSAnalysisResult } from '@/lib/types';
import { extractTextFromFile } from '@/lib/pdf-parser';

export default function ATSScorerPage() {
  const [resumeText, setResumeText] = useState<string>(
    `${INITIAL_RESUME.summary}\n\nEXPERIENCE:\n${INITIAL_RESUME.experience.map(e => `${e.role} at ${e.company}\n- ${e.bullets.join('\n- ')}`).join('\n\n')}`
  );

  const [jobDescription, setJobDescription] = useState<string>(
    `Senior Frontend Engineer - Stripe\n\nWe are looking for a Senior Frontend Engineer to build robust payment web interfaces using React, TypeScript, GraphQL, Next.js, and Tailwind CSS. Experience with micro-frontends, system architecture, Docker containers, and high reliability systems is required.`
  );
  // Persist job description to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atsecure_job_description', jobDescription);
    }
  }, [jobDescription]);

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parserProvider, setParserProvider] = useState<string>('JobSync Engine');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read URL search params on client mount (e.g. from Job Matcher)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const jdParam = params.get('jd');
      if (jdParam) {
        setJobDescription(decodeURIComponent(jdParam));
      }
      // Load saved active resume text if available
      const savedResume = localStorage.getItem('atsecure_active_resume_text');
      if (savedResume && savedResume.trim().length > 20) {
        setResumeText(savedResume);
      }
    }
  }, []);

  // High Accuracy Resume File Upload & Parsing Handler
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsParsingFile(true);
    setUploadedFileName(file.name);

    try {
      const result = await extractTextFromFile(file);
      setResumeText(result.text);
      setParserProvider('PDF.js Engine');
      if (typeof window !== 'undefined') {
        localStorage.setItem('atsecure_active_resume_text', result.text);
        localStorage.setItem('atsecure_active_resume_file', file.name);
      }
    } catch (err: any) {
      console.error('Error parsing resume file:', err);
      const msg = err?.message || 'Unable to read PDF text. Please paste text directly or upload a text-based PDF/DOCX file.';
      alert(msg);
    } finally {
      setIsParsingFile(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      // Retrieve the most recent job description from localStorage to ensure fresh data
      const latestJobDescription = (typeof window !== 'undefined')
        ? localStorage.getItem('atsecure_job_description') || jobDescription
        : jobDescription;
      const geminiKey = (typeof window !== 'undefined')
        ? (localStorage.getItem('GEMINI_API_KEY') || localStorage.getItem('AI_API_KEY') || '')
        : '';
      const res = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiKey ? { 'x-gemini-api-key': geminiKey } : {})
        },
        body: JSON.stringify({
          resumeText,
          jobDescription: latestJobDescription,
          geminiApiKey: geminiKey
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAnalysisError(data.error || 'Failed to complete ATS analysis. Please verify your inputs.');
      } else {
        setAnalysisResult(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('atsecure_active_resume_text', resumeText);
          localStorage.setItem('atsecure_last_analysis', JSON.stringify(data));
        }
      }
    } catch (err: any) {
      console.error('Error analyzing fit:', err);
      setAnalysisError(err?.message || 'Network error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTailorInStudio = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('atsecure_active_resume_text', resumeText);
      const roleLines = jobDescription.split('\n')[0] || 'Target Role';
      localStorage.setItem(
        'atsecure_target_job',
        JSON.stringify({
          title: roleLines.slice(0, 50),
          company: 'Target Company',
          description: jobDescription,
          extractedKeywords: analysisResult?.matchedKeywords || []
        })
      );
    }
  };

  // 1-Click Inject missing keyword directly into resume text
  const injectKeywordToResume = (keyword: string) => {
    setResumeText((prev) => {
      if (prev.includes(keyword)) return prev;
      const next = `${prev}\n\nTECHNICAL SKILLS ADDITION:\n- Proficient in ${keyword}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('atsecure_active_resume_text', next);
      }
      return next;
    });
  };

  // 1-Click Replace weak bullet in raw text with AI suggested bullet
  const replaceWeakBulletInResume = (original: string, suggestion: string) => {
    setResumeText((prev) => {
      const next = prev.replace(original, suggestion);
      if (typeof window !== 'undefined') {
        localStorage.setItem('atsecure_active_resume_text', next);
      }
      return next;
    });
  };

  const sampleJdPreset = (title: string, jdText: string) => {
    setJobDescription(jdText);
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const reportText = `=== ATS RESUME FIT MATCH REPORT ===
Overall Score: ${analysisResult.score}/100
Keyword Match Rate: ${analysisResult.keywordMatchPercentage || 0}%
Formatting Score: ${analysisResult.formattingScore || 0}%
Impact Action Verbs: ${analysisResult.actionVerbScore || 0}%

Matched Keywords: ${(analysisResult.matchedKeywords || []).join(', ')}
Missing Hard Skills: ${(analysisResult.missingSkills?.hardSkills || []).join(', ')}
Missing Soft Skills: ${(analysisResult.missingSkills?.softSkills || []).join(', ')}
`;
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Page Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/90 p-6 rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold text-xs mb-2">
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
              Core ATS Scanner & ML Parser Engine
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ATS Fit Match & Keyword Optimizer
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Upload your base resume (PDF, DOCX, TXT) and target job description to get real-time compatibility scores, missing keywords, and 1-click bullet point rewrites.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {analysisResult && (
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedReport ? 'Report Copied' : 'Copy Report'}
              </button>
            )}

            <Link
              href="/tailor"
              onClick={handleTailorInStudio}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              Tailor in Studio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {analysisError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{analysisError}</span>
            </div>
            <button
              type="button"
              onClick={() => setAnalysisError(null)}
              className="text-rose-400 hover:text-white text-xs underline cursor-pointer ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dual Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Input: Base Resume Zone */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-bold text-sm text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  1. Base Resume (PDF Upload or Paste Text)
                </label>
                <span className="text-[11px] font-mono text-zinc-500">v2.4 Ready</span>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={(e) => e.target.files && e.target.files[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />

              {/* Interactive Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className="border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl p-5 bg-zinc-950/60 hover:bg-indigo-950/20 transition-all text-center cursor-pointer mb-4 group"
              >
                {isParsingFile ? (
                  <div className="flex flex-col items-center py-2 text-indigo-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-xs font-bold">Extracting ML Resume Metadata...</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 mx-auto text-indigo-400 group-hover:scale-110 transition-transform mb-2" />
                    <p className="text-xs font-bold text-white">
                      Click to browse or Drag & Drop your resume PDF / DOCX
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Supports Affinda, APILayer & Eden AI Parsers (Text auto-populates below)
                    </p>
                  </>
                )}
              </div>

              {/* Uploaded File Pill */}
              {uploadedFileName && (
                <div className="mb-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>{uploadedFileName} (Parsed via {parserProvider})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFileName(null);
                      setResumeText('');
                    }}
                    className="p-1 text-emerald-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste raw resume text here or drop a PDF file above..."
                rows={10}
                className="w-full p-4 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 bg-zinc-950/80 resize-y"
              />
            </div>
          </div>

          {/* Right Input: Target Job Description Zone */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 shadow-xl flex flex-col justify-between backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-bold text-sm text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  2. Target Job Description
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-zinc-500">Presets:</span>
                  <button
                    type="button"
                    onClick={() => sampleJdPreset('Stripe', 'Senior Frontend Engineer - Stripe\nRequirements: React, TypeScript, GraphQL, Next.js, Tailwind CSS, Micro-frontends, System Architecture, Docker, PostgreSQL.')}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                  >
                    Stripe
                  </button>
                  <button
                    type="button"
                    onClick={() => sampleJdPreset('Vercel', 'Full Stack AI Product Engineer - Vercel\nRequirements: Next.js App Router, Server Actions, OpenAI API, Supabase, TypeScript, AI SDKs.')}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                  >
                    Vercel
                  </button>
                </div>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste full job posting requirements and role description here..."
                rows={14}
                className="w-full p-4 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 bg-zinc-950/80 resize-y"
              />
            </div>

            <div className="mt-4 flex items-center justify-end">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText || !jobDescription}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Scanning ATS Keywords & Fit Score...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-amber-300" />
                    <span>Analyze Fit Match Score</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Results Display */}
        {analysisResult && (
          <div className="space-y-6 animate-fadeIn">
            {/* Main Score Radial & Metrics Banner */}
            <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center backdrop-blur-xl">
              {/* Score Gauge Ring */}
              <div className="flex flex-col items-center justify-center md:border-r border-zinc-800 pr-0 md:pr-6">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-zinc-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`transition-all duration-1000 ease-out ${
                        analysisResult.score >= 80
                          ? 'text-emerald-500'
                          : analysisResult.score >= 65
                          ? 'text-amber-400'
                          : 'text-rose-500'
                      }`}
                      strokeDasharray={`${analysisResult.score}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-4xl font-black text-white tracking-tight">{analysisResult.score}</span>
                    <span className="text-xs font-semibold text-zinc-500 block">/ 100</span>
                  </div>
                </div>
                <span
                  className={`mt-2 text-xs font-bold px-3 py-1 rounded-full border ${
                    analysisResult.score >= 80
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : analysisResult.score >= 65
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {analysisResult.score >= 80 ? 'Strong ATS Fit' : analysisResult.score >= 65 ? 'Moderate Match' : 'Action Required'}
                </span>
              </div>

              {/* Detailed Breakdown Metric Cards */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <span className="text-xs font-semibold text-zinc-400">Keyword Match Rate</span>
                  <p className="text-2xl font-extrabold text-white mt-1">{analysisResult.keywordMatchPercentage}%</p>
                  <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-700" style={{ width: `${analysisResult.keywordMatchPercentage}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <span className="text-xs font-semibold text-zinc-400">Formatting ATS Rank</span>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-1">{analysisResult.formattingScore}%</p>
                  <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${analysisResult.formattingScore}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <span className="text-xs font-semibold text-zinc-400">Impact Action Verbs</span>
                  <p className="text-2xl font-extrabold text-violet-400 mt-1">{analysisResult.actionVerbScore}%</p>
                  <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-violet-500 h-full rounded-full transition-all duration-700" style={{ width: `${analysisResult.actionVerbScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Missing Keywords & Verified Matches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Missing Keywords with 1-Click Injector */}
              <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 shadow-xl backdrop-blur-xl">
                <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Missing Critical Keywords (Click + to Inject)
                </h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Click any missing skill below to automatically append it to your resume input text:
                </p>

                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Hard Technical Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {(analysisResult.missingSkills?.hardSkills || []).map((skill, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => injectKeywordToResume(skill)}
                          title="Click to inject into resume text"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all group cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-400 group-hover:scale-125 transition-transform" />
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Soft & Leadership Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {(analysisResult.missingSkills?.softSkills || []).map((skill, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => injectKeywordToResume(skill)}
                          title="Click to inject into resume text"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-medium transition-all group cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:scale-125 transition-transform" />
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched Keywords */}
              <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 shadow-xl backdrop-blur-xl">
                <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Verified Matched Keywords Found
                </h3>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  These keywords are already successfully detected in your resume:
                </p>

                <div className="flex flex-wrap gap-2">
                  {(analysisResult.matchedKeywords || []).map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Bullet Point Rewrite Suggestions */}
            <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 shadow-xl backdrop-blur-xl">
              <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-4">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                AI Bullet Point Rewrite Suggestions
              </h3>

              <div className="space-y-4">
                {(analysisResult.weakBullets || []).map((bullet, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        Original Bullet
                      </span>
                      <span className="text-xs text-zinc-400 italic">{bullet.reason}</span>
                    </div>
                    <p className="text-xs text-zinc-400 line-through decoration-rose-400/80 font-mono">
                      "{bullet.original}"
                    </p>

                    <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          AI Suggested High-Impact Rewrite
                        </span>
                        <p className="text-xs text-white font-semibold mt-1 font-mono">
                          "{bullet.suggestion}"
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => replaceWeakBulletInResume(bullet.original, bullet.suggestion)}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-indigo-400" />
                        Apply to Resume
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
