const root = __dirname + '/../../';

module.exports = {
  darkMode: 'class',
  theme: {
    colors: {
      neutral: {
        1: 'var(--neutral-1)',
        2: 'var(--neutral-2)',
        3: 'var(--neutral-3)',
        4: 'var(--neutral-4)',
        5: 'var(--neutral-5)',
      },
      accent: 'var(--accent)',
    },
    fontFamily: {
      merriweather: 'roboto, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      mono: 'mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    screens: {
      sm: '40rem',
      md: '45rem',
      lg: '64rem',
      xl: '80rem',
    },
    extend: {
      boxShadow: {
        container: 'inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)',
      },
      width: {
        fit: 'fit-content',
      },
    },
  },
  variants: {
    extend: {
      borderWidth: [
        'first',
        'last',
      ],
      margin: [
        'first',
        'last',
      ],
      padding: [
        'first',
        'last',
      ],
    },
  },
  purge: {
    enabled: process.env.HUGO_ENVIRONMENT === 'production',
    content: [
      root + 'assets/**/*.js',
      root + 'assets/**/*.scss',
      root + 'content/**/*.md',
      root + 'content/**/*.html',
      root + 'layouts/**/*.html',
    ],
  },
};
