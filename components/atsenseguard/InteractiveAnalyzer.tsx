'use client';

import { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Upload,
  Layers,
  Check,
  Compass,
  Target,
  BookOpen,
  Code2,
  RotateCcw,
  Zap,
  ShieldCheck,
  Award
} from 'lucide-react';
import {
  analyzeResumeApi,
  incrementTrialCount,
  getTrialCount,
  MAX_FREE_ANALYSES,
  AnalysisResult,
  getAuthState
} from '@/lib/atsenseguard-service';
import { extractTextFromFile } from '@/lib/pdf-parser';

interface InteractiveAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode?: 'login' | 'register', isExhausted?: boolean) => void;
}

const SAMPLE_RESUME_TEXT = `Alex Vance
San Francisco, CA • alex.vance@techdev.io • (555) 234-5678

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 6+ years of experience building high-scale cloud platforms, distributed microservices, and modern React web applications. Proven track record in optimizing system architecture and increasing API throughput by 45%.

EXPERIENCE
Apex Cloud Systems — Senior Software Engineer (2022 - Present)
- Architected real-time analytics pipeline using Node.js, Next.js, and SQL processing 10M+ daily events.
- Led migration of monolithic application to AWS microservices, reducing overhead costs by 32%.
- Implemented strict CI/CD workflow with GitHub Actions, reducing deployment cycle times from 2 hours to 15 minutes.

DataPulse Technologies — Software Engineer (2019 - 2022)
- Developed interactive React frontend dashboard with JavaScript and Tailwind CSS used by 50,000+ monthly active users.
- Designed REST API endpoints, improving frontend client response latency by 200ms.

TECHNICAL SKILLS
Languages & Frameworks: JavaScript, Python, React, Next.js, Node.js, Express, Tailwind CSS, SQL, HTML5/CSS3, Git`;

const SAMPLE_JOB_DESC = `Looking for a Senior Python Backend Engineer to build robust payment web interfaces using Python, FastAPI, PostgreSQL, Docker, and AWS. Experience with micro-frontends, REST APIs, and high reliability systems is required.`;

