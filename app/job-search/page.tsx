'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Search,
  Sparkles,
  MapPin,
  Building2,
  DollarSign,
  FileCheck2,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Globe,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { INITIAL_RESUME } from '@/lib/utils';

interface RecommendedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  countryFormat: 'US ATS' | 'UK/EU CV' | 'Global Tech';
  matchedSkills: string[];
  missingSkills: string[];
  description: string;
  postedTime: string;
  isSaved?: boolean;
}

const SAMPLE_RECOMMENDED_JOBS: RecommendedJob[] = [
  {
    id: 'job_1',
    title: 'Senior Full Stack Engineer (AI & Web)',
    company: 'Vercel',
    location: 'Remote (Global)',
    salary: '$160,000 - $195,000',
    matchScore: 94,
    countryFormat: 'US ATS',
    matchedSkills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
    missingSkills: ['Supabase', 'Server Actions'],
    description: 'Build Next.js AI SDK infrastructure and developer experience tools. Scale real-time web applications to millions of developers.',
    postedTime: '2 hours ago'
  },
  {
    id: 'job_2',
    title: 'Senior Frontend Engineer - Payments',
    company: 'Stripe',
    location: 'San Francisco, CA / Remote',
    salary: '$170,000 - $210,000',
    matchScore: 89,
    countryFormat: 'US ATS',
    matchedSkills: ['React', 'TypeScript', 'System Architecture', 'CI/CD'],
    missingSkills: ['Docker', 'Micro-frontends'],
    description: 'Design robust payment web interfaces and high reliability transaction UI dashboards.',
    postedTime: '1 day ago'
  },
  {
    id: 'job_3',
    title: 'Staff AI Solutions Architect',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    salary: '$220,000 - $280,000',
    matchScore: 82,
    countryFormat: 'US ATS',
    matchedSkills: ['Python', 'Node.js', 'API Integration', 'Cloud Architecture'],
    missingSkills: ['Vector Databases', 'LangChain'],
    description: 'Collaborate with enterprise teams to deploy state-of-the-art LLM models and custom AI agents.',
    postedTime: '3 days ago'
  },
  {
    id: 'job_4',
    title: 'Lead Frontend Developer (React/Next)',
    company: 'Linear',
    location: 'London, UK / Remote EU',
    salary: '£110,000 - £135,000',
    matchScore: 91,
    countryFormat: 'UK/EU CV',
    matchedSkills: ['React', 'TypeScript', 'UI/UX Performance', 'GraphQL'],
    missingSkills: ['WebSockets'],
    description: 'Craft high performance issue tracking software interfaces with lightning fast keyboard shortcuts.',
    postedTime: 'Just now'
  }
];

