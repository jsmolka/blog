import storage from "./storage";
import { clamp, isMobileDevice, onIntersect } from "./utils";

class Bar {
  constructor(element) {
    this.onMove = null;
    this.onMoveBegin = null;
    this.onMoveEnd = null;

    const onMove = (event) => this.onMove(clamp((event.pageX - element.offsetLeft) / element.offsetWidth, 0, 1));
    const onMoveBegin = () => this.onMoveBegin();
    const onMoveEnd = () => this.onMoveEnd();

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
  }
}

const instances = [];

export default function Audio(src) {
  return {
    $template: /* html */ `
      <div class="audio">
        <audio ref="audio" hidden type="audio/mp3" preload="metadata"></audio>
        <button class="state-button" ref="stateButton">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path fill="currentColor" :d="paused ? icon.play : icon.pause" />
          </svg>
        </button>
        <div class="time">{{ format(time) }} / {{ format(duration) }}</div>
        <div class="progress-bar" ref="progressBar">
          <div class="slider" :style="{ '--value': duration === 0 ? 0 : time / duration }"></div>
        </div>
        <div class="volume" ref="volume">
          <div class="volume-bar-wrapper" :style="{ width: volumeInteract ? '5rem' : 0 }">
            <div class="volume-bar" ref="volumeBar">
              <div class="slider" :style="{ '--value': muted ? 0 : volume }"></div>
            </div>
          </div>
          <button class="volume-button" ref="volumeButton">
            <svg width="22" height="22" viewBox="0 0 24 24">
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
    volume: 0.66,
    volumeInteract: 0,
    icon: {
      play: "M8 5.14v14l11-7l-11-7z",
      pause: "M14 19h4V5h-4M6 19h4V5H6v14z",
      speaker:
        "M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77c0-4.28-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9H3z",
      speakerMuted:
        "M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21L21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.916 8.916 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71m-2.5 0c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.05-.2.05-.42.05-.63z",
    },

    mounted(element) {
      this.$refs.audio.addEventListener("loadedmetadata", () => {
        if (isMobileDevice()) {
          this.setVolume(this.volume);
        } else {
          this.setVolume(storage.get("volume", this.volume));
        }

        this.init();
        this.update();

        instances.push(this);
      });

      onIntersect(element, () => this.$refs.audio.setAttribute("src", src), { rootMargin: "256px" });
    },

    init() {
      for (const event of [
        "play",
        "pause",
        "ended",
        "stalled",
        "waiting",
        "timeupdate",
        "durationchange",
        "volumechange",
      ]) {
        this.$refs.audio.addEventListener(event, () => this.update());
      }

      this.$refs.stateButton.addEventListener("click", () => {
        if (this.$refs.audio.paused) {
          this.play();
        } else {
          this.pause();
        }
      });

      this.initProgress();
      this.initVolume();
    },

    initProgress() {
      let paused = false;

      const bar = new Bar(this.$refs.progressBar);
      bar.onMove = (percentage) => {
        this.$refs.audio.currentTime = percentage * this.$refs.audio.duration;
      };
      bar.onMoveBegin = () => {
        paused = this.$refs.audio.paused;
        if (!paused) {
          this.pause();
        }
      };
      bar.onMoveEnd = () => {
        if (!paused) {
          this.play();
        }
      };
    },

    initVolume() {
      this.$refs.volumeButton.addEventListener("click", () => (this.$refs.audio.muted = !this.$refs.audio.muted));

      if (!isMobileDevice()) {
        this.$refs.volume.addEventListener("pointerenter", () => this.volumeInteract++);
        this.$refs.volume.addEventListener("pointerleave", () => this.volumeInteract--);

        const bar = new Bar(this.$refs.volumeBar);
        bar.onMove = (percentage) => this.setVolume(percentage);
        bar.onMoveBegin = () => this.volumeInteract++;
        bar.onMoveEnd = () => this.volumeInteract--;
      }
    },

    play() {
      for (const instance of instances) {
        instance.pause();
      }
      this.$refs.audio.play();
    },

    pause() {
      this.$refs.audio.pause();
    },

    setVolume(volume) {
      this.volume = volume;
      this.$refs.audio.muted = false;
      this.$refs.audio.volume = Math.pow(this.volume, 3);
      storage.set("volume", this.volume);
    },

    format(time) {
      time = isNaN(time) ? 0 : time;
      const min = Math.floor(time / 60).toString();
      const sec = Math.floor(time % 60).toString();
      return `${min}:${sec.padStart(2, "0")}`;
    },

    update() {
      this.time = this.$refs.audio.currentTime;
      this.duration = this.$refs.audio.duration;
      this.paused = this.$refs.audio.paused;
      this.muted = this.$refs.audio.muted;
    },
  };
}
