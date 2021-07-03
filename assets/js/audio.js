import EventHandler from "./eventHandler";

// TODO: save volume in localestorage, set volume globally
// TODO: mobile can only mute / unmute

class BarEventHandler {
  constructor(bar) {
    this.onDown = event => {};
    this.onMove = event => {};
    this.onUp = event => {};

    new EventHandler(bar).onDown(event => {
      if (event.button === 2) {
        return;
      }

      window.document.body.classList.add('select-none');
      window.document.body.classList.add('cursor-pointer');

      this.onDown(event);

      const handler = new EventHandler(window);

      handler.onMove(event => {
        this.onMove(event);
      });

      handler.onUp(event => {
        handler.offAll();

        window.document.body.classList.remove('select-none');
        window.document.body.classList.remove('cursor-pointer');

        this.onUp(event);
      })
    });
  }
}

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
    this.volumeContainer = container.querySelector('.audio-volume-container');
    this.volumeButton = container.querySelector('.audio-volume-button');
    this.volume = container.querySelector('.audio-volume');
    this.volumeBar = container.querySelector('.audio-volume-bar');

    this.audio.volume = 0.1;
    this.audio.addEventListener('loadedmetadata', () => {
      this.initEvents();
      this.updateVolume();
      this.updateTime();
    });

    AudioPlayer.instances.push(this);
  }

  get isVolumeAdjustable() {
    const volume = this.audio.volume;
    const volumeTest = volume < 0.5 ? (volume + 0.01) : (volume - 0.01);

    this.audio.volume = volumeTest;
    const adjustable = this.audio.volume === volumeTest;
    this.audio.volume = volume;

    return adjustable;
  }

  calcRelativePosition(event, element) {
    return Math.min(1, Math.max(0, ((event.pageX ?? event?.touches[0]?.pageX ?? 0) - element.offsetLeft) / element.offsetWidth));
  }

  initEvents() {
    this.audio.addEventListener('play', this.updatePlayPause.bind(this));
    this.audio.addEventListener('pause', this.updatePlayPause.bind(this));
    this.audio.addEventListener('ended', this.updatePlayPause.bind(this));
    this.audio.addEventListener('timeupdate', () => {
      this.updateProgress();
      this.updateTime();
    });

    this.playPauseButton.addEventListener('click', () => this.toggle());

    this.initProgressEvents();
    this.initVolumeEvents();
  }

  initProgressEvents() {
    const handler = new BarEventHandler(this.progressBar);

    const setCurrentTime = event => {
      this.audio.currentTime = this.calcRelativePosition(event, this.progressBar) * this.audio.duration;
    };

    let wasPaused = false;

    handler.onDown = event => {
      wasPaused = this.audio.paused;
      if (!wasPaused) {
        this.pause()
      }
      setCurrentTime(event);
    };

    handler.onMove = event => {
      setCurrentTime(event);
    }

    handler.onUp = event => {
      setCurrentTime(event);
      if (!wasPaused) {
        this.play();
      }
    }
  }

  initVolumeEvents() {
    if (this.isVolumeAdjustable) {
      let volumeHovered = false;
      let volumeGrabbed = false;

      const updateLayout = () => {
        const show = volumeHovered || volumeGrabbed;
        this.volumeBar.classList.toggle('w-20', show);
        this.volumeBar.classList.toggle('w-0', !show);
      };

      this.volumeContainer.addEventListener('mouseenter', () => {
        volumeHovered = true;
        updateLayout();
      });

      this.volumeContainer.addEventListener('mouseleave', () => {
        volumeHovered = false;
        updateLayout();
      });

      const handler = new BarEventHandler(this.volumeBar);

      const setVolume = event => {
        this.audio.volume = this.calcRelativePosition(event, this.volumeBar);
        this.updateVolume();
      };

      handler.onDown = event => {
        setVolume(event);
      };

      handler.onMove = event => {
        setVolume(event);
        volumeGrabbed = true;
        updateLayout();
      };

      handler.onUp = event => {
        setVolume(event);
        volumeGrabbed = false;
        updateLayout();
      };
    } else {
      // Todo: update icon
      this.volumeButton.addEventListener('click', () => this.audio.muted = !this.audio.muted);
    }
  }

  play() {
    for (const instance of AudioPlayer.instances) {
      instance.pause();
    }
    return this.audio.play();
  }

  pause() {
    return this.audio.pause();
  }

  toggle() {
    if (this.audio.paused) {
      return this.play();
    } else {
      return this.pause();
    }
  }

  static formatTime(time) {
    time = isNaN(time) ? 0 : time;

    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);

    return `${min}:${(sec < 10) ? `0${sec}` : sec}`;
  }

  updateVolume() {
    this.volume.style.width = 100 * this.audio.volume + "%";
  }

  updateProgress() {
    this.progress.style.width = 100 * (this.audio.currentTime / this.audio.duration) + "%";
  }

  updateTime() {
    this.time.innerHTML = `${AudioPlayer.formatTime(this.audio.currentTime)} / ${AudioPlayer.formatTime(this.audio.duration)}`;
  }

  updatePlayPause() {
    const playIcon = this.container.querySelector('#audioPlayIcon');
    const pauseIcon = this.container.querySelector('#audioPauseIcon');

    playIcon.classList.toggle('hidden', !this.audio.paused);
    pauseIcon.classList.toggle('hidden', this.audio.paused);
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
        <div id="audioProgressBar" class="flex flex-1 ml-3.5 mr-3 py-2 cursor-pointer">
          <div class="flex flex-1 h-1 bg-var-background-tertiary">
            <div id="audioProgress" class="bg-var-accent"></div>
          </div>
        </div>
        <div class="audio-volume-container flex items-center">
          <div class="audio-volume-bar flex py-2 cursor-pointer w-0 transition-width duration-500 ease-in-out">
            <div class="flex flex-1 h-1 ml-1.5 mr-3 bg-var-background-tertiary">
              <div class="audio-volume bg-var-accent"></div>
            </div>
          </div>
          <div class="audio-volume-button text-var-color-secondary group-hover:text-var-color select-none cursor-pointer">
            <svg id="audioPlayIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0.5">
              <path d="M13 7.22L9.603 10H6v4h3.603L13 16.78V7.22zM8.889 16H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L8.89 16zm9.974.591l-1.422-1.422A3.993 3.993 0 0 0 19 12c0-1.43-.75-2.685-1.88-3.392l1.439-1.439A5.991 5.991 0 0 1 21 12c0 1.842-.83 3.49-2.137 4.591z" />
            </svg>
          </div>
        </div>
      </div>
    `;
  }
}
