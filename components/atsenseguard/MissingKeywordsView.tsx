'use client';

import { useState, useMemo, useEffect } from 'react';
import { Sparkles, Search, Plus, Check, ArrowRight, Filter, CheckCircle2, Target } from 'lucide-react';
import { ResumeData } from '@/lib/types';
import { INITIAL_RESUME } from '@/lib/utils';

interface MissingKeywordsViewProps {
  resume?: ResumeData;
  onUpdateResume?: (updated: ResumeData) => void;
  onOpenTailor?: () => void;
}

const TAXONOMY_KEYWORDS = [
  { name: 'Kubernetes', category: 'cloud', demand: '98%', priority: 'High', reason: 'Found in 92% of Cloud & Full-Stack postings' },
  { name: 'Terraform', category: 'cloud', demand: '91%', priority: 'High', reason: 'Infrastructure as Code requirement' },
  { name: 'CI/CD Pipelines', category: 'cloud', demand: '89%', priority: 'Medium', reason: 'Automated release management & GitHub Actions' },
  { name: 'Docker', category: 'cloud', demand: '95%', priority: 'High', reason: 'Containerization standard across industry' },
  { name: 'FastAPI', category: 'backend', demand: '87%', priority: 'High', reason: 'High-performance Python backend API services' },
  { name: 'Redis', category: 'backend', demand: '94%', priority: 'High', reason: 'Sub-millisecond data caching and rate limiting' },
  { name: 'PostgreSQL', category: 'backend', demand: '96%', priority: 'High', reason: 'Relational data consistency and SQL querying' },
  { name: 'React.js', category: 'frontend', demand: '97%', priority: 'High', reason: 'Modern component-driven web interfaces' },
  { name: 'Next.js', category: 'frontend', demand: '93%', priority: 'High', reason: 'Full-stack React with SSR and Server Actions' },
  { name: 'TypeScript', category: 'frontend', demand: '95%', priority: 'High', reason: 'Type safety and enterprise codebase scalability' },
  { name: 'System Design Architecture', category: 'leadership', demand: '96%', priority: 'High', reason: 'L5+ technical interview benchmark' },
  { name: 'REST APIs', category: 'backend', demand: '98%', priority: 'High', reason: 'Universal API integration standard' }
];

