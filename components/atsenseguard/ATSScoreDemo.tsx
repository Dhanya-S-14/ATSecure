'use client';

import { Check, AlertTriangle, X } from 'lucide-react';

interface ATSScoreDemoProps {
  onOpenAnalyzer?: () => void;
}

export default function ATSScoreDemo({ onOpenAnalyzer }: ATSScoreDemoProps) {
  return (
    <section className="py-20 bg-[var(--surface-alt)] border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider block">
            Analysis Dashboard Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
            Know exactly where you stand.
          </h2>
          <p className="text-base text-[var(--text-muted)]">
            Get an instant breakdown of your ATS compatibility, keyword frequency, and recruiter pass rate.
          </p>
        </div>

        {/* Dashboard Showcase Card */}
        <div className="max-w-4xl mx-auto bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div>
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Target Job Posting</span>
              <h3 className="font-extrabold text-lg text-[var(--text-heading)]">Lead Full Stack Engineer — Stripe</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold">
                Overall Compatibility: 92/100
              </span>
            </div>
          </div>

          {/* Top 4 Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[var(--surface-alt)] p-4 rounded-lg border border-[var(--border)] text-center">
              <span className="text-xs font-medium text-[var(--text-muted)] block">ATS Score</span>
              <span className="text-2xl font-black text-[var(--text-heading)] mt-1 block">92%</span>
            </div>
            <div className="bg-[var(--surface-alt)] p-4 rounded-lg border border-[var(--border)] text-center">
              <span className="text-xs font-medium text-[var(--text-muted)] block">Keyword Fit</span>
              <span className="text-2xl font-black text-[var(--text-heading)] mt-1 block">94%</span>
            </div>
            <div className="bg-[var(--surface-alt)] p-4 rounded-lg border border-[var(--border)] text-center">
              <span className="text-xs font-medium text-[var(--text-muted)] block">Role Match</span>
              <span className="text-2xl font-black text-[var(--text-heading)] mt-1 block">88%</span>
            </div>
            <div className="bg-[var(--surface-alt)] p-4 rounded-lg border border-[var(--border)] text-center">
              <span className="text-xs font-medium text-[var(--text-muted)] block">Readability</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">98%</span>
            </div>
          </div>

          {/* 3 Skill Columns: Matched, Partial, Missing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Matched Skills */}
            <div className="bg-[var(--surface-alt)] p-4 rounded-lg border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Matched Skills
                </span>
                <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">6 Found</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {['React / Next.js', 'TypeScript', 'Node.js API Architecture', 'SQL & Database Design', 'Tailwind CSS', 'Git & CI/CD Pipelines'].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[var(--text-secondary)] font-medium">
                    <span>{item}</span>
                    <span className="text-emerald-400 font-bold">✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partial Skills */}
            <div className="bg-[var(--surface-alt)] p-4 rounded-lg border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 uppercase">
                  <AlertTriangle className="w-4 h-4 text-amber-400 stroke-[2.5]" /> Partial Skills
                </span>
                <span className="text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">2 Need Polish</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {['System Design Patterns', 'Micro-frontends Architecture'].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[var(--text-secondary)] font-medium">
                    <span>{item}</span>
                    <span className="text-amber-400 font-bold">△</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-[var(--surface-alt)] p-4 rounded-lg border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <span className="text-xs font-extrabold text-rose-400 flex items-center gap-1.5 uppercase">
                  <X className="w-4 h-4 text-rose-400 stroke-[3]" /> Missing Skills
                </span>
                <span className="text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">2 To Add</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {['Kubernetes & Docker', 'PostgreSQL Query Optimization'].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[var(--text-secondary)] font-medium">
                    <span>{item}</span>
                    <span className="text-rose-400 font-bold">✕</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={onOpenAnalyzer}
              className="px-6 py-3 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-xs shadow-md shadow-[var(--accent-glow)] transition-all cursor-pointer"
            >
              Test Your Resume Live
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
