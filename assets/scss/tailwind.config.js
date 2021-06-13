const root = __dirname + '/../../';

function font(name) {
  return [
    name,
    'system-ui',
    '-apple-system',
    '"Segoe UI"',
    'Roboto',
    'Helvetica',
    'Arial',
    'sans-serif'
  ];
}

module.exports = {
  theme: {
    colors: {
      current: 'currentColor',
      transparent: 'transparent',
      var: {
        'color': 'var(--color)',
        'color-secondary': 'var(--color-secondary)',
        'background': 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        'header': 'var(--header)',
        'border': 'var(--border)',
        'menu-hover': 'var(--menu-hover)',
        'accent': 'var(--accent)'
      },
      complement: {
        alpha: {
          100: 'rgba(var(--complement), 0.1)',
          200: 'rgba(var(--complement), 0.2)',
          300: 'rgba(var(--complement), 0.3)',
          400: 'rgba(var(--complement), 0.4)',
          500: 'rgba(var(--complement), 0.5)',
          600: 'rgba(var(--complement), 0.6)',
          700: 'rgba(var(--complement), 0.7)',
          800: 'rgba(var(--complement), 0.8)',
          900: 'rgba(var(--complement), 0.9)'
        }
      }
    },
    fontFamily: {
      roboto: font('Roboto'),
      jetBrainsMono: font('JetBrainsMono')
    }
  },
  variants: {
    extend: {
      margin: [
        'first',
        'last'
      ]
    }
  },
  purge: {
    enabled: process.env.HUGO_ENVIRONMENT === 'production',
    content: [
      root + 'assets/**/*.scss',
      root + 'content/**/*.md',
      root + 'content/**/*.html',
      root + 'layouts/**/*.html'
    ]
  }
}
