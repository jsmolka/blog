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
      black: 'black',
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
      alpha: {
        black: {
          10: 'rgba(0, 0, 0, 0.01)',
          20: 'rgba(0, 0, 0, 0.02)',
          30: 'rgba(0, 0, 0, 0.03)',
          40: 'rgba(0, 0, 0, 0.04)',
          50: 'rgba(0, 0, 0, 0.05)',
          60: 'rgba(0, 0, 0, 0.06)',
          70: 'rgba(0, 0, 0, 0.07)',
          80: 'rgba(0, 0, 0, 0.08)',
          90: 'rgba(0, 0, 0, 0.09)',
        },
        white: {
          10: 'rgba(255, 255, 255, 0.01)',
          20: 'rgba(255, 255, 255, 0.02)',
          30: 'rgba(255, 255, 255, 0.03)',
          40: 'rgba(255, 255, 255, 0.04)',
          50: 'rgba(255, 255, 255, 0.05)',
          60: 'rgba(255, 255, 255, 0.06)',
          70: 'rgba(255, 255, 255, 0.07)',
          80: 'rgba(255, 255, 255, 0.08)',
          90: 'rgba(255, 255, 255, 0.09)',
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
