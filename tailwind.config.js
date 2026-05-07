/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f5f5f0',
        surface: '#ffffff',
        border: {
          DEFAULT: 'rgba(0,0,0,0.1)',
          strong: 'rgba(0,0,0,0.18)',
        },
        text: {
          DEFAULT: '#0d0d0d',
          muted: '#717182',
        },
        accent: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          light: '#ede9fe',
        },
        terminal: {
          bg: '#0f1117',
          border: '#1e2030',
          text: '#c9d1d9',
          dim: '#484f58',
          green: '#3fb950',
          red: '#ff5f57',
          yellow: '#febc2e',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
      },
      animation: {
        'spin-slow': 'spin 0.7s linear infinite',
        'shimmer': 'shimmer 1.4s infinite',
        'fade-in': 'fadeIn 0.25s ease forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
