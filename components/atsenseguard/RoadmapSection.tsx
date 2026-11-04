'use client';

import { Check, ArrowRight, BookOpen, Code2, Rocket, Award } from 'lucide-react';

interface RoadmapSectionProps {
  onOpenAnalyzer?: () => void;
}

const ROADMAP_STEPS = [
  {
    step: 'Step 1',
    title: 'Bridge System Design Gap',
    duration: '3-5 Days',
    icon: BookOpen,
    desc: 'Study microservices architecture patterns and REST API caching models.',
    bullet: 'Engineered high-scale REST endpoints with Redis caching, cutting latency by 35%.'
  },
  {
    step: 'Step 2',
    title: 'Build Kubernetes Integration Project',
    duration: '1-2 Weeks',
    icon: Code2,
    desc: 'Containerize backend service using Docker and deploy to local Minikube cluster.',
    bullet: 'Deployed containerized microservice pipeline using Docker & Kubernetes on AWS EKS.'
  },
  {
    step: 'Step 3',
    title: 'Re-Analyze & Achieve 95%+ Fit',
    duration: '1 Day',
    icon: Rocket,
    desc: 'Add new project bullets to your resume and re-run ATSecure scan for recruiter green-light.',
    bullet: 'Job-Ready resume verified with 95%+ ATS compatibility score.'
  }
];

export default function RoadmapSection({ onOpenAnalyzer }: RoadmapSectionProps) {
  return (
    <section className="py-20 bg-[var(--background)] border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider block">
            ATSecure Career Roadmap
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
            Don't just find your gaps. Know what to do next.
          </h2>
          <p className="text-base text-[var(--text-muted)]">
            ATSecure transforms your missing skills into an actionable, step-by-step learning and portfolio roadmap.
          </p>
        </div>

        {/* Progression Stepper Ribbon */}
        <div className="max-w-4xl mx-auto bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 shadow-md">
          <div className="grid grid-cols-5 text-center text-xs font-semibold text-[var(--text-secondary)] divide-x divide-[var(--border)]">
            <div className="px-2 py-1">
              <span className="text-[var(--text-muted)] block text-[10px] uppercase font-mono">01</span>
              <span>Current Skills</span>
            </div>
            <div className="px-2 py-1">
              <span className="text-[var(--text-muted)] block text-[10px] uppercase font-mono">02</span>
              <span>Skill Gaps</span>
            </div>
            <div className="px-2 py-1 text-[var(--accent)] font-bold">
              <span className="text-[var(--accent)] block text-[10px] uppercase font-mono">03</span>
              <span>Learning</span>
            </div>
            <div className="px-2 py-1">
              <span className="text-[var(--text-muted)] block text-[10px] uppercase font-mono">04</span>
              <span>Practice Project</span>
            </div>
            <div className="px-2 py-1 text-emerald-400 font-bold">
              <span className="text-emerald-400 block text-[10px] uppercase font-mono">05</span>
              <span>Job Ready</span>
            </div>
          </div>
        </div>

        {/* Content Breakdown Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Skill Assessment Summary */}
          <div className="lg:col-span-5 bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4 shadow-md">
            <h3 className="font-extrabold text-sm text-[var(--text-heading)] uppercase tracking-wider border-b border-[var(--border)] pb-3">
              Candidate Skill Status
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[var(--text-heading)] block">Java & Spring Boot</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Core backend language</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold text-[11px]">
                  ✓ Strong
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[var(--text-heading)] block">SQL & Database Querying</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Relational schema design</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold text-[11px]">
                  ✓ Strong
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[var(--text-heading)] block">System Architecture</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Distributed microservices</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-extrabold text-[11px]">
                  ⚠ Needs Polish
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[var(--text-heading)] block">Kubernetes & Cloud Ops</span>
                  <span className="text-[11px] text-[var(--text-muted)]">Container orchestration</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-extrabold text-[11px]">
                  ✕ Missing
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Step Timeline Cards */}
          <div className="lg:col-span-7 space-y-4">
            {ROADMAP_STEPS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 space-y-3 shadow-md hover:border-[var(--accent)] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/30">
                        {item.step}
                      </span>
                      <h4 className="font-extrabold text-sm text-[var(--text-heading)]">{item.title}</h4>
                    </div>
                    <span className="text-[11px] font-medium text-[var(--text-muted)] font-mono">{item.duration}</span>
                  </div>

                  <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>

                  <div className="pt-2 border-t border-[var(--border)] bg-[var(--surface-alt)] p-2.5 rounded-lg border border-[var(--border)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">
                      Suggested Resume Bullet Addition:
                    </span>
                    <p className="text-xs text-[var(--text-heading)] font-mono font-medium">"{item.bullet}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
