const isMobile = /Mobi|Android|iPad|iPhone|iPod/i.test(navigator.userAgent);

function formatTime(date, template = null) {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

  if (template == null) {
    if (h >= 10) {
      template = 'hh:mm:ss';
    } else if (h >= 1) {
      template = 'h:mm:ss';
    } else if (m >= 10) {
      template = 'mm:ss';
    } else {
      template = 'm:ss';
    }
  }

  return template.replace(/h{1,2}|m{1,2}|s{1,2}/g, (match) => {
    switch (match) {
      case 'h':
        return String(h);
      case 'hh':
        return String(h).padStart(2, '0');
      case 'm':
        return String(m);
      case 'mm':
        return String(m).padStart(2, '0');
      case 's':
        return String(s);
      case 'ss':
        return String(s).padStart(2, '0');
    }
  });
}

function formatSeconds(seconds, template = null) {
  return formatTime(new Date(0, 0, 0, 0, 0, seconds), template);
}

function clamp(value, min, max) {
  return Math.min(Math.max(min, value), max);
}

function initBar(element) {
  const dispatch = (name) => {
    return (event) => {
      const { left, right } = element.getBoundingClientRect();
      element.dispatchEvent(
        new CustomEvent(name, {
          detail: clamp((event.x - left) / (right - left), 0, 1),
        }),
      );
    };
  };

  const down = dispatch('bardown');
  const move = dispatch('barmove');
  const up = dispatch('barup');

  element.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) {
      return;
    }

    const cursor = window.document.body.style.cursor;
    const select = window.document.body.style.userSelect;

    const pointerUp = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', pointerUp);
      window.document.body.style.cursor = cursor;
      window.document.body.style.userSelect = select;
      up(event);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', pointerUp);
    window.document.body.style.cursor = 'pointer';
    window.document.body.style.userSelect = 'none';
    down(event);
    move(event);
  });
}

const template = /* html */ `
  <button ref="stateButton">
    <svg width="16" height="16" viewBox="2 2 20 20">
      <path ref="stateButtonPath" fill="currentColor" />
    </svg>
  </button>
  <div ref="time" class="time"></div>
  <div ref="progressBar" class="bar">
    <div ref="progressBarSeeker" class="seeker"></div>
  </div>
  <div ref="volumeArea" class="volume-area">
    <div ref="volumeBarWrapper" class="volume-bar-wrapper">
      <div ref="volumeBar" class="bar">
        <div ref="volumeBarSeeker" class="seeker"></div>
      </div>
    </div>
    <button ref="volumeButton">
      <svg width="16" height="16" viewBox="2 2 20 20">
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

    this.update();

    new IntersectionObserver(
      ([entry], observer) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          this.audio.addEventListener('loadedmetadata', () => this.init());
          this.audio.src = this.getAttribute('src');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '256px' },
    ).observe(this);
  }

  update() {
    const position = this.audio.currentTime;
    const duration = this.audio.duration || 0;

    this.time.innerHTML = `${formatSeconds(position)} / ${formatSeconds(duration)}`;
    this.stateButtonPath.setAttribute(
      'd',
      this.audio.paused
        ? 'M8,19V5l11,7L8,19Z'
        : 'M14,19V5h4V19H14ZM6,19V5h4V19H6Z', // prettier-ignore
    );
    this.volumeButtonPath.setAttribute(
      'd',
      this.audio.muted || this.audio.volume === 0
        ? 'M19.8,22.6l-3.02-3.03q-0.63,0.4-1.33,0.69T14,20.73V18.68q0.35-0.13 0.69-0.25q0.34-0.13 0.64-0.3L12,14.8V20L7,15H3V9H6.2L1.4,4.2L2.8,2.8L21.2,21.2l-1.4,1.4Zm-0.2-5.8l-1.45-1.45q0.42-0.78 0.64-1.63T19,11.98q0-2.35-1.38-4.2Q16.25,5.93 14,5.27V3.22q3.1,0.7 5.05,3.14T21,11.98q0,1.32-0.36,2.55T19.6,16.8Zm-3.35-3.35L14,11.2V7.95Q15.18,8.5 15.84,9.6T16.5,12q0,0.38-0.06,0.74t-0.19,0.71ZM12,9.2L9.4,6.6L12,4V9.2Z'
        : 'M14,20.73V18.68q2.25-0.65 3.63-2.5T19,11.98t-1.38-4.2Q16.25,5.93 14,5.27V3.22q3.1,0.7 5.05,3.14T21,11.98t-1.95,5.61T14,20.73ZM3,15V9H7l5-5V20L7,15H3Zm11,1V7.95Q15.18,8.5 15.84,9.6T16.5,12q0,1.27-0.66,2.36T14,16Z',
    );
    this.progressBarSeeker.style.setProperty('--value', duration > 0 ? position / duration : 0);
  }

  init() {
    this.update();

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
      this.audio.addEventListener(event, () => this.update());
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

  initProgress() {
    initBar(this.progressBar);

    let wasPaused = false;
    this.progressBar.addEventListener('bardown', () => {
      wasPaused = this.audio.paused;
      if (!wasPaused) {
        this.pause();
      }
    });

    this.progressBar.addEventListener('barmove', ({ detail: percentage }) => {
      this.audio.currentTime = percentage * this.audio.duration;
    });

    this.progressBar.addEventListener('barup', () => {
      if (!wasPaused) {
        this.play();
      }
    });
  }

  initVolume() {
    this.volume = this.volume;
    this.volumeButton.addEventListener('click', () => {
      this.audio.muted = !this.audio.muted;
    });

    if (isMobile) {
      return;
    }

    let active = 0;
    const enter = () => this.volumeBarWrapper.classList.toggle('active', ++active > 0);
    const leave = () => this.volumeBarWrapper.classList.toggle('active', --active > 0);

    this.volumeArea.addEventListener('pointerenter', enter);
    this.volumeArea.addEventListener('pointerleave', leave);

    initBar(this.volumeBar);
    this.volumeBar.addEventListener('bardown', enter);
    this.volumeBar.addEventListener('barmove', ({ detail: volume }) => (this.volume = volume));
    this.volumeBar.addEventListener('barup', leave);
  }

  play() {
    for (const instance of XAudio.instances) {
      instance.pause();
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
}

customElements.define('x-audio', XAudio);
