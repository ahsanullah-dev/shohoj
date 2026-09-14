import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UniversityBadge from '../components/common/UniversityBadge';
import PostCard from '../components/feed/PostCard';
import { UNIVERSITIES } from '../constants/universities';
import { api, resolveImageUrl } from '../api/client';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Mail, 
  Edit3, 
  Save, 
  Layers, 
  Bookmark,
  CheckCircle2, 
  Plus,
  Building,
  Camera,
  Loader2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');
  const [hall, setHall] = useState('');
  const [bio, setBio] = useState('');
  const [universityTag, setUniversityTag] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'saved'
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  if (!isAuthenticated) {
    navigate('/login?next=/profile');
    return null;
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('Image must be under 10MB.');
      return;
    }

    setAvatarError('');
    setUploadingAvatar(true);
    try {
      const img = await api.uploadAvatar(file);
      const res = await api.patch('/api/users/me', {
        avatarUrl: img.url,
        avatarPublicId: img.publicId || '',
      });
      if (res.user) {
        updateUser(res.user);
      }
    } catch (err) {
      setAvatarError('Photo upload failed: ' + (err.message || 'Server error'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (user) {
      setDepartment(user.department || '');
      setBatch(user.batch || '');
      setHall(user.hall || '');
      setBio(user.bio || '');
      setUniversityTag(user.universityTag || (user.isRuetVerified ? 'RUET' : ''));
      setBkashNumber(user.bkashNumber || '');
      setNagadNumber(user.nagadNumber || '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    async function loadMyPosts() {
      setLoadingPosts(true);
      try {
        const res = await api.get(`/api/posts?author=${user._id}`);
        setMyPosts(res.posts || []);
      } catch (err) {
        setMyPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    }
    loadMyPosts();
  }, [user]);

  useEffect(() => {
    if (!user || activeTab !== 'saved') return;
    async function loadSavedPosts() {
      setLoadingSaved(true);
      try {
        const res = await api.get('/api/posts/favorites/mine');
        setSavedPosts(res.posts || []);
      } catch (err) {
        setSavedPosts([]);
      } finally {
        setLoadingSaved(false);
      }
    }
    loadSavedPosts();
  }, [user, activeTab]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      const selectedUni = UNIVERSITIES.find((u) => u.tag === universityTag);
      const res = await api.patch('/api/users/me', {
        department,
        batch,
        hall,
        bio,
        universityTag,
        universityName: selectedUni ? selectedUni.name : '',
        bkashNumber,
        nagadNumber,
      });
      if (res.user) {
        updateUser(res.user);
        setMsg('Profile details updated successfully!');
      }
    } catch (err) {
      setMsg('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-500 flex items-center justify-center text-3xl font-extrabold text-white uppercase shadow-lg shadow-brand-500/25 overflow-hidden">
              {user?.avatarUrl ? (
                <img
                  src={resolveImageUrl(user.avatarUrl)}
                  alt={user?.name || 'Profile photo'}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.[0] || 'U'
              )}
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              title="Change profile photo"
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-2 border-white dark:border-dark-card shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-70"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 justify-center sm:justify-start">
              <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
                {user?.name}
              </h1>
              <UniversityBadge user={user} size="lg" />
            </div>
            <p className="text-xs font-mono text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            {user?.bio && (
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed pt-1">
                {user.bio}
              </p>
            )}
            {avatarError && (
              <p className="text-xs text-rose-500 font-medium pt-1">{avatarError}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Edit Student Details */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm space-y-4">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-brand-500" />
              Edit Student Profile
            </h2>

            {msg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
                {msg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">University / Campus</label>
                <select
                  value={universityTag}
                  onChange={(e) => setUniversityTag(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  <option value="">Select University...</option>
                  {UNIVERSITIES.map((u) => (
                    <option key={u.tag} value={u.tag}>
                      {u.tag} — {u.shortName} ({u.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. CSE, EEE, ME, Civil"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Batch / Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2021"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Hall / Hostel</label>
                  <input
                    type="text"
                    placeholder="e.g. Selim Hall"
                    value={hall}
                    onChange={(e) => setHall(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Short Bio / Skills</label>
                <textarea
                  rows={2}
                  placeholder="e.g. CSE junior offering Python tuition and laptop upgrades..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-dark-border">
                <label className="block text-slate-700 dark:text-slate-300 mb-1">bKash Send Money Number (optional)</label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-all"
              >
                {saving ? 'Saving changes...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Listings & Saved Listings Tabs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('listings')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'listings'
                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 border border-brand-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>My Listings ({myPosts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'saved'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved Listings ({savedPosts.length})</span>
              </button>
            </div>

            <Link
              to="/create-post"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> + New Listing
            </Link>
          </div>

          {/* Active Tab Content */}
          {activeTab === 'listings' ? (
            loadingPosts ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading your listings...</div>
            ) : myPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-xs text-slate-400">
                You haven't posted any campus listings yet.
              </div>
            )
          ) : (
            loadingSaved ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading saved listings...</div>
            ) : savedPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedPosts.map((post) => (
                  <PostCard key={post._id} post={post} isFavorited={true} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-xs text-slate-400">
                You have no bookmarked or saved listings yet. Tap the bookmark icon on any post card to save it here!
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
