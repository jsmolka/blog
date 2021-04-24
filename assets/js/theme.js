class Theme {
  constructor() {
    this.onChanged = dark => {};
  }

  get classList() {
    return document.getElementsByTagName('html')[0].classList;
  }

  get isDark() {
    return this.classList.contains("dark-mode");
  }

  updateMetaColor(dark) {
    const meta = document.querySelector('meta[name=theme-color]');

    meta.setAttribute('content', dark ? '#24292E' : '#f5f5f5');
  }

  init() {
    const theme = window.localStorage.getItem('theme');
    const dark = this.classList.toggle('dark-mode', theme == null || theme === 'dark');

    this.updateMetaColor(dark);
  }

  toggle() {
    const dark = this.classList.toggle('dark-mode');
    window.localStorage.setItem('theme', dark ? 'dark' : 'light');

    this.updateMetaColor(dark);
    this.onChanged(dark);

    return dark;
  }
}

window.theme = new Theme();
window.theme.init();
