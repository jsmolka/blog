window.Module = {
  id: 0,
  canvas: document.getElementById('canvas'),
  pending: false,

  onRuntimeInitialized() {
    this.updateBackground(window.theme.dark);
  },

  async readUrl(url) {
    return new Promise((resolve) => {
      const request = new XMLHttpRequest();
      request.open('GET', url);
      request.responseType = 'arraybuffer';
      request.onload = () => resolve(new Uint8Array(request.response));
      request.send();
    });
  },

  async readFile(input) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result));
      reader.readAsArrayBuffer(input.files[0]);
      input.value = '';
    });
  },

  writeFile(data, ext) {
    const name = `${this.id++}.${ext}`;
    FS.writeFile(name, data);
    return name;
  },

  async loadGba(input) {
    const data = await this.readFile(input);
    const name = this.writeFile(data, 'gba');
    this.eggvanceLoadGba(name);
  },

  async loadSav(input) {
    const data = await this.readFile(input);
    const name = this.writeFile(data, 'sav');
    this.eggvanceLoadSav(name);
  },

  async loadDemo(button) {
    if (this.pending) {
      return;
    }

    this.pending = true;
    button.innerHTML = 'Loading...';
    try {
      const data = await this.readUrl('/data/celeste.gba');
      const name = this.writeFile(data, 'gba');
      this.eggvanceLoadGba(name);
    } catch (error) {
      console.error(error);
    } finally {
      this.pending = false;
      button.innerHTML = 'Load demo';
    }
  },

  updateBackground(dark) {
    this.eggvanceSetBackground(dark ? 0xff22272e : 0xffffffff);
  }
};

window.onload = () => {
  window.theme.callbacks.push((dark) => {
    Module.updateBackground(dark);
  });
};
