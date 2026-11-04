'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  FileText,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Printer,
  Download,
  Building2,
  Briefcase,
  Wand2,
  Sliders
} from 'lucide-react';
import { INITIAL_RESUME, INITIAL_COVER_LETTER } from '@/lib/utils';


export default function CoverLetterPage() {
  const [candidateName, setCandidateName] = useState('Candidate');
  const [company, setCompany] = useState('Vercel');
  const [role, setRole] = useState('Full Stack AI Product Engineer');
  const [jobDescription, setJobDescription] = useState(
    'Join Vercel to craft the future of AI SDKs and web infrastructure. We need experts in Next.js App Router, Server Actions, OpenAI API, Supabase, and TypeScript.'
  );

  const [tone, setTone] = useState<'Professional' | 'Startup' | 'Executive' | 'Enthusiastic'>('Professional');
  const [length, setLength] = useState<'Concise' | 'Standard' | 'Detailed'>('Standard');
  const [coverLetterText, setCoverLetterText] = useState(INITIAL_COVER_LETTER.content);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Load candidate name from auth or resume
        const userProfile = localStorage.getItem('atsenseguard_user_profile');
        if (userProfile) {
          const parsed = JSON.parse(userProfile);
          if (parsed.name) setCandidateName(parsed.name);
        } else {
          const activeResume = localStorage.getItem('atsecure_active_resume');
          if (activeResume) {
            const parsed = JSON.parse(activeResume);
            if (parsed.fullName) setCandidateName(parsed.fullName);
          }
        }

        // Check if coming from target job
        const targetJobStr = localStorage.getItem('atsecure_target_job');
        if (targetJobStr) {
          const job = JSON.parse(targetJobStr);
          if (job.company && job.company !== 'Target Company') setCompany(job.company);
          if (job.title) setRole(job.title);
          if (job.description) setJobDescription(job.description);
        }
      } catch {}
    }
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let activeSummary = INITIAL_RESUME.summary;
      if (typeof window !== 'undefined') {
        const savedResume = localStorage.getItem('atsecure_active_resume');
        if (savedResume) {
          try {
            const parsed = JSON.parse(savedResume);
            if (parsed.summary) activeSummary = parsed.summary;
          } catch {}
        }
      }

      const geminiKey = typeof window !== 'undefined'
        ? (localStorage.getItem('GEMINI_API_KEY') || localStorage.getItem('AI_API_KEY') || '')
        : '';

      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiKey ? { 'x-gemini-api-key': geminiKey } : {})
        },
        body: JSON.stringify({
          company,
          role,
          jobDescription,
          tone,
          length,
          resumeSummary: activeSummary,
          candidateName,
          geminiApiKey: geminiKey
        })
      });
      const data = await res.json();
      if (data.content) {
        setCoverLetterText(data.content);
      }
    } catch (err) {
      console.error('Error generating cover letter:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetterText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${company.replace(/[^a-zA-Z0-9]/g, '_')}_${role.replace(/[^a-zA-Z0-9]/g, '_')}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Page Header */}
        <div className="bg-zinc-900/90 p-6 rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold text-xs mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click AI Cover Letter Writer
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Tailored AI Cover Letter Writer
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Combines your base resume experience and target job description to generate compelling, ATS-aligned cover letters instantly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Download .TXT
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Export PDF
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Inputs Pane (Cols 5) */}
          <div className="lg:col-span-5 bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 shadow-xl space-y-4 no-print backdrop-blur-xl">
            <h2 className="font-bold text-sm text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Target Role & Tone Settings
            </h2>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-medium text-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Target Role Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-medium text-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Tone & Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Professional">Professional</option>
                  <option value="Startup">High Growth Startup</option>
                  <option value="Executive">Executive Leader</option>
                  <option value="Enthusiastic">Passionate & Direct</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Target Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Concise">Concise (~200 words)</option>
                  <option value="Standard">Standard (~350 words)</option>
                  <option value="Detailed">Detailed (~500 words)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Target Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-200 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Cover Letter...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Tailored Cover Letter
                </>
              )}
            </button>
          </div>

          {/* Right Output Editor Pane (Cols 7) */}
          <div className="lg:col-span-7 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-8 min-h-[650px] print-area flex flex-col justify-between select-text">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Cover Letter Preview</h3>
                  <p className="text-xs text-slate-500">{company} — {role}</p>
                </div>
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 no-print">
                  ATS Editable
                </span>
              </div>

              <textarea
                value={coverLetterText}
                onChange={(e) => setCoverLetterText(e.target.value)}
                rows={22}
                className="w-full text-xs text-slate-800 leading-relaxed font-sans p-2 focus:outline-none focus:bg-indigo-50/30 rounded resize-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 no-print">
              <span>Word count: {coverLetterText.split(/\s+/).filter(Boolean).length} words</span>
              <span>Formatted for standard 1-page application</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
