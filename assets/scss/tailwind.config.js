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
  darkMode: 'class',
  important: true,
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
      hover: {
        alpha: {
          light: 'rgba(0, 0, 0, 0.02)',
          dark: 'rgba(255, 255, 255, 0.04)'
        }
      }
    },
    fontFamily: {
      'roboto': font('Roboto'),
      'jet-brains-mono': font('JetBrainsMono')
    }
  },
  variants: {
    extend: {
      margin: [
        'first',
        'last'
      ],
      padding: [
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
