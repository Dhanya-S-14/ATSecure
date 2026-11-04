'use client';

import { Lock, ArrowRight } from 'lucide-react';
import { MAX_FREE_ANALYSES } from '@/lib/atsenseguard-service';

interface TrialCounterProps {
  trialCount: number;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export default function TrialCounter({ trialCount, onOpenAuth }: TrialCounterProps) {
  const remaining = Math.max(0, MAX_FREE_ANALYSES - trialCount);

  return (
    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs transition-colors duration-200 shadow-md">
      <div className="flex items-center gap-3">
        {/* Progress indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-4 h-4 rounded-full transition-all flex items-center justify-center font-mono text-[9px] font-bold ${
              trialCount >= 1
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-emerald-500 text-white shadow-xs animate-pulse'
            }`}
          >
            {trialCount >= 1 ? '●' : '1'}
          </span>
        </div>

        <div>
          {remaining > 0 ? (
            <span className="font-extrabold text-[var(--text-heading)]">
              Free scan: 1 / 1 remaining
            </span>
          ) : (
            <span className="font-extrabold text-[var(--text-heading)] flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-rose-500" /> Free scan completed (1/1 used)
            </span>
          )}
          <p className="text-[11px] text-[var(--text-muted)]">
            {remaining > 0
              ? 'Analyze any resume for a basic ATS score and formatting check.'
              : 'You have used your 1 free scan. Please log in or register to unlock unlimited scans.'}
          </p>
        </div>
      </div>

      {remaining <= 0 ? (
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="px-3 py-2 rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-[var(--text-heading)] font-bold text-xs transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-black text-xs shadow-md shadow-[var(--accent-glow)] flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onOpenAuth('login')}
          className="text-xs font-bold text-[var(--accent)] hover:opacity-80 underline shrink-0 cursor-pointer"
        >
          Have an account? Log In
        </button>
      )}
    </div>
  );
}
