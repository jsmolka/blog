import { env } from './utils/env';
import { math } from './utils/math';
import { storage } from './utils/storage';

const $template = document.createElement('template');
$template.innerHTML = /* html */ `
  <div class="audio">
    <button ref="stateButton">
      <svg width="16" height="16" viewBox="5 5 14 14">
        <path ref="stateButtonPath" fill="currentColor" />
      </svg>
    </button>
    <div ref="time" class="time">0:00 / 0:00</div>
    <div ref="progressBar" class="bar">
      <div ref="progressBarSeeker" class="seeker"></div>
    </div>
    <div ref="volume" class="volume">
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
  </div>
`;

function formatTime(time) {
  const min = String(Math.floor(time / 60));
  const sec = String(Math.floor(time % 60));
  return `${min}:${sec.padStart(2, '0')}`;
}

function initBar(element, opts) {
  const onMove = (event) =>
    opts.onMove(math.clamp((event.pageX - element.offsetLeft) / element.offsetWidth, 0, 1));
  const onMoveBegin = opts.onMoveBegin;
  const onMoveEnd = opts.onMoveEnd;

  element.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) {
      return;
    }

    const cursor = window.document.body.style.cursor;
    const select = window.document.body.style.userSelect;

    const up = (event) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', up);
      window.document.body.style.cursor = cursor;
      window.document.body.style.userSelect = select;
      onMove(event);
      onMoveEnd();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', up);
    window.document.body.style.cursor = 'pointer';
    window.document.body.style.userSelect = 'none';
    onMoveBegin();
    onMove(event);
  });
}

export function mount(root, src) {
  const template = $template.content.cloneNode(true);

  const refs = {};
  for (const element of template.querySelectorAll('[ref]')) {
    refs[element.getAttribute('ref')] = element;
    element.removeAttribute('ref');
  }

  const audio = new Audio();

  const update = () => {
    refs.time.innerHTML = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    refs.stateButtonPath.setAttribute(
      'd',
      audio.paused ? 'M8 5.14v14l11-7l-11-7z' : 'M14 19h4V5h-4M6 19h4V5H6v14z'
    );
    refs.volumeButtonPath.setAttribute(
      'd',
      audio.muted || audio.volume === 0
        ? 'M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21L21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.916 8.916 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71m-2.5 0c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.05-.2.05-.42.05-.63z'
        : 'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77c0-4.28-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9H3z'
    );

    const progress = audio.duration > 0 ? audio.currentTime / audio.duration : 0;
    refs.progressBarSeeker.style.cssText = `--value: ${progress}`;
  };

  const play = () => {
    audio.play();
  };

  const pause = () => {
    audio.pause();
  };

  const getVolume = () => {
    return env.isMobileDevice() ? 1 : storage.get('volume', 0.5);
  };

  const setVolume = (value) => {
    audio.muted = false;
    audio.volume = Math.pow(value, 3);
    storage.set('volume', value);

    refs.volumeBarSeeker.style.cssText = `--value: ${value}`;
  };

  const initProgressBar = () => {
    let paused = false;

    initBar(refs.progressBar, {
      onMove: (position) => {
        audio.currentTime = position * audio.duration;
      },
      onMoveBegin: () => {
        paused = audio.paused;
        if (!paused) {
          pause();
        }
      },
      onMoveEnd: () => {
        if (!paused) {
          play();
        }
      },
    });
  };

  const initVolumeBar = () => {
    refs.volumeButton.addEventListener('click', () => {
      audio.muted = !audio.muted;
    });

    if (!env.isMobileDevice()) {
      const showVolume = new Proxy(
        { value: 0 },
        {
          set(object, prop, value) {
            object[prop] = value;
            refs.volumeBarWrapper.classList.toggle('active', value > 0);
          },
        }
      );

      refs.volume.addEventListener('pointerenter', () => showVolume.value++);
      refs.volume.addEventListener('pointerleave', () => showVolume.value--);

      initBar(refs.volumeBar, {
        onMove: (volume) => {
          setVolume(volume);
        },
        onMoveBegin: () => showVolume.value++,
        onMoveEnd: () => showVolume.value--,
      });
    }
  };

  audio.preload = 'metadata';
  audio.src = src;
  audio.addEventListener('loadedmetadata', () => {
    update();

    setVolume(getVolume());

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
      audio.addEventListener(event, update);
    }

    refs.stateButton.addEventListener('click', () => {
      if (audio.paused) {
        play();
      } else {
        pause();
      }
    });

    initProgressBar();
    initVolumeBar();
  });

  root.appendChild(template);
}
