import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PostCard from '../components/feed/PostCard';
import SegmentPills from '../components/feed/SegmentPills';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { UNIVERSITIES } from '../constants/universities';
import { Search, Filter, Plus, ShieldCheck, RefreshCw, SlidersHorizontal, Building } from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params or user profile defaults
  const [segment, setSegment] = useState(searchParams.get('segment') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [university, setUniversity] = useState(searchParams.get('university') || (user?.universityTag || 'all'));
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [ruetOnly, setRuetOnly] = useState(searchParams.get('ruetOnly') === '1');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPriceFilter, setShowPriceFilter] = useState(Boolean(searchParams.get('minPrice') || searchParams.get('maxPrice')));

  // Keep state in sync with URL searchParams
  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (segment && segment !== 'all') nextParams.set('segment', segment);
    if (searchQuery.trim()) nextParams.set('q', searchQuery.trim());
    if (university && university !== 'all') nextParams.set('university', university);
    if (minPrice !== '') nextParams.set('minPrice', minPrice);
    if (maxPrice !== '') nextParams.set('maxPrice', maxPrice);
    if (ruetOnly) nextParams.set('ruetOnly', '1');

    setSearchParams(nextParams, { replace: true });
  }, [segment, searchQuery, university, minPrice, maxPrice, ruetOnly, setSearchParams]);

  // Fetch posts from backend with all active filters
  useEffect(() => {
    let mounted = true;
    async function fetchPosts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (segment !== 'all') queryParams.set('segment', segment);
        if (searchQuery.trim()) queryParams.set('q', searchQuery.trim());
        if (university && university !== 'all') queryParams.set('university', university);
        if (minPrice !== '') queryParams.set('minPrice', minPrice);
        if (maxPrice !== '') queryParams.set('maxPrice', maxPrice);
        if (ruetOnly) queryParams.set('ruetOnly', '1');

        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const res = await api.get(`/api/posts${query}`);
        if (mounted) {
          setPosts(res.posts || []);
        }
      } catch (err) {
        if (mounted) setPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const timer = setTimeout(fetchPosts, 200); // 200ms debounce
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [segment, searchQuery, university, minPrice, maxPrice, ruetOnly]);

  function handleResetFilters() {
    setSegment('all');
    setSearchQuery('');
    setUniversity('all');
    setMinPrice('');
    setMaxPrice('');
    setRuetOnly(false);
    setShowPriceFilter(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Campus Marketplace Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover peer services, tuition, tech repair, and student listings.
          </p>
        </div>
        <Link
          to="/create-post"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          + Create Post
        </Link>
      </div>

      {/* Segment Pills */}
      <div className="mb-6">
        <SegmentPills activeSegment={segment} onSelect={setSegment} />
      </div>

      {/* Primary Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm mb-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, description, course code, device..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* University Selector Dropdown */}
          <div className="relative w-full md:w-56">
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition-colors cursor-pointer"
            >
              <option value="all">All Universities</option>
              {UNIVERSITIES.map((u) => (
                <option key={u.tag} value={u.tag}>
                  {u.tag} — {u.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Price Filter Button */}
          <button
            type="button"
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
              showPriceFilter || minPrice || maxPrice
                ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-800 text-brand-600 dark:text-brand-300'
                : 'bg-slate-50 dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Price Filter {(minPrice || maxPrice) ? '• Active' : ''}</span>
          </button>

          {/* RUET Verified Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none whitespace-nowrap px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-surface border border-transparent hover:border-slate-200 dark:hover:border-dark-border transition-colors">
            <input
              type="checkbox"
              checked={ruetOnly}
              onChange={(e) => setRuetOnly(e.target.checked)}
              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>RUET Verified Only</span>
          </label>
        </div>

        {/* Collapsible Price Filter Row */}
        {showPriceFilter && (
          <div className="pt-3 border-t border-slate-100 dark:border-dark-border/60 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">
              Budget Range (৳ BDT):
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ৳"
                className="w-24 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              />
              <span className="text-slate-400 text-xs">—</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ৳"
                className="w-24 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            {(minPrice || maxPrice) && (
              <button
                onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                className="text-[11px] text-brand-600 hover:underline font-semibold"
              >
                Clear Budget
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {(segment !== 'all' || searchQuery || university !== 'all' || minPrice || maxPrice || ruetOnly) && (
        <div className="flex items-center justify-between gap-2 mb-6 px-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span>Filtering by:</span>
            {segment !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-300 font-mono font-bold text-[11px]">
                {segment}
              </span>
            )}
            {university !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 font-mono font-bold text-[11px]">
                {university}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300 text-[11px]">
                "{searchQuery}"
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 font-mono text-[11px]">
                ৳{minPrice || '0'} - ৳{maxPrice || '∞'}
              </span>
            )}
            {ruetOnly && (
              <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px]">
                RUET Verified
              </span>
            )}
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* Post Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border animate-pulse p-6"
            />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No matching campus posts found
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Try broadening your university, search terms, or budget range.
          </p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
