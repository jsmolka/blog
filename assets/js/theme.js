const html = document.documentElement;

function updateThemeColor(dark) {
  const meta = document.querySelector('meta[name=theme-color]');
  meta?.setAttribute('content', dark ? '#292a2d' : '#ffffff');
}

function init() {
  const theme = localStorage.getItem('theme');

  const dark = theme
    ? theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;

  html.classList.toggle('dark', dark);
  updateThemeColor(dark);
}

export default class Theme {
  constructor() {
    init();

    this.onChange = dark => {};
  }

  get isDark() {
    return html.classList.contains('dark');
  }

  toggle() {
    const dark = html.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    updateThemeColor(dark);
    this.onChange(dark);
  }
}

window.theme = new Theme();
