/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Electric Indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
        },
        cyan: {
          500: '#06b6d4',
          600: '#0891b2',
        },
        dark: {
          base: '#090D16',     // Obsidian Background
          surface: '#0F172A',  // Slate Surface
          card: '#161F32',     // Card Surface
          border: '#243048',   // Border
          hover: '#1E293B',
        },
        uni: {
          ruet: '#8B5CF6',     // Purple
          vu: '#0D9488',       // Teal
          buet: '#2563EB',     // Blue
          du: '#E11D48',       // Crimson
          kuet: '#F59E0B',     // Amber
          cuet: '#06B6D4',     // Cyan
          sust: '#10B981',     // Emerald
          iut: '#6366F1',      // Indigo
          ru: '#EC4899',       // Pink
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-brand': '0 0 24px -4px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 24px -4px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 24px -4px rgba(16, 185, 129, 0.35)',
        'card-dark': '0 8px 30px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
