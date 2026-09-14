import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Wrench, Palette, Package, ShoppingBag, ArrowRight } from 'lucide-react';

export const SEGMENTS = [
  {
    key: 'tuition',
    name: 'Tuition Offers',
    icon: <BookOpen className="w-5 h-5 text-purple-400" />,
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 hover:border-purple-400',
    iconBg: 'bg-purple-500/15',
    desc: 'HSC, University courses, Math, Physics, Circuit & Coding tuition from verified seniors.',
    priceGuide: 'from ৳2,000/mo',
  },
  {
    key: 'tech',
    name: 'Tech & Repair',
    icon: <Wrench className="w-5 h-5 text-teal-400" />,
    color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30 hover:border-teal-400',
    iconBg: 'bg-teal-500/15',
    desc: 'Laptop SSD upgrades, phone screen fixing, bike tuning, electronic lab kits & OS setup.',
    priceGuide: 'from ৳300',
  },
  {
    key: 'creative',
    name: 'Creative & Design',
    icon: <Palette className="w-5 h-5 text-pink-400" />,
    color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 hover:border-pink-400',
    iconBg: 'bg-pink-500/15',
    desc: 'Poster design, club photography, video editing, slides & thesis presentation help.',
    priceGuide: 'from ৳500',
  },
  {
    key: 'errands',
    name: 'Campus Errands',
    icon: <Package className="w-5 h-5 text-amber-400" />,
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-400',
    iconBg: 'bg-amber-500/15',
    desc: 'Bulk document printing, parcel delivery, ride-splitting & urgent campus micro-jobs.',
    priceGuide: 'from ৳100',
  },
  {
    key: 'marketplace',
    name: 'Buy, Sell & Exchange',
    icon: <ShoppingBag className="w-5 h-5 text-blue-400" />,
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 hover:border-blue-400',
    iconBg: 'bg-blue-500/15',
    desc: 'Scientific calculators, drafting boards, cycles, lab aprons, books & electronics.',
    priceGuide: 'from ৳150',
  },
];

export default function SegmentCards() {
  return (
    <section className="py-16 md:py-20 border-b border-slate-200/80 dark:border-dark-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 mb-3">
            5 CORE MARKETPLACE SEGMENTS
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight">
            Everything You Need Across Campus
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Dedicated feeds designed specifically for students to find help, offer skills, or trade items securely.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SEGMENTS.map((seg) => (
            <Link
              key={seg.key}
              to={`/feed?segment=${seg.key}`}
              className={`group p-6 rounded-2xl bg-gradient-to-br ${seg.color} bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${seg.iconBg} border border-white/10`}>
                    {seg.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    {seg.priceGuide}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors mb-2">
                  {seg.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {seg.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                <span>Browse {seg.name}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
