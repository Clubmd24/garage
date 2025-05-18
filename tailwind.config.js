module.exports = {
  darkMode: 'class',
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
      },
      borderRadius: { '2xl': '1rem' },
      boxShadow: {
        xl: '0 8px 16px rgba(0,0,0,0.1)',
        lg: '0 4px 12px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};