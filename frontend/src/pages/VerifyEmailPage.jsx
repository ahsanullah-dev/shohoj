import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyEmail(email, code.trim());
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Incorrect verification code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending || !email) return;
    setResending(true);
    setResendMsg('');
    setError('');

    try {
      await resendVerification(email);
      setResendMsg('New code sent! Check your inbox.');
      setCooldown(60);
    } catch (err) {
      setError(err.message || 'Could not resend code. Please wait a moment.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 mb-1">
            ONE LAST STEP
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Verify Your Email
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We sent a 6-digit verification code to <strong className="text-slate-800 dark:text-slate-200">{email || 'your email'}</strong>.
          </p>
        </div>

        {/* Spam / Junk / Promotions Tip Callout Box */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="text-base flex-shrink-0">💡</span>
          <div>
            <strong className="text-amber-500 dark:text-amber-400 block mb-0.5">Can't find the email?</strong>
            Please check your <b>Spam</b>, <b>Junk</b>, or <b>Promotions</b> tab. It may take up to a minute to arrive.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {resendMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium text-center">
            {resendMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full py-3.5 text-center font-mono text-3xl font-extrabold tracking-[10px] rounded-2xl bg-slate-50 dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-brand-500 dark:text-cyan-400 focus:outline-none focus:border-brand-500 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length !== 6}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying Account...' : 'Verify & Activate Account'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="text-brand-500 hover:text-brand-400 font-semibold disabled:opacity-50"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending...' : 'Resend code'}
          </button>
          <Link to="/signup" className="text-slate-400 hover:text-slate-300">
            Wrong email? Start over
          </Link>
        </div>
      </div>
    </div>
  );
}