export default function MissingKeywordsView({
  resume,
  onUpdateResume,
  onOpenTailor
}: MissingKeywordsViewProps) {
  const currentResume = resume || INITIAL_RESUME;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cloud' | 'backend' | 'frontend' | 'leadership'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  const [activeTargetJob, setActiveTargetJob] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('atsecure_target_job');
        if (saved) return JSON.parse(saved);
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
            setActiveTargetJob(JSON.parse(saved));
          } else {
            setActiveTargetJob(null);
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

  const existingSkillsSet = useMemo(() => {
    const list = (currentResume.skills || []).flatMap(s => s.items);
    return new Set(list.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '')));
  }, [currentResume]);

  // Compute Target Job Missing Keywords vs Existing Resume Skills
  const targetJobKeywordsAnalysis = useMemo(() => {
    if (!activeTargetJob) return null;
    const keywords: string[] = activeTargetJob.extractedKeywords || [];
    const matched: string[] = [];
    const missing: string[] = [];

    for (const kw of keywords) {
      const clean = kw.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (existingSkillsSet.has(clean) || Array.from(existingSkillsSet).some(s => s.includes(clean) || clean.includes(s))) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    }
    return { matched, missing };
  }, [activeTargetJob, existingSkillsSet]);

  const handleInjectAllTargetJobMissing = () => {
    if (!targetJobKeywordsAnalysis || targetJobKeywordsAnalysis.missing.length === 0) return;
    const updated: ResumeData = JSON.parse(JSON.stringify(currentResume));
    if (updated.skills && updated.skills.length > 0) {
      const existing = new Set(updated.skills.flatMap(s => s.items.map(i => i.toLowerCase().trim())));
      for (const m of targetJobKeywordsAnalysis.missing) {
        if (!existing.has(m.toLowerCase().trim())) {
          updated.skills[0].items.push(m);
          existing.add(m.toLowerCase().trim());
        }
      }
    } else {
      updated.skills = [{ category: 'Core Skills', items: [...targetJobKeywordsAnalysis.missing] }];
    }
    if (onUpdateResume) {
      onUpdateResume(updated);
    }
    setNotification(`✓ Injected all ${targetJobKeywordsAnalysis.missing.length} target job keywords into ${currentResume.fullName}'s resume!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filtered = useMemo(() => {
    return TAXONOMY_KEYWORDS.filter((k) => {
      const matchSearch = k.name.toLowerCase().includes(search.toLowerCase()) || k.reason.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'all' || k.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  const handleToggleAdd = (name: string) => {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const alreadyHas = existingSkillsSet.has(clean);

    const updated: ResumeData = JSON.parse(JSON.stringify(currentResume));
    if (alreadyHas) {
      // Remove
      updated.skills.forEach(cat => {
        cat.items = cat.items.filter(item => item.toLowerCase().replace(/[^a-z0-9]/g, '') !== clean);
      });
      setNotification(`Removed "${name}" from ${currentResume.fullName}'s resume.`);
    } else {
      // Add
      if (updated.skills.length > 0) {
        updated.skills[0].items.push(name);
      } else {
        updated.skills = [{ category: 'Core Skills', items: [name] }];
      }
      setNotification(`✓ Injected "${name}" into ${currentResume.fullName}'s resume!`);
    }

    if (onUpdateResume) {
      onUpdateResume(updated);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[var(--foreground)]">
      {/* Top Banner */}
      <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-xl transition-colors duration-200">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Keyword Optimizer & ATS Frequency Bank</span>
          </div>
          <h2 className="text-2xl font-black text-[var(--text-heading)]">
            High-Impact Keywords for {currentResume.fullName}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Taxonomy search across 12,000+ tech job descriptions. Inject high-converting keywords missing from your active draft.
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

      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Target Job Keywords Section (Direct Integration) */}
      {targetJobKeywordsAnalysis && (
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-bold">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[var(--text-heading)]">
                  Target Job Required Keywords: {activeTargetJob.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Company: <strong>{activeTargetJob.company || 'Target Employer'}</strong> • {targetJobKeywordsAnalysis.matched.length} Matched / {targetJobKeywordsAnalysis.missing.length} Missing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {targetJobKeywordsAnalysis.missing.length > 0 && (
                <button
                  type="button"
                  onClick={handleInjectAllTargetJobMissing}
                  className="px-3.5 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Auto-Inject All Missing ({targetJobKeywordsAnalysis.missing.length})</span>
                </button>
              )}
              {onOpenTailor && (
                <button
                  type="button"
                  onClick={onOpenTailor}
                  className="px-3.5 py-2 rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--border)] text-[var(--text-heading)] font-bold text-xs border border-[var(--border)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tailor Bullets</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Matched from Target Job */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Found in {currentResume.fullName}'s Resume ({targetJobKeywordsAnalysis.matched.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {targetJobKeywordsAnalysis.matched.map((kw: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>{kw}</span>
                  </span>
                ))}
                {targetJobKeywordsAnalysis.matched.length === 0 && (
                  <span className="text-xs text-[var(--text-muted)]">No direct matches found yet.</span>
                )}
              </div>
            </div>

            {/* Missing from Target Job */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Missing from Resume ({targetJobKeywordsAnalysis.missing.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {targetJobKeywordsAnalysis.missing.map((kw: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleToggleAdd(kw)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title={`Inject ${kw} into resume`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{kw}</span>
                  </button>
                ))}
                {targetJobKeywordsAnalysis.missing.length === 0 && (
                  <span className="text-xs text-emerald-500 font-bold">🎉 100% of target job keywords are present in your resume!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords (e.g. Kubernetes, Redis, Docker, FastAPI)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-heading)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex rounded-xl bg-[var(--card)] p-1 border border-[var(--border)] text-xs shrink-0 w-full sm:w-auto overflow-x-auto">
          {(['all', 'cloud', 'backend', 'frontend', 'leadership'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                selectedCategory === c
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Keywords Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((item, idx) => {
          const clean = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isAdded = existingSkillsSet.has(clean);

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all space-y-3 shadow-sm ${
                isAdded
                  ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/30'
                  : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--text-heading)]">{item.name}</h3>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-mono">
                    {item.category} • Demand: {item.demand}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleAdd(item.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isAdded
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                      : 'bg-[var(--accent)] hover:opacity-90 text-white shadow-xs'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>In Resume</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Inject</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
