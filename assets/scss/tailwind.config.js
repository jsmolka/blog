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
        prose: {
          1: 'var(--color-prose-1)',
          2: 'var(--color-prose-2)',
          3: 'var(--color-prose-3)',
        },
        elevate: {
          1: 'var(--color-elevate-1)',
          2: 'var(--color-elevate-2)',
          3: 'var(--color-elevate-3)',
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
