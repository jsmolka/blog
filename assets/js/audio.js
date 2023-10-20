import storage from "./storage";
import { clamp, isMobileDevice, onIntersect } from "./utils";

const instances = [];

export default function Audio(src) {
  return {
    $template: /* html */ `
      <div class="audio">
        <audio ref="audio" hidden type="audio/mp3" preload="metadata"></audio>
        <button ref="stateButton">
          <svg width="18" height="18" viewBox="5 5 14 14">
            <path fill="currentColor" :d="paused ? icon.play : icon.pause" />
          </svg>
        </button>
        <div class="time">{{ format(time) }} / {{ format(duration) }}</div>
        <div class="bar" ref="progressBar">
          <div class="seeker" :style="{ '--value': duration ? time / duration : 0 }"></div>
        </div>
        <div class="volume" ref="volume">
          <div class="volume-bar-wrapper" :style="{ width: showVolume ? '5rem' : 0 }">
            <div class="bar" ref="volumeBar">
              <div class="seeker" :style="{ '--value': muted ? 0 : volume }"></div>
            </div>
          </div>
          <button ref="volumeButton">
            <svg width="18" height="18" viewBox="3 3 18 18">
              <path fill="currentColor" :d="muted || volume === 0 ? icon.speakerMuted : icon.speaker" />
            </svg>
          </button>
        </div>
      </div>
    `,

    time: 0,
    duration: 0,
    paused: true,
    muted: false,
    showVolume: 0,

    icon: {
      play: "M8 5.14v14l11-7l-11-7z",
      pause: "M14 19h4V5h-4M6 19h4V5H6v14z",
      speaker:
        "M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77c0-4.28-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9H3z",
      speakerMuted:
        "M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21L21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.916 8.916 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71m-2.5 0c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.05-.2.05-.42.05-.63z",
    },

    mounted(element) {
      this.volume = this.volume;

      this.audio.addEventListener("loadedmetadata", this.init);

      onIntersect(element, () => this.audio.setAttribute("src", src), { rootMargin: "256px" });
    },

    init() {
      for (const event of [
        "durationchange",
        "ended",
        "pause",
        "play",
        "playing",
        "seeked",
        "stalled",
        "timeupdate",
        "volumechange",
        "waiting",
      ]) {
        this.audio.addEventListener(event, this.update);
      }

      this.$refs.stateButton.addEventListener("click", () => {
        if (this.audio.paused) {
          this.play();
        } else {
          this.pause();
        }
      });

      this.initProgressBar();
      this.initVolumeBar();
      this.update();

      instances.push(this);
    },

    initBar(element, opts) {
      const onMove = (event) => opts.onMove(clamp((event.pageX - element.offsetLeft) / element.offsetWidth, 0, 1));
      const onMoveBegin = opts.onMoveBegin;
      const onMoveEnd = opts.onMoveEnd;

      element.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) {
          return;
        }

        const cursor = window.document.body.style.cursor;
        const select = window.document.body.style.userSelect;

        const up = (event) => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", up);
          window.document.body.style.cursor = cursor;
          window.document.body.style.userSelect = select;
          onMove(event);
          onMoveEnd();
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", up);
        window.document.body.style.cursor = "pointer";
        window.document.body.style.userSelect = "none";
        onMoveBegin();
        onMove(event);
      });
    },

    initProgressBar() {
      let paused = false;

      this.initBar(this.$refs.progressBar, {
        onMove: (position) => {
          this.audio.currentTime = position * this.audio.duration;
        },
        onMoveBegin: () => {
          paused = this.audio.paused;
          if (!paused) {
            this.pause();
          }
        },
        onMoveEnd: () => {
          if (!paused) {
            this.play();
          }
        },
      });
    },

    initVolumeBar() {
      this.$refs.volumeButton.addEventListener("click", () => {
        this.audio.muted = !this.audio.muted;
      });

      if (!isMobileDevice()) {
        this.$refs.volume.addEventListener("pointerenter", () => this.showVolume++);
        this.$refs.volume.addEventListener("pointerleave", () => this.showVolume--);

        this.initBar(this.$refs.volumeBar, {
          onMove: (volume) => {
            this.volume = volume;
          },
          onMoveBegin: () => this.showVolume++,
          onMoveEnd: () => this.showVolume--,
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

    get audio() {
      return this.$refs.audio;
    },

    get volume() {
      return isMobileDevice() ? 1 : storage.get("volume", 0.5);
    },

    set volume(value) {
      this.audio.muted = false;
      this.audio.volume = Math.pow(value, 3);
      storage.set("volume", value);
    },

    format(time) {
      const min = String(Math.floor(time / 60));
      const sec = String(Math.floor(time % 60));
      return `${min}:${sec.padStart(2, "0")}`;
    },

    update() {
      this.time = this.audio.currentTime;
      this.duration = this.audio.duration;
      this.paused = this.audio.paused;
      this.muted = this.audio.muted;
    },
  };
}
