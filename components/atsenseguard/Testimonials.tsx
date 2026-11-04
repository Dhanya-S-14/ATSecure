'use client';

import { Star, CheckCircle } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "I finally understood why my resume wasn't passing ATS filters for Senior Frontend roles. Adding missing GraphQL and PostgreSQL keywords increased my interview callbacks by 3x.",
      author: 'David Chen',
      role: 'Senior Full Stack Applicant',
      company: 'Hired at Cloud Platform',
      stars: 5
    },
    {
      quote: "The job description matcher is phenomenal. Being able to compare my resume directly against target postings saved me countless hours of manual editing.",
      author: 'Sarah Jenkins',
      role: 'Junior Software Engineer',
      company: 'Hired at Fintech Scaleup',
      stars: 5
    },
    {
      quote: "The formatting health check detected multi-column layout glitches that were breaking ATS text parsers. Fixing the layout made an immediate difference.",
      author: 'Marcus Rivera',
      role: 'DevOps & Cloud Engineer Candidate',
      company: 'Hired at Enterprise SaaS',
      stars: 5
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-zinc-950 text-zinc-100 relative border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider">
            Verified Candidate Outcomes
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Trusted by Job Seekers & Tech Candidates.
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 font-medium">
            Real candidate feedback from applicants using ATSenseGuard for tech applications.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-white">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-white text-white" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-black bg-white px-2 py-0.5 rounded">
                    <CheckCircle className="w-3 h-3 text-black" /> Verified User
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-medium italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-white">{t.author}</p>
                  <p className="text-[11px] text-zinc-400">{t.role}</p>
                </div>
                <span className="text-[10px] font-semibold text-zinc-400 font-mono bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                  {t.company}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
