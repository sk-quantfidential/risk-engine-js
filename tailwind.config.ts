import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // War-room military theme colors
        background: {
          DEFAULT: '#0a0f14',
          secondary: '#111820',
          tertiary: '#1a2332',
        },
        primary: {
          DEFAULT: '#00ff88',
          dark: '#00cc6a',
          light: '#33ffaa',
        },
        danger: {
          DEFAULT: '#ff3366',
          dark: '#cc2952',
          light: '#ff5c85',
        },
        warning: {
          DEFAULT: '#ffaa00',
          dark: '#cc8800',
          light: '#ffbb33',
        },
        info: {
          DEFAULT: '#00ccff',
          dark: '#00a3cc',
          light: '#33d6ff',
        },
        text: {
          primary: '#e0e6ed',
          secondary: '#9ca3af',
          muted: '#6b7280',
        },
        border: {
          DEFAULT: '#1f2937',
          light: '#374151',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;