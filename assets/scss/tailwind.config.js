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
        neutral: {
          1: 'var(--color-neutral-1)',
          2: 'var(--color-neutral-2)',
          3: 'var(--color-neutral-3)',
          4: 'var(--color-neutral-4)',
          5: 'var(--color-neutral-5)',
          6: 'var(--color-neutral-6)',
        },
        accent: 'var(--color-accent)',
      },
      fontSize: {
        sm: ['0.85rem', {
          lineHeight: '1.25rem',
        }],
      },
    },
  },
  content: [
    path.join(__dirname, '../../assets/**/*.js'),
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
  experimental: {
    optimizeUniversalDefaults: true,
  },
};
