export type ThemeId = 'light' | 'midnight' | 'cyber' | 'emerald' | 'sunset' | 'ocean';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  accentColor: string;
  previewBg: string;
  previewCard: string;
  previewBorder: string;
  iconName: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'light',
    name: 'Enterprise Light',
    description: 'Clean, high-contrast executive corporate design',
    accentColor: '#2563eb',
    previewBg: '#f8fafc',
    previewCard: '#ffffff',
    previewBorder: '#e2e8f0',
    iconName: 'Sun'
  },
  {
    id: 'midnight',
    name: 'AtSecure Midnight',
    description: 'Ultra-refined dark security navy & slate aesthetic',
    accentColor: '#3b82f6',
    previewBg: '#090d16',
    previewCard: '#0f172a',
    previewBorder: '#1e293b',
    iconName: 'Moon'
  },
  {
    id: 'cyber',
    name: 'Cyber Defense',
    description: 'SOC operations dark navy with restrained cyan accent',
    accentColor: '#0284c7',
    previewBg: '#070b14',
    previewCard: '#0c1222',
    previewBorder: '#172544',
    iconName: 'Shield'
  },
  {
    id: 'emerald',
    name: 'Verified Compliance',
    description: 'Deep forest obsidian with verified emerald highlights',
    accentColor: '#059669',
    previewBg: '#06110d',
    previewCard: '#0b1c16',
    previewBorder: '#133d2f',
    iconName: 'CheckCircle'
  },
  {
    id: 'sunset',
    name: 'Amber Sentinel',
    description: 'Warm dark palette with amber warning indicators',
    accentColor: '#d97706',
    previewBg: '#120a07',
    previewCard: '#1c110c',
    previewBorder: '#3d2217',
    iconName: 'Flame'
  },
  {
    id: 'ocean',
    name: 'Deep Marine',
    description: 'Arctic navy security architecture theme',
    accentColor: '#0284c7',
    previewBg: '#08111e',
    previewCard: '#0e1d33',
    previewBorder: '#1a365d',
    iconName: 'Compass'
  }
];

export const THEME_STORAGE_KEY = 'jobsuit_theme';

export function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
  if (saved && THEMES.some((t) => t.id === saved)) {
    return saved;
  }
  return 'light';
}

export function applyTheme(themeId: ThemeId): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
  document.documentElement.setAttribute('data-theme', themeId);
  
  if (themeId === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }
  
  window.dispatchEvent(new CustomEvent('jobsuit_theme_changed', { detail: { theme: themeId } }));
}
