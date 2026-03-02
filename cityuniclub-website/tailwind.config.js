/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'oxford-blue': '#003366',
        'cambridge-blue': '#A3C9D8',
        'club-gold': '#D4AF37',
      },
    },
  },
  plugins: [],
}
