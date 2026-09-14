import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 via-cyan-500 to-brand-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                S
              </div>
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Shohoj
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The verified peer-to-peer student marketplace for university gigs, tuition, repair, and items across Bangladesh.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-brand-500 font-medium font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Student Profiles
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Marketplace
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/feed?segment=tuition" className="hover:text-brand-500 transition-colors">Tuition &amp; Teaching</Link></li>
              <li><Link to="/feed?segment=tech" className="hover:text-brand-500 transition-colors">Tech &amp; Device Repair</Link></li>
              <li><Link to="/feed?segment=creative" className="hover:text-brand-500 transition-colors">Creative &amp; Design Gigs</Link></li>
              <li><Link to="/feed?segment=errands" className="hover:text-brand-500 transition-colors">Campus Errands</Link></li>
              <li><Link to="/feed?segment=marketplace" className="hover:text-brand-500 transition-colors">Buy, Sell &amp; Exchange</Link></li>
            </ul>
          </div>

          {/* Universities */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Top Campuses
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><span className="hover:text-brand-500 transition-colors">RUET (Rajshahi)</span></li>
              <li><span className="hover:text-brand-500 transition-colors">Varendra University</span></li>
              <li><span className="hover:text-brand-500 transition-colors">BUET (Dhaka)</span></li>
              <li><span className="hover:text-brand-500 transition-colors">University of Dhaka</span></li>
              <li><span className="hover:text-brand-500 transition-colors">KUET, CUET, SUST &amp; IUT</span></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Safety &amp; Payments
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Direct peer coordination with manual bKash &amp; Nagad verification and scam-free transaction IDs.
            </p>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded bg-slate-100 dark:bg-dark-card border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300">
                bKash
              </span>
              <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded bg-slate-100 dark:bg-dark-card border border-slate-300 dark:border-dark-border text-slate-700 dark:text-slate-300">
                Nagad
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Shohoj. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for university students across Bangladesh.
          </p>
        </div>
      </div>
    </footer>
  );
}
