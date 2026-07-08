/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Noontree is the primary brand typeface.
        sans: ['Noontree', 'system-ui', 'sans-serif'],
        noontree: ['Noontree', 'sans-serif'],
        figtree: ['Figtree', 'Noontree', 'system-ui', 'sans-serif'],
        questrial: ['Questrial', 'system-ui', 'sans-serif'],
      },
      colors: {
        // noon brand palette
        noon: {
          yellow: '#FEEE00',
          dark: '#404553',
          gray: '#7E859B',
        },
      },
    },
  },
  plugins: [],
}
