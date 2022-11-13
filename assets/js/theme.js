const html = document.documentElement;
const dark = window.matchMedia('(prefers-color-scheme: dark)');

class Theme {
  constructor() {
    this.callbacks = [];
    this.set(this.get());

    dark.addEventListener('change', ({ matches }) => {
      if (this.get() === 'system') {
        this.update(matches);
      }
    });
  }

  get isDark() {
    switch (this.get()) {
      case 'system':
        return dark.matches;
      case 'dark':
        return true;
      }
      return false;
  }

  get() {
    return localStorage.getItem('theme') ?? 'system';
  }

  set(theme) {
    html.setAttribute('theme', theme);
    localStorage.setItem('theme', theme);
    this.update(this.isDark);
  }

  update(dark) {
    html.classList.toggle('dark', dark);
    for (const callback of this.callbacks) {
      callback(dark);
    }
  }
}

window.theme = new Theme();
