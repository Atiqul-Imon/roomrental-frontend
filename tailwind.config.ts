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
        // Refined shadow hierarchy - subtle and layered
        'soft': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        // Hover shadows
        'hover-soft': '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'hover-medium': '0 6px 8px -2px rgba(0, 0, 0, 0.1), 0 3px 5px -1px rgba(0, 0, 0, 0.06)',
        'hover-large': '0 12px 18px -4px rgba(0, 0, 0, 0.12), 0 6px 8px -3px rgba(0, 0, 0, 0.08)',
        // Dark mode shadows
        'dark-soft': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'dark-medium': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'dark-large': '0 10px 25px rgba(0, 0, 0, 0.5)',
        'dark-xl': '0 20px 25px rgba(0, 0, 0, 0.6)',
        // Glow effects
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-primary': '0 0 20px rgba(59, 130, 246, 0.2)',
        'glow-subtle': '0 0 12px rgba(59, 130, 246, 0.15)',
      },
      borderWidth: {
        '1': '1px',
        '2': '2px',
        '3': '3px',
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
      screens: {
        'xs': '475px',
      },
      spacing: {
        'touch': '44px', // Minimum touch target size
        // 4px base scale for consistent spacing
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
      },
      lineHeight: {
        'tight': '1.2',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
      letterSpacing: {
        'tighter': '-0.03em',
        'tight': '-0.02em',
        'normal': '-0.01em',
        'wide': '0.01em',
      },
    },
  },
  plugins: [],
};

export default config;

