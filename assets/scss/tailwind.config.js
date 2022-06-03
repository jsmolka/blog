const path = require('path');
const plugin = require('tailwindcss/plugin');

module.exports = {
  theme: {
    fontFamily: {
      sans: ['Inter', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    screens: {
      sm: '40rem',
      md: '45rem',
      lg: '60rem',
      xl: '80rem',
    },
    extend: {
      borderRadius: {
        sm: '0.0625rem',
      },
      colors: {
        accent: 'var(--accent)',
        shade: {
          1: 'var(--shade-1)',
          2: 'var(--shade-2)',
          3: 'var(--shade-3)',
          4: 'var(--shade-4)',
          5: 'var(--shade-5)',
          6: 'var(--shade-6)',
        },
      },
    },
  },
  content: [
    path.join(__dirname, '../../assets/**/*.{js,scss}'),
    path.join(__dirname, '../../content/**/*.{html,md,js}'),
    path.join(__dirname, '../../layouts/**/*.html'),
  ],
  plugins: [
    plugin(function({ addVariant }) {
      for (const theme of ['system', 'dark', 'light']) {
        addVariant(`theme-${theme}`, `html[theme="${theme}"] &`)
      }
    }),
  ],
};
