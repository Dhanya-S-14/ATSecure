'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Settings,
  Key,
  Database,
  Code,
  CheckCircle2,
  Lock,
  Sparkles,
  Copy,
  Check,
  Cpu,
  Palette,
  Shield,
  Sun,
  Moon,
  Flame,
  Compass,
  Loader2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { THEMES, ThemeId, getStoredTheme, applyTheme } from '@/lib/theme-manager';

const SQL_SCHEMA_SNIPPET = `-- AtSecure / JobSync AI PostgreSQL / Supabase Core Database Schema

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    raw_content JSONB NOT NULL,
    tailored_content JSONB,
    ats_score INT DEFAULT 0
);

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    applied_date DATE DEFAULT CURRENT_DATE
);`;

const PRISMA_SCHEMA_SNIPPET = `// AtSecure / JobSync AI Prisma Schema

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  resumes   Resume[]
}

model Resume {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  title           String   @default("Untitled Resume")
  rawContent      Json     @map("raw_content")
  atsScore        Int?     @map("ats_score")
}`;

export default function SettingsPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('light');
  const [themeNotice, setThemeNotice] = useState(false);

  const [aiApiKey, setAiApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini');

  // Resume Parser API Settings (Affinda, APILayer, Eden AI)
  const [parserApiKey, setParserApiKey] = useState('');
  const [parserProvider, setParserProvider] = useState<'affinda' | 'apilayer' | 'edenai'>('affinda');

  const [activeSchemaTab, setActiveSchemaTab] = useState<'sql' | 'prisma'>('sql');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [aiSavedSuccess, setAiSavedSuccess] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ valid: boolean; model?: string; latencyMs?: number; error?: string } | null>(null);

  const handleTestAiConnection = async () => {
    setIsTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/check-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: aiApiKey })
      });
      const data = await res.json();
      setAiTestResult(data);
    } catch (err: any) {
      setAiTestResult({ valid: false, error: err?.message || 'Failed to connect to Gemini API.' });
    } finally {
      setIsTestingAi(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentTheme(getStoredTheme());
      setParserApiKey(localStorage.getItem('RESUME_PARSER_API_KEY') || '');
      setParserProvider((localStorage.getItem('RESUME_PARSER_PROVIDER') as 'affinda' | 'apilayer' | 'edenai') || 'affinda');
      const savedAiProvider = (localStorage.getItem('AI_PROVIDER') as 'gemini' | 'openai') || 'gemini';
      setAiProvider(savedAiProvider);
      const savedAiKey = localStorage.getItem(savedAiProvider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY') || localStorage.getItem('AI_API_KEY') || '';
      setAiApiKey(savedAiKey);
    }
  }, []);

  const handleSelectTheme = (tId: ThemeId) => {
    setCurrentTheme(tId);
    applyTheme(tId);
    setThemeNotice(true);
    setTimeout(() => setThemeNotice(false), 2500);
  };

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('RESUME_PARSER_API_KEY', parserApiKey);
      localStorage.setItem('RESUME_PARSER_PROVIDER', parserProvider);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveAiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('AI_PROVIDER', aiProvider);
      localStorage.setItem('AI_API_KEY', aiApiKey);
      if (aiProvider === 'gemini') {
        localStorage.setItem('GEMINI_API_KEY', aiApiKey);
      } else {
        localStorage.setItem('OPENAI_API_KEY', aiApiKey);
      }
    }
    setAiSavedSuccess(true);
    setTimeout(() => setAiSavedSuccess(false), 3000);
  };

  const handleCopySchema = () => {
    const textToCopy = activeSchemaTab === 'sql' ? SQL_SCHEMA_SNIPPET : PRISMA_SCHEMA_SNIPPET;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getThemeIcon = (id: ThemeId) => {
    switch (id) {
      case 'light':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'midnight':
        return <Moon className="w-4 h-4 text-blue-400" />;
      case 'cyber':
        return <Shield className="w-4 h-4 text-sky-400" />;
      case 'emerald':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'sunset':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'ocean':
        return <Compass className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12 transition-colors duration-200">
        
        {/* Settings Header */}
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] shadow-sm">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-semibold text-xs mb-2">
            <Settings className="w-3.5 h-3.5" />
            AtSecure Platform Settings
          </div>
          <h1 className="text-xl font-extrabold text-[var(--text-heading)] tracking-tight">
            Design Tokens, Theme & Integrations
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Configure visual design tokens, AI model API keys, ML resume parser integrations, and database schemas.
          </p>
        </div>

        {/* 1. APPEARANCE & THEME CONFIGURATION CARD */}
        <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-default)] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-[var(--text-heading)]">
                  Appearance & Design Tokens
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Standardized semantic design tokens ensuring UI stability across all components
                </p>
              </div>
            </div>

            {themeNotice && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Theme applied successfully!
              </span>
            )}
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    isSelected
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-subtle)] ring-1 ring-[var(--brand-primary)] shadow-xs'
                      : 'border-[var(--border-default)] bg-[var(--bg-surface-alt)] hover:border-[var(--brand-primary)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center border border-[var(--border-default)]"
                        style={{ backgroundColor: theme.previewBg }}
                      >
                        {getThemeIcon(theme.id)}
                      </div>
                      <span className="font-bold text-xs text-[var(--text-heading)]">{theme.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/30"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      {isSelected && <Check className="w-3.5 h-3.5 text-[var(--brand-primary)]" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-1">
                    {theme.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Design Token Architecture Callout */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-alt)] border border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
              <span className="text-[var(--text-body)]">
                <strong>AtSecure Token System:</strong> Separate semantic CSS variables for Brand (`#2563EB`), Surface (`#FFFFFF`), Sidebar (`#0F172A`), and Status (`#15803D`, `#B45309`, `#B91C1C`).
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
              Zero class conflicts • Strict scoping
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: AI Keys & DB Provider (Cols 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* ML Resume Parser Card */}
            <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-[var(--text-heading)] flex items-center gap-2 border-b border-[var(--border-default)] pb-3">
                <Cpu className="w-4 h-4 text-emerald-500" />
                ML Resume Parser Integration
              </h2>

              <form onSubmit={handleSaveKeys} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-body)] block mb-1">Select Parser Service</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setParserProvider('affinda')}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        parserProvider === 'affinda'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'border-[var(--border-default)] bg-[var(--bg-surface-alt)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      Affinda (50/mo)
                    </button>

                    <button
                      type="button"
                      onClick={() => setParserProvider('apilayer')}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        parserProvider === 'apilayer'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'border-[var(--border-default)] bg-[var(--bg-surface-alt)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      APILayer (100/mo)
                    </button>

                    <button
                      type="button"
                      onClick={() => setParserProvider('edenai')}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        parserProvider === 'edenai'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'border-[var(--border-default)] bg-[var(--bg-surface-alt)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      Eden AI (Unified)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-body)] block mb-1">
                    {parserProvider.toUpperCase()} API KEY
                  </label>
                  <input
                    type="password"
                    value={parserApiKey}
                    onChange={(e) => setParserApiKey(e.target.value)}
                    placeholder="Paste your API Key here..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-alt)] text-xs font-mono text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    * If empty, AtSecure uses built-in UTF-8 and PDF.js extraction automatically.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      Settings Saved
                    </>
                  ) : (
                    <span>Save Integration Keys</span>
                  )}
                </button>
              </form>
            </div>

            {/* AI LLM Key Card */}
            <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-[var(--text-heading)] flex items-center gap-2 border-b border-[var(--border-default)] pb-3">
                <Key className="w-4 h-4 text-[var(--brand-primary)]" />
                LLM Model (Gemini / OpenAI) Settings
              </h2>

              <form onSubmit={handleSaveAiKeys} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-body)] block mb-1">Select AI Engine</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAiProvider('gemini')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        aiProvider === 'gemini'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                          : 'border-[var(--border-default)] bg-[var(--bg-surface-alt)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Google Gemini
                    </button>

                    <button
                      type="button"
                      onClick={() => setAiProvider('openai')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        aiProvider === 'openai'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                          : 'border-[var(--border-default)] bg-[var(--bg-surface-alt)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-[var(--text-muted)]" />
                      OpenAI GPT-4
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-body)] block mb-1">
                    {aiProvider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY'}
                  </label>
                  <input
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder={aiProvider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-alt)] text-xs font-mono text-[var(--text-heading)] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    * Used for AI resume bullet rewriting and customized cover letter synthesis.
                  </p>

                  {/* AI Connection Test Result */}
                  {aiTestResult && (
                    <div
                      className={`mt-2 p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        aiTestResult.valid
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {aiTestResult.valid ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                          <span>
                            ✓ Gemini API Verified! Model: <strong>{aiTestResult.model || 'gemini-1.5-flash'}</strong> ({aiTestResult.latencyMs}ms)
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                          <span className="line-clamp-2">
                            ⚠️ {aiTestResult.error || 'Connection failed. Please check your key.'}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleTestAiConnection}
                    disabled={isTestingAi || !aiApiKey.trim()}
                    className="py-2.5 px-3 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-surface-alt)] text-[var(--text-heading)] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    title="Test connection to Gemini API"
                  >
                    {isTestingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Test API</span>
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {aiSavedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        AI Keys Saved
                      </>
                    ) : (
                      <span>Save AI Configuration</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right Column: Schema Code Viewer (Cols 7) */}
          <div className="lg:col-span-7 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-[var(--brand-primary)]" />
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-heading)]">Core Database Schemas</h3>
                  <p className="text-xs text-[var(--text-muted)]">SQL & Prisma definitions generated for AtSecure platform</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex p-0.5 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-default)] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveSchemaTab('sql')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeSchemaTab === 'sql' ? 'bg-[var(--bg-card)] text-[var(--brand-primary)] shadow-xs' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    SQL (Supabase)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSchemaTab('prisma')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeSchemaTab === 'prisma' ? 'bg-[var(--bg-card)] text-[var(--brand-primary)] shadow-xs' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Prisma Schema
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-surface-alt)] text-[var(--text-muted)] hover:text-[var(--text-heading)] cursor-pointer transition-colors"
                  title="Copy Schema"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-[var(--bg-surface-alt)] text-[var(--text-heading)] font-mono text-xs overflow-x-auto leading-relaxed border border-[var(--border-default)] max-h-[500px]">
              {activeSchemaTab === 'sql' ? SQL_SCHEMA_SNIPPET : PRISMA_SCHEMA_SNIPPET}
            </pre>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
