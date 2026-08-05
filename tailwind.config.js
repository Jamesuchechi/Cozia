/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cozia: {
          bg: '#12110E',
          surface: '#1C1A16',
          'surface-2': '#23211C',
          ink: '#F5F0E8',
          'ink-dim': '#A39A8A',
          'ink-faint': '#6E685C',
          gold: '#E8A33D',
          'gold-dim': '#B87F2C',
          teal: '#3E8E7E',
          line: 'rgba(245,240,232,0.08)',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
    },
  },
  plugins: [],
}
