'use client';

import { useState, useEffect, useRef } from 'react';
import { Palette, Check, Moon, Sun, Shield, CheckCircle2, Flame, Compass } from 'lucide-react';
import { THEMES, ThemeId, getStoredTheme, applyTheme } from '@/lib/theme-manager';

export default function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('light');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTheme(getStoredTheme());

    const handleThemeChange = (e: any) => {
      if (e.detail?.theme) {
        setCurrentTheme(e.detail.theme);
      }
    };

    window.addEventListener('jobsuit_theme_changed', handleThemeChange);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('jobsuit_theme_changed', handleThemeChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setIsOpen(false);
  };

  const getThemeIcon = (id: ThemeId) => {
    switch (id) {
      case 'light':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'midnight':
        return <Moon className="w-3.5 h-3.5 text-blue-400" />;
      case 'cyber':
        return <Shield className="w-3.5 h-3.5 text-sky-400" />;
      case 'emerald':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'sunset':
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case 'ocean':
        return <Compass className="w-3.5 h-3.5 text-sky-500" />;
    }
  };

  if (!mounted) {
    return (
      <div className="relative">
        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] text-xs font-medium text-[var(--text-body)] bg-[var(--bg-card)] shadow-xs opacity-90"
        >
          <Palette className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
          <span className="hidden sm:inline text-xs font-semibold">Theme</span>
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-black/20" />
        </button>
      </div>
    );
  }

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Visual Theme"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] hover:border-[var(--brand-primary)] text-xs font-medium text-[var(--text-body)] hover:text-[var(--text-heading)] bg-[var(--bg-card)] transition-all cursor-pointer shadow-xs"
      >
        <Palette className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
        <span className="hidden sm:inline text-xs font-semibold">{activeThemeObj.name.split(' ')[0]}</span>
        <span
          className="w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/20 shadow-xs"
          style={{ backgroundColor: activeThemeObj.accentColor }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl p-2 z-50 animate-fadeIn backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-[var(--border-default)] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              AtSecure Themes ({THEMES.length})
            </span>
          </div>

          <div className="space-y-1">
            {THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelect(theme.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--brand-subtle)] text-[var(--text-heading)] font-bold border border-[var(--brand-primary)]'
                      : 'text-[var(--text-body)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-heading)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center border border-[var(--border-default)]"
                      style={{ backgroundColor: theme.previewBg }}
                    >
                      {getThemeIcon(theme.id)}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-heading)]">{theme.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] leading-tight">{theme.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-black/20 dark:border-white/30"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    {isSelected && <Check className="w-3.5 h-3.5 text-[var(--brand-primary)]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
