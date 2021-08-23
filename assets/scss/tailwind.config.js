const root = __dirname + '/../../';

const font = name => [ name, 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif' ];

module.exports = {
  darkMode: 'class',
  theme: {
    colors: {
      accent: {
        DEFAULT: 'var(--accent)',
        faded: 'var(--accent-faded)',
      },
      neutral: {
        0: 'var(--neutral-0)',
        1: 'var(--neutral-1)',
        2: 'var(--neutral-2)',
        3: 'var(--neutral-3)',
        4: 'var(--neutral-4)',
        5: 'var(--neutral-5)',
        6: 'var(--neutral-6)',
        7: 'var(--neutral-7)',
      },
    },
    fontFamily: {
      inter: font('Inter'),
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
    }
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
