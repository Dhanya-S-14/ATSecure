'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[var(--surface-alt)] border-t border-[var(--border)] py-16 text-[var(--text-muted)] text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold shadow-md shadow-[var(--accent-glow)]">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base text-[var(--text-heading)] tracking-tight">
                ATSecure
              </span>
            </div>
            <p className="text-[var(--text-muted)] max-w-sm leading-relaxed">
              AI-Powered Resume Compatibility Analyzer and Personalized Career Roadmap Platform.
            </p>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-bold text-[var(--text-heading)] uppercase tracking-wider block text-[11px]">Product</span>
            <ul className="space-y-2 text-[var(--text-muted)] font-medium">
              <li><a href="#jobsuit" className="hover:text-[var(--text-heading)] transition-colors">ATS Analyzer</a></li>
              <li><a href="#jobstep" className="hover:text-[var(--text-heading)] transition-colors">Career Roadmap</a></li>
              <li><a href="#features" className="hover:text-[var(--text-heading)] transition-colors">Features</a></li>
              <li><Link href="/ats-scorer" className="hover:text-[var(--text-heading)] transition-colors">ATS Scorer</Link></li>
              <li><Link href="/tailor" className="hover:text-[var(--text-heading)] transition-colors">Resume Tailor</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-bold text-[var(--text-heading)] uppercase tracking-wider block text-[11px]">Resources</span>
            <ul className="space-y-2 text-[var(--text-muted)] font-medium">
              <li><a href="#how-it-works" className="hover:text-[var(--text-heading)] transition-colors">How It Works</a></li>
              <li><Link href="/job-search" className="hover:text-[var(--text-heading)] transition-colors">Job Matcher</Link></li>
              <li><Link href="/cover-letter" className="hover:text-[var(--text-heading)] transition-colors">Cover Letters</Link></li>
              <li><Link href="/tracker" className="hover:text-[var(--text-heading)] transition-colors">Job Tracker</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-bold text-[var(--text-heading)] uppercase tracking-wider block text-[11px]">Company & Legal</span>
            <ul className="space-y-2 text-[var(--text-muted)] font-medium">
              <li><a href="#security" className="hover:text-[var(--text-heading)] transition-colors">Security & Privacy</a></li>
              <li><Link href="/settings" className="hover:text-[var(--text-heading)] transition-colors">API System Settings</Link></li>
              <li><span className="text-[var(--text-muted)]/70">Terms of Service</span></li>
              <li><span className="text-[var(--text-muted)]/70">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[var(--text-muted)] font-medium">
          <p>© 2026 ATSecure. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy First</span>
            <span>•</span>
            <span>Single-Column ATS Approved</span>
            <span>•</span>
            <span>B2B Career Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
