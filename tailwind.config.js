/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c8fe9',
          600: '#0063fd', // Color principal azul eléctrico
          700: '#0050d4',
          800: '#0041ab',
          900: '#043887',
          950: '#032356',
        },
        cyanGlow: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        frost: {
          50: 'rgba(255, 255, 255, 0.95)',
          100: 'rgba(255, 255, 255, 0.85)',
          200: 'rgba(255, 255, 255, 0.70)',
          300: 'rgba(255, 255, 255, 0.50)',
          400: 'rgba(255, 255, 255, 0.35)',
          border: 'rgba(255, 255, 255, 0.80)',
          borderDark: 'rgba(226, 232, 240, 0.80)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 99, 253, 0.08), 0 2px 8px 0 rgba(0, 0, 0, 0.02)',
        'glass-hover': '0 16px 40px -8px rgba(0, 99, 253, 0.16), 0 4px 12px 0 rgba(0, 0, 0, 0.03)',
        'glass-lg': '0 24px 60px -12px rgba(0, 99, 253, 0.14), 0 8px 24px -4px rgba(0, 0, 0, 0.04)',
        'glow-blue': '0 0 25px rgba(0, 99, 253, 0.35)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.40)',
        'inner-light': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float-slow': 'floatSlow 5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
