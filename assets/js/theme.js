const html = document.documentElement;

export default class Theme {
  constructor() {
    this.onChange = dark => {};

    const theme = localStorage.getItem('theme');
    if (theme) {
      html.classList.toggle('dark', theme === 'dark');
    }
  }

  get isDark() {
    return html.classList.contains('dark');
  }

  toggle() {
    const dark = html.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    this.onChange(dark);
  }
}
