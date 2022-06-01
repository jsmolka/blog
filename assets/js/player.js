import { clamp } from './utils';

function initEventsBar(element, events) {
  element.addEventListener('pointerdown', (event) => {
    if (event.button === 2) {
      return;
    }

    const up = (event) => {
      window.removeEventListener('pointermove', events.update);
      window.removeEventListener('pointerup', up);
      window.document.body.classList.remove('cursor-pointer', 'select-none');
      events.update(event);
      events.up(event);
    };

    window.addEventListener('pointermove', events.update);
    window.addEventListener('pointerup', up);
    window.document.body.classList.add('cursor-pointer', 'select-none');
    events.update(event);
    events.down(event);
  });
}

function offsetRatio(event, element) {
  return clamp((event.pageX - element.offsetLeft) / element.offsetWidth, 0, 1);
}

const instances = [];

export default function Player() {
  return {
    $template: /* html */ `
      <div class="flex items-center bg-backdrop-1 text-neutral-4 border border-backdrop-3 rounded-sm touch-action-none">
        <button ref="stateButton" class="p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path :d="paused ? icons.play : icons.pause"></path>
          </svg>
        </button>
        <div class="text-sm font-feature-tnum">{{ format(time) }} / {{ format(duration) }}</div>
        <div ref="progressBar" class="flex flex-1 ml-3 py-2 cursor-pointer">
          <div ref="progressBarInner" class="flex flex-1 h-1 bg-backdrop-3">
            <div class="bg-backdrop-9" :style="{ width: 100 * (time / duration) + '%' }" ></div>
          </div>
        </div>
        <div ref="volumeContainer" class="flex items-center ml-1">
          <div ref="volumeBar" :class="volumeHover || volumeActive ? 'w-20' : 'w-0'" class="flex py-2 transition-width duration-500 ease-in-out cursor-pointer">
            <div ref="volumeBarInner" class="flex flex-1 h-1 ml-3 mr-1 bg-backdrop-3">
              <div class="bg-backdrop-9" :style="{ width: 100 * volume + '%' }"></div>
            </div>
          </div>
          <button ref="volumeButton" class="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path :d="muted || volume === 0 ? icons.speakerMuted : icons.speaker"></path>
            </svg>
          </button>
        </div>
      </div>
    `,

    time: 0,
    duration: 0,
    paused: true,
    muted: false,
    volume: 0.66,
    volumeHover: false,
    volumeActive: false,
    icons: {
      play: 'M8 5.14v14l11-7l-11-7z',
      pause: 'M14 19h4V5h-4M6 19h4V5H6v14z',
      speaker: 'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77c0-4.28-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9H3z',
      speakerMuted: 'M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21L21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.916 8.916 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71m-2.5 0c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.05-.2.05-.42.05-.63z',
    },

    mounted(element) {
      this.audio = element.parentElement.getElementsByTagName('audio')[0];
      this.audio.addEventListener('loadedmetadata', () => {
        if (this.isMobileDevice) {
          this.setVolume(this.volume);
        } else {
          this.setVolume(parseFloat(localStorage.getItem('volume') ?? this.volume));
        }
        this.initEvents();
        this.query();

        instances.push(this);
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
      const query = this.query.bind(this);
      this.audio.addEventListener('play', query);
      this.audio.addEventListener('pause', query);
      this.audio.addEventListener('ended', query);
      this.audio.addEventListener('stalled', query);
      this.audio.addEventListener('waiting', query);
      this.audio.addEventListener('timeupdate', query);
      this.audio.addEventListener('durationchange', query);
      this.audio.addEventListener('volumechange', query);

      this.$refs.stateButton.addEventListener('click', () => {
        if (this.audio.paused) {
          this.play();
        } else {
          this.pause();
        }
      });

      this.initEventsProgress();
      this.initEventsVolume();
    },

    initEventsProgress() {
      let wasPaused = false;
      initEventsBar(this.$refs.progressBar, {
        update: (event) => {
          this.audio.currentTime = offsetRatio(event, this.$refs.progressBarInner) * this.audio.duration;
        },
        down: () => {
          wasPaused = this.audio.paused;
          if (!wasPaused) {
            this.pause()
          }
        },
        up: () => {
          if (!wasPaused) {
            this.play();
          }
        },
      });
    },

    initEventsVolume() {
      if (this.isMobileDevice) {
        this.$refs.volumeButton.addEventListener('click', () => this.audio.muted = !this.audio.muted);
      } else {
        this.$refs.volumeContainer.addEventListener('pointerenter', () => this.volumeHover = true);
        this.$refs.volumeContainer.addEventListener('pointerleave', () => this.volumeHover = false);

        initEventsBar(this.$refs.volumeBar, {
          update: (event) => this.setVolume(offsetRatio(event, this.$refs.volumeBarInner)),
          down: () => this.volumeActive = true,
          up: () => this.volumeActive = false,
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
      localStorage.setItem('volume', this.volume);
    },

    format(time) {
      time = isNaN(time) ? 0 : time;

      const mins = Math.floor(time / 60).toString();
      const secs = Math.floor(time % 60).toString();

      return `${mins}:${secs.padStart(2, '0')}`;
    },

    query() {
      this.time = this.audio.currentTime;
      this.duration = this.audio.duration;
      this.paused = this.audio.paused;
      this.muted = this.audio.muted;
    },
  };
}
