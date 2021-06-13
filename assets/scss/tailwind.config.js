const root = __dirname + '/../../';

function font(font) {
  return [
    font,
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
  theme: {
    colors: {
      var: {
        'color': 'var(--color)',
        'color-secondary': 'var(--color-secondary)',
        'background': 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        'header': 'var(--header)',
        'border': 'var(--border)',
        'menu-hover': 'var(--menu-hover)',
        'accent': 'var(--accent)',
        'complement': 'var(--complement)'
      }
    },
    fontFamily: {
      roboto: font('Roboto'),
      jetBrainsMono: font('JetBrainsMono')
    },
    extends: {}
  },
  variants: {},
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
