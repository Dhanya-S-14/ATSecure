'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Kanban,
  Plus,
  Building2,
  MapPin,
  DollarSign,
  FileCheck2,
  Calendar,
  MoreVertical,
  ArrowRight,
  Sparkles,
  Search,
  ChevronDown,
  TrendingUp
} from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';
import { SAMPLE_JOB_APPLICATIONS } from '@/lib/utils';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { Trash2 } from 'lucide-react';

const COLUMNS: { id: ApplicationStatus; label: string; color: string; countColor: string }[] = [
  { id: 'Draft', label: 'Drafting & Tailoring', color: 'bg-zinc-900 border-zinc-800', countColor: 'bg-zinc-800 text-zinc-300' },
  { id: 'Applied', label: 'Applied', color: 'bg-indigo-950/40 border-indigo-900/50', countColor: 'bg-indigo-900/50 text-indigo-300' },
  { id: 'Interviewing', label: 'Interviewing', color: 'bg-amber-950/40 border-amber-900/50', countColor: 'bg-amber-900/50 text-amber-300' },
  { id: 'Offer', label: 'Offer Received', color: 'bg-emerald-950/40 border-emerald-900/50', countColor: 'bg-emerald-900/50 text-emerald-300' },
  { id: 'Rejected', label: 'Archived / Rejected', color: 'bg-zinc-950/60 border-zinc-900', countColor: 'bg-rose-950/60 text-rose-300' }
];

export default function TrackerPage() {
  const [applications, setApplications] = useState<JobApplication[]>(SAMPLE_JOB_APPLICATIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newSalary, setNewSalary] = useState('$150,000 - $180,000');
  const [newJd, setNewJd] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Draft');

  // Load from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('atsecure_job_applications');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setApplications(parsed);
            return;
          }
        }
      } catch {}
      localStorage.setItem('atsecure_job_applications', JSON.stringify(SAMPLE_JOB_APPLICATIONS));
    }
  }, []);

  const saveApplications = (apps: JobApplication[]) => {
    setApplications(apps);
    if (typeof window !== 'undefined') {
      localStorage.setItem('atsecure_job_applications', JSON.stringify(apps));
    }
  };

  const filteredApps = applications.filter(
    (app) =>
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalApps = applications.length;
  const interviewingApps = applications.filter((a) => a.status === 'Interviewing' || a.status === 'Offer').length;
  const interviewRate = totalApps > 0 ? Math.round((interviewingApps / totalApps) * 100) : 0;
  const avgScore = totalApps > 0 ? Math.round(applications.reduce((acc, curr) => acc + (curr.ats_score || 0), 0) / totalApps) : 0;

  const handleStatusChange = (appId: string, nextStatus: ApplicationStatus) => {
    const updated = applications.map((app) => (app.id === appId ? { ...app, status: nextStatus } : app));
    saveApplications(updated);
  };

  const handleDeleteApplication = (appId: string) => {
    const updated = applications.filter((app) => app.id !== appId);
    saveApplications(updated);
  };

  const handleSelectJobForTailoring = (app: JobApplication) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'atsecure_target_job',
        JSON.stringify({
          title: app.role,
          company: app.company,
          description: app.job_description || `${app.role} at ${app.company}.`,
          extractedKeywords: app.match_keywords || []
        })
      );
    }
  };

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole) return;

    const newApp: JobApplication = {
      id: `app_${Date.now()}`,
      user_id: 'usr_1',
      company: newCompany,
      role: newRole,
      location: newLocation,
      salary: newSalary,
      job_description: newJd || `${newRole} position at ${newCompany}.`,
      status: newStatus,
      applied_date: new Date().toISOString().split('T')[0],
      ats_score: Math.floor(Math.random() * 20) + 78,
      match_keywords: ['React', 'TypeScript', 'Tailwind CSS'],
      missing_keywords: ['System Design']
    };

    const updated = [newApp, ...applications];
    saveApplications(updated);
    setNewCompany('');
    setNewRole('');
    setNewJd('');
    setIsAddModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Tracker Header Bar */}
        <div className="bg-zinc-900/90 p-6 rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold text-xs mb-2">
              <Kanban className="w-3.5 h-3.5" />
              Unified Candidate Pipeline Tracker
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Application Kanban Studio
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Manage candidate job applications across pipeline stages from initial tailoring to job offer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>

        {/* Pipeline Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400">Total Tracked Applications</span>
              <p className="text-2xl font-black text-white mt-1">{totalApps}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400">Interview Conversion Rate</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{interviewRate}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400">Average ATS Match Score</span>
              <p className="text-2xl font-black text-violet-400 mt-1">{avgScore}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search application by company or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colApps = filteredApps.filter((a) => a.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 min-h-[550px] flex flex-col backdrop-blur-xl"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-white">{col.label}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countColor}`}>
                      {colApps.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 shadow-md transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors leading-tight">
                            {app.company}
                          </h4>
                          <p className="text-xs font-medium text-zinc-400 mt-0.5">{app.role}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Status Selector Dropdown */}
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                            className="text-[10px] font-bold px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 focus:outline-none cursor-pointer"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Applied">Applied</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteApplication(app.id)}
                            title="Delete Application"
                            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{app.location}</span>
                        </div>
                        {app.salary && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{app.salary}</span>
                          </div>
                        )}
                      </div>

                      {/* ATS Score & Match Tag */}
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                          <FileCheck2 className="w-3 h-3 text-indigo-400" />
                          <span>{app.ats_score}% Match</span>
                        </div>

                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {app.applied_date}
                        </span>
                      </div>

                      {/* Quick Action Links */}
                      <div className="pt-1 flex items-center justify-end gap-2 text-[10px] font-semibold">
                        <Link
                          href={`/ats-scorer?jd=${encodeURIComponent(app.job_description)}`}
                          onClick={() => handleSelectJobForTailoring(app)}
                          className="text-zinc-400 hover:text-indigo-400 transition-colors"
                        >
                          Scan ATS
                        </Link>
                        <span className="text-zinc-700">•</span>
                        <Link
                          href="/tailor"
                          onClick={() => handleSelectJobForTailoring(app)}
                          className="text-zinc-400 hover:text-indigo-400 transition-colors"
                        >
                          Tailor Studio
                        </Link>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-xs text-zinc-500 font-medium">
                      No applications in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Dialog for Adding Job Application */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" />
                  Add New Job Application
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-zinc-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddApplication} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OpenAI, Stripe, Google"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-medium text-white focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Job Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-medium text-white focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">Location</label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-medium text-white focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">Pipeline Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-medium text-white focus:ring-2 focus:ring-indigo-500/40"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer">Offer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Job Description Requirements</label>
                  <textarea
                    rows={4}
                    placeholder="Paste requirements for ATS score tracking..."
                    value={newJd}
                    onChange={(e) => setNewJd(e.target.value)}
                    className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-200 focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-300 font-semibold text-xs hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
                  >
                    Save Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
