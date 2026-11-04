'use client';

import { useState, useEffect } from 'react';
import { Settings, X, Palette, Sliders, Cpu, CheckCircle2 } from 'lucide-react';
import { THEMES, ThemeId, getStoredTheme, applyTheme } from '@/lib/theme-manager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [theme, setTheme] = useState<ThemeId>('light');
  const [atsSensitivity, setAtsSensitivity] = useState<'Standard' | 'Strict' | 'FAANG Heavy'>('Standard');
  const [aiModel, setAiModel] = useState<'Gemini 1.5 Pro' | 'GPT-4o' | 'Claude 3.5 Sonnet'>('Gemini 1.5 Pro');
  const [autoSave, setAutoSave] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTheme(getStoredTheme());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTheme = (tId: ThemeId) => {
    setTheme(tId);
    applyTheme(tId);
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 shadow-2xl text-[var(--foreground)] space-y-6 max-h-[90vh] overflow-y-auto transition-colors duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent)]/30">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--text-heading)]">Platform Settings</h2>
            <p className="text-xs text-[var(--text-muted)]">Configure visual themes, ATS scanner models, and editor preferences</p>
          </div>
        </div>

        {/* Theme Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[var(--accent)]" />
              <span>Visual Theme Palette ({THEMES.length} Options)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {THEMES.map((t) => {
              const active = t.id === theme;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTheme(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent-glow)] shadow-md ring-1 ring-[var(--accent)]'
                      : 'border-[var(--border)] bg-[var(--surface-alt)] hover:border-[var(--accent)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-[var(--text-heading)]">{t.name}</span>
                    <span
                      className="w-3 h-3 rounded-full border border-black/20 dark:border-white/30"
                      style={{ backgroundColor: t.accentColor }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] line-clamp-1">{t.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ATS Parsing Sensitivity */}
        <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
          <span className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>ATS Parser Strictness</span>
          </span>

          <div className="grid grid-cols-3 gap-2">
            {(['Standard', 'Strict', 'FAANG Heavy'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => { setAtsSensitivity(lvl); triggerSaved(); }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  atsSensitivity === lvl
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md'
                    : 'bg-[var(--surface-alt)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* AI Engine Model Selection */}
        <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
          <span className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>AI Bullet Tailor Engine</span>
          </span>

          <div className="grid grid-cols-3 gap-2">
            {(['Gemini 1.5 Pro', 'GPT-4o', 'Claude 3.5 Sonnet'] as const).map((model) => (
              <button
                key={model}
                type="button"
                onClick={() => { setAiModel(model); triggerSaved(); }}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer truncate ${
                  aiModel === model
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md'
                    : 'bg-[var(--surface-alt)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>

        {/* Auto Save Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <div>
            <div className="text-xs font-bold text-[var(--text-heading)]">Live Resume Autosave</div>
            <div className="text-[11px] text-[var(--text-muted)]">Instantly persist bullet edits and keyword changes</div>
          </div>
          <button
            type="button"
            onClick={() => { setAutoSave(!autoSave); triggerSaved(); }}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              autoSave ? 'bg-[var(--accent)]' : 'bg-[var(--surface-alt)] border border-[var(--border)]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                autoSave ? 'left-5.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Feedback footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          {savedNotice ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Preferences updated!
            </span>
          ) : <span className="text-[11px] text-[var(--text-muted)]">Settings sync automatically</span>}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--surface-alt)] hover:bg-[var(--card-hover)] border border-[var(--border)] text-[var(--text-heading)] text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
