import EventHandler from './eventHandler';
import { clamp } from './utils';

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

const icons = {
  play: 'M8 5.14v14l11-7l-11-7z',
  pause: 'M14 19h4V5h-4M6 19h4V5H6v14z',
  muted: 'M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21L21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.916 8.916 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71m-2.5 0c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.05-.2.05-.42.05-.63z',
  volume: 'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77c0-4.28-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9H3z'
};

export default class AudioPlayer {
  static instances = [];

  constructor(container) {
    container.innerHTML += this.template;

    this.time = container.querySelector('.audio-time');

    this.progress = {
      bar: container.querySelector('.audio-progress-bar'),
      barValue: container.querySelector('.audio-progress-bar-value')
    };

    this.playPause = {
      button: container.querySelector('.audio-play-pause-button'),
      buttonPath: container.querySelector('.audio-play-pause-button-path')
    };

    this.volume = {
      container: container.querySelector('.audio-volume-container'),
      bar: container.querySelector('.audio-volume-bar'),
      barValue: container.querySelector('.audio-volume-bar-value'),
      button: container.querySelector('.audio-volume-button'),
      buttonPath: container.querySelector('.audio-volume-button-path')
    };

    this.audio = container.getElementsByTagName('audio')[0];
    this.audio.classList.add('hidden');
    this.audio.addEventListener('loadedmetadata', () => {
      if (this.isMobileDevice) {
        this.setVolume(1);
      } else {
        this.setVolume(parseFloat(localStorage.getItem('volume') || '0.5'));
      }

      this.updateTime();
      this.initEvents();
    });

    AudioPlayer.instances.push(this);
  }

  get isMobileDevice() {
    // Seems to "work" up until iOS 13
    // https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html
    const isIosAudioQuirk = () => {
      const audio = new Audio();
      audio.volume = 0.5;
      return audio.volume === 1;
    };

    // Apple specific, works on iPad with iOS 14.6
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator#non-standard_properties
    const isIosStandalone = () => {
      return typeof navigator.standalone === 'boolean';
    };

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_tablet_or_desktop
    return /Mobi|Android|iPad|iPhone|iPod/i.test(navigator.userAgent) || isIosStandalone() || isIosAudioQuirk();
  }

  relativePosition(event, element) {
    const getPageX = event => {
      if (event instanceof MouseEvent) {
        return event.pageX;
      } else if (event instanceof TouchEvent) {
        if (event.touches.length > 0) {
          return event.touches[0].pageX;
        } else if (event.targetTouches.length > 0) {
          return event.targetTouches[0].pageX;
        } else if (event.changedTouches.length > 0) {
          return event.changedTouches[event.changedTouches.length - 1].pageX;
        }
      }
      return 0;
    };
    return clamp((getPageX(event) - element.offsetLeft) / element.offsetWidth, 0, 1);
  }

  initEvents() {
    this.audio.addEventListener('play', this.updatePlayPauseIcon.bind(this));
    this.audio.addEventListener('pause', this.updatePlayPauseIcon.bind(this));
    this.audio.addEventListener('ended', this.updatePlayPauseIcon.bind(this));
    this.audio.addEventListener('timeupdate', () => {
      this.updateTime();
      this.updateProgress();
    });

    this.playPause.button.addEventListener('click', () => {
      if (this.audio.paused) {
        this.play();
      } else {
        this.pause();
      }
    });

    this.initProgressEvents();
    this.initVolumeEvents();
  }

  initProgressEvents() {
    const handler = new BarEventHandler(this.progress.bar);

    const setCurrentTime = event => {
      this.audio.currentTime = this.relativePosition(event, this.progress.barValue.parentNode) * this.audio.duration;
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
    };

    handler.onUp = event => {
      setCurrentTime(event);
      if (!wasPaused) {
        this.play();
      }
    };
  }

  initVolumeEvents() {
    if (this.isMobileDevice) {
      this.volume.button.addEventListener('click', () => {
        this.audio.muted = !this.audio.muted;
        this.updateVolumeIcon();
      });
    } else {
      let hovered = false;
      let grabbed = false;

      const updateUi = () => {
        const show = hovered || grabbed;
        this.volume.bar.classList.toggle('w-20', show);
        this.volume.bar.classList.toggle('w-0', !show);
        this.volume.button.classList.toggle('text-var-audio-secondary', show);
        this.volume.button.classList.toggle('text-var-audio', !show);
      };

      this.volume.container.addEventListener('mouseenter', () => {
        hovered = true;
        updateUi();
      });

      this.volume.container.addEventListener('mouseleave', () => {
        hovered = false;
        updateUi();
      });

      const handler = new BarEventHandler(this.volume.bar);

      handler.onDown = event => {
        this.setVolume(this.relativePosition(event, this.volume.barValue.parentNode));
      };

      handler.onMove = event => {
        this.setVolume(this.relativePosition(event, this.volume.barValue.parentNode));
        grabbed = true;
        updateUi();
      };

      handler.onUp = event => {
        this.setVolume(this.relativePosition(event, this.volume.barValue.parentNode));
        grabbed = false;
        updateUi();
      };
    }
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

  setVolume(volume) {
    volume = clamp(volume, 0, 1);

    this.audio.volume = Math.pow(volume, 3);
    this.volume.barValue.style.width = 100 * volume + "%";
    localStorage.setItem('volume', volume.toString());

    this.updateVolumeIcon();
  }

  updateTime() {
    const format = time => {
      time = isNaN(time) ? 0 : time;

      const min = Math.floor(time / 60);
      const sec = Math.floor(time % 60);

      return `${min}:${(sec < 10) ? `0${sec}` : sec}`;
    };

    this.time.innerHTML = `${format(this.audio.currentTime)} / ${format(this.audio.duration)}`;
  }

  updateProgress() {
    this.progress.barValue.style.width = 100 * (this.audio.currentTime / this.audio.duration) + "%";
  }

  updatePlayPauseIcon() {
    this.playPause.buttonPath.attributes.d.value = this.audio.paused
      ? icons.play
      : icons.pause;
  }

  updateVolumeIcon() {
    this.volume.buttonPath.attributes.d.value = this.audio.muted || this.audio.volume === 0
      ? icons.muted
      : icons.volume;
  }

  get template() {
    return /* html */ `
      <div class="flex items-center pl-2 pr-2.5 py-2 bg-var-background-secondary rounded-sm shadow-sm">
        <svg class="audio-play-pause-button ripple mb-px text-var-audio hover:text-var-audio-secondary rounded-sm select-none cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path class="audio-play-pause-button-path" d="${icons.play}" />
        </svg>
        <div class="audio-time ml-2 text-sm text-var-audio-secondary">0:00 / 0:00</div>
        <div class="audio-progress-bar flex flex-1 ml-3.5 mr-3 py-2 cursor-pointer">
          <div class="flex flex-1 h-1 bg-var-background-tertiary">
            <div class="audio-progress-bar-value bg-var-audio"></div>
          </div>
        </div>
        <div class="audio-volume-container flex items-center">
          <div class="audio-volume-bar flex w-0 py-2 cursor-pointer transition-width duration-500 ease-in-out">
            <div class="flex flex-1 h-1 ml-1.5 mr-3 bg-var-background-tertiary">
              <div class="audio-volume-bar-value bg-var-audio"></div>
            </div>
          </div>
          <svg class="audio-volume-button text-var-audio hover:text-var-audio-secondary select-none cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path class="audio-volume-button-path" d="${icons.volume}" />
          </svg>
        </div>
      </div>
    `;
  }
}
