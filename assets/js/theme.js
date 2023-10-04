const html = document.documentElement;
const pcsd = window.matchMedia('(prefers-color-scheme: dark)');

class Theme {
  constructor() {
    this.callbacks = [];
    this.theme = this.theme;

    pcsd.addEventListener('change', ({ matches }) => {
      if (this.theme === 'system') {
        this.dark = matches;
      }
    });
  }

  get theme() {
    return localStorage.getItem('theme') ?? 'system';
  }

  set theme(theme) {
    html.setAttribute('theme', theme);
    localStorage.setItem('theme', theme);
    this.dark = this.dark;
  }

  get dark() {
    switch (this.theme) {
      case 'system':
        return pcsd.matches;
      case 'dark':
        return true;
    }
    return false;
  }

  set dark(value) {
    html.classList.toggle('dark', value);
    for (const callback of this.callbacks) {
      callback(value);
    }
  }
}

window.theme = new Theme();
