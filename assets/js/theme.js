const html = document.documentElement;

class Theme {
  constructor() {
    this.callbacks = [];
    this.set(localStorage.getItem('theme') ?? 'system');
  }

  get isDark() {
    switch (html.getAttribute('theme')) {
      case 'system':
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      case 'dark':
        return true;
      case 'light':
        return false;
      default:
        return false;
    }
  }

  set(theme) {
    html.setAttribute('theme', theme);
    localStorage.setItem('theme', theme);

    const dark = html.classList.toggle('dark', this.isDark);
    for (const callback of this.callbacks) {
      callback(dark);
    }
  }
}

window.theme = new Theme();
