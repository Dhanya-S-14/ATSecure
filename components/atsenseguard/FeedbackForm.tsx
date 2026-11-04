'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { submitFeedbackApi, FeedbackData } from '@/lib/atsenseguard-service';

export default function FeedbackForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<FeedbackData['type']>('Suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg('');

    const res = await submitFeedbackApi({ name, email, type, message });
    setIsSubmitting(false);
    setSuccessMsg(res.message);
    setMessage('');
  };

  return (
    <section className="py-24 bg-zinc-950 text-zinc-100 relative border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider">
            Continuous Platform Engineering
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Direct Product Feedback Channel.
          </h2>

          <p className="text-sm text-zinc-400 font-medium">
            Found an issue, need a parser enhancement, or want a custom integration? We read every submission.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6 sm:p-8 shadow-xl">
          {successMsg ? (
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-white mx-auto" />
              <h3 className="font-extrabold text-white text-base">Feedback Submitted</h3>
              <p className="text-xs text-zinc-300">{successMsg}</p>
              <button
                type="button"
                onClick={() => setSuccessMsg('')}
                className="text-xs font-bold text-white underline pt-2 cursor-pointer"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Your Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Feedback Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as FeedbackData['type'])}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-white"
                >
                  <option value="Suggestion">Suggestion</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Your Message</label>
                <textarea
                  rows={4}
                  placeholder="Describe your suggestion or report a problem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs shadow-lg shadow-white/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Send className="w-4 h-4 text-black" />
                <span>{isSubmitting ? 'Submitting Message...' : 'Submit Feedback'}</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
