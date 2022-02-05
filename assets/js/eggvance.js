let id = 0;

function write(data, ext) {
  const filename = `${this.id++}.${ext}`;
  FS.writeFile(filename, data);
  return filename;
}

const canvas = document.getElementById('canvas');

window.Module = {
  canvas,
  pending: false,

  onRuntimeInitialized() {
    this.updateBackground(window.theme.isDark);
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
    this.eggvanceLoadGba(write(data, 'gba'));
  },

  async loadSav(input) {
    const data = await this.readFile(input);
    this.eggvanceLoadSav(write(data, 'sav'));
  },

  async loadDemo(button) {
    if (this.pending) {
      return;
    }

    this.pending = true;
    button.innerHTML = 'Loading...';
    try {
      const data = await this.readUrl('/data/celeste.gba');
      this.eggvanceLoadGba(write(data, 'gba'));
    } catch (error) {
      console.error(error);
    } finally {
      this.pending = false;
      button.innerHTML = 'Load demo';
    }
  },

  updateBackground(dark) {
    this.eggvanceSetBackground(dark ? 0xff1b1f24 : 0xffffffff);
  }
};

window.onload = () => {
  window.theme.on('change', dark => {
    Module.updateBackground(dark);
  });

  const ratio = 2 / 3;
  const style = document.createElement('style');
  style.appendChild(
    document.createTextNode(
      `#canvas { width: ${canvas.clientWidth}px; height: ${ratio * canvas.clientWidth}px }`
    )
  );
  document.head.appendChild(style);

  window.addEventListener('resize', () => {
    style.remove();
    canvas.height = ratio * canvas.width;
  });
}
