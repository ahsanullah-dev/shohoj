import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UniversityBadge from '../components/common/UniversityBadge';
import { ShieldCheck, UserPlus, Sparkles } from 'lucide-react';

const UNIVERSITIES = [
  { domains: ['student.ruet.ac.bd', 'ruet.ac.bd'], tag: 'RUET' },
  { domains: ['vu.edu.bd', 'student.vu.edu.bd'], tag: 'Varendra Uni' },
  { domains: ['buet.ac.bd', 'student.buet.ac.bd'], tag: 'BUET' },
  { domains: ['du.ac.bd', 'student.du.ac.bd'], tag: 'DU' },
  { domains: ['kuet.ac.bd', 'student.kuet.ac.bd'], tag: 'KUET' },
  { domains: ['cuet.ac.bd', 'student.cuet.ac.bd'], tag: 'CUET' },
  { domains: ['sust.edu', 'student.sust.edu'], tag: 'SUST' },
  { domains: ['iutoic-dhaka.edu'], tag: 'IUT' },
  { domains: ['ru.ac.bd', 'student.ru.ac.bd'], tag: 'RU' },
  { domains: ['g.bracu.ac.bd', 'bracu.ac.bd'], tag: 'BRACU' },
  { domains: ['northsouth.edu'], tag: 'NSU' },
  { domains: ['aiub.edu'], tag: 'AIUB' },
  { domains: ['aust.edu'], tag: 'AUST' },
];

function detectUniversityTag(email) {
  const lower = String(email || '').toLowerCase().trim();
  for (const u of UNIVERSITIES) {
    if (u.domains.some((d) => lower.endsWith('@' + d) || lower.includes('@' + d))) {
      return u.tag;
    }
  }
  return null;
}

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const detectedTag = detectUniversityTag(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await register(name.trim(), email.trim(), password);
      if (res.pendingVerification || res.ok) {
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-brand-500 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-md">
            S
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Create Student Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join thousands of verified university peers on Shohoj.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahim Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Email Address
              </label>
              {detectedTag && (
                <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3" /> Auto-tagged {detectedTag}
                </span>
              )}
            </div>
            <input
              type="email"
              required
              placeholder="you@student.ruet.ac.bd, @vu.edu.bd, @buet..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
            />
            {detectedTag && (
              <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
                <span className="text-[11px] text-slate-500">Your Badge:</span>
                <UniversityBadge user={{ universityTag: detectedTag, universityVerified: true }} size="sm" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 shadow-md shadow-brand-500/25 transition-all disabled:opacity-60"
          >
            {loading ? 'Creating Account...' : 'Continue to Email Verification'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-dark-border/60 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-400 font-bold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
