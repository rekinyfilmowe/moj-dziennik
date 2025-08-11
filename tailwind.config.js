// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './pages/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { lg: '1024px', xl: '1200px', '2xl': '1320px' } },
    extend: {
      colors: {
        // Pastelowy zielony vibe
        primary: { DEFAULT: '#22C55E', 600: '#16A34A', 700: '#15803D' }, // emerald
        mint:    { DEFAULT: '#A7F3D0' },   // akcenty, tła chipów
        lime:    { DEFAULT: '#D9F99D' },   // delikatne highlighty
        ink:     '#0F172A',                // tekst nagłówków (slate-900)
        text:    '#334155',                // treści (slate-700)
        // delikatne, “make’owe” tła
        paper:   '#F7FBF8',                // kolor strony
        card:    '#FFFFFF',                // karty/sekcje
        border:  '#E5E7EB',                // obramowania
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' },
      boxShadow: {
        soft: '0 10px 30px rgba(22,163,74,0.08)',   // zielonkawy cień
      },
    },
  },
  plugins: [],
}
