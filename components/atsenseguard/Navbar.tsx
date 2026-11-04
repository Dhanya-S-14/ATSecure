'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowRight,
  Menu,
  X,
  User,
  Settings,
  Sparkles,
  HelpCircle,
  Shield,
  Palette,
  LogOut
} from 'lucide-react';
import { getAuthState, authLogoutApi } from '@/lib/atsenseguard-service';
import ThemeSelector from './ThemeSelector';

interface NavbarProps {
  onOpenAnalyzer: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenHowItWorks?: () => void;
}

export default function Navbar({
  onOpenAnalyzer,
  onOpenAuth,
  onOpenProfile,
  onOpenSettings,
  onOpenHowItWorks
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null as any, trialCount: 0 });

  useEffect(() => {
    setMounted(true);
    setAuth(getAuthState());

    const updateAuth = () => setAuth(getAuthState());
    window.addEventListener('atsenseguard_auth_changed', updateAuth);
    window.addEventListener('storage', updateAuth);

    return () => {
      window.removeEventListener('atsenseguard_auth_changed', updateAuth);
      window.removeEventListener('storage', updateAuth);
    };
  }, []);

  const handleHowItWorksClick = (e: React.MouseEvent) => {
    if (mounted && auth.isAuthenticated && onOpenHowItWorks) {
      e.preventDefault();
      onOpenHowItWorks();
    } else {
      // Allow default smooth anchor scroll to #how-it-works
      const el = document.getElementById('how-it-works');
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const displayName = auth.user?.name || 'Dhanya1456subramaniam';

  return (
    <header
      suppressHydrationWarning
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border)] transition-colors duration-200"
    >
      
      {/* 
        Top Announcement Banner: High-Converting, Modern & Eye-Catching
      */}
      <div
        suppressHydrationWarning
        className={`relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 text-white border-b border-blue-400/30 shadow-xs transition-all duration-300 ${
          mounted && auth.isAuthenticated ? 'hidden' : 'block'
        }`}
      >
        {/* Subtle background radial glow highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center sm:text-left text-xs">
          
          {/* Main Messaging: Headline + Supporting Sentence */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 leading-tight">
            {/* Headline */}
            <span className="font-extrabold text-white text-[12px] sm:text-xs tracking-tight flex items-center gap-1 drop-shadow-xs">
              <span>Make Your Resume Impossible to Ignore</span>
              <span className="inline-block transition-transform duration-300 hover:scale-125">🚀</span>
            </span>

            {/* Separator Dot (Hidden on mobile) */}
            <span className="hidden md:inline-block text-blue-200/60 font-black">•</span>

            {/* Supporting sentence */}
            <span className="text-blue-100/90 font-normal text-[11px] sm:text-xs">
              Optimize your resume with AI, improve your ATS score, and get noticed by recruiters.
            </span>
          </div>

          {/* CTA Link / Button */}
          <button
            type="button"
            onClick={onOpenAnalyzer}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-bold text-[11px] sm:text-xs shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group active:scale-95 hover:scale-[1.02]"
            aria-label="Try ATSecure Free and scan your resume"
          >
            <span>Try ATSecure Free</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:text-blue-800 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold shadow-md shadow-[var(--accent-glow)]">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-base text-[var(--text-heading)] tracking-tight">
            ATSecure
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-7 text-xs font-bold text-[var(--text-muted)]">
          <a href="#features" className="hover:text-[var(--text-heading)] transition-colors">
            Features
          </a>

          <button
            type="button"
            onClick={handleHowItWorksClick}
            className="hover:text-[var(--text-heading)] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>How It Works</span>
          </button>

          <a href="#security" className="hover:text-[var(--text-heading)] transition-colors">
            Security
          </a>

          {mounted && auth.isAuthenticated && (
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-glow)] text-[var(--accent)] text-[10px] border border-[var(--accent)]/30 font-bold">
              Pro Suite Unlocked
            </span>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Theme Selector (6 Themes) */}
          <ThemeSelector />

          {mounted && auth.isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Profile Button */}
              <button
                type="button"
                onClick={onOpenProfile}
                title="View Profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-bold text-[var(--text-heading)] transition-all cursor-pointer shadow-xs"
              >
                <div className="w-5 h-5 rounded-md bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-black">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{displayName}</span>
              </button>

              {/* Settings Button */}
              <button
                type="button"
                onClick={onOpenSettings}
                title="Settings"
                className="p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-all cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={() => authLogoutApi()}
                title="Sign Out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:border-[var(--accent)] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors cursor-pointer"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={onOpenAnalyzer}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-[var(--accent-glow)]"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--card)]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[var(--nav-bg)] border-b border-[var(--border)] px-6 py-4 space-y-4 shadow-2xl animate-fadeIn backdrop-blur-xl">
          <div className="flex flex-col space-y-3 text-xs font-bold text-[var(--text-muted)]">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--text-heading)]">Features</a>
            <button
              type="button"
              onClick={handleHowItWorksClick}
              className="text-left font-bold hover:text-[var(--text-heading)]"
            >
              How It Works
            </button>
            <a href="#security" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--text-heading)]">Security</a>
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-2 justify-between">
            <ThemeSelector />

            {mounted && auth.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); if (onOpenProfile) onOpenProfile(); }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-heading)] font-bold"
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); if (onOpenSettings) onOpenSettings(); }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-heading)] font-bold"
                >
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); authLogoutApi(); }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--card)] text-[var(--text-muted)] text-xs"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] text-xs"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); onOpenAnalyzer(); }}
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-bold"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
