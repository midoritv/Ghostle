/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary accent — electric violet/indigo from logo
        accent: '#7b6ee0',
        'accent-dark': '#4a3fb5',
        'accent-light': '#a99ef0',
        // Secondary — chrome silver
        chrome: '#c8cdd6',
        'chrome-dark': '#7a8394',
        // Keep gold for correct answers (green-adjacent warmth)
        gold: '#d4af37',
        crimson: '#8a0303',
      },
      fontFamily: {
        cinzel: ['"Cinzel Decorative"', '"Cinzel"', 'Georgia', 'serif'],
        serif: ['"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
