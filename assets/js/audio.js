import { isMobile } from './utils/platform';
import { slider } from './utils/slider';
import { formatSeconds } from './utils/time';

const template = /* html */ `
  <button ref="stateButton">
    <svg width="16" height="16" viewBox="5 5 14 14">
      <path ref="stateButtonPath" fill="currentColor" />
    </svg>
  </button>
  <div ref="time" class="time"></div>
  <div ref="progressBar" class="bar">
    <div ref="progressBarSeeker" class="seeker"></div>
  </div>
  <div ref="volumeArea" class="volume">
    <div ref="volumeBarWrapper" class="volume-bar-wrapper">
      <div ref="volumeBar" class="bar">
        <div ref="volumeBarSeeker" class="seeker"></div>
      </div>
    </div>
    <button ref="volumeButton">
      <svg width="16" height="16" viewBox="3 3 18 18">
        <path ref="volumeButtonPath" fill="currentColor" />
      </svg>
    </button>
  </div>
`;

class XAudio extends HTMLElement {
  static instances = [];

  constructor() {
    super();

    this.audio = new Audio();
    this.audio.preload = 'metadata';

    XAudio.instances.push(this);
  }

  connectedCallback() {
    this.innerHTML = template;
    for (const element of this.querySelectorAll('[ref]')) {
      this[element.getAttribute('ref')] = element;
    }

    this.render();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio > 0 || entry.isIntersecting) {
          this.audio.addEventListener('loadedmetadata', this.init.bind(this));
          this.audio.src = this.getAttribute('src');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '256px' }
    );
    observer.observe(this);
  }

  play() {
    for (const instance of XAudio.instances) {
      instance.audio.pause();
    }
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  get volume() {
    return isMobile ? 1 : parseFloat(localStorage.getItem('volume') ?? '0.5');
  }

  set volume(value) {
    this.audio.muted = false;
    this.audio.volume = value ** 3;
    localStorage.setItem('volume', value);

    this.volumeBarSeeker.style.setProperty('--value', value);
  }

  render() {
    const progress = this.audio.currentTime || 0;
    const duration = this.audio.duration || 0;

    this.time.innerHTML = `${formatSeconds(progress)} / ${formatSeconds(duration)}`;
    this.stateButtonPath.setAttribute(
      'd',
      this.audio.paused ? 'M8 5.14v14l11-7l-11-7z' : 'M14 19h4V5h-4M6 19h4V5H6v14z'
    );
    this.volumeButtonPath.setAttribute(
      'd',
      this.audio.muted || this.audio.volume === 0
        ? 'M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21L21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.916 8.916 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71m-2.5 0c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.05-.2.05-.42.05-.63z'
        : 'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77c0-4.28-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9H3z'
    );
    this.progressBarSeeker.style.setProperty('--value', duration > 0 ? progress / duration : 0);
  }

  initProgress() {
    let paused = false;

    const down = () => {
      paused = this.audio.paused;
      if (!paused) {
        this.pause();
      }
    };
    const move = ({ detail: progress }) => {
      this.audio.currentTime = progress * this.audio.duration;
    };
    const up = () => {
      if (!paused) {
        this.play();
      }
    };

    slider(this.progressBar);
    this.progressBar.addEventListener('slider:down', down);
    this.progressBar.addEventListener('slider:move', move);
    this.progressBar.addEventListener('slider:up', up);
  }

  initVolume() {
    this.volume = this.volume;

    this.volumeButton.addEventListener('click', () => {
      this.audio.muted = !this.audio.muted;
    });

    if (isMobile) {
      return;
    }

    const active = new Proxy(
      { value: 0 },
      {
        set: (target, key, value) => {
          this.volumeBarWrapper.classList.toggle('active', value > 0);
          return Reflect.set(target, key, value);
        },
      }
    );

    this.volumeArea.addEventListener('pointerenter', () => active.value++);
    this.volumeArea.addEventListener('pointerleave', () => active.value--);

    slider(this.volumeBar);
    this.volumeBar.addEventListener('slider:down', () => active.value++);
    this.volumeBar.addEventListener('slider:move', ({ detail: volume }) => (this.volume = volume));
    this.volumeBar.addEventListener('slider:up', () => active.value--);
  }

  init() {
    this.render();

    for (const event of [
      'durationchange',
      'ended',
      'pause',
      'play',
      'playing',
      'seeked',
      'stalled',
      'timeupdate',
      'volumechange',
      'waiting',
    ]) {
      this.audio.addEventListener(event, this.render.bind(this));
    }

    this.stateButton.addEventListener('click', () => {
      if (this.audio.paused) {
        this.play();
      } else {
        this.pause();
      }
    });

    this.initProgress();
    this.initVolume();
  }
}

customElements.define('x-audio', XAudio);
