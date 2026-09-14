import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getUniversityByTag } from '../../constants/universities';

const UNI_STYLES = {
  RUET: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
  VU: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
  BUET: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30',
  DU: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
  KUET: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
  CUET: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
  SUST: 'bg-pink-500/15 text-pink-600 dark:text-pink-300 border-pink-500/30',
  IUT: 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/30',
  RU: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
  AUST: 'bg-lime-500/15 text-lime-600 dark:text-lime-300 border-lime-500/30',
};

const DOT_COLORS = {
  RUET: 'bg-purple-500',
  VU: 'bg-emerald-500',
  BUET: 'bg-blue-500',
  DU: 'bg-rose-500',
  KUET: 'bg-cyan-500',
  CUET: 'bg-amber-500',
  SUST: 'bg-pink-500',
  IUT: 'bg-teal-500',
  RU: 'bg-indigo-500',
  AUST: 'bg-lime-500',
};

export default function UniversityBadge({ user, universityTag, variant = 'compact', size = 'sm' }) {
  const tag = (universityTag || (user && (user.universityTag || (user.isRuetVerified ? 'RUET' : null))) || '').toUpperCase();
  const isVerified = user ? (user.universityVerified || user.isRuetVerified || user.emailVerified) : Boolean(tag);

  if (!tag && !isVerified) return null;

  const uniInfo = getUniversityByTag(tag);
  const styleClass = UNI_STYLES[tag] || 'bg-brand-500/15 text-brand-600 dark:text-brand-300 border-brand-500/30';
  const dotColor = DOT_COLORS[tag] || 'bg-brand-500';
  const label = tag || 'STUDENT';
  const fullName = (user && user.universityName) || (uniInfo && uniInfo.name) || `${label} Verified`;

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-bold tracking-tight rounded-full px-2 py-0.5 border text-[10px] leading-none ${styleClass}`}
        title={`${fullName} — Verified`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span>{label}</span>
      </span>
    );
  }

  // variant === 'full'
  const sizeClasses = size === 'lg'
    ? 'text-xs px-2.5 py-1 gap-1.5'
    : 'text-[11px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center font-mono font-bold tracking-wider rounded-md border uppercase shadow-sm ${sizeClasses} ${styleClass}`}
      title={`${fullName} — Verified Account`}
    >
      <ShieldCheck className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      <span>{label} VERIFIED</span>
    </span>
  );
}
