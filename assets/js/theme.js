class Theme {
  constructor() {
    const theme = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', theme === 'dark');

    this.onChanged = dark => {};
  }

  get isDark() {
    return document.documentElement.classList.contains('dark');
  }

  toggle() {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    this.onChanged(dark);

    return dark;
  }
}

window.theme = new Theme();
