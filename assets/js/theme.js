import mitt from 'mitt';

const html = document.documentElement;

class Theme {
  constructor() {
    Object.assign(this, mitt());
    this.setMode(localStorage.getItem('theme') ?? 'system');
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

  setMode(mode) {
    html.setAttribute('theme', mode);
    localStorage.setItem('theme', mode);
    this.emit('change', html.classList.toggle('dark', this.isDark));
  }

  setModeSystem() {
    this.setMode('system');
  }

  setModeDark() {
    this.setMode('dark');
  }

  setModeLight() {
    this.setMode('light');
  }
}

window.theme = new Theme();
