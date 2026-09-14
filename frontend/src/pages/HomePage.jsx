import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import SegmentCards from '../components/home/SegmentCards';
import HowItWorks from '../components/home/HowItWorks';
import TaskerEarnings from '../components/home/TaskerEarnings';
import PostCard from '../components/feed/PostCard';
import SegmentPills from '../components/feed/SegmentPills';
import { api } from '../api/client';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState('all');

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        const query = activeSegment === 'all' ? '' : `?segment=${activeSegment}`;
        const res = await api.get(`/api/posts${query}`);
        setPosts(res.posts || []);
      } catch (err) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [activeSegment]);

  return (
    <div className="space-y-4">
      {/* 1. Hero Section (No 3D book, includes Live Preview Widget) */}
      <HeroSection />

      {/* 2. Unified Live Feed Section on Home */}
      <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> RECENT CAMPUS LISTINGS
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
              Latest Offers &amp; Requests
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Browse recent student posts or filter by segment.
            </p>
          </div>

          <Link
            to="/create-post"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </Link>
        </div>

        {/* Segment Filter Pills */}
        <div className="mb-8">
          <SegmentPills activeSegment={activeSegment} onSelect={setActiveSegment} />
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border animate-pulse p-6"
              ></div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, 6).map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl bg-slate-100/60 dark:bg-dark-card border border-slate-200 dark:border-dark-border">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              No posts found in this category yet. Be the first to post!
            </p>
            <Link
              to="/create-post"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-400"
            >
              + Create First Post <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {posts.length > 6 && (
          <div className="text-center mt-10">
            <Link
              to={`/feed?segment=${activeSegment}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-dark-card border border-slate-300 dark:border-dark-border hover:border-brand-500 transition-colors"
            >
              View All Campus Listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* 3. 5 Core Segments Showcase */}
      <SegmentCards />

      {/* 4. How It Works */}
      <HowItWorks />

      {/* 5. Student Tasker Earnings */}
      <TaskerEarnings />
    </div>
  );
}
