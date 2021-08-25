const root = __dirname + '/../../';

module.exports = {
  darkMode: 'class',
  theme: {
    colors: {
      primary: 'var(--primary)',
      secondary: 'var(--secondary)',
      tertiary: 'var(--tertiary)',
    },
    fontFamily: {
      merriweather: ['merriweather', 'serif'],
      mono: ['mono', 'monospace'],
    },
    screens: {
      sm: '30rem',
      md: '45rem',
      lg: '61rem',
      xl: '90rem',
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
