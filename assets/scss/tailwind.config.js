const path = require('path');
const plugin = require('tailwindcss/plugin');

module.exports = {
  corePlugins: {
    fontSize: false,
  },
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
        neutral: {
          0: 'var(--neutral-0)',
          1: 'var(--neutral-1)',
          2: 'var(--neutral-2)',
          3: 'var(--neutral-3)',
          4: 'var(--neutral-4)',
          5: 'var(--neutral-5)',
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
