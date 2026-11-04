'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck2,
  Sparkles,
  FileText,
  Kanban,
  Settings,
  Shield,
  Target,

   
  
  ChevronRight,
  LogOut,
  User,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserAuth, logoutUser, MAX_FREE_TRIALS } from '@/lib/auth';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    badge: null
  },
  {
    label: 'ATS Scorer',
    href: '/ats-scorer',
    icon: FileCheck2,
    badge: 'Core'
  },
  {
    label: 'AI Resume Tailor',
    href: '/tailor',
    icon: Sparkles,
    badge: 'Studio'
  },
  {
    label: 'Job Matcher',
    href: '/job-search',
    icon: Target,
    badge: 'AI Match'
  },
  {
    label: 'Cover Letters',
    href: '/cover-letter',
    icon: FileText,
    badge: null
  },
  {
    label: 'Application Tracker',
    href: '/tracker',
    icon: Kanban,
    badge: 'Kanban'
  },
  {
    label: 'Settings & Appearance',
    href: '/settings',
    icon: Settings,
    badge: null
  }
];

export default function Sidebar() {
  const pathname = usePathname();
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

  const remainingTrials = Math.max(0, MAX_FREE_TRIALS - auth.trialCount);

  return (
    <aside className="w-64 bg-[var(--bg-sidebar)] text-[var(--sidebar-text)] flex flex-col h-screen sticky top-0 border-r border-[var(--sidebar-border)] z-30 shrink-0 shadow-xl select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-[var(--sidebar-border)] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Shield className="w-5 h-5 fill-current text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">AtSecure</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">PRO</span>
            </div>
            <p className="text-[11px] text-[var(--sidebar-muted)] font-medium">Enterprise ATS & Resume Security</p>
          </div>
        </Link>
      </div>

      {/* Free Trial Banner in Sidebar */}
      {mounted && !auth.isAuthenticated && (
        <div className="m-3 p-3 rounded-xl bg-black/40 border border-[var(--sidebar-border)] text-[var(--sidebar-muted)] text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Free Trial Mode
            </span>
            <span className="text-[11px] font-mono bg-[var(--brand-primary)] text-white font-bold px-1.5 py-0.5 rounded">
              {remainingTrials}/{MAX_FREE_TRIALS} left
            </span>
          </div>
          <p className="text-[11px] text-[var(--sidebar-muted)] leading-snug">
            {remainingTrials > 0
              ? 'Test AI ATS features up to 3 times for free.'
              : 'Trial limit reached. Sign in for full access.'}
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-[var(--sidebar-muted)] uppercase tracking-wider">
          Platform Workspace
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group',
                isActive
                  ? 'bg-[var(--sidebar-active-bg)] text-white shadow-md shadow-blue-500/25 font-bold'
                  : 'text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-[var(--sidebar-muted)] group-hover:text-white')} />
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                    isActive
                      ? 'bg-white/20 text-white border-white/30'
                      : 'bg-black/30 text-[var(--sidebar-muted)] border-[var(--sidebar-border)]'
                  )}
                >
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className={cn("w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--sidebar-muted)]", isActive && "opacity-100 text-white")} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3.5 border-t border-[var(--sidebar-border)] flex items-center justify-between bg-black/30">
        {mounted && auth.isAuthenticated ? (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] flex items-center justify-center font-bold text-xs text-white shadow shrink-0">
                {auth.user?.name ? auth.user.name.slice(0, 2).toUpperCase() : 'AS'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{auth.user?.name || 'Enterprise User'}</p>
                <p className="text-[11px] text-[var(--sidebar-muted)] truncate">{auth.user?.email || 'user@atsecure.ai'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => logoutUser()}
              title="Log Out"
              className="p-1.5 rounded-lg text-[var(--sidebar-muted)] hover:text-white hover:bg-[var(--sidebar-hover)] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--sidebar-hover)] border border-[var(--sidebar-border)] flex items-center justify-center text-[var(--sidebar-muted)]">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Guest Session</p>
                <p className="text-[10px] text-[var(--sidebar-muted)]">
                  {auth.trialCount >= MAX_FREE_TRIALS ? 'Free Scan Used' : '1 Free Scan Left'}
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="text-[11px] font-bold px-2.5 py-1 rounded bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-hover)] transition-colors shadow-xs"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
