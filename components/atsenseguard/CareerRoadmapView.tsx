'use client';

import { useState } from 'react';
import { TrendingUp, Sparkles, CheckCircle2, ArrowRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ResumeData } from '@/lib/types';
import { INITIAL_RESUME } from '@/lib/utils';

interface CareerRoadmapViewProps {
  resume?: ResumeData;
  onOpenTailor?: () => void;
}

export default function CareerRoadmapView({ resume, onOpenTailor }: CareerRoadmapViewProps) {
  const currentResume = resume || INITIAL_RESUME;
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const candidateRole = currentResume.title || 'Software Engineer';

  const ROADMAP_STEPS = [
    {
      day: 'Days 1 - 30',
      title: 'Core Architecture Alignment & ATS Optimization',
      objective: `Align ${currentResume.fullName}'s resume with target ${candidateRole} benchmarks.`,
      tasks: [
        `Incorporate missing high-demand keywords into ${currentResume.fullName}'s experience bullets.`,
        'Ensure 100% of bullets use Google XYZ format (Accomplished [X] by doing [Z]).',
        'Verify single-column document flow and standard ATS section headings.'
      ]
    },
    {
      day: 'Days 31 - 60',
      title: 'Production System Breadth & Portfolio Expansion',
      objective: 'Demonstrate measurable engineering leadership and cloud mastery.',
      tasks: [
        'Document production metrics (latency drop %, concurrency scaling, user adoption).',
        'Frame top 3 projects into STAR-method behavioral interview answers.',
        'Link live GitHub repository or portfolio demo in the resume contact section.'
      ]
    },
    {
      day: 'Days 61 - 90',
      title: 'High-Volume Application & Interview Execution',
      objective: 'Execute tailored applications with 90%+ ATS match scores.',
      tasks: [
        'Use Job Description Matcher to tailor keywords for each specific company.',
        'Practice STAR behavioral answers for leadership and technical challenge questions.',
        'Track submissions and iterate on weak bullets based on recruiter response rates.'
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-[var(--foreground)]">
      {/* Top Banner */}
      <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-xl transition-colors duration-200">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/30">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>90-Day Career Roadmap & Interview Prep</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--text-heading)]">
            AI Milestone Roadmap for {currentResume.fullName}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Strategic 30-60-90 day progression plan to elevate your candidacy for {candidateRole} positions.
          </p>
        </div>

        {onOpenTailor && (
          <button
            type="button"
            onClick={onOpenTailor}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)] transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tailor Bullets in Studio</span>
          </button>
        )}
      </div>

      {/* Roadmap Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROADMAP_STEPS.map((step, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-4 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-glow)] px-2.5 py-1 rounded-full inline-block border border-[var(--accent)]/30">
                {step.day}
              </span>
              <h3 className="font-extrabold text-sm text-[var(--text-heading)] leading-snug">{step.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{step.objective}</p>
            </div>

            <ul className="space-y-2 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
              {step.tasks.map((task, tIdx) => (
                <li key={tIdx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
