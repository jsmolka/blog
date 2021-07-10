const html = document.documentElement;

function updateMetaThemeColor(dark) {
  const meta = document.querySelector('meta[name=theme-color]');

  meta?.setAttribute('content', dark ? '#252627' : '#fafafa');
}

export default class Theme {
  constructor() {
    const theme = localStorage.getItem('theme');
    if (theme) {
      const dark = theme === 'dark';
      html.classList.toggle('dark', dark);
      updateMetaThemeColor(dark);
    }
    this.onChange = dark => {};
  }

  get isDark() {
    return html.classList.contains('dark');
  }

  toggle() {
    const dark = html.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    updateMetaThemeColor(dark);
    this.onChange(dark);
  }
}
