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
        cormorant: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        'oxford-blue': '#0A2342',
        'navy': {
          DEFAULT: '#0A2342',
          deep: '#071A33',
          mid: '#0D2B52',
          light: '#13376A',
        },
        'cambridge': {
          DEFAULT: '#7AAFC4',
          light: '#A3C9D8',
          muted: '#5A8FA8',
          subtle: '#D6E8F0',
        },
        'club-gold': {
          DEFAULT: '#C9A96E',
          rule: '#B8966A',
        },
        'ivory': {
          DEFAULT: '#FAF7F2',
          warm: '#F5F0E8',
          cream: '#EDE8DF',
          border: '#DDD5C8',
        },
        'ink': {
          DEFAULT: '#1C2B3A',
          mid: '#4A5568',
          light: '#718096',
        },
      },
      boxShadow: {
        'card': '0 1px 4px rgba(10,35,66,0.06), 0 4px 16px rgba(10,35,66,0.08)',
        'card-hover': '0 2px 8px rgba(10,35,66,0.10), 0 8px 24px rgba(10,35,66,0.12)',
        'modal': '0 8px 40px rgba(10,35,66,0.30)',
        'teal-ring': '0 0 0 3px rgba(122,175,196,0.30)',
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(160deg, #071A33 0%, #0A2342 50%, #0D2B52 100%)',
        'gold-rule': 'linear-gradient(90deg, transparent, rgba(201,169,110,0.5), transparent)',
      },
    },
  },
  plugins: [],
}
