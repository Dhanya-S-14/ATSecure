'use client';

import { X, ArrowRight, ShieldCheck, Sparkles, FileText, Wand2, Zap, Target } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTailor?: () => void;
}

export default function HowItWorksModal({
  isOpen,
  onClose,
  onStartTailor
}: HowItWorksModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      title: 'Upload or Select Target Role Resume',
      desc: 'Load your baseline PDF/DOCX or activate one of our pre-calibrated role variants (Full-Stack, Cloud AI, Staff).',
      icon: FileText,
      tag: 'Raw Input'
    },
    {
      num: '02',
      title: 'Job Description Match & TF-IDF Extraction',
      desc: 'Our engine computes mathematical cosine similarity, keyword frequency, and extracts hard/soft required skills.',
      icon: Target,
      tag: 'NLP Matching'
    },
    {
      num: '03',
      title: 'Interactive Split-Screen Resume Tailor',
      desc: 'Click ANY sentence in your left resume preview. Our AI Chatbot rewrites it into a metric-driven Google XYZ bullet.',
      icon: Wand2,
      tag: 'Live Studio'
    },
    {
      num: '04',
      title: 'One-Click Replace & ATS Compliant Export',
      desc: 'Click "Replace in Resume" to patch text live, then download a single-column, ATS-verified PDF ready to submit.',
      icon: Zap,
      tag: 'Job-Ready Candidate'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 shadow-2xl text-[var(--foreground)] space-y-6 max-h-[90vh] overflow-y-auto transition-colors duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Complete ATS & Career Architecture</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--text-heading)]">How ATSecure Works</h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Understanding the algorithmic pipeline that turns your existing resume into a top 5% interview magnet.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="space-y-3.5">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[var(--surface-alt)] border border-[var(--border)] flex items-start gap-4 transition-all hover:border-[var(--accent)]"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/30 font-black text-sm">
                  {st.num}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-[var(--text-heading)]">{st.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--card)] text-[var(--text-secondary)] border border-[var(--border)]">
                      {st.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)]">Everything works live right inside your dashboard.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-heading)] cursor-pointer"
            >
              Close
            </button>
            {onStartTailor && (
              <button
                type="button"
                onClick={() => { onClose(); onStartTailor(); }}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)] cursor-pointer transition-all"
              >
                <span>Launch AI Tailor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
