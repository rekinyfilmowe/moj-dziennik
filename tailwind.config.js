// tailwind.config.js – dopisz do extend:
theme: {
  extend: {
    colors: {
      primary: '#1E40AF', // <- z Figmy
      secondary: '#F59E0B',
      muted: '#F5F7FA',
    },
    fontFamily: {
      sans: ['var(--font-inter)'],
    },
    borderRadius: {
      xl: '12px', // jeśli w Figmie masz stały radius
    }
  }
}
