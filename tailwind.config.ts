import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#3B82F6', // Vibrant friendly blue
          foreground: '#FFFFFF',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#EC4899', // Warm playful pink
          foreground: '#FFFFFF',
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9F1239',
          900: '#831843',
        },
        accent: {
          DEFAULT: '#EC4899',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F3F4F6', // Light grey
          foreground: '#6B7280',
        },
        grey: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Dark mode colors
        dark: {
          bg: {
            primary: '#0F172A',    // Slate 900 - Main background
            secondary: '#1E293B',  // Slate 800 - Cards, panels
            tertiary: '#334155',   // Slate 700 - Hover, borders
            elevated: '#475569',   // Slate 600 - Dropdowns, modals
          },
          text: {
            primary: '#F8FAFC',    // Slate 50 - Main text
            secondary: '#CBD5E1',  // Slate 300 - Secondary text
            muted: '#94A3B8',      // Slate 400 - Placeholders
            accent: '#60A5FA',      // Blue 400 - Links
          },
          border: {
            default: '#334155',    // Slate 700
            hover: '#475569',      // Slate 600
            focus: '#3B82F6',      // Blue 500
          },
        },
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.16)',
        // Dark mode shadows
        'dark-soft': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'dark-medium': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'dark-large': '0 10px 25px rgba(0, 0, 0, 0.5)',
        'dark-xl': '0 20px 25px rgba(0, 0, 0, 0.6)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-primary': '0 0 20px rgba(59, 130, 246, 0.2)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #EC4899 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #2563EB 0%, #DB2777 100%)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;

