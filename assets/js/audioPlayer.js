function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function bar(element, events) {
  const down = event => {
    if (event.button === 2) {
      return;
    }

    const up = event => {
      window.removeEventListener('pointermove', events.move);
      window.removeEventListener('pointerup', up);
      window.document.body.classList.remove('cursor-pointer', 'select-none');
      events.up(event);
    };

    window.addEventListener('pointermove', events.move);
    window.addEventListener('pointerup', up);
    window.document.body.classList.add('cursor-pointer', 'select-none');
    events.down(event);
  };

  element.addEventListener('pointerdown', down);
}

function relativeOffset(event, element) {
  return clamp((event.pageX - element.offsetLeft) / element.offsetWidth, 0, 1);
}

const icons = {
  play: 'M8 5.14v14l11-7l-11-7z',
  pause: 'M14 19h4V5h-4M6 19h4V5H6v14z',
  muted: 'M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21L21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.916 8.916 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71m-2.5 0c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.05-.2.05-.42.05-.63z',
  volume: 'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77c0-4.28-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9H3z'
};

const instances = [];

export default function AudioPlayer(props) {
  return {
    $template: /* html */ `
      <div class="flex items-center p-1 text-neutral-2 bg-backdrop-2 rounded-sm touch-action-none">
        <button ref="stateButton" class="p-1 select-none cursor-pointer">
          <svg class="mb-px" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path :d="icon.state"></path>
          </svg>
        </button>
        <div class="ml-1 pb-0.5 text-sm text-center font-feature-tnum">{{ time }}</div>
        <div ref="progressBar" class="flex flex-1 ml-3.5 mr-2 py-2.5 cursor-pointer">
          <div ref="progressBarInner" class="flex flex-1 h-1 bg-backdrop-3">
            <div class="bg-neutral-2" :style="{ width: 100 * progress + '%' }" ></div>
          </div>
        </div>
        <div ref="volumeContainer" class="flex items-center">
          <div ref="volumeBar" :class="isVolumeHovered || isVolumeGrabbed ? 'w-20' : 'w-0'" class="flex py-2.5 transition-width duration-500 ease-in-out">
            <div ref="volumeBarInner" class="flex flex-1 h-1 ml-2.5 mr-2 bg-backdrop-3">
              <div class="bg-neutral-2" :style="{ width: 100 * volume + '%' }"></div>
            </div>
          </div>
          <div ref="volumeButton" class="p-1 select-none cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path :d="icon.volume"></path>
            </svg>
          </div>
        </div>
      </div>
    `,

    time: '0:00 / 0:00',
    progress: 0,
    volume: 0,
    isVolumeHovered: false,
    isVolumeGrabbed: false,
    icon: {
      state: icons.play,
      volume: icons.volume,
    },

    mounted(element) {
      instances.push(this);

      const container = element.parentNode;

      this.audio = container.getElementsByTagName('audio')[0];
      this.audio.classList.add('hidden');
      this.audio.addEventListener('loadedmetadata', () => {
        if (this.isMobileDevice) {
          this.setVolume(0.66);
        } else {
          this.setVolume(parseFloat(localStorage.getItem('volume') ?? '0.66'));
        }
        this.updateTime();
        this.initEvents();
      });
    },

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
    },

    initEvents() {
      this.audio.addEventListener('play', this.updateStateIcon.bind(this));
      this.audio.addEventListener('pause', this.updateStateIcon.bind(this));
      this.audio.addEventListener('ended', this.updateStateIcon.bind(this));
      this.audio.addEventListener('timeupdate', () => {
        this.updateTime();
        this.updateProgress();
      });

      this.$refs.stateButton.addEventListener('click', () => {
        if (this.audio.paused) {
          this.play();
        } else {
          this.pause();
        }
      });

      this.initProgressEvents();
      this.initVolumeEvents();
    },

    initProgressEvents() {
      const update = event => {
        this.audio.currentTime = relativeOffset(event, this.$refs.progressBarInner) * this.audio.duration;
      };

      let paused = false;
      bar(this.$refs.progressBar, {
        down: event => {
          if (!(paused = this.audio.paused)) {
            this.pause()
          }
          update(event);
        },
        move: update,
        up: event => {
          update(event);
          if (!paused) {
            this.play();
          }
        },
      });
    },

    initVolumeEvents() {
      if (this.isMobileDevice) {
        this.$refs.volumeButton.addEventListener('click', () => {
          this.audio.muted = !this.audio.muted;
          this.updateVolumeIcon();
        });
      } else {
        this.$refs.volumeContainer.addEventListener('mouseenter', () => this.isVolumeHovered = true );
        this.$refs.volumeContainer.addEventListener('mouseleave', () => this.isVolumeHovered = false );

        const update = event => {
          this.setVolume(relativeOffset(event, this.$refs.volumeBarInner));
        };

        bar(this.$refs.volumeBar, {
          down: update,
          move: event => {
            update(event);
            this.isVolumeGrabbed = true;
          },
          up: event => {
            update(event);
            this.isVolumeGrabbed = false;
          },
        });
      }
    },

    play() {
      for (const instance of instances) {
        instance.pause();
      }
      this.audio.play();
    },

    pause() {
      this.audio.pause();
    },

    setVolume(volume) {
      this.volume = clamp(volume, 0, 1);
      this.audio.volume = Math.pow(this.volume, 3);
      localStorage.setItem('volume', this.volume.toString());

      this.updateVolumeIcon();
    },

    updateTime() {
      const format = time => {
        time = isNaN(time) ? 0 : time;

        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);

        return `${min}:${(sec < 10) ? `0${sec}` : sec}`;
      };
      this.time = `${format(this.audio.currentTime)} / ${format(this.audio.duration)}`;
    },

    updateProgress() {
      this.progress = this.audio.currentTime / this.audio.duration;
    },

    updateStateIcon() {
      this.icon.state = this.audio.paused
        ? icons.play
        : icons.pause;
    },

    updateVolumeIcon() {
      this.icon.volume = this.audio.muted || this.audio.volume === 0
        ? icons.muted
        : icons.volume;
    },
  };
}