export default function JobSearchPage() {
  const [jobs, setJobs] = useState<RecommendedJob[]>(SAMPLE_RECOMMENDED_JOBS);
  const [query, setQuery] = useState('');
  const [selectedCountryFormat, setSelectedCountryFormat] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved bookmarks from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedIds = JSON.parse(localStorage.getItem('atsecure_saved_jobs') || '[]');
        if (Array.isArray(savedIds) && savedIds.length > 0) {
          setJobs((prev) =>
            prev.map((j) => ({ ...j, isSaved: savedIds.includes(j.id) }))
          );
        }
      } catch {}
    }
  }, []);

  const toggleSaveJob = (id: string) => {
    setJobs((prev) => {
      const updated = prev.map((j) => (j.id === id ? { ...j, isSaved: !j.isSaved } : j));
      if (typeof window !== 'undefined') {
        const savedIds = updated.filter((j) => j.isSaved).map((j) => j.id);
        localStorage.setItem('atsecure_saved_jobs', JSON.stringify(savedIds));
      }
      return updated;
    });
  };

  const handleSelectJobForTailoring = (job: RecommendedJob) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'atsecure_target_job',
        JSON.stringify({
          title: job.title,
          company: job.company,
          description: `${job.title} at ${job.company}\n\nRequirements:\n${job.description}`,
          extractedKeywords: [...job.matchedSkills, ...job.missingSkills]
        })
      );
    }
  };

  const handleTrackInPipeline = (job: RecommendedJob) => {
    if (typeof window !== 'undefined') {
      try {
        const existingStr = localStorage.getItem('atsecure_job_applications');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const alreadyTracked = existing.some((a: any) => a.company === job.company && a.role === job.title);

        if (alreadyTracked) {
          setToastMessage(`ℹ️ "${job.title} at ${job.company}" is already in your pipeline!`);
          setTimeout(() => setToastMessage(null), 3000);
          return;
        }

        const newApp = {
          id: `app_${Date.now()}`,
          user_id: 'usr_1',
          company: job.company,
          role: job.title,
          location: job.location,
          salary: job.salary,
          job_description: `${job.title} at ${job.company}.\n${job.description}`,
          status: 'Draft',
          applied_date: new Date().toISOString().split('T')[0],
          ats_score: job.matchScore,
          match_keywords: job.matchedSkills,
          missing_keywords: job.missingSkills
        };

        const updated = [newApp, ...existing];
        localStorage.setItem('atsecure_job_applications', JSON.stringify(updated));
        setToastMessage(`✓ Added "${job.title} at ${job.company}" to your Application Kanban Pipeline!`);
        setTimeout(() => setToastMessage(null), 3500);
      } catch (err) {
        console.error('Error tracking job:', err);
      }
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesQuery =
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.company.toLowerCase().includes(query.toLowerCase()) ||
      j.matchedSkills.some((s) => s.toLowerCase().includes(query.toLowerCase()));

    const matchesFormat =
      selectedCountryFormat === 'All' || j.countryFormat === selectedCountryFormat;

    return matchesQuery && matchesFormat;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header Banner */}
        <div className="bg-zinc-900/90 p-6 rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold text-xs mb-2">
              <Zap className="w-3.5 h-3.5" />
              JobSuit & JobStep AI Recommendation Engine
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              AI Job Matcher & Resume Agent
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Scans open listings and calculates your real-time compatibility score based on your base resume.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
            <span className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Base Resume Match Rate: <strong>89% Avg</strong></span>
            </span>
          </div>
        </div>

        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <Link
              href="/tracker"
              className="text-xs font-bold text-emerald-400 hover:text-white underline ml-3 shrink-0"
            >
              View Pipeline →
            </Link>
          </div>
        )}

        {/* Filter & Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by role title, company, or skill (e.g. Next.js, Stripe, Python)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
            <select
              value={selectedCountryFormat}
              onChange={(e) => setSelectedCountryFormat(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              <option value="All">All ATS Standards (Global)</option>
              <option value="US ATS">US ATS Format</option>
              <option value="UK/EU CV">UK / EU CV Format</option>
              <option value="Global Tech">Global Remote Tech</option>
            </select>
          </div>
        </div>

        {/* Recommended Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-zinc-900/90 rounded-2xl border border-zinc-800 hover:border-zinc-700 p-6 shadow-xl backdrop-blur-xl transition-all space-y-4 group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-white text-base group-hover:scale-105 transition-transform shrink-0">
                    {job.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-white group-hover:text-indigo-300 transition-colors">
                        {job.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {job.countryFormat}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span className="font-semibold text-zinc-200">{job.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-500" />{job.location}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-zinc-500" />{job.salary}</span>
                    </div>
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
                    <span className="text-[11px] font-semibold text-zinc-400">Match Score</span>
                    <span
                      className={`text-lg font-black ${
                        job.matchScore >= 90
                          ? 'text-emerald-400'
                          : job.matchScore >= 80
                          ? 'text-amber-300'
                          : 'text-rose-400'
                      }`}
                    >
                      {job.matchScore}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSaveJob(job.id)}
                    title={job.isSaved ? 'Saved to bookmarks' : 'Save job bookmark'}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      job.isSaved
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {job.isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTrackInPipeline(job)}
                    title="Track in Kanban Pipeline"
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Track</span>
                  </button>

                  <Link
                    href={`/ats-scorer?jd=${encodeURIComponent(`${job.title} at ${job.company}\n\nRequirements: ${job.description}`)}`}
                    onClick={() => handleSelectJobForTailoring(job)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Tailor & Analyze
                  </Link>
                </div>
              </div>

              {/* Description & Skill Breakdown */}
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {job.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    ✓ Matched Skills in your Resume
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    ⚠ Recommended Keywords to Inject
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.missingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
