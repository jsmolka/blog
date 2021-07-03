import initMenu from './menu';

// TODO: save volume in localestorage

export default class AudioPlayer {
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
    this.volumeButton = container.querySelector('.audio-volume-button');
    this.volumeMenu = container.querySelector('.audio-volume-menu');

    // NO EARRAPE IN DEV
    this.audio.volume = 0.1;

    this.initEvents();

    AudioPlayer.instances.push(this);
  }

  get isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  }

  initEvents() {
    this.audio.addEventListener('loadedmetadata', () => this.updateTime());  // TODO: enabled interactions after this, call initEvents in here?
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

    initMenu(this.volumeMenu, this.volumeButton);
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
    return /* html */ `
      <div class="flex items-center w-full px-2 py-2 bg-var-background-secondary rounded-sm shadow-sm">
        <div id="audioPlayPauseButton" class="pb-px text-var-color-secondary hover:text-var-color select-none cursor-pointer">
          <svg id="audioPlayIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0.5">
          <path d="M9 8.482v7.036L15.03 12 9 8.482zM7.752 5.44l10.508 6.13a.5.5 0 0 1 0 .863l-10.508 6.13A.5.5 0 0 1 7 18.128V5.871a.5.5 0 0 1 .752-.432z" />
          </svg>
          <svg id="audioPauseIcon" class="hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
            <path d="M15 7a1 1 0 0 1 2 0v10a1 1 0 1 1-2 0V7zM7 7a1 1 0 1 1 2 0v10a1 1 0 1 1-2 0V7z" />
          </svg>
        </div>
        <div id="audioTime" class="ml-2 text-sm">0:00 / 0:00</div>
        <div id="audioProgressBar" class="flex flex-1 mx-3.5 py-2 cursor-pointer">
          <div class="flex flex-1 h-1 bg-var-background-tertiary">
            <div id="audioProgress" class="bg-var-accent"></div>
          </div>
        </div>
        <div class="relative">
          <div class="audio-volume-button text-var-color-secondary hover:text-var-color select-none cursor-pointer">
            <svg id="audioPlayIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0.5">
              <path d="M13 7.22L9.603 10H6v4h3.603L13 16.78V7.22zM8.889 16H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L8.89 16zm9.974.591l-1.422-1.422A3.993 3.993 0 0 0 19 12c0-1.43-.75-2.685-1.88-3.392l1.439-1.439A5.991 5.991 0 0 1 21 12c0 1.842-.83 3.49-2.137 4.591z" />
            </svg>
          </div>
          <div class="audio-volume-menu hidden">
            <div class="absolute top-12 right-4 bg-var-accent px-2 py-8">
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
