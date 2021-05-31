class Theme {
  constructor() {
    this.onChanged = dark => {};
  }

  get isDark() {
    return document.documentElement.classList.contains('dark');
  }

  init() {
    const dark = !!localStorage.getItem('dark');
    document.documentElement.classList.toggle('dark', dark);
  }

  toggle() {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('dark', dark);
    this.onChanged(dark);

    return dark;
  }
}

window.theme = new Theme();
window.theme.init();
