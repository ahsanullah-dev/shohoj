import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UniversityBadge from '../components/common/UniversityBadge';
import ReportModal from '../components/common/ReportModal';
import { api, resolveImageUrl } from '../api/client';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  MapPin, 
  Share2,
  AlertCircle,
  Heart,
  Bookmark,
  Flag,
  Send,
  Building
} from 'lucide-react';

function fmtBDT(n) {
  if (n == null || n === '') return '';
  return `৳ ${Number(n).toLocaleString('en-IN')}`;
}

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Engagement state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [favorited, setFavorited] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        const res = await api.get(`/api/posts/${id}`);
        const p = res.post || res;
        setPost(p);
        setLiked(Boolean(p.liked));
        setLikeCount(p.likeCount || 0);
        setFavorited(Boolean(p.favorited));
      } catch (err) {
        setError('Post not found or has been removed.');
      } finally {
        setLoading(false);
      }
    }

    async function loadComments() {
      try {
        const res = await api.get(`/api/posts/${id}/comments`);
        setComments(res.comments || []);
      } catch (_) {
        setComments([]);
      }
    }

    loadPost();
    loadComments();
  }, [id]);

  const handleLikeToggle = async () => {
    if (!user) {
      navigate(`/login?next=/post/${id}`);
      return;
    }
    const nextLiked = !liked;
    const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLiked(nextLiked);
    setLikeCount(nextCount);

    try {
      if (nextLiked) {
        await api.post(`/api/posts/${id}/like`);
      } else {
        await api.delete(`/api/posts/${id}/like`);
      }
    } catch (_) {
      setLiked(!nextLiked);
      setLikeCount(likeCount);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate(`/login?next=/post/${id}`);
      return;
    }
    const nextFav = !favorited;
    setFavorited(nextFav);

    try {
      if (nextFav) {
        await api.post(`/api/posts/${id}/favorite`);
      } else {
        await api.delete(`/api/posts/${id}/favorite`);
      }
    } catch (_) {
      setFavorited(!nextFav);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?next=/post/${id}`);
      return;
    }
    const text = commentText.trim();
    if (!text) return;

    setSubmittingComment(true);
    setCommentError('');
    try {
      const res = await api.post(`/api/posts/${id}/comments`, { text });
      if (res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setCommentText('');
        if (post) setPost({ ...post, commentCount: res.commentCount });
      }
    } catch (err) {
      setCommentError(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await api.delete(`/api/posts/${id}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (post) setPost({ ...post, commentCount: res.commentCount });
    } catch (err) {
      alert('Could not delete comment: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/posts/${id}`);
      navigate('/feed');
    } catch (err) {
      alert('Could not delete post: ' + err.message);
      setDeleting(false);
    }
  };

  const handleStartChat = () => {
    if (!user) {
      navigate(`/login?next=/post/${id}`);
      return;
    }
    if (post.author?._id === user._id) {
      alert("You cannot message yourself!");
      return;
    }
    navigate(`/inbox?with=${post.author._id}&post=${post._id}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: `Check out this listing on Shohoj: ${post.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Listing URL copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading campus listing details...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Listing Unavailable</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'This post does not exist.'}</p>
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>
      </div>
    );
  }

  const author = post.author || {};
  const isOwner = user && user._id === author._id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button & Action toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-colors ${
              liked
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400'
                : 'bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{likeCount}</span>
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteToggle}
            className={`p-2 rounded-xl border transition-colors ${
              favorited
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 text-amber-500'
                : 'bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:text-amber-500'
            }`}
            title="Save to favorites"
          >
            <Bookmark className={`w-4 h-4 ${favorited ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
            title="Share Listing"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Report Button */}
          {!isOwner && (
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Report Listing"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Images, Details & Comments */}
        <div className="lg:col-span-8 space-y-6">
          {/* Image Gallery */}
          {post.images && post.images.length > 0 && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm">
              <div className="w-full h-80 sm:h-96 relative bg-slate-900 flex items-center justify-center">
                <img
                  src={resolveImageUrl(post.images[activeImg] || post.images[0])}
                  alt={post.title}
                  className="w-full h-full object-contain"
                />
              </div>
              {post.images.length > 1 && (
                <div className="flex gap-2 p-3 bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-dark-border overflow-x-auto">
                  {post.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activeImg === idx ? 'border-brand-500' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={resolveImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details Card */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-dark-border/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                  {post.category || post.segment}
                </span>

                {/* Campus Landmark Tag */}
                {(post.landmark || post.location) && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300 border border-sky-500/20">
                    <MapPin className="w-3.5 h-3.5 text-sky-500" />
                    <span>{post.landmark || post.location}</span>
                  </span>
                )}
              </div>

              <span className="text-xs font-mono text-slate-400">
                Posted {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight">
              {post.title}
            </h1>

            {post.price != null && post.price !== '' && (
              <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                {fmtBDT(post.price)} {post.priceNote && <span className="text-xs font-normal text-slate-400">({post.priceNote})</span>}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-dark-border/60">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                Description &amp; Details
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {post.description || 'No additional description provided.'}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div id="comments" className="p-6 md:p-8 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border/60">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-500" />
                <span>Discussion &amp; Questions ({comments.length})</span>
              </h3>
            </div>

            {/* Comment Submission Box */}
            {user ? (
              <form onSubmit={handleAddComment} className="space-y-2">
                {commentError && (
                  <p className="text-xs text-red-500">{commentError}</p>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ask a question or inquire about this listing..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Sign in to ask questions or discuss this listing with peers.</span>
                <Link to={`/login?next=/post/${id}`} className="font-bold text-brand-600 hover:underline">
                  Sign In
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4 pt-2">
              {comments.length > 0 ? (
                comments.map((c) => {
                  const cAuthor = c.user || {};
                  const canDelete = user && (user._id === cAuthor._id || user._id === author._id);
                  return (
                    <div
                      key={c._id}
                      className="p-4 rounded-xl bg-slate-50/70 dark:bg-dark-surface/60 border border-slate-200/60 dark:border-dark-border/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                            {cAuthor.name || 'Student'}
                          </span>
                          <UniversityBadge user={cAuthor} variant="compact" />
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {canDelete && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {c.text}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  No questions yet. Be the first to ask!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Author Card & Action Buttons */}
        <div className="lg:col-span-4 space-y-6">
          {/* Author Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-base font-bold text-brand-400 uppercase flex-shrink-0">
                {author.name?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white truncate">
                    {author.name || 'Student'}
                  </h3>
                </div>
                <div className="mt-1">
                  <UniversityBadge user={author} variant="full" size="sm" />
                </div>
              </div>
            </div>

            {/* Department / Batch / Hall */}
            {(author.department || author.batch || author.hall) && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200/60 dark:border-dark-border/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono">
                {author.department && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dept:</span>
                    <span className="font-bold">{author.department}</span>
                  </div>
                )}
                {author.batch && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Batch:</span>
                    <span className="font-bold">{author.batch}</span>
                  </div>
                )}
                {author.hall && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hall:</span>
                    <span className="font-bold">{author.hall}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-2.5">
              {!isOwner ? (
                <button
                  onClick={handleStartChat}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 shadow-md shadow-brand-500/25 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message Peer
                </button>
              ) : (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Deleting...' : 'Delete Listing'}
                </button>
              )}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Safety Tip
            </div>
            <p className="leading-relaxed">
              Meet in public campus areas for device testing or handover. Verify student badges and transaction IDs before closing the ticket.
            </p>
          </div>
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
