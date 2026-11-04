'use client';

import { ArrowRight, Check } from 'lucide-react';

interface HeroProps {
  onOpenAnalyzer: () => void;
}

export default function Hero({ onOpenAnalyzer }: HeroProps) {
  return (
    <section id="home" className="pt-32 pb-20 lg:pt-36 lg:pb-28 bg-[var(--background)] border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--accent-glow)] border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider">
              AI-Powered Career Intelligence
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[var(--text-heading)] tracking-tight leading-[1.15]">
              Turn Your Resume Into a Clearer Career Path.
            </h1>

            {/* Supporting Subtext */}
            <p className="text-base sm:text-lg text-[var(--text-muted)] font-normal leading-relaxed max-w-xl">
              ATSecure analyzes how well your resume matches a target role and turns skill gaps into a personalized career roadmap so you know exactly what to learn next.
            </p>
            <p className="text-sm sm:text-base text-[var(--accent)] font-semibold mt-2">
              Stay Ahead of AI. Stay Safe in Your Career.
            </p>
            {/* Feature Headings */}
            <div className="flex flex-col gap-2 mt-4">
              <h2 className="text-xl font-bold text-[var(--text-heading)]">AI-Powered</h2>
              <h2 className="text-xl font-bold text-[var(--text-heading)]">Resume Analyzer</h2>
              <h2 className="text-xl font-bold text-[var(--text-heading)]">Job Scam Protection</h2>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                onClick={onOpenAnalyzer}
                className="px-6 py-3.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-sm shadow-md shadow-[var(--accent-glow)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Analyze My Resume</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>

              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-lg bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-[var(--text-heading)] font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>See How It Works</span>
              </a>
            </div>

            {/* Bullet Points */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[var(--text-secondary)] font-medium border-t border-[var(--border)]">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" /> Instant resume analysis
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" /> 1 free scan (no card needed)
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" /> Privacy-focused processing
              </span>
            </div>
          </div>

          {/* Right Column: Realistic SaaS Dashboard Preview Card */}
          <div className="lg:col-span-6">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 shadow-xl space-y-5 transition-colors duration-200">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                    Resume Compatibility
                  </span>
                  <h3 className="font-bold text-base text-[var(--text-heading)]">Senior Software Engineer</h3>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  Strong Match
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-center">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] block">ATS Score</span>
                  <span className="text-2xl font-extrabold text-[var(--text-heading)] mt-0.5 block">92%</span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-center">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] block">Keyword Match</span>
                  <span className="text-2xl font-extrabold text-[var(--text-heading)] mt-0.5 block">94%</span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-center">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] block">Role Match</span>
                  <span className="text-2xl font-extrabold text-[var(--text-heading)] mt-0.5 block">88%</span>
                </div>
              </div>

              {/* Skill Verification List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)] block">Skill Requirements Breakdown</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-[var(--surface-alt)] border border-[var(--border)]">
                    <span className="font-medium text-[var(--text-secondary)]">Java &amp; Spring Boot</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Matched
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[var(--surface-alt)] border border-[var(--border)]">
                    <span className="font-medium text-[var(--text-secondary)]">SQL &amp; Relational Databases</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Matched
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[var(--surface-alt)] border border-[var(--border)]">
                    <span className="font-medium text-[var(--text-secondary)]">System Architecture</span>
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      ⚠ Partial Match
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[var(--surface-alt)] border border-[var(--border)]">
                    <span className="font-medium text-[var(--text-secondary)]">Kubernetes &amp; Container Orchestration</span>
                    <span className="font-semibold text-rose-400 flex items-center gap-1">
                      ✕ Missing
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenAnalyzer}
                className="w-full py-2.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-xs transition-all shadow-md shadow-[var(--accent-glow)] cursor-pointer"
              >
                View Full Analysis
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
