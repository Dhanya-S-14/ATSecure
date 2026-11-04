'use client';

import { useState } from 'react';
import { Target, FileText, Check, Plus, Trash2, Copy, Download, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ResumeData } from '@/lib/types';
import { INITIAL_RESUME } from '@/lib/utils';
import { calculateDeterministicAtsScore } from '@/lib/ats-validator';

interface ResumeVersionsViewProps {
  resume?: ResumeData;
  onUpdateResume?: (updated: ResumeData) => void;
  onOpenTailor?: () => void;
}

export default function ResumeVersionsView({
  resume,
  onUpdateResume,
  onOpenTailor
}: ResumeVersionsViewProps) {
  const currentResume = resume || INITIAL_RESUME;
  const currentScore = calculateDeterministicAtsScore(currentResume).overallScore;

  const [activeVersionId, setActiveVersionId] = useState('v1');
  const [notification, setNotification] = useState<string | null>(null);

  const [versions, setVersions] = useState([
    {
      id: 'v1',
      name: `${currentResume.fullName} (Active Upload)`,
      targetRole: currentResume.title,
      atsScore: currentScore,
      lastModified: 'Just now',
      tags: (currentResume.skills[0]?.items || ['Full Stack', 'REST APIs', 'Cloud']).slice(0, 4),
      isPrimary: true
    },
    {
      id: 'v2',
      name: `${currentResume.fullName} (Cloud & DevOps Variant)`,
      targetRole: 'Cloud & Infrastructure Engineer',
      atsScore: 92,
      lastModified: '1 day ago',
      tags: ['Docker', 'Kubernetes', 'CI/CD', 'PostgreSQL'],
      isPrimary: false
    },
    {
      id: 'v3',
      name: `${currentResume.fullName} (AI Systems Specialist)`,
      targetRole: 'Full Stack & AI Engineer',
      atsScore: 89,
      lastModified: '3 days ago',
      tags: ['React.js', 'FastAPI', 'LLM', 'Gemini API'],
      isPrimary: false
    }
  ]);

  const handleCreateVariant = () => {
    const newV = {
      id: `v_${Date.now()}`,
      name: `${currentResume.fullName} (Variant #${versions.length + 1})`,
      targetRole: 'Software Engineer',
      atsScore: 86,
      lastModified: 'Just now',
      tags: (currentResume.skills[0]?.items || ['TypeScript', 'Cloud']).slice(0, 3),
      isPrimary: false
    };
    setVersions([...versions, newV]);
    setNotification(`✓ Created new saved variant "${newV.name}"!`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[var(--foreground)]">
      {/* Top Banner */}
      <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-xl transition-colors duration-200">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/30">
            <Target className="w-3.5 h-3.5" />
            <span>Role Variants & Saved Resume Vault</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--text-heading)]">
            Saved Resume Variants for {currentResume.fullName}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Manage role-specific versions tailored to different job applications without losing your core master draft.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCreateVariant}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Variant</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Versions List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {versions.map((v) => {
          const isActive = activeVersionId === v.id;
          return (
            <div
              key={v.id}
              onClick={() => setActiveVersionId(v.id)}
              className={`p-6 rounded-3xl border transition-all space-y-4 cursor-pointer shadow-md ${
                isActive
                  ? 'bg-[var(--accent-glow)] border-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                  : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  {v.isPrimary ? 'Primary Active' : 'Specialized Variant'}
                </span>
                <span className="text-xs font-black text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  {v.atsScore} ATS Pts
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-[var(--text-heading)]">{v.name}</h3>
                <p className="text-xs text-[var(--accent)] font-semibold mt-0.5">{v.targetRole}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">Modified {v.lastModified}</p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {v.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] text-[10px] text-[var(--text-secondary)] font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                {onOpenTailor && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTailor();
                    }}
                    className="text-xs font-bold text-[var(--accent)] hover:opacity-80 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Tailor in Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {v.isPrimary && (
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Loaded Live</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
