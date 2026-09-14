import React, { useState } from 'react';
import { Flag, X, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const REASONS = [
  'Scam / Fraud',
  'Inappropriate Content',
  'Spam',
  'Fake Listing',
  'Harassment',
  'Other',
];

export default function ReportModal({ isOpen, onClose, targetType = 'post', targetId, targetTitle = '' }) {
  const { user } = useAuth();
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to submit a report.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/reports', {
        targetType,
        targetId,
        reason,
        details,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDetails('');
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 rounded-2xl shadow-2xl p-6 text-dark-900 dark:text-dark-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">
              Report {targetType === 'post' ? 'Listing' : 'User'}
            </h3>
            <p className="text-xs text-dark-500 dark:text-dark-400">
              Help keep the Shohoj student community safe
            </p>
          </div>
        </div>

        {targetTitle && (
          <div className="mb-4 p-2.5 rounded-lg bg-dark-50 dark:bg-dark-800/60 text-xs font-medium text-dark-600 dark:text-dark-300 truncate">
            Target: <span className="font-semibold">{targetTitle}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-base text-dark-900 dark:text-white">Report Submitted</h4>
            <p className="text-xs text-dark-500 dark:text-dark-400">
              Thank you for keeping our campus marketplace safe. We will review this shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-dark-700 dark:text-dark-300 mb-1.5">
                Reason for report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-sm rounded-xl border border-dark-300 dark:border-dark-700 bg-white dark:bg-dark-800 px-3.5 py-2.5 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-700 dark:text-dark-300 mb-1.5">
                Additional Details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what was misleading, suspicious, or harmful..."
                rows={3}
                maxLength={1000}
                className="w-full text-sm rounded-xl border border-dark-300 dark:border-dark-700 bg-white dark:bg-dark-800 px-3.5 py-2.5 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-dark-300 dark:border-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
