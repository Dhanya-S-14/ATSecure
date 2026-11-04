'use client';

import { ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';

const SECURITY_ITEMS = [
  {
    icon: Lock,
    title: 'Secure Document Processing',
    description: 'Your uploaded resumes are parsed in-memory and encrypted during transmission.'
  },
  {
    icon: EyeOff,
    title: 'Privacy-Focused Architecture',
    description: 'We do not sell, rent, or expose candidate documents to third-party data recruiters.'
  },
  {
    icon: Server,
    title: 'Protected User Sessions',
    description: 'All session tokens and stored applications are protected via industry-standard HTTP-only cookies.'
  },
  {
    icon: ShieldCheck,
    title: 'Controlled Document Access',
    description: 'You maintain 100% ownership of your tailored resume data and can delete your profile at any time.'
  }
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 bg-[var(--surface-alt)] border-b border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider block">
            Privacy & Security Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
            Your resume is personal. We treat it that way.
          </h2>
          <p className="text-base text-[var(--text-muted)]">
            Engineered with strict privacy controls so you can optimize your resume with total confidence.
          </p>
        </div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SECURITY_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-3 shadow-md hover:border-[var(--accent)] transition-all">
                <div className="w-10 h-10 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-heading)]">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
