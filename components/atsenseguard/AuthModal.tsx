'use client';

import { useState } from 'react';
import { X, Lock, Sparkles, UserCheck, AlertCircle } from 'lucide-react';
import { authRegisterApi, authLoginApi } from '@/lib/atsenseguard-service';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  isExhausted?: boolean;
  onClose: () => void;
}

export default function AuthModal({
  isOpen,
  initialMode = 'register',
  isExhausted = false,
  onClose
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await authRegisterApi(name, email);
      } else {
        await authLoginApi(email);
      }
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] p-6 sm:p-8 shadow-2xl text-[var(--text-heading)] space-y-6">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          {isExhausted ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-[var(--text-body)] text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              <span>1 Free Scan Used</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-[var(--text-body)] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>Unlock Full ATS Diagnostic Suite</span>
            </div>
          )}

          <h2 className="text-2xl font-extrabold text-[var(--text-heading)] tracking-tight">
            {isExhausted ? 'Free Scan Completed' : mode === 'register' ? 'Create Free Account' : 'Welcome Back'}
          </h2>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
            {isExhausted
              ? 'You have used your 1 free scan. Please log in or create a free account to run unlimited scans, save your reports, and unlock full ATS tools.'
              : 'Sign in to access saved resume analyses, job description matching, and AI bullet rewriter.'}
          </p>
        </div>

        {/* Form Tabs */}
        <div className="flex rounded-xl bg-[var(--bg-muted)] p-1 border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              mode === 'register' ? 'bg-[var(--brand-primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            Create Free Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              mode === 'login' ? 'bg-[var(--brand-primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
            }`}
          >
            Sign In
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[var(--text-body)] mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] text-xs text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[var(--text-body)] mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. alex.vance@techdev.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] text-xs text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-body)] mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] text-xs text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[var(--brand-primary)] hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-[var(--brand-primary)]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-white" />
            <span>{loading ? 'Authenticating...' : mode === 'register' ? 'Create Free Account' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-heading)] underline cursor-pointer"
          >
            Maybe later
          </button>
        </div>

      </div>
    </div>
  );
}
