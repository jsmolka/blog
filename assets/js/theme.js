const html = document.documentElement;
const pcsd = window.matchMedia('(prefers-color-scheme: dark)');

class Theme {
  constructor() {
    this.callbacks = [];
    this.value = this.value;

    pcsd.addEventListener('change', ({ matches }) => {
      if (this.value === 'system') {
        this.dark = matches;
      }
    });
  }

  get value() {
    return localStorage.getItem('theme') ?? 'system';
  }

  set value(value) {
    html.setAttribute('theme', value);
    localStorage.setItem('theme', value);
    this.dark = this.dark;
  }

  get dark() {
    switch (this.value) {
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
