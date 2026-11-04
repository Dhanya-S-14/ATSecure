'use client';

import { Upload, Search, AlertCircle, MapPin } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Resume',
    description: 'Upload your base resume in PDF or DOCX format, or paste text directly.'
  },
  {
    number: '02',
    icon: Search,
    title: 'Analyze Compatibility',
    description: 'ATSecure scans your text against target job description requirements.'
  },
  {
    number: '03',
    icon: AlertCircle,
    title: 'Identify Skill Gaps',
    description: 'Instantly view your score along with matched, partial, and missing skills.'
  },
  {
    number: '04',
    icon: MapPin,
    title: 'Follow Career Roadmap',
    description: 'ATSecure guides your next steps with tailored project ideas and bullet rewrites.'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-[var(--background)] border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider block">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
            How ATSecure Works
          </h2>
          <p className="text-base text-[var(--text-muted)]">
            From raw resume to job-ready candidate in four clear steps.
          </p>
        </div>

        {/* 4 Steps Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-3 shadow-md relative hover:border-[var(--accent)] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-[var(--text-muted)]/50 font-mono">{step.number}</span>
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-alt)] text-[var(--accent)] border border-[var(--border)] flex items-center justify-center font-bold">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-[var(--text-heading)]">{step.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
