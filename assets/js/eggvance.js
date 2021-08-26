import { createApp } from 'petite-vue';

class FileSystem {
  constructor() {
    this.id = 0;
  }

  write(data, ext) {
    const filename = `data${this.id++}.${ext}`;
    FS.writeFile(filename, data);

    return filename;
  }
}

window.Module = {
  fs: new FileSystem(),
  canvas: document.getElementById('canvas'),
  fetching: false,

  onRuntimeInitialized() {
    this.updateBackground(theme.isDark);
  },

  async readUrl(url) {
    return new Promise(resolve => {
      const request = new XMLHttpRequest();

      request.open('GET', url);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        resolve(new Uint8Array(request.response));
      }
      request.send();
    });
  },

  async readFile(input) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(new Uint8Array(reader.result));
      }
      reader.readAsArrayBuffer(input.files[0]);
      input.value = '';
    });
  },

  async loadGba(input) {
    const data = await this.readFile(input);
    this.eggvanceLoadGba(this.fs.write(data, 'gba'));
  },

  async loadDemo(button) {
    if (this.fetching) {
      return;
    }

    this.fetching = true;
    button.innerHTML = 'Loading...';
    try {
      const data = await this.readUrl('/data/celeste.gba');
      this.eggvanceLoadGba(this.fs.write(data, 'gba'));
    } finally {
      this.fetching = false;
      button.innerHTML = 'Load demo';
    }
  },

  async loadSav(input) {
    const data = await this.readFile(input);
    this.eggvanceLoadSav(this.fs.write(data, 'sav'));
  },

  updateBackground(dark) {
    this.eggvanceSetBackground(
      dark
        ? 0xFF292A2D
        : 0xFFFFFFFF
    );
  }
};

createApp().mount();

window.onload = () => {
  window.theme.onChange = dark => {
    Module.updateBackground(dark)
  };

  const canvas = document.getElementById('canvas');
  const width = canvas.clientWidth;
  const height = 2 * width / 3;

  const style = document.createElement('style');
  style.appendChild(document.createTextNode(`#canvas { width: ${width}px; height: ${height}px }`));
  document.head.appendChild(style);

  window.onresize = () => {
    style.remove();
    canvas.height = 2 * canvas.width / 3;
  }
}
