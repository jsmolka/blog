const root = __dirname + '/../../';

module.exports = {
  darkMode: 'class',
  theme: {
    fontFamily: {
      bit: [
        '"Bit Outline"',
        '"Roboto"',
        'system-ui',
        'sans-serif'
      ],
      roboto: [
        '"Roboto"',
        'system-ui',
        'sans-serif'
      ],
      mono: [
        '"JetBrains Mono"',
        'monospace'
      ]
    },
    extend: {
      colors: {
        blue: {
          100: '#bbdefb',
          200: '#a8d5fa',
          300: '#95ccf9',
          400: '#81c3f8',
          500: '#6ebaf7',
          600: '#5bb1f6',
          700: '#48a8f5',
          800: '#349ff4',
          900: '#2196f3',
          dark: '#4482af',
          light: '#95ccf9'
        },
        dark: {
          100: '#5f6469',
          200: '#52575d',
          300: '#454b50',
          400: '#383e44',
          500: '#2b3137',
          600: '#24292e',
          700: '#1a1d21',
          800: '#131619',
          900: '#0d0f11'
        },
        light: {
          100: '#fafafa',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121'
        }
      },
      borderWidth: {
        3: '3px',
        6: '6px'
      },
      height: {
        18: '4.5rem'
      },
      maxWidth: {
        96: '24rem'
      },
      minHeight: {
        18: '4.5rem'
      },
      opacity: {
        40: '0.40',
        60: '0.60',
        85: '0.85'
      },
      screens: {
        anchor: '832px',
      }
    }
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true
  },
  variants: {
    backgroundColor: [
      'dark',
      'hover',
      'group-hover'
    ],
    borderColor: [
      'dark',
      'hover'
    ],
    textColor: [
      'dark',
      'hover',
      'group-hover',
      'focus'
    ],
    margin: [
      'first',
      'last',
      'responsive'
    ],
    padding: [
      'first',
      'last',
      'responsive'
    ]
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
