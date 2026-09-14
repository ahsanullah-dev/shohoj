import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export default function TaskerEarnings() {
  return (
    <section className="py-16 md:py-20 border-b border-slate-200/80 dark:border-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-900/40 via-dark-card to-dark-surface border border-brand-500/20 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" /> FOR STUDENT EARNERS
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
                Turn Spare Hours Into ৳5,000+/Month
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Offer tuition, fix laptops, design project posters, or run errands around campus halls. Set your own rates, work on your schedule, and keep 100% of your earnings.
              </p>
              <div className="pt-2">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 transition-all duration-200"
                >
                  Join as a Student Tasker
                </Link>
              </div>
            </div>

            {/* Sample Earnings Card */}
            <div className="lg:col-span-5">
              <div className="p-5 rounded-2xl bg-dark-base/80 border border-slate-700/60 shadow-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                  <span>SAMPLE WEEKLY LOG</span>
                  <span className="text-purple-400 font-bold">RUET EEE '21</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Circuit Analysis Tuition (2 sessions)</span>
                  <span className="text-emerald-400 font-bold">৳ 1,600</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Laptop SSD Upgrade (Hall delivery)</span>
                  <span className="text-emerald-400 font-bold">৳ 500</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Arduino Project Debugging</span>
                  <span className="text-emerald-400 font-bold">৳ 800</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Earned This Week</span>
                  <span className="text-emerald-400 text-base">৳ 2,900</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
