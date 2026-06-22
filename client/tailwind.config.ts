import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#edf4ef',
          100: '#dde8e0',
          200: '#b0d0bc',
          300: '#6aaf90',
          400: '#4a9a6a',
          500: '#2e7d52',
          600: '#236642',
          700: '#1a4d30',
          800: '#163c2a',
          900: '#0e2a1c',
        },
        pink: {
          50:  '#f7edf0',
          100: '#eedadf',
          200: '#ddb4be',
          300: '#cb8e9e',
          400: '#b86a80',
          500: '#a35068',
          600: '#853a52',
          700: '#65293c',
        },
        gold: {
          300: '#fde68a',
          400: '#fcd34d',
          500: '#f5c242',
          600: '#d4a017',
        },
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'progress-fill': {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
        'count-up': {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-in': {
          '0%':   { transform: 'scale(0.7)', opacity: '0' },
          '70%':  { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'slide-out': {
          '0%':   { opacity: '1', transform: 'translateX(0)',   maxHeight: '80px' },
          '100%': { opacity: '0', transform: 'translateX(-16px)', maxHeight: '0px' },
        },
      },
      animation: {
        'fade-in':         'fade-in 0.3s ease-out both',
        'fade-in-up':      'fade-in-up 0.4s ease-out both',
        'slide-in-right':  'slide-in-right 0.3s ease-out both',
        'scale-in':        'scale-in 0.2s ease-out both',
        'fade-in-slow':    'fade-in 0.6s ease-out both',
        shimmer:           'shimmer 1.5s linear infinite',
        'bounce-in':       'bounce-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-out':       'slide-out 0.22s ease-in forwards',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
