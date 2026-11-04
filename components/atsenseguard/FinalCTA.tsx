'use client';

import { ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onOpenAnalyzer?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export default function FinalCTA({ onOpenAnalyzer }: FinalCTAProps) {
  return (
    <section className="py-20 bg-[var(--background)] border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-heading)] tracking-tight leading-tight">
          Your next opportunity starts with knowing where you stand.
        </h2>
        <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto font-normal">
          Analyze your resume. Understand your gaps. Build your roadmap.
        </p>

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={onOpenAnalyzer}
            className="px-8 py-4 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-extrabold text-sm shadow-lg shadow-[var(--accent-glow)] transition-all flex items-center gap-2 cursor-pointer group"
          >
            <span>Start Free Analysis</span>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
