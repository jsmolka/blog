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
        'color-tertiary': 'var(--color-tertiary)',
        'background': 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        'background-tertiary': 'var(--background-tertiary)',
        'header': 'var(--header)',
        'header-menu': 'var(--header-menu)',
        'audio': 'var(--audio)',
        'audio-secondary': 'var(--audio-secondary)',
        'border': 'var(--border)',
        'accent': 'var(--accent)'
      },
    },
    fontFamily: {
      'roboto': font('Roboto'),
      'jet-brains-mono': font('JetBrainsMono')
    },
    extend: {
      borderWidth: {
        6: '6px'
      }
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
      root + 'assets/**/*.js',
      root + 'assets/**/*.scss',
      root + 'content/**/*.md',
      root + 'content/**/*.html',
      root + 'layouts/**/*.html'
    ]
  }
}
