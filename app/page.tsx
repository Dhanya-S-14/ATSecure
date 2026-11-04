'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/atsenseguard/Navbar';
import Hero from '@/components/atsenseguard/Hero';
import WhyATS from '@/components/atsenseguard/WhyATS';
import HowItWorks from '@/components/atsenseguard/HowItWorks';
import ATSScoreDemo from '@/components/atsenseguard/ATSScoreDemo';
import RoadmapSection from '@/components/atsenseguard/RoadmapSection';
import SecuritySection from '@/components/atsenseguard/SecuritySection';
import FreeVsFull from '@/components/atsenseguard/FreeVsFull';
import FAQSection from '@/components/atsenseguard/FAQSection';
import FinalCTA from '@/components/atsenseguard/FinalCTA';
import Footer from '@/components/atsenseguard/Footer';
import AuthModal from '@/components/atsenseguard/AuthModal';
import InteractiveAnalyzer from '@/components/atsenseguard/InteractiveAnalyzer';
import AuthenticatedDashboard from '@/components/atsenseguard/AuthenticatedDashboard';
import ProfileModal from '@/components/atsenseguard/ProfileModal';
import SettingsModal from '@/components/atsenseguard/SettingsModal';
import HowItWorksModal from '@/components/atsenseguard/HowItWorksModal';
import { getAuthState, getTrialCount, MAX_FREE_ANALYSES } from '@/lib/atsenseguard-service';
import { getStoredTheme, applyTheme } from '@/lib/theme-manager';

export default function ATSecureHomePage() {
  const [mounted, setMounted] = useState(false);
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null as any, trialCount: 0 });
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isExhausted, setIsExhausted] = useState(false);

  // New Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [howItWorksModalOpen, setHowItWorksModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAuth(getAuthState());

    // Apply stored visual theme
    const savedTheme = getStoredTheme();
    applyTheme(savedTheme);

    const update = () => {
      const state = getAuthState();
      setAuth(state);
    };

    window.addEventListener('atsenseguard_auth_changed', update);
    window.addEventListener('storage', update);

    return () => {
      window.removeEventListener('atsenseguard_auth_changed', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'register', exhausted = false) => {
    setAuthMode(mode);
    setIsExhausted(exhausted);
    setAuthModalOpen(true);
  };

  const handleOpenAnalyzer = () => {
    const remaining = Math.max(0, MAX_FREE_ANALYSES - getTrialCount());
    if (mounted && !auth.isAuthenticated && remaining <= 0) {
      handleOpenAuth('register', true);
      return;
    }
    setAnalyzerOpen(true);
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200"
    >
      {/* Sticky Navbar with Automatic Top Banner Hide on Login */}
      <Navbar
        onOpenAnalyzer={handleOpenAnalyzer}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenHowItWorks={() => setHowItWorksModalOpen(true)}
      />

      {/* RENDER LOGGED-IN DASHBOARD OR FULL B2B SAAS LANDING PAGE */}
      {mounted && auth.isAuthenticated && auth.user ? (
        <main className="pt-20 min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
          <AuthenticatedDashboard
            user={auth.user}
            onOpenAnalyzer={handleOpenAnalyzer}
            onOpenProfile={() => setProfileModalOpen(true)}
            onOpenSettings={() => setSettingsModalOpen(true)}
            onOpenHowItWorks={() => setHowItWorksModalOpen(true)}
          />
        </main>
      ) : (
        <main>
          {/* Section: Hero Section (2-Column Grid + SaaS Preview Card) */}
          <Hero onOpenAnalyzer={handleOpenAnalyzer} />

          {/* Section: Product Explanation (Two tools. One career path. — JobSuit & JobStep) */}
          <WhyATS onOpenAnalyzer={handleOpenAnalyzer} />

          {/* Section: How It Works (Clean 4-Step Process 01 to 04) */}
          <HowItWorks />

          {/* Section: Analysis Dashboard Showcase (Know exactly where you stand.) */}
          <ATSScoreDemo onOpenAnalyzer={handleOpenAnalyzer} />

          {/* Section: JobStep Roadmap Section (Don't just find your gaps. Know what to do next.) */}
          <RoadmapSection onOpenAnalyzer={handleOpenAnalyzer} />

          {/* Section: Security & Trust Section (Your resume is personal. We treat it that way.) */}
          <SecuritySection />

          {/* Section: Pricing & Free Access Matrix (Start Free — 3 Free Resume Analyses) */}
          <FreeVsFull
            onOpenAnalyzer={handleOpenAnalyzer}
            onOpenAuth={handleOpenAuth}
          />

          {/* Section: FAQ Accordions */}
          <FAQSection />

          {/* Section: Final Call To Action */}
          <FinalCTA
            onOpenAnalyzer={handleOpenAnalyzer}
            onOpenAuth={handleOpenAuth}
          />
        </main>
      )}

      {/* Footer */}
      <Footer />

      {/* Interactive Analyzer Modal (Preserving full PDF parsing & JobSuit + JobStep logic) */}
      <InteractiveAnalyzer
        isOpen={analyzerOpen}
        onClose={() => setAnalyzerOpen(false)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        isExhausted={isExhausted}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        user={auth.user}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Settings & Themes Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      {/* How It Works Interactive Modal */}
      <HowItWorksModal
        isOpen={howItWorksModalOpen}
        onClose={() => setHowItWorksModalOpen(false)}
      />
    </div>
  );
}
