'use client';

import {
  FileCheck2,
  Key,
  Layers,
  Sparkles,
  Activity,
  History,
  Target,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export default function FeatureGrid() {
  const features = [
    {
      title: 'ATS Resume Score',
      desc: 'Calculate precise applicant tracking compatibility metrics before submitting applications.',
      icon: FileCheck2
    },
    {
      title: 'Keyword Intelligence',
      desc: 'Identify essential technical stack terms, hard skills, and soft skills missing from your text.',
      icon: Key
    },
    {
      title: 'Job Description Matcher',
      desc: 'Align your resume bullet points with explicit requirements from target job posts.',
      icon: Layers
    },
    {
      title: 'AI Bullet Points Rewriter',
      desc: 'Transform passive statements into high-impact, metric-driven achievement bullets.',
      icon: Sparkles
    },
    {
      title: 'Formatting Health Audit',
      desc: 'Detect multi-column boundaries, unreadable tables, and font hierarchy glitches.',
      icon: Activity
    },
    {
      title: 'Analysis History Log',
      desc: 'Review past resume versions, match score improvements, and stored diagnostic reports.',
      icon: History
    },
    {
      title: 'Role-Specific Targeting',
      desc: 'Manage role variants for Frontend, Cloud Infrastructure, and AI Engineering roles.',
      icon: Target
    },
    {
      title: 'SOC-2 Memory Privacy',
      desc: 'Ensure resume parsing happens strictly in volatile memory with zero data sharing.',
      icon: ShieldCheck
    },
    {
      title: 'Industry Skill Insights',
      desc: 'Discover high-demand tech stack trends to strengthen your overall candidate profile.',
      icon: TrendingUp
    }
  ];

  return (
    <section id="features" className="py-24 bg-zinc-950 text-zinc-100 relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider">
            Platform Capabilities
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Everything You Need to Pass Screening.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 font-medium">
            Nine specialized modules built to give your candidate profile a competitive edge.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black transition-all space-y-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-black" />
                </div>

                <h3 className="text-base font-extrabold text-white group-hover:text-zinc-200 transition-colors">
                  {feat.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
