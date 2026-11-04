'use client';

import { useState } from 'react';
import { User, X, Mail, Briefcase, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '@/lib/atsenseguard-service';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [roleTitle, setRoleTitle] = useState('Staff AI Product Engineer');
  const [yearsExp, setYearsExp] = useState('6+ Years');
  const [targetSalary, setTargetSalary] = useState('$180,000 - $220,000');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const displayName = user?.name || 'Dhanya1456subramaniam';
  const displayEmail = user?.email || 'Dhanya1456subramaniam@gmail.com';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 shadow-2xl text-[var(--foreground)] space-y-6 transition-colors duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Avatar & Info */}
        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-5">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-[var(--accent-glow)]">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[var(--text-heading)]">{displayName}</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                PRO ACTIVE
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{displayEmail}</span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Total Scans</span>
            <span className="text-2xl font-black text-[var(--text-heading)]">{user?.analysesCount || 7}</span>
            <span className="text-[10px] text-emerald-400">Unlimited Active</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Saved Resumes</span>
            <span className="text-2xl font-black text-[var(--text-heading)]">{user?.savedResumesCount || 3}</span>
            <span className="text-[10px] text-[var(--text-muted)]">Role Variants</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Average ATS</span>
            <span className="text-2xl font-black text-[var(--text-heading)]">92%</span>
            <span className="text-[10px] text-[var(--accent)]">Top 5% Tier</span>
          </div>
        </div>

        {/* Career Target Preferences Form */}
        <form onSubmit={handleSave} className="space-y-3.5 pt-1">
          <h3 className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Target Career Profile</span>
          </h3>

          <div>
            <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Target Role Title</label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Experience Level</label>
              <input
                type="text"
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">Target Compensation</label>
              <input
                type="text"
                value={targetSalary}
                onChange={(e) => setTargetSalary(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saved ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Changes saved to profile!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs shadow-md shadow-[var(--accent-glow)] transition-all cursor-pointer"
            >
              Save Profile Preferences
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
