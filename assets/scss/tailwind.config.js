const path = require('path');
const root = path.join(__dirname, '../../');

module.exports = {
  corePlugins: {
    container: false,
  },
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
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
          6: 'var(--neutral-6)',
          7: 'var(--neutral-7)',
          8: 'var(--neutral-8)',
          9: 'var(--neutral-9)',
        },
        backdrop: {
          0: 'var(--backdrop-0)',
          1: 'var(--backdrop-1)',
          2: 'var(--backdrop-2)',
          3: 'var(--backdrop-3)',
          4: 'var(--backdrop-4)',
          5: 'var(--backdrop-5)',
          6: 'var(--backdrop-6)',
          7: 'var(--backdrop-7)',
          8: 'var(--backdrop-8)',
          9: 'var(--backdrop-9)',
        },
      },
      fontSize: {
        sm: '0.925rem',
      },
    },
  },
  content: [
    path.join(root, 'assets/**/*.{js,scss}'),
    path.join(root, 'content/**/*.{html,md}'),
    path.join(root, 'layouts/**/*.html'),
  ],
};
