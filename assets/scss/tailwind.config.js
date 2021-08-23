const root = __dirname + '/../../';

module.exports = {
  darkMode: 'class',
  theme: {},
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
