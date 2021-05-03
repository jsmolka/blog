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

  init() {
    const theme = window.localStorage.getItem('theme');
    this.classList.toggle('dark-mode', theme === 'dark');
  }

  toggle() {
    const dark = this.classList.toggle('dark-mode');
    window.localStorage.setItem('theme', dark ? 'dark' : 'light');

    this.onChanged(dark);

    return dark;
  }
}

window.theme = new Theme();
window.theme.init();
