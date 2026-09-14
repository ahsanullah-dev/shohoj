import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UniversityBadge from '../common/UniversityBadge';
import { MessageSquare, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../../api/client';

const FALLBACK_CARDS = [
  {
    _id: 'fallback-1',
    segment: 'tuition',
    title: 'Calculus II & Physics 101 Tuition (3 days/week)',
    price: 2500,
    priceNote: 'per month',
    author: {
      name: 'Rahim Ahmed',
      universityTag: 'RUET',
      isRuetVerified: true,
      batch: "EEE '21",
    },
    location: 'RUET Campus',
  },
  {
    _id: 'fallback-2',
    segment: 'tech',
    title: 'Asus/Lenovo Laptop NVMe SSD Upgrade + Thermal Paste',
    price: 450,
    priceNote: 'service fee',
    author: {
      name: 'Samiul Hasan',
      universityTag: 'VU',
      universityVerified: true,
      batch: "CSE '22",
    },
    location: 'Kazla / Motihar',
  },
  {
    _id: 'fallback-3',
    segment: 'marketplace',
    title: 'Casio FX-991CW Scientific Calculator (Original)',
    price: 1400,
    priceNote: 'fixed',
    author: {
      name: 'Tanvir Chowdhury',
      universityTag: 'BUET',
      universityVerified: true,
      batch: "ME '20",
    },
    location: 'Campus Delivery',
  }
];

const ACCENT_MAP = {
  tuition: 'border-l-purple-500',
  tech: 'border-l-teal-500',
  creative: 'border-l-pink-500',
  errands: 'border-l-amber-500',
  marketplace: 'border-l-blue-500',
};

const SEGMENT_NAMES = {
  tuition: 'Tuition',
  tech: 'Tech Repair',
  creative: 'Creative & Design',
  errands: 'Errands & Delivery',
  marketplace: 'Buy & Sell',
};

export default function LivePreviewWidget() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchLivePosts() {
      try {
        const data = await api.get('/api/posts?limit=3');
        if (mounted && data && Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts);
        } else if (mounted) {
          setPosts(FALLBACK_CARDS);
        }
      } catch (_) {
        if (mounted) setPosts(FALLBACK_CARDS);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchLivePosts();
    return () => { mounted = false; };
  }, []);

  const displayList = posts.length > 0 ? posts : FALLBACK_CARDS;

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Background Ambient Glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-brand-500/20 via-cyan-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10"></div>

      <div className="rounded-2xl bg-white/80 dark:bg-dark-surface/90 border border-slate-200/80 dark:border-dark-border shadow-xl p-5 backdrop-blur-md">
        {/* Widget Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-dark-border/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
              Live Campus Activity
            </span>
          </div>
          <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Real-time Feed
          </span>
        </div>

        {/* Stacked Preview Cards */}
        <div className="space-y-3">
          {displayList.map((card) => {
            const segKey = card.segment || 'marketplace';
            const accent = ACCENT_MAP[segKey] || 'border-l-brand-500';
            const segLabel = SEGMENT_NAMES[segKey] || segKey;
            const author = card.author || {};
            const priceText = card.price != null ? `৳ ${Number(card.price).toLocaleString('en-IN')}` : 'Free / Discuss';

            return (
              <Link
                key={card._id}
                to={`/post/${card._id}`}
                className={`block p-3.5 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200/70 dark:border-dark-border border-l-4 ${accent} hover:border-brand-500/50 hover:shadow-md transition-all duration-200 group`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {segLabel}
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {priceText}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors line-clamp-1 mb-2">
                  {card.title}
                </h4>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-dark-border/40">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {author.name || 'Student'}
                    </span>
                    <UniversityBadge user={author} variant="compact" />
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {card.landmark || card.location || (author.department ? `${author.department} Dept` : 'Campus')}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border/60">
          <Link
            to="/feed"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 border border-brand-500/20 transition-all duration-200"
          >
            <span>Explore All Campus Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
