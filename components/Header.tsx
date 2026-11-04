'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Bell, ShieldCheck, Lock, Shield } from 'lucide-react';
import { getUserAuth, MAX_FREE_TRIALS } from '@/lib/auth';
import ThemeSelector from '@/components/atsenseguard/ThemeSelector';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Security Dashboard & Overview', subtitle: 'Real-time overview of your ATS resume compatibility and applications' },
  '/ats-scorer': { title: 'ATS Resume Scorer & Analyzer', subtitle: 'Parse and audit your resume against target security and engineering roles' },
  '/tailor': { title: 'AI Resume Tailor Studio', subtitle: 'Interactive resume canvas with Google XYZ formulas and Job Description alignment' },
  '/job-search': { title: 'Security & Engineering Job Matcher', subtitle: 'Personalized role recommendations scored against your resume credentials' },
  '/cover-letter': { title: 'Tailored Cover Letter Generator', subtitle: 'Generate compelling, recruiter-aligned cover letters instantly' },
  '/tracker': { title: 'Application Pipeline Tracker', subtitle: 'Track candidate applications across enterprise hiring stages' },
  '/settings': { title: 'System Settings & Theme Configuration', subtitle: 'Configure visual themes, ATS parser strictness, and AI API keys' }
};

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const pageInfo = PAGE_TITLES[pathname] || { title: 'AtSecure Platform', subtitle: 'Enterprise ATS & Resume Security Intelligence' };

  const [mounted, setMounted] = useState(false);
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null as any, trialCount: 0 });

  useEffect(() => {
    setMounted(true);
    setAuth(getUserAuth());
    const update = () => setAuth(getUserAuth());
    window.addEventListener('jobsync_auth_changed', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('jobsync_auth_changed', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const remaining = Math.max(0, MAX_FREE_TRIALS - auth.trialCount);

  return (
    <header className="h-16 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-default)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 select-none transition-colors duration-200">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-surface-alt)] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-sm sm:text-base font-bold text-[var(--text-heading)] tracking-tight leading-tight flex items-center gap-2">
            {pageInfo.title}
          </h1>
          <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">{pageInfo.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Visual Theme Selector Quick Switcher */}
        <ThemeSelector />

        {/* Trial / Auth Badge */}
        {mounted && auth.isAuthenticated ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise Verified</span>
          </div>
        ) : (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
            remaining > 0 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
          }`}>
            {remaining > 0 ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>{remaining}/{MAX_FREE_TRIALS} Trials Left</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-500" />
                <span>Limit Reached</span>
              </>
            )}
          </div>
        )}

        {/* Quick Action Buttons */}
        <Link
          href="/ats-scorer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Shield className="w-3.5 h-3.5 text-white" />
          <span>Scan Resume</span>
        </Link>
      </div>
    </header>
  );
}
