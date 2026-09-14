import React from 'react';
import { Link } from 'react-router-dom';
import UniversityBadge from '../common/UniversityBadge';
import ReportModal from '../common/ReportModal';
import { resolveImageUrl, api } from '../../api/client';
import { 
  MapPin, 
  Clock, 
  MessageSquare, 
  Heart, 
  Bookmark, 
  MoreVertical,
  Flag,
  BookOpen,
  Wrench,
  Palette,
  Package,
  ShoppingBag
} from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const then = new Date(dateStr).getTime();
  const sec = Math.floor((Date.now() - then) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function fmtBDT(n) {
  if (n == null || n === '') return '';
  return `৳ ${Number(n).toLocaleString('en-IN')}`;
}

const SEGMENT_FALLBACKS = {
  tuition: {
    bg: 'from-purple-900/60 via-indigo-900/50 to-slate-900',
    icon: <BookOpen className="w-9 h-9 text-purple-400/80" />,
    label: 'TUITION & TEACHING',
    border: 'border-purple-500/20',
  },
  tech: {
    bg: 'from-teal-900/60 via-emerald-900/50 to-slate-900',
    icon: <Wrench className="w-9 h-9 text-teal-400/80" />,
    label: 'TECH & GADGET REPAIR',
    border: 'border-teal-500/20',
  },
  creative: {
    bg: 'from-pink-900/60 via-rose-900/50 to-slate-900',
    icon: <Palette className="w-9 h-9 text-pink-400/80" />,
    label: 'CREATIVE & DESIGN',
    border: 'border-pink-500/20',
  },
  errands: {
    bg: 'from-amber-900/60 via-orange-900/50 to-slate-900',
    icon: <Package className="w-9 h-9 text-amber-400/80" />,
    label: 'CAMPUS DELIVERY & ERRANDS',
    border: 'border-amber-500/20',
  },
  marketplace: {
    bg: 'from-blue-900/60 via-cyan-900/50 to-slate-900',
    icon: <ShoppingBag className="w-9 h-9 text-blue-400/80" />,
    label: 'BUY, SELL & EXCHANGE',
    border: 'border-blue-500/20',
  },
};

export default function PostCard({ 
  post, 
  onLike, 
  onFavorite, 
  onReport,
  isLiked: propLiked,
  isFavorited: propFavorited 
}) {
  if (!post) return null;

  const [liked, setLiked] = React.useState(propLiked !== undefined ? propLiked : Boolean(post.liked));
  const [likeCount, setLikeCount] = React.useState(post.likeCount || 0);
  const [favorited, setFavorited] = React.useState(propFavorited !== undefined ? propFavorited : Boolean(post.favorited));
  const [reportModalOpen, setReportModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (propLiked !== undefined) setLiked(propLiked);
    else if (post.liked !== undefined) setLiked(Boolean(post.liked));
  }, [propLiked, post.liked]);

  React.useEffect(() => {
    if (propFavorited !== undefined) setFavorited(propFavorited);
    else if (post.favorited !== undefined) setFavorited(Boolean(post.favorited));
  }, [propFavorited, post.favorited]);

  React.useEffect(() => {
    if (post.likeCount !== undefined) setLikeCount(post.likeCount);
  }, [post.likeCount]);

  async function handleLikeToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    const nextLiked = !liked;
    const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLiked(nextLiked);
    setLikeCount(nextCount);

    if (onLike) {
      onLike(post, nextLiked);
      return;
    }

    try {
      if (nextLiked) {
        await api.post(`/api/posts/${post._id}/like`);
      } else {
        await api.delete(`/api/posts/${post._id}/like`);
      }
    } catch (_) {
      // Rollback on error
      setLiked(!nextLiked);
      setLikeCount(likeCount);
    }
  }

  async function handleFavoriteToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    const nextFav = !favorited;
    setFavorited(nextFav);

    if (onFavorite) {
      onFavorite(post, nextFav);
      return;
    }

    try {
      if (nextFav) {
        await api.post(`/api/posts/${post._id}/favorite`);
      } else {
        await api.delete(`/api/posts/${post._id}/favorite`);
      }
    } catch (_) {
      // Rollback on error
      setFavorited(!nextFav);
    }
  }

  const author = post.author || {};
  const segment = post.segment || 'marketplace';
  const fallback = SEGMENT_FALLBACKS[segment] || SEGMENT_FALLBACKS.marketplace;
  const coverImg = post.images && post.images.length > 0 ? resolveImageUrl(post.images[0]) : '';

  return (
    <div className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border hover:border-brand-500/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div>
        {/* Banner Area - ALWAYS FIXED HEIGHT h-44 for 100% uniform alignment */}
        <Link to={`/post/${post._id}`} className="block relative w-full h-44 overflow-hidden">
          {coverImg ? (
            <img
              src={coverImg}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${fallback.bg} border-b ${fallback.border} flex flex-col items-center justify-center p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner mb-1.5">
                {fallback.icon}
              </div>
              <span className="font-mono text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
                {fallback.label}
              </span>
            </div>
          )}

          {/* Price Tag Overlay */}
          {post.price != null && post.price !== '' && (
            <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-dark-base/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm shadow-md">
              {fmtBDT(post.price)}
            </span>
          )}

          {/* Location / Landmark Tag if exists */}
          {(post.landmark || post.location) && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-dark-base/80 text-slate-300 border border-white/10 backdrop-blur-sm flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-cyan-400" />
              <span className="max-w-[120px] truncate">{post.landmark || post.location}</span>
            </span>
          )}
        </Link>

        {/* Content Body */}
        <div className="p-5">
          {/* Segment Tag & Actions */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
              {post.category || segment}
            </span>

            {/* Quick Report Menu Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onReport) onReport(post);
                else setReportModalOpen(true);
              }}
              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Report listing"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Title */}
          <Link to={`/post/${post._id}`} className="block">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors line-clamp-2 mb-2 leading-snug">
              {post.title}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {post.description || 'No additional description provided.'}
          </p>
        </div>
      </div>

      {/* Card Footer: Author (with inline compact badge), Time & Engagement */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-dark-border/60 bg-slate-50/50 dark:bg-dark-surface/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 max-w-[55%] truncate">
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs">
            {author.name || 'Student'}
          </span>
          <UniversityBadge user={author} variant="compact" />
        </div>

        {/* Action icons: Like / Save / Time */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1 transition-colors ${
              liked ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-rose-500'
            }`}
            title="Like post"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likeCount}</span>
          </button>

          {/* Comment Count Link */}
          <Link
            to={`/post/${post._id}#comments`}
            className="flex items-center gap-1 text-slate-400 hover:text-brand-500 transition-colors"
            title="Comments"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{post.commentCount || 0}</span>
          </Link>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteToggle}
            className={`transition-colors ${
              favorited ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
            }`}
            title="Save to favorites"
          >
            <Bookmark className={`w-3.5 h-3.5 ${favorited ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="post"
        targetId={post._id}
        targetTitle={post.title}
      />
    </div>
  );
}
