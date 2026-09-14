import React from 'react';
import { Send, MessageCircle, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Post in 60 Seconds',
      desc: 'Pick your category, upload photos, set your price, and post your request or offer with your university badge.',
      icon: <Send className="w-5 h-5 text-brand-400" />,
      tag: 'POST',
    },
    {
      num: '02',
      title: 'Chat with Verified Peers',
      desc: 'Direct in-app messaging with real-time notifications. Coordinate meeting spot on campus or discuss requirements.',
      icon: <MessageCircle className="w-5 h-5 text-emerald-400" />,
      tag: 'CONNECT',
    },
    {
      num: '03',
      title: 'Pay & Settle Safely',
      desc: 'Send money via personal bKash or Nagad Send Money, submit the Transaction ID, get instant confirmation, and close the deal.',
      icon: <CheckCircle className="w-5 h-5 text-cyan-400" />,
      tag: 'SETTLE',
    },
  ];

  return (
    <section className="py-16 md:py-20 border-b border-slate-200/80 dark:border-dark-border/60 bg-slate-50/50 dark:bg-dark-surface/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 border border-brand-500/20 mb-3">
            HOW IT WORKS
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight">
            Three Steps. From Post to Settled.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            A transparent, scam-free campus workflow built around peer verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm hover:border-brand-500/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-xs font-extrabold text-slate-400 dark:text-slate-500">
                  {s.num} / {s.tag}
                </span>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                  {s.icon}
                </div>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">
                {s.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
