export const UNIVERSITIES = [
  {
    tag: 'RUET',
    name: 'Rajshahi University of Engineering & Technology',
    shortName: 'RUET',
    city: 'Rajshahi',
    color: '#8b5cf6', // purple
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/40',
    dotColor: 'bg-purple-500',
    domains: ['student.ruet.ac.bd', 'ruet.ac.bd'],
  },
  {
    tag: 'VU',
    name: 'Varendra University',
    shortName: 'Varendra Univ',
    city: 'Rajshahi',
    color: '#10b981', // emerald
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40',
    dotColor: 'bg-emerald-500',
    domains: ['vu.edu.bd'],
  },
  {
    tag: 'BUET',
    name: 'Bangladesh University of Engineering and Technology',
    shortName: 'BUET',
    city: 'Dhaka',
    color: '#3b82f6', // blue
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40',
    dotColor: 'bg-blue-500',
    domains: ['buet.ac.bd'],
  },
  {
    tag: 'DU',
    name: 'University of Dhaka',
    shortName: 'Dhaka Univ',
    city: 'Dhaka',
    color: '#ef4444', // red
    badgeBg: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/40',
    dotColor: 'bg-red-500',
    domains: ['du.ac.bd'],
  },
  {
    tag: 'KUET',
    name: 'Khulna University of Engineering & Technology',
    shortName: 'KUET',
    city: 'Khulna',
    color: '#06b6d4', // cyan
    badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/40',
    dotColor: 'bg-cyan-500',
    domains: ['kuet.ac.bd'],
  },
  {
    tag: 'CUET',
    name: 'Chittagong University of Engineering & Technology',
    shortName: 'CUET',
    city: 'Chittagong',
    color: '#f59e0b', // amber
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40',
    dotColor: 'bg-amber-500',
    domains: ['cuet.ac.bd'],
  },
  {
    tag: 'SUST',
    name: 'Shahjalal University of Science and Technology',
    shortName: 'SUST',
    city: 'Sylhet',
    color: '#ec4899', // pink
    badgeBg: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800/40',
    dotColor: 'bg-pink-500',
    domains: ['sust.edu'],
  },
  {
    tag: 'IUT',
    name: 'Islamic University of Technology',
    shortName: 'IUT',
    city: 'Gazipur',
    color: '#14b8a6', // teal
    badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/40',
    dotColor: 'bg-teal-500',
    domains: ['iut-dhaka.edu'],
  },
  {
    tag: 'RU',
    name: 'University of Rajshahi',
    shortName: 'Rajshahi Univ',
    city: 'Rajshahi',
    color: '#6366f1', // indigo
    badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/40',
    dotColor: 'bg-indigo-500',
    domains: ['ru.ac.bd'],
  },
  {
    tag: 'AUST',
    name: 'Ahsanullah University of Science and Technology',
    shortName: 'AUST',
    city: 'Dhaka',
    color: '#84cc16', // lime
    badgeBg: 'bg-lime-100 text-lime-800 dark:bg-lime-950/60 dark:text-lime-300 dark:border-lime-800/40',
    dotColor: 'bg-lime-500',
    domains: ['aust.edu'],
  },
];

export function getUniversityByTag(tag) {
  if (!tag) return null;
  const upper = String(tag).trim().toUpperCase();
  return UNIVERSITIES.find((u) => u.tag === upper) || null;
}

export function getUniversityByEmail(email) {
  if (!email) return null;
  const lower = String(email).trim().toLowerCase();
  return UNIVERSITIES.find((u) => u.domains.some((d) => lower.endsWith('@' + d) || lower.endsWith('.' + d))) || null;
}
