class AudioPlayer {
  static instances = [];

  constructor(container) {
    this.container = container;
    this.container.innerHTML += AudioPlayer.template;
    this.audio = container.getElementsByTagName('audio')[0];
    this.audio.removeAttribute('controls');
    this.playPauseButton = container.querySelector('#audioPlayPauseButton');

    this.initEvents();

    AudioPlayer.instances.push(this);
  }

  initEvents() {
    this.audio.addEventListener('play', () => this.playing = true);
    this.audio.addEventListener('pause', () => this.playing = false);
    this.audio.addEventListener('ended', () => this.playing = false);
    this.playPauseButton.addEventListener('click', () => this.toggle());
  }

  play() {
    for (const instance of AudioPlayer.instances) {
      instance.pause();
    }
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  toggle() {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  updatePlayPauseIcon() {
    const playIcon = this.container.querySelector('#audioPlayIcon');
    const pauseIcon = this.container.querySelector('#audioPauseIcon');

    playIcon.classList.toggle('hidden', this.playing);
    pauseIcon.classList.toggle('hidden', !this.playing);
  }

  get playing() {
    return this._playing ?? false;
  }

  set playing(value) {
    this._playing = value;
    this.updatePlayPauseIcon();
  }

  static get template() {
    return `
      <div class="flex items-center w-full px-3 py-2 bg-var-background-secondary">
        <div id="audioPlayPauseButton" class="select-none">
          <svg id="audioPlayIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <svg id="audioPauseIcon" class="hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </div>
      </div>
    `;
  }
}

for (const container of document.getElementsByClassName('audio-container')) {
  new AudioPlayer(container);
}
