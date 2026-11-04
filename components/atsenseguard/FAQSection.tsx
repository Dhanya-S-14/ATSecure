'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'What is ATS?',
    a: 'ATS stands for Applicant Tracking System. It is an automated software application used by hiring teams to parse, sort, and rank candidate resumes before recruiters manually review them.'
  },
  {
    q: 'Why does ATS optimization matter?',
    a: 'Even highly qualified candidates get rejected automatically if their resume lacks specific target job keywords, has unreadable multi-column formatting, or uses obscure section titles.'
  },
  {
    q: 'How many free scans do I get?',
    a: 'Every first-time visitor receives 1 free resume scan without needing to register or provide credit card information.'
  },
  {
    q: 'Do I need an account to analyze my resume?',
    a: 'No! You can perform your 1 free resume scan immediately as an anonymous guest visitor.'
  },
  {
    q: 'What happens after I use my free scan?',
    a: 'Once your 1 free scan is completed, simply log in or create a free account to unlock unlimited scans and full platform tools.'
  },
  {
    q: 'Can I compare my resume with a job description?',
    a: 'Yes! ATSenseGuard allows you to paste or link target job descriptions to compute job-specific match percentages and skill alignment.'
  },
  {
    q: 'Can ATSenseGuard identify missing keywords?',
    a: 'Yes. Our AI engine scans both your resume and the target job description to highlight exact technical and soft keywords missing from your text.'
  },
  {
    q: 'Is my resume data secure?',
    a: 'Absolutely. We process resume documents in ephemeral memory without selling user data or training third-party models on your private documents.'
  },
  {
    q: 'What file formats can I upload?',
    a: 'We support PDF documents (.pdf), Microsoft Word (.docx), plain text (.txt), or direct copy-pasting of raw resume text.'
  },
  {
    q: 'Can I save my previous analyses?',
    a: 'Registered members can save unlimited resume analyses, compare past scores over time, and export optimized PDF resume versions.'
  }
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-[var(--surface-alt)] text-[var(--foreground)] relative border-t border-[var(--border)] transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--accent-glow)] border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-bold uppercase tracking-wider">
            Frequently Asked Questions
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-heading)] tracking-tight leading-tight">
            Got Questions? We've Got Answers.
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[var(--text-heading)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--accent)]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[var(--text-secondary)] leading-relaxed font-medium border-t border-[var(--border)]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
