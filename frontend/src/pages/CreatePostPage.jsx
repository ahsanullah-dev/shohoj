import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { CAMPUS_DATA } from '../constants/campuses';
import { UNIVERSITIES } from '../constants/universities';
import { Plus, Upload, ArrowLeft, Image as ImageIcon, X, MapPin, Building } from 'lucide-react';

const CATEGORIES = {
  tuition: ['Calculus & Math', 'Physics & Science', 'Computer Programming', 'English & Languages', 'HSC / Admission Prep', 'Other'],
  tech: ['Laptop Repair & SSD', 'Smartphone Fixing', 'OS & Software Setup', 'Circuit & Arduino Debugging', 'Bicycle Tuning', 'Other'],
  creative: ['Poster & Banner Design', 'Club Photography', 'Video Editing & Reels', 'Slides & Presentation', 'UI/UX Design', 'Other'],
  errands: ['Bulk Document Printing', 'Hall Delivery', 'Ride Sharing', 'Grocery / Pharmacy Run', 'Other'],
  marketplace: ['Scientific Calculators', 'Engineering Lab Kits', 'Textbooks & Notes', 'Cycles & Commute', 'Hostel Essentials', 'Other'],
};

export default function CreatePostPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [segment, setSegment] = useState('tuition');
  const [category, setCategory] = useState(CATEGORIES.tuition[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedUni, setSelectedUni] = useState(user?.universityTag || (user?.isRuetVerified ? 'RUET' : 'RUET'));
  const [landmark, setLandmark] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    navigate('/login?next=/create-post');
    return null;
  }

  const campus = CAMPUS_DATA[selectedUni] || CAMPUS_DATA.RUET;

  const handleSegmentChange = (e) => {
    const s = e.target.value;
    setSegment(s);
    setCategory(CATEGORIES[s]?.[0] || 'Other');
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError('');

    try {
      for (const file of files) {
        const res = await api.upload(file);
        if (res && res.url) {
          setImages((prev) => [...prev, { url: res.url, publicId: res.publicId || '' }]);
        }
      }
    } catch (err) {
      setError('Image upload failed: ' + (err.message || 'Server error'));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const matchedLm = campus.landmarks?.find((l) => l.name === landmark);
      const payload = {
        segment,
        category,
        title: title.trim(),
        description: description.trim(),
        price: price ? Number(price) : null,
        landmark: landmark || '',
        coordinates: matchedLm
          ? { lat: matchedLm.coords[0], lng: matchedLm.coords[1] }
          : { lat: campus.center[0], lng: campus.center[1] },
        images,
      };

      const res = await api.post('/api/posts', payload);
      if (res.post?._id || res._id) {
        navigate(`/post/${res.post?._id || res._id}`);
      } else {
        navigate('/feed');
      }
    } catch (err) {
      setError(err.message || 'Could not create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-500 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel
      </button>

      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xl space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Create Campus Listing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Post an offer, service, request, or item for university peers.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Segment & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                Marketplace Segment
              </label>
              <select
                value={segment}
                onChange={handleSegmentChange}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="tuition">📚 Tuition Offers</option>
                <option value="tech">🛠️ Tech &amp; Repair</option>
                <option value="creative">🎨 Creative &amp; Design</option>
                <option value="errands">📦 Campus Errands</option>
                <option value="marketplace">🛍️ Buy, Sell &amp; Exchange</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {(CATEGORIES[segment] || []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campus Landmark / Location Picker (For Map Discovery) */}
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-dark-surface/60 border border-slate-200/80 dark:border-dark-border/80 space-y-3">
            <div className="flex items-center gap-2 text-dark-800 dark:text-dark-200 font-bold">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Campus Map Pin (Discovery Location)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                  University Campus
                </label>
                <select
                  value={selectedUni}
                  onChange={(e) => {
                    setSelectedUni(e.target.value);
                    setLandmark('');
                  }}
                  className="w-full p-2 rounded-lg bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  {UNIVERSITIES.map((u) => (
                    <option key={u.tag} value={u.tag}>
                      {u.tag} — {u.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[11px]">
                  Campus Landmark / Area
                </label>
                <select
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="">General Campus Area</option>
                  {(campus.landmarks || []).map((lm) => (
                    <option key={lm.name} value={lm.name}>
                      📍 {lm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
              Listing Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Calculus II Tuition (3 days/week) or Casio FX-991EX Calculator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
              Price (৳ BDT) — optional
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 1500 (leave blank for negotiable/free)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
              Description &amp; Specifications
            </label>
            <textarea
              rows={4}
              placeholder="Describe your service, condition of the item, timing, or how to coordinate..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
              Pictures (Optional — fallback icon banner is shown if none uploaded)
            </label>
            <div className="flex flex-wrap gap-3 mb-2">
              {images.map((img, idx) => {
                const url = typeof img === 'object' ? img.url : img;
                return (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-dark-border group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              {images.length < 4 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-dark-border hover:border-brand-500 flex flex-col items-center justify-center text-slate-400 hover:text-brand-500 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-semibold">Add Pic</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            {uploading && (
              <p className="text-xs text-brand-600 animate-pulse">Uploading picture to cloud...</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? 'Publishing Listing...' : 'Publish Campus Listing'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
