export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        'oxford-blue': '#0A2342',
        'cambridge-blue': '#A3C9D8',
        'card-white': '#F8F9FA',
        'secondary-text': '#6B7280',
        'address-gray': '#9CA3AF',
      },
    },
  },
  plugins: [],
}
