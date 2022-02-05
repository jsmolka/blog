const path = require('path');
const root = path.join(__dirname, '../../');

const sans = (font) => `"${font}", Roboto, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif`;
const mono = (font) => `"${font}", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;

module.exports = {
  corePlugins: {
    container: false,
  },
  theme: {
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
    fontFamily: {
      inter: sans('Inter'),
      roboto: sans('Roboto'),
      mono: mono('JetBrains Mono'),
    },
    screens: {
      sm: '40rem',
      md: '45rem',
      lg: '64rem',
      xl: '80rem',
    },
    extend: {
      width: {
        fit: 'fit-content',
      },
    },
  },
  content: [
    path.join(root, 'assets/**/*.{js,scss}'),
    path.join(root, 'content/**/*.{html,md}'),
    path.join(root, 'layouts/**/*.html'),
  ],
};
