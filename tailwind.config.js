/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'idli-white': '#FAF6EC',
        'rice-cream': '#FAF6EC',
        'coconut': '#FFFDF7',
        'coffee-brown': '#2B1D14',
        'sambar-brown': '#6B5444',
        'banana-leaf': '#2F5D3A',
        'turmeric-gold': '#E0A526',
        'kumkum-red': '#B3261E',
        'sandalwood': '#E8DCC4',
        'deep-leaf': '#1F3F28',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        hindi: ['Tiro Devanagari Hindi', 'serif'],
        tamil: ['Noto Sans Tamil', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
