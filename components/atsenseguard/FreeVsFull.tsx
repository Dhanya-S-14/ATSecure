'use client';

import { Check, ArrowRight, Sparkles } from 'lucide-react';

interface FreeVsFullProps {
  onOpenAnalyzer?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export default function FreeVsFull({ onOpenAnalyzer, onOpenAuth }: FreeVsFullProps) {
  return (
    <section className="py-20 bg-[var(--background)] border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider block">
            Transparent Access Model
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
            Start Free. No credit card required.
          </h2>
          <p className="text-base text-[var(--text-muted)]">
            Analyze your resume with 1 free scan. Unlock your complete candidate workspace when you register.
          </p>
        </div>

        {/* Pricing Matrix Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Card 1: Free Trial Mode */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-8 flex flex-col justify-between space-y-6 shadow-md hover:border-[var(--accent)] transition-all">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">Free Trial Mode</span>
              <h3 className="text-3xl font-black text-[var(--text-heading)]">1 Free Scan</h3>
              <p className="text-xs text-[var(--text-muted)]">Perfect for evaluating your resume against a target role.</p>

              <ul className="space-y-3 text-xs text-[var(--text-secondary)] font-medium pt-2 border-t border-[var(--border)]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  <span>Full ATSecure compatibility match score</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  <span>Keyword frequency & missing skill scan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  <span>Basic ATSecure learning roadmap</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                  <span>PDF & DOCX file text parsing</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onOpenAnalyzer}
              className="w-full py-3 rounded-lg bg-[var(--surface-alt)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-[var(--text-heading)] font-semibold text-xs transition-colors cursor-pointer"
            >
              Analyze Resume Free
            </button>
          </div>

          {/* Card 2: Full Workspace Account */}
          <div className="bg-[var(--card)] rounded-xl border-2 border-[var(--accent)] p-8 flex flex-col justify-between space-y-6 shadow-xl relative">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              Recommended
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider block">Full Platform Account</span>
              <h3 className="text-3xl font-black text-[var(--text-heading)]">Unlimited Studio</h3>
              <p className="text-xs text-[var(--text-muted)]">Create an account to unlock your complete career workspace.</p>

              <ul className="space-y-3 text-xs text-[var(--text-secondary)] font-medium pt-2 border-t border-[var(--border)]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--accent)] stroke-[2.5]" />
                  <span>Unlimited ATSecure resume scans</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--accent)] stroke-[2.5]" />
                  <span>Split-Screen AI Resume Tailor Studio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--accent)] stroke-[2.5]" />
                  <span>1-Click Tailored Cover Letter Generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--accent)] stroke-[2.5]" />
                  <span>Kanban Application Tracker & Job Matcher</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onOpenAuth?.('register')}
              className="w-full py-3 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[var(--accent-glow)]"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
