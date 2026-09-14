import React from 'react';

const SEGMENTS = [
  { key: 'all', name: 'All Campus Posts', icon: '✨' },
  { key: 'tuition', name: 'Tuition', icon: '📚' },
  { key: 'tech', name: 'Tech & Repair', icon: '🛠️' },
  { key: 'creative', name: 'Creative & Design', icon: '🎨' },
  { key: 'errands', name: 'Errands', icon: '📦' },
  { key: 'marketplace', name: 'Buy & Sell', icon: '🛍️' },
];

export default function SegmentPills({ activeSegment = 'all', onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
      {SEGMENTS.map((seg) => {
        const isActive = activeSegment === seg.key;
        return (
          <button
            key={seg.key}
            onClick={() => onSelect(seg.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              isActive
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                : 'bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dark-border hover:border-brand-500/40'
            }`}
          >
            <span>{seg.icon}</span>
            <span>{seg.name}</span>
          </button>
        );
      })}
    </div>
  );
}
