'use client';

import { useState, useMemo, useEffect } from 'react';
import { Layers, Target, CheckCircle2, AlertCircle, Plus, Sparkles, ArrowRight, Check, User } from 'lucide-react';
import { ResumeData } from '@/lib/types';
import { INITIAL_RESUME } from '@/lib/utils';

interface JobDescriptionMatcherViewProps {
  resume?: ResumeData;
  onUpdateResume?: (updated: ResumeData) => void;
  onOpenTailor?: () => void;
}

const PRESET_ROLES = {
  stripe: {
    company: 'Stripe',
    title: 'Software Engineering / Full Stack Intern',
    requiredSkills: ['React.js', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git'],
    preferredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'Microservices'],
    description: 'Stripe is hiring a Software Engineer to build resilient financial checkout interfaces and scalable developer tooling. Requirements include deep TypeScript proficiency, React systems architecture, high-availability microservices, and GraphQL federation.'
  },
  vercel: {
    company: 'Vercel',
    title: 'AI Product & Full Stack Engineer',
    requiredSkills: ['Next.js', 'React.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Docker'],
    preferredSkills: ['LLM', 'Gemini API', 'FastAPI', 'Python', 'Redis'],
    description: 'Join Vercel to shape the future of AI SDKs and modern web experiences. We are looking for experts in Next.js App Router, Server Actions, TypeScript, Edge computing, and AI/LLM model orchestration.'
  },
  openai: {
    company: 'OpenAI',
    title: 'Full Stack Systems Engineer',
    requiredSkills: ['Python', 'SQL', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    preferredSkills: ['FastAPI', 'Kubernetes', 'Redis', 'LLM', 'Kafka'],
    description: 'OpenAI is seeking Full Stack Systems Engineers to construct developer dashboards, model evaluation interfaces, and scalable inference infrastructure handling petabytes of data daily.'
  }
};

export default function JobDescriptionMatcherView({
  resume,
  onUpdateResume,
  onOpenTailor
}: JobDescriptionMatcherViewProps) {
  const currentResume = resume || INITIAL_RESUME;
  const [selectedRole, setSelectedRole] = useState<'stripe' | 'vercel' | 'openai' | 'custom'>('stripe');
  const [customRoleTitle, setCustomRoleTitle] = useState('Senior Cloud Platform Developer');
  const [customJdText, setCustomJdText] = useState('Requirements: React.js, Node.js, Python, PostgreSQL, Docker, AWS, REST APIs.');
  const [injectedSkills, setInjectedSkills] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const candidateSkills = useMemo(() => {
    return (currentResume.skills || []).flatMap((s) => s.items);
  }, [currentResume]);

  const activeRoleData = useMemo(() => {
    if (selectedRole === 'custom') {
      const lower = customJdText.toLowerCase();
      const extracted = ['React.js', 'Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'Kubernetes', 'REST APIs', 'TypeScript', 'Git']
        .filter(k => lower.includes(k.toLowerCase()));
      return {
        company: 'Custom Employer',
        title: customRoleTitle,
        requiredSkills: extracted.length > 0 ? extracted : ['React.js', 'Node.js', 'PostgreSQL'],
        preferredSkills: ['Docker', 'FastAPI', 'TypeScript'],
        description: customJdText
      };
    }
    return PRESET_ROLES[selectedRole];
  }, [selectedRole, customRoleTitle, customJdText]);

  // Dynamically compute matched vs missing based on candidate's real uploaded resume!
  const { matched, missing } = useMemo(() => {
    const candidateLower = new Set(candidateSkills.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '')));
    const allRequired = [...activeRoleData.requiredSkills, ...activeRoleData.preferredSkills];

    const m: string[] = [];
    const miss: string[] = [];

    for (const skill of allRequired) {
      const clean = skill.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (candidateLower.has(clean) || candidateSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))) {
        m.push(skill);
      } else {
        miss.push(skill);
      }
    }

    return { matched: m, missing: miss };
  }, [candidateSkills, activeRoleData]);

  const matchScore = Math.round((matched.length / Math.max(1, matched.length + missing.length)) * 100);

  const [syncedJobTitle, setSyncedJobTitle] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('atsecure_target_job');
        if (saved) return JSON.parse(saved).title || null;
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    const handleJobSync = () => {
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem('atsecure_target_job');
          if (saved) {
            setSyncedJobTitle(JSON.parse(saved).title || null);
          } else {
            setSyncedJobTitle(null);
          }
        } catch {}
      }
    };
    window.addEventListener('atsecure_target_job_updated', handleJobSync);
    window.addEventListener('storage', handleJobSync);
    return () => {
      window.removeEventListener('atsecure_target_job_updated', handleJobSync);
      window.removeEventListener('storage', handleJobSync);
    };
  }, []);

  const isCurrentRoleActive = syncedJobTitle === activeRoleData.title;

  const handleApplyRoleToAll = (andTailor: boolean = false) => {
    const allKeywords = Array.from(new Set([...activeRoleData.requiredSkills, ...activeRoleData.preferredSkills]));
    const payload = {
      title: activeRoleData.title,
      company: activeRoleData.company,
      description: activeRoleData.description,
      extractedKeywords: allKeywords
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('atsecure_target_job', JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('atsecure_target_job_updated', { detail: payload }));
    }
    setSyncedJobTitle(activeRoleData.title);
    setNotification(`🎯 Target Job "${activeRoleData.title} (${activeRoleData.company})" applied to all 8 dashboard features!`);
    setTimeout(() => setNotification(null), 4000);

    if (andTailor && onOpenTailor) {
      onOpenTailor();
    }
  };

  const handleInjectAllMissingSkills = () => {
    if (missing.length === 0) return;
    const updated: ResumeData = JSON.parse(JSON.stringify(currentResume));
    if (updated.skills && updated.skills.length > 0) {
      const existing = new Set(updated.skills.flatMap(s => s.items.map(i => i.toLowerCase().trim())));
      for (const m of missing) {
        if (!existing.has(m.toLowerCase().trim())) {
          updated.skills[0].items.push(m);
          existing.add(m.toLowerCase().trim());
        }
      }
    } else {
      updated.skills = [{ category: 'Core Technologies', items: [...missing] }];
    }
    setInjectedSkills(prev => [...prev, ...missing]);
    if (onUpdateResume) {
      onUpdateResume(updated);
    }
    setNotification(`✓ Injected all ${missing.length} missing job keywords into ${currentResume.fullName}'s resume!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleInjectSkill = (skill: string) => {
    if (!candidateSkills.some(cs => cs.toLowerCase() === skill.toLowerCase())) {
      const updated: ResumeData = JSON.parse(JSON.stringify(currentResume));
      if (updated.skills.length > 0) {
        updated.skills[0].items.push(skill);
      } else {
        updated.skills = [{ category: 'Core Technologies', items: [skill] }];
      }
      setInjectedSkills(prev => [...prev, skill]);
      if (onUpdateResume) {
        onUpdateResume(updated);
      }
      setNotification(`✓ Injected "${skill}" into ${currentResume.fullName}'s resume skills!`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[var(--foreground)]">
      {/* Top Banner */}
      <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-xl transition-colors duration-200">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/30">
            <Target className="w-3.5 h-3.5" />
            <span>Job Description Matcher & Keyword Gap Analysis</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--text-heading)]">
            Job Match Alignment for {currentResume.fullName}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Comparing your uploaded resume against target job postings to uncover matching strengths and high-priority skill gaps.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleApplyRoleToAll(false)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isCurrentRoleActive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-[var(--surface-alt)] hover:bg-[var(--border)] text-[var(--text-heading)] border border-[var(--border)]'
            }`}
          >
            {isCurrentRoleActive ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Active for All 8 Features</span>
              </>
            ) : (
              <>
                <Target className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Apply to All 8 Features</span>
              </>
            )}
          </button>

          {onOpenTailor && (
            <button
              type="button"
              onClick={() => handleApplyRoleToAll(true)}
              className="px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply & Tailor Resume Canvas</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Target Job Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {(['stripe', 'vercel', 'openai', 'custom'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setSelectedRole(r)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedRole === r
                ? 'bg-[var(--accent-glow)] border-[var(--accent)] ring-2 ring-[var(--accent)]/40 shadow-md'
                : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]'
            }`}
          >
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block tracking-wider">
              {r === 'custom' ? 'User Custom Post' : 'Preset Posting'}
            </span>
            <div className="font-extrabold text-xs text-[var(--text-heading)] mt-0.5 capitalize">
              {r === 'custom' ? 'Custom Job Description' : PRESET_ROLES[r].company}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] truncate mt-1">
              {r === 'custom' ? 'Paste any external JD' : PRESET_ROLES[r].title}
            </div>
          </button>
        ))}
      </div>

      {/* Custom JD Input if Selected */}
      {selectedRole === 'custom' && (
        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={customRoleTitle}
              onChange={(e) => setCustomRoleTitle(e.target.value)}
              placeholder="Target Role Title (e.g. Cloud Engineer)"
              className="w-full p-2.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <textarea
            value={customJdText}
            onChange={(e) => setCustomJdText(e.target.value)}
            rows={4}
            placeholder="Paste responsibilities and requirements..."
            className="w-full p-3 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      )}

      {/* Match Result Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Overall Fit Score Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Match Fit vs {activeRoleData.company}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-[var(--text-heading)]">{matchScore}%</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                matchScore >= 80 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
              }`}>
                {matchScore >= 80 ? 'Competitive Fit' : 'Skills Gap Detected'}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Based on candidate <strong>{currentResume.fullName}</strong>'s uploaded draft with {candidateSkills.length} total technical skills identified.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface-alt)] border border-[var(--border)] space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Skills Matched:</span>
              <span className="font-bold text-emerald-500">{matched.length} Skills</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Missing Gaps:</span>
              <span className="font-bold text-amber-500">{missing.length} Skills</span>
            </div>
          </div>
        </div>

        {/* Right: Skills Breakdown */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-5 shadow-xl">
          {/* Matched Skills */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-[var(--text-heading)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Found in {currentResume.fullName}'s Resume ({matched.length})</span>
              </h3>
              <span className="text-[10px] text-emerald-500 font-bold">100% Algorithmic Match</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matched.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>{s}</span>
                </span>
              ))}
              {matched.length === 0 && (
                <p className="text-xs text-[var(--text-muted)]">No direct keyword overlap found yet.</p>
              )}
            </div>
          </div>

          {/* Missing Skills with 1-Click Inject */}
          <div className="space-y-2.5 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-extrabold text-xs text-[var(--text-heading)] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Missing Industry Keywords ({missing.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-muted)]">Click "+" or inject all:</span>
                {missing.length > 0 && (
                  <button
                    type="button"
                    onClick={handleInjectAllMissingSkills}
                    className="px-2.5 py-1 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inject All ({missing.length})</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missing.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInjectSkill(s)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={`Inject ${s} into your resume`}
                >
                  <Plus className="w-3 h-3" />
                  <span>{s}</span>
                </button>
              ))}
              {missing.length === 0 && (
                <p className="text-xs text-emerald-500 font-bold">🎉 Outstanding! Zero skill gaps for this posting.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
