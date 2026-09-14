import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LivePreviewWidget from './LivePreviewWidget';
import { api } from '../../api/client';
import { 
  ShieldCheck, 
  ArrowRight, 
  Plus, 
  Users, 
  CheckCircle2, 
  Layers, 
  Sparkles 
} from 'lucide-react';

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    users: 48,
    verified: 32,
    posts: 26,
    segments: 5
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/api/stats');
        if (res) {
          setStats({
            users: res.totalUsers || 48,
            verified: res.verifiedUsers || 32,
            posts: res.totalPosts || 26,
            segments: 5,
          });
        }
      } catch (err) {
        // use default stats
      }
    }
    loadStats();
  }, []);

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-slate-200/80 dark:border-dark-border/60">
      {/* Background Ambient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copywriting & Call to Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider text-brand-600 dark:text-brand-300 bg-brand-500/10 border border-brand-500/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              STUDENT MARKETPLACE · BANGLADESH UNIVERSITIES
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-5xl tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              The Verified Student Marketplace for{' '}
              <span className="bg-gradient-to-r from-brand-500 via-cyan-500 to-emerald-400 bg-clip-text text-transparent">
                Campus Gigs &amp; Items
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Buy &amp; sell textbooks, find tuition gigs, get tech devices repaired, and trade campus services with verified peers from <strong>RUET</strong>, <strong>Varendra</strong>, <strong>BUET</strong>, <strong>DU</strong>, and top universities across Bangladesh.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to="/feed"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 shadow-md shadow-brand-500/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore Campus Feed
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={isAuthenticated ? '/create-post' : '/signup'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-dark-card border border-slate-300 dark:border-dark-border hover:border-brand-500 transition-all duration-200"
              >
                <Plus className="w-4 h-4 text-emerald-500" />
                Post a Gig / Item
              </Link>
            </div>

            {/* Quick Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80 dark:border-dark-border/60">
              <div className="text-center lg:text-left">
                <div className="font-display font-extrabold text-2xl text-brand-500">{stats.users}+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Students Joined</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="font-display font-extrabold text-2xl text-emerald-500">{stats.verified}+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified Accounts</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="font-display font-extrabold text-2xl text-cyan-500">{stats.posts}+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Listings</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="font-display font-extrabold text-2xl text-purple-500">5</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Core Segments</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Marketplace Preview Widget */}
          <div className="lg:col-span-5 flex justify-center">
            <LivePreviewWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
