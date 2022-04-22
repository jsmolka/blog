const path = require('path');
const root = path.join(__dirname, '../../');

module.exports = {
  corePlugins: {
    container: false,
  },
  theme: {
    fontFamily: {
      sans: ['Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
      inter: ['Inter', 'sans-serif'],
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
        backdrop: {
          0: 'var(--backdrop-0)',
          1: 'var(--backdrop-1)',
          2: 'var(--backdrop-2)',
          3: 'var(--backdrop-3)',
        },
        neutral: {
          0: 'var(--neutral-0)',
          1: 'var(--neutral-1)',
          2: 'var(--neutral-2)',
          3: 'var(--neutral-3)',
        },
        accent: 'var(--accent)',
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
