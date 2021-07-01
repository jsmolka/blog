class AudioPlayer {
  static instances = [];

  constructor(container) {
    this.container = container;
    this.container.innerHTML += AudioPlayer.template;
    this.audio = container.getElementsByTagName('audio')[0];
    this.audio.removeAttribute('controls');
    this.progress = container.querySelector('#audioProgress');
    this.progressBar = container.querySelector('#audioProgressBar');
    this.playPauseButton = container.querySelector('#audioPlayPauseButton');

    // NO EARRAPE IN DEV
    this.audio.volume = 0.1;

    this.initEvents();

    AudioPlayer.instances.push(this);
  }

  get isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  }

  initEvents() {
    this.audio.addEventListener('play', () => this.playing = true);
    this.audio.addEventListener('pause', () => this.playing = false);
    this.audio.addEventListener('ended', () => this.playing = false);
    this.audio.addEventListener('timeupdate', () => {
      this.progress.style.width = 100 * (this.audio.currentTime / this.audio.duration) + "%";
   });

   const start = this.isTouchDevice ? 'touchstart' : 'mousedown';
   const move = this.isTouchDevice ? 'touchmove' : 'mousemove';
   const end = this.isTouchDevice ? 'touchend' : 'mouseup';

   this.progressBar.addEventListener(start, () => {
      const wasPlaying = this.playing;

      // Todo: don't pause on click?
      this.pause();

      const update = event => {
        const pageX = event.pageX ?? event?.touches[0]?.pageX ?? 0;
        const position = (pageX - this.progressBar.offsetLeft) / this.progressBar.offsetWidth;
        this.audio.currentTime = position * this.audio.duration;
      }

      const finish = () => {
        if (wasPlaying) {
          this.play();
        }

        window.document.body.classList.remove('select-none');
        window.removeEventListener(move, update);
        window.removeEventListener(end, update);
        window.removeEventListener(end, finish);
      };

      window.document.body.classList.add('select-none');
      window.addEventListener(move, update);
      window.addEventListener(end, update);
      window.addEventListener(end, finish);
    });

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
        <div id="audioPlayPauseButton" class="select-none cursor-pointer">
          <svg id="audioPlayIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <svg id="audioPauseIcon" class="hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </div>
        <div id="audioProgressBar" class="flex flex-1 h-1 mx-2 my-2 bg-var-background">
          <div id="audioProgress" class="bg-var-accent"></div>
        </div
      </div>
    `;
  }
}

for (const container of document.getElementsByClassName('audio-container')) {
  new AudioPlayer(container);
}
