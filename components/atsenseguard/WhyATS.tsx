'use client';

import { FileCheck, Compass, Check, ArrowRight } from 'lucide-react';

interface WhyATSProps {
  onOpenAnalyzer?: () => void;
}

export default function WhyATS({ onOpenAnalyzer }: WhyATSProps) {
  return (
    <section id="features" className="py-20 bg-[var(--surface-alt)] border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider block">
            Integrated Product Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
            Two tools. One career path.
          </h2>
          <p className="text-base text-[var(--text-muted)]">
            Combine precise ATS compatibility scoring with an actionable learning roadmap to land the role you want.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Card 1: JobSuit */}
          <div id="jobsuit" className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-8 flex flex-col justify-between space-y-6 hover:border-[var(--accent)] transition-all shadow-md">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold shadow-md shadow-[var(--accent-glow)]">
                <FileCheck className="w-5 h-5" />
              </div>

              <div>
                <span className="text-xs font-extrabold text-[var(--accent)] uppercase tracking-wider">ATSECURE ATS ANALYZER</span>
                <h3 className="text-xl font-extrabold text-[var(--text-heading)] mt-0.5">Resume Compatibility Analyzer</h3>
                <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                  Understand exactly how your resume matches the job you're targeting.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[var(--text-secondary)] font-medium pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--accent)] stroke-[2.5]" />
                  <span>3-tier keyword compatibility scan (Matched, Partial, Missing)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--accent)] stroke-[2.5]" />
                  <span>ATS formatting, section order, & readability validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--accent)] stroke-[2.5]" />
                  <span>Real-time score rating with recruiter action items</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onOpenAnalyzer}
              className="w-full py-3 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[var(--accent-glow)]"
            >
              <span>Analyze Resume with ATSecure</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Career Roadmap */}
          <div id="jobstep" className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-8 flex flex-col justify-between space-y-6 hover:border-[var(--accent)] transition-all shadow-md">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>

              <div>
                <span className="text-xs font-extrabold text-[var(--text-heading)] uppercase tracking-wider">ATSECURE CAREER ROADMAP</span>
                <h3 className="text-xl font-extrabold text-[var(--text-heading)] mt-0.5">Personalized Career Roadmap</h3>
                <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
                  Turn missing skills into a practical step-by-step learning plan.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[var(--text-secondary)] font-medium pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--text-heading)] stroke-[2.5]" />
                  <span>Interactive step-by-step skill gap project roadmap</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--text-heading)] stroke-[2.5]" />
                  <span>Estimated durations & practical portfolio build ideas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[var(--text-heading)] stroke-[2.5]" />
                  <span>Ready-to-use resume bullet point additions for each step</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onOpenAnalyzer}
              className="w-full py-3 rounded-lg bg-[var(--surface-alt)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-[var(--text-heading)] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Explore Career Roadmap with ATSecure</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
