import { clamp, isMobileDevice } from './utils';

function makeBar(element) {
  const bar = {
    onMove: null,
    onMoveBegin: null,
    onMoveEnd: null,
  };

  const onMove = (event) => bar.onMove(clamp((event.pageX - element.offsetLeft) / element.offsetWidth, 0, 1));
  const onMoveBegin = () => bar.onMoveBegin();
  const onMoveEnd = () => bar.onMoveEnd();

  element.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) {
      return;
    }

    const up = (event) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', up);
      window.document.body.classList.remove('cursor-pointer', 'select-none');
      onMove(event);
      onMoveEnd();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', up);
    window.document.body.classList.add('cursor-pointer', 'select-none');
    onMoveBegin();
    onMove(event);
  });

  return bar;
}

const instances = [];

export default function Audio(src) {
  return {
    $template: /* html */ `
      <div class="lozad flex items-center bg-elevate-2 text-[#8693a2] dark:text-[#707f8e] text-sm border border-elevate-3 rounded-sm touch-action-none">
        <audio ref="audio" class="hidden" :data-src="src" type="audio/mp3" preload="metadata"></audio>
        <button ref="stateButton" class="p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path :d="paused ? icons.play : icons.pause"></path>
          </svg>
        </button>
        <div class="font-feature-tnum">{{ format(time) }} / {{ format(duration) }}</div>
        <div ref="progressBar" class="flex flex-1 ml-3 py-2 cursor-pointer">
          <div class="flex flex-1 h-1 bg-elevate-3">
            <div class="bg-[#8693a2] dark:bg-[#707f8e]" :style="{ width: 100 * (time / duration) + '%' }"></div>
          </div>
        </div>
        <div ref="volume" class="flex items-center space-x-1">
          <div :class="volumeHover || volumeActive ? 'w-20' : 'w-0'" class="flex transition-width duration-500 ease-in-out">
            <div ref="volumeBar" class="flex flex-1 ml-4 py-2 cursor-pointer">
              <div class="flex flex-1 h-1 bg-elevate-3">
                <div class="bg-[#8693a2] dark:bg-[#707f8e]" :style="{ width: 100 * (muted ? 0 : volume) + '%' }"></div>
              </div>
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

    src,
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

    mounted() {
      this.audio = this.$refs.audio;
      this.audio.addEventListener('loadedmetadata', () => {
        if (isMobileDevice()) {
          this.setVolume(this.volume);
        } else {
          this.setVolume(parseFloat(localStorage.getItem('volume') ?? this.volume));
        }

        this.init();
        this.update();

        instances.push(this);
      });
    },

    init() {
      const update = () => this.update();
      this.audio.addEventListener('play', update);
      this.audio.addEventListener('pause', update);
      this.audio.addEventListener('ended', update);
      this.audio.addEventListener('stalled', update);
      this.audio.addEventListener('waiting', update);
      this.audio.addEventListener('timeupdate', update);
      this.audio.addEventListener('durationchange', update);
      this.audio.addEventListener('volumechange', update);

      this.$refs.stateButton.addEventListener('click', () => {
        if (this.audio.paused) {
          this.play();
        } else {
          this.pause();
        }
      });

      this.initProgressBar();
      this.initVolumeBar();
    },

    initProgressBar() {
      let paused = false;

      const bar = makeBar(this.$refs.progressBar);
      bar.onMove = (percentage) => {
        this.audio.currentTime = percentage * this.audio.duration;
      };
      bar.onMoveBegin = () => {
        paused = this.audio.paused;
        if (!paused) {
          this.pause()
        }
      };
      bar.onMoveEnd = () => {
        if (!paused) {
          this.play();
        }
      };
    },

    initVolumeBar() {
      this.$refs.volumeButton.addEventListener('click', () => this.audio.muted = !this.audio.muted);

      if (!isMobileDevice()) {
        this.$refs.volume.addEventListener('pointerenter', () => this.volumeHover = true);
        this.$refs.volume.addEventListener('pointerleave', () => this.volumeHover = false);

        const bar = makeBar(this.$refs.volumeBar);
        bar.onMove = (percentage) => this.setVolume(percentage);
        bar.onMoveBegin = () => this.volumeActive = true;
        bar.onMoveEnd = () => this.volumeActive = false;
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
      this.audio.muted = false;
      this.audio.volume = Math.pow(this.volume, 3);
      localStorage.setItem('volume', this.volume);
    },

    format(time) {
      time = isNaN(time) ? 0 : time;

      const mins = Math.floor(time / 60).toString();
      const secs = Math.floor(time % 60).toString();

      return `${mins}:${secs.padStart(2, '0')}`;
    },

    update() {
      this.time = this.audio.currentTime;
      this.duration = this.audio.duration;
      this.paused = this.audio.paused;
      this.muted = this.audio.muted;
    },
  };
}