export default function InteractiveAnalyzer({
  isOpen,
  onClose,
  onOpenAuth
}: InteractiveAnalyzerProps) {
  const [activeTab, setActiveTab] = useState<'jobsuit' | 'jobstep'>('jobsuit');
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME_TEXT);
  const [jobDesc, setJobDesc] = useState(SAMPLE_JOB_DESC);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // JobStep interactive progress tracking state
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const authState = getAuthState();
  const currentTrials = getTrialCount();
  const remaining = Math.max(0, MAX_FREE_ANALYSES - currentTrials);

  const handlePdfUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingPdf(true);
    try {
      const extracted = await extractTextFromFile(file);
      setResumeText(extracted.text);
      setUploadedFileName(extracted.fileName);
      setIsExtractingPdf(false);
    } catch (err: any) {
      setIsExtractingPdf(false);
      const errorMessage = err?.message || 'Unable to read PDF text. Please paste text directly or upload a text-based PDF/DOCX file.';
      alert(errorMessage);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleRunAnalysis = async () => {
    if (!authState.isAuthenticated && remaining <= 0) {
      onClose();
      onOpenAuth('register', true);
      return;
    }

    if (!resumeText.trim()) {
      alert('Please enter or upload your resume text first.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await analyzeResumeApi({
        resumeText,
        jobDescription: jobDesc,
        isBasic: !authState.isAuthenticated
      });

      if (!authState.isAuthenticated) {
        incrementTrialCount();
      }

      setIsAnalyzing(false);
      setResult(res);
      setActiveTab('jobsuit');
      setCompletedSteps([]);
    } catch (err) {
      setIsAnalyzing(false);
      alert('Something went wrong. Your resume was not analyzed.');
    }
  };

  const toggleStepCompletion = (stepNum: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepNum) ? prev.filter(s => s !== stepNum) : [...prev, stepNum]
    );
  };

  const applySkillToResumeAndReAnalyze = async (skillName: string, bulletSuggestion?: string) => {
    if (!authState.isAuthenticated && getTrialCount() >= MAX_FREE_ANALYSES) {
      onClose();
      onOpenAuth('register', true);
      return;
    }

    const newBullet = bulletSuggestion || `- Engineered high-throughput microservice using ${skillName}, improving query throughput by 35%.`;
    const updatedResume = `${resumeText}\n\nREVISED PROJECT EXPERIENCE (${skillName.toUpperCase()} ADDED)\n${newBullet}`;
    setResumeText(updatedResume);

    setIsAnalyzing(true);
    try {
      const res = await analyzeResumeApi({
        resumeText: updatedResume,
        jobDescription: jobDesc,
        isBasic: !authState.isAuthenticated
      });

      setIsAnalyzing(false);
      setResult(res);
      setActiveTab('jobsuit');
      alert(`🎉 Skill "${skillName}" added to resume! ATSecure score updated.`);
    } catch (err) {
      setIsAnalyzing(false);
      alert('Failed to re-analyze resume after skill update.');
    }
  };

  const applyPresetJob = (title: string, desc: string) => {
    setJobDesc(desc);
  };

  const matchedSkillsList = result?.jobSuitMatch?.matchedSkills || (result?.matchedKeywords || []).map(k => ({ name: k, supportedByProject: true, details: 'Verified in experience' }));
  const partialSkillsList = result?.jobSuitMatch?.partialSkills || [];
  const missingSkillsList = result?.jobSuitMatch?.missingSkills || (result?.missingKeywords || []).map(k => ({ name: k, importance: 'High' }));

  const totalRoadmapSteps = result?.jobStepRoadmap?.steps.length || 0;
  const roadmapProgressPercentage = totalRoadmapSteps > 0 ? Math.round((completedSteps.length / totalRoadmapSteps) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] my-auto rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl shadow-black text-zinc-100 flex flex-col space-y-6 overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">ATSecure Engine</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono">
                  v3.0 Dual Suite
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                {!authState.isAuthenticated
                  ? `Resume Compatibility & Personalized Skill Roadmap (${remaining > 0 ? '1 free scan available' : 'Free scan completed'})`
                  : 'Unlocked ATSecure Compatibility & Career Roadmap Platform'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guest Trial Status */}
        {!authState.isAuthenticated && (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2">
              {remaining > 0 ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Guest Mode: 1 free scan remaining</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Free scan completed (1/1 used)! Please log in or register.</span>
                </>
              )}
            </span>
            {remaining <= 0 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenAuth('login', true); }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[11px] cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenAuth('register', true); }}
                  className="px-3 py-1 rounded-lg bg-white text-black font-extrabold text-[11px] cursor-pointer"
                >
                  Create Free Account
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Input Form View */}
        {!result && (
          <div className="space-y-5">
            {/* File Upload Zone */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">
                    {uploadedFileName ? `Loaded File: ${uploadedFileName}` : 'Upload Resume File'}
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Extract text cleanly from PDF (.pdf), Word (.docx), or Text (.txt).
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                type="button"
                onClick={handlePdfUploadClick}
                disabled={isExtractingPdf}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isExtractingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Extracting Text...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-white" />
                    <span>{uploadedFileName ? 'Choose Other File' : 'Upload PDF File'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-white" />
                    <span>1. Candidate Resume Text</span>
                  </span>
                  {isExtractingPdf && (
                    <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                      <span>Extracting resume text...</span>
                    </span>
                  )}
                </label>
                <div className="relative">
                  <textarea
                    rows={9}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    disabled={isExtractingPdf}
                    className={`w-full p-3.5 rounded-xl bg-zinc-900 border text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white transition-all ${
                      isExtractingPdf ? 'border-amber-500/50 opacity-60' : 'border-zinc-800'
                    }`}
                    placeholder="Paste your resume text or upload a PDF above..."
                  />
                  {isExtractingPdf && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center p-4">
                      <div className="bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl">
                        <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                        <span className="text-xs font-bold text-white">Extracting resume text...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-white" />
                    <span>2. Target Job Description</span>
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => applyPresetJob('Python Backend', 'Target Role: Python Backend Developer\nRequirements: Python, FastAPI, PostgreSQL, Docker, AWS, REST APIs, Microservices, System Architecture.')}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold"
                    >
                      Python Backend
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetJob('Senior Frontend', 'Target Role: Senior Frontend Engineer\nRequirements: React, TypeScript, GraphQL, Next.js, Tailwind CSS, Cypress, Micro-frontends.')}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold"
                    >
                      Frontend
                    </button>
                  </div>
                </div>
                <textarea
                  rows={9}
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white"
                  placeholder="Paste target job posting to compute ATSecure score and career roadmap..."
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-sm shadow-xl shadow-white/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 text-black animate-spin" />
                  <span>ATSecure AI is vectorizing skills & generating career roadmap...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>
                    {!authState.isAuthenticated && remaining <= 0
                      ? 'Free Scans Exhausted — Create Account'
                      : 'Run ATSecure Compatibility & Career Roadmap'}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Result Dual-Tab View */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Free Scan Completed Banner */}
            {!authState.isAuthenticated && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-indigo-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-extrabold text-white">1 Free Scan Completed!</p>
                    <p className="text-zinc-400 text-[11px]">
                      Please <strong>Log In</strong> or <strong>Register</strong> to save this report, re-scan revised resumes, and run unlimited scans.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenAuth('login', true); }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenAuth('register', true); }}
                    className="px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs shadow-md cursor-pointer"
                  >
                    Create Free Account
                  </button>
                </div>
              </div>
            )}

            {/* Top Navigation Tabs: ATSecure Compatibility vs Career Roadmap */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('jobsuit')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'jobsuit'
                      ? 'bg-white text-black shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>ATSecure Compatibility</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${activeTab === 'jobsuit' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                    {result.overallScore}% Match
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('jobstep')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'jobstep'
                      ? 'bg-white text-black shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Career Roadmap</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${activeTab === 'jobstep' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                    {result.jobStepRoadmap?.predictedMatchAfterRoadmap || 96}% Target
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-zinc-400 font-mono hidden sm:block">
                Engine: {result.jobStepRoadmap ? 'ATSecure Dual AI Engine' : 'Standard Parser'}
              </div>
            </div>

            {/* TAB 1: ATSECURE COMPATIBILITY ANALYZER */}
            {activeTab === 'jobsuit' && (
              <div className="space-y-6">
                
                {/* Score Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">ATSecure Score</span>
                    <span className="text-3xl font-black text-white mt-1 block">
                      {result.overallScore}<span className="text-xs text-zinc-500">/100</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">Explainable Fit</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Keyword Match</span>
                    <span className="text-3xl font-black text-white mt-1 block">{result.keywordMatchRate}%</span>
                    <span className="text-[10px] text-zinc-400 font-medium">Semantic Match</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Project Support</span>
                    <span className="text-3xl font-black text-white mt-1 block">
                      {matchedSkillsList.length} <span className="text-xs text-zinc-500">Skills</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">Verified in Bullets</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Formatting Audit</span>
                    <span className="text-xs font-bold text-black mt-3 block bg-white px-2 py-0.5 rounded">
                      {result.formattingStatus}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">Single-Column ATS</span>
                  </div>
                </div>

                {/* 3-Tier Skill Compatibility Matrix */}
                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-white">ATSecure 3-Tier Skill Compatibility Breakdown</h3>
                      <p className="text-xs text-zinc-400">Classified by verified resume project evidence and target job requirements</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                      ATSecure Model Output
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    
                    {/* Matched (✓) */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="font-extrabold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-white" /> Matched Skills (✓)
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 font-bold">{matchedSkillsList.length}</span>
                      </div>
                      <div className="space-y-2">
                        {matchedSkillsList.length > 0 ? (
                          matchedSkillsList.map((skill, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                              <span className="font-bold text-white font-mono">{skill.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-black font-extrabold">
                                Verified ✓
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-zinc-500 italic">No exact skill matches found in resume text.</p>
                        )}
                      </div>
                    </div>

                    {/* Partial (⚠) */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="font-extrabold text-zinc-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-white" /> Partial Skills (⚠)
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 font-bold">{partialSkillsList.length}</span>
                      </div>
                      <div className="space-y-2">
                        {partialSkillsList.length > 0 ? (
                          partialSkillsList.map((skill, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-zinc-200 font-mono">{skill.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                                  Needs Metric ⚠
                                </span>
                              </div>
                              {skill.reason && <p className="text-[10px] text-zinc-400">{skill.reason}</p>}
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-zinc-500 italic">No partial skills detected.</p>
                        )}
                      </div>
                    </div>

                    {/* Missing (✗) */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="font-extrabold text-zinc-300 flex items-center gap-1.5">
                          <X className="w-4 h-4 text-white" /> Missing Gaps (✗)
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400 font-bold">{missingSkillsList.length}</span>
                      </div>
                      <div className="space-y-2">
                        {missingSkillsList.length > 0 ? (
                          missingSkillsList.map((skill, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                              <span className="font-bold text-zinc-300 font-mono">{skill.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
                                Missing ✗
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-zinc-500 italic">No missing skills detected! 100% Match.</p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Strengths & Weak Bullets */}
                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 text-xs">
                  <span className="font-bold text-white block text-sm">Actionable Resume Improvements:</span>
                  <div className="space-y-3">
                    {result.improvements.map((imp, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                        <span className="font-bold text-white text-xs block">{imp.message}</span>
                        <p className="text-xs text-zinc-300 leading-relaxed font-mono">{imp.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Switch to Career Roadmap Banner */}
                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">What should you do next to become more suitable?</h4>
                    <p className="text-xs text-zinc-400">
                      ATSecure will prioritize your missing skills ({missingSkillsList.map(s => s.name).join(', ')}) into a step-by-step career roadmap.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('jobstep')}
                    className="px-5 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Compass className="w-4 h-4 text-black" />
                    <span>View Personalized Career Roadmap</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                </div>

              </div>
            )}

            {/* TAB 2: JOBSTEP PERSONALIZED CAREER ROADMAP */}
            {activeTab === 'jobstep' && (
              <div className="space-y-6">
                
                {/* JobStep Progress Header */}
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold">
                        <Compass className="w-3.5 h-3.5 text-white" />
                        <span>ATSecure Personal Learning Path</span>
                      </div>
                      <h3 className="text-xl font-extrabold text-white mt-2">
                        Target Role: {result.jobStepRoadmap?.targetRole || 'Backend Developer'}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Follow this step-by-step sequence to bridge your skill gaps and boost your match score to{' '}
                        <strong className="text-white font-mono">{result.jobStepRoadmap?.predictedMatchAfterRoadmap || 96}%</strong>.
                      </p>
                    </div>

                    <div className="text-right sm:self-center">
                      <div className="text-2xl font-black text-white font-mono">
                        {completedSteps.length}/{totalRoadmapSteps} <span className="text-xs text-zinc-400">Done</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-medium">Roadmap Progress</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${roadmapProgressPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Current Score: {result.overallScore}%</span>
                      <span>Target After Completion: {result.jobStepRoadmap?.predictedMatchAfterRoadmap || 96}%</span>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Learning Sequence */}
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-white" /> Step-by-Step Skill & Project Sequence
                  </h4>

                  <div className="space-y-4">
                    {result.jobStepRoadmap?.steps.map((step) => {
                      const isDone = completedSteps.includes(step.stepNumber);
                      return (
                        <div
                          key={step.stepNumber}
                          className={`p-5 rounded-2xl border transition-all space-y-4 ${
                            isDone
                              ? 'bg-zinc-950/80 border-zinc-800 opacity-80'
                              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => toggleStepCompletion(step.stepNumber)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                                  isDone ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white'
                                }`}
                              >
                                {isDone ? <Check className="w-4 h-4 text-black" /> : step.stepNumber}
                              </button>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-white">{step.title}</span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                                    {step.type}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-300 font-medium">{step.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs shrink-0">
                              {step.difficulty && (
                                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 text-zinc-300 font-mono text-[11px] border border-zinc-800">
                                  {step.difficulty}
                                </span>
                              )}
                              {step.estimatedDuration && (
                                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 text-zinc-400 font-mono text-[11px] border border-zinc-800">
                                  {step.estimatedDuration}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Recommended Project / Bullet Idea */}
                          {step.projectIdea && (
                            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-1.5 text-xs">
                              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                                <Code2 className="w-3.5 h-3.5 text-white" /> Recommended Practice Project:
                              </span>
                              <p className="text-xs text-zinc-300 leading-relaxed font-mono">{step.projectIdea}</p>
                              
                              {step.resumeBulletSuggestion && (
                                <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <span className="text-[11px] text-zinc-400 font-mono">
                                    Resume Bullet: "{step.resumeBulletSuggestion}"
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => applySkillToResumeAndReAnalyze(step.title, step.resumeBulletSuggestion)}
                                    className="px-3 py-1.5 rounded-lg bg-white text-black font-extrabold text-[11px] hover:bg-zinc-200 transition-colors cursor-pointer shrink-0"
                                  >
                                    Add to Resume & Re-Analyze ➔
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Resources */}
                          {step.learningResources && step.learningResources.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-zinc-400 text-[11px] font-medium">Recommended Learning:</span>
                              {step.learningResources.map((res, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 text-[11px] font-mono border border-zinc-800">
                                  {res}
                                </span>
                              ))}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Finished your roadmap steps?</h4>
                    <p className="text-xs text-zinc-400">Update your resume content and run ATSecure analysis again to verify your new compatibility score.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!authState.isAuthenticated && getTrialCount() >= MAX_FREE_ANALYSES) {
                        onClose();
                        onOpenAuth('register', true);
                        return;
                      }
                      setResult(null);
                      setActiveTab('jobsuit');
                    }}
                    className="px-5 py-3 rounded-xl bg-white text-black font-extrabold text-xs shadow-md hover:bg-zinc-200 transition-colors cursor-pointer shrink-0"
                  >
                    Re-Run ATSecure Scan Now
                  </button>
                </div>

              </div>
            )}

            {/* Modal Bottom Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  if (!authState.isAuthenticated && getTrialCount() >= MAX_FREE_ANALYSES) {
                    onClose();
                    onOpenAuth('register', true);
                    return;
                  }
                  setResult(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs cursor-pointer"
              >
                Analyze Another Resume
              </button>

              {!authState.isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenAuth('register'); }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Save ATSecure Reports</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs cursor-pointer"
                >
                  Done / Close
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
