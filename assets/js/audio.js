// TODO: save volume in localestorage

class AudioPlayer {
  static instances = [];

  constructor(container) {
    this.container = container;
    this.container.innerHTML += AudioPlayer.template;
    this.audio = container.getElementsByTagName('audio')[0];
    this.audio.removeAttribute('controls');
    this.time = container.querySelector('#audioTime');
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
    this.audio.addEventListener('loadedmetadata', () => this.updateTime());
    this.audio.addEventListener('play', () => this.playing = true);
    this.audio.addEventListener('pause', () => this.playing = false);
    this.audio.addEventListener('ended', () => this.playing = false);
    this.audio.addEventListener('timeupdate', () => {
      this.progress.style.width = 100 * (this.audio.currentTime / this.audio.duration) + "%";
      this.updateTime();
    });

    const start = this.isTouchDevice ? 'touchstart' : 'mousedown';
    const move = this.isTouchDevice ? 'touchmove' : 'mousemove';
    const end = this.isTouchDevice ? 'touchend' : 'mouseup';

    this.progressBar.addEventListener(start, event => {
      const wasPlaying = this.playing;

      // Todo: don't pause on click?
      this.pause();

      const update = event => {
        const pageX = event.pageX ?? event?.touches[0]?.pageX ?? 0;
        const position = (pageX - this.progressBar.offsetLeft) / this.progressBar.offsetWidth;
        this.audio.currentTime = position * this.audio.duration;
      }

      update(event);

      const finish = () => {
        if (wasPlaying) {
          this.play();
        }

        window.document.body.classList.remove('select-none');
        window.document.body.classList.remove('cursor-pointer');
        window.removeEventListener(move, update);
        window.removeEventListener(end, update);
        window.removeEventListener(end, finish);
      };

      window.document.body.classList.add('select-none');
      window.document.body.classList.add('cursor-pointer');
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

  static formatTime(time) {
    time = isNaN(time) ? 0 : time;

    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);

    return `${min}:${(sec < 10) ? `0${sec}` : sec}`;
  }

  updateTime() {
    this.time.innerHTML = `${AudioPlayer.formatTime(this.audio.currentTime)} / ${AudioPlayer.formatTime(this.audio.duration)}`;
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
      <div class="flex items-center w-full px-2 py-2 bg-var-background-secondary rounded-sm shadow-sm">
        <div id="audioPlayPauseButton" class="select-none cursor-pointer">
          <svg id="audioPlayIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
            <path d="M7.752 5.439l10.508 6.13a.5.5 0 0 1 0 .863l-10.508 6.13A.5.5 0 0 1 7 18.128V5.871a.5.5 0 0 1 .752-.432z" />
          </svg>
          <svg id="audioPauseIcon" class="hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
            <path d="M15 7a1 1 0 0 1 2 0v10a1 1 0 1 1-2 0V7zM7 7a1 1 0 1 1 2 0v10a1 1 0 1 1-2 0V7z" />
          </svg>
        </div>
        <div id="audioTime" class="ml-2 mr-3.5 text-sm">0:00 / 0:00</div>
        <div id="audioProgressBar" class="flex flex-1 py-2 cursor-pointer">
          <div class="flex flex-1 h-1 bg-var-background">
            <div id="audioProgress" class="bg-var-accent"></div>
          </div>
        </div
      </div>
    `;
  }
}

for (const container of document.getElementsByClassName('audio-container')) {
  new AudioPlayer(container);
}
