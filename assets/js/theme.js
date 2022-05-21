import mitt from 'mitt';

const html = document.documentElement;

class Theme {
  constructor() {
    Object.assign(this, mitt());
    this.set(localStorage.getItem('theme') ?? 'system');
  }

  get isDark() {
    switch (html.getAttribute('theme') ?? 'system') {
      case 'system':
        return matchMedia('(prefers-color-scheme: dark)').matches;
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
    this.emit('change', html.classList.toggle('dark', this.isDark));
  }
}

window.theme = new Theme();
