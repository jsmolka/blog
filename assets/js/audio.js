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

function initBarEvents(element) {
  const createBarEvent = (name) => {
    return (event) => {
      element.dispatchEvent(
        new CustomEvent(name, {
          detail: clamp((event.pageX - element.offsetLeft) / element.offsetWidth, 0, 1),
        })
      );
    };
  };

  const down = createBarEvent('bardown');
  const move = createBarEvent('barmove');
  const up = createBarEvent('barup');

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
    <svg width="16" height="16" viewBox="5 5 14 14">
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

    this.update();

    new IntersectionObserver(
      ([entry], observer) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          this.audio.addEventListener('loadedmetadata', () => this.init());
          this.audio.src = this.getAttribute('src');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '256px' }
    ).observe(this);
  }

  update() {
    const position = this.audio.currentTime;
    const duration = this.audio.duration || 0;

    this.time.innerHTML = `${formatSeconds(position)} / ${formatSeconds(duration)}`;
    this.stateButtonPath.setAttribute(
      'd',
      this.audio.paused
        ? 'M8 5.14v14l11-7l-11-7z'
        : 'M14 19h4V5h-4M6 19h4V5H6v14z' // prettier-ignore
    );
    this.volumeButtonPath.setAttribute(
      'd',
      this.audio.muted || this.audio.volume === 0
        ? 'M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21L21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.916 8.916 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71m-2.5 0c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.05-.2.05-.42.05-.63z'
        : 'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77c0-4.28-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9H3z'
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
    initBarEvents(this.progressBar);

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

    initBarEvents(this.volumeBar);
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
