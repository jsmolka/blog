import { env } from './utils/env';
import { slider } from './utils/slider';
import { storage } from './utils/storage';
import { formatSeconds } from './utils/time';

const template = /* html */ `
  <div class="audio">
    <button data-ref="stateButton">
      <svg width="16" height="16" viewBox="5 5 14 14">
        <path data-ref="stateButtonPath" fill="currentColor" />
      </svg>
    </button>
    <div data-ref="time" class="time"></div>
    <div data-ref="progressBar" class="bar">
      <div data-ref="progressBarSeeker" class="seeker"></div>
    </div>
    <div data-ref="volume" class="volume">
      <div data-ref="volumeBarWrapper" class="volume-bar-wrapper">
        <div data-ref="volumeBar" class="bar">
          <div data-ref="volumeBarSeeker" class="seeker"></div>
        </div>
      </div>
      <button data-ref="volumeButton">
        <svg width="16" height="16" viewBox="3 3 18 18">
          <path data-ref="volumeButtonPath" fill="currentColor" />
        </svg>
      </button>
    </div>
  </div>
`;

const audios = [];

export function mount(root, src) {
  root.innerHTML = template;

  const refs = {};
  for (const element of root.querySelectorAll('[data-ref]')) {
    refs[element.getAttribute('data-ref')] = element;
  }

  const play = () => {
    for (const audio of audios) {
      audio.pause();
    }
    audio.play();
  };

  const pause = () => {
    audio.pause();
  };

  const getVolume = () => {
    return env.isMobile ? 1 : storage.get('volume', 0.5);
  };

  const setVolume = (value) => {
    audio.muted = false;
    audio.volume = value ** 3;
    storage.set('volume', value);

    refs.volumeBarSeeker.style.setProperty('--value', value);
  };

  const update = () => {
    const progress = audio.currentTime || 0;
    const duration = audio.duration || 0;

    refs.time.innerHTML = `${formatSeconds(progress)} / ${formatSeconds(duration)}`;
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
    refs.progressBarSeeker.style.setProperty('--value', duration > 0 ? progress / duration : 0);
  };

  const initProgress = () => {
    let paused = false;

    const down = () => {
      paused = audio.paused;
      if (!paused) {
        pause();
      }
    };
    const move = ({ detail: progress }) => {
      audio.currentTime = progress * audio.duration;
    };
    const up = () => {
      if (!paused) {
        play();
      }
    };

    slider(refs.progressBar);
    refs.progressBar.addEventListener('slider:down', down);
    refs.progressBar.addEventListener('slider:move', move);
    refs.progressBar.addEventListener('slider:up', up);
  };

  const initVolume = () => {
    setVolume(getVolume());

    refs.volumeButton.addEventListener('click', () => {
      audio.muted = !audio.muted;
    });

    if (env.isMobile) {
      return;
    }

    const active = new Proxy(
      { value: 0 },
      {
        set(target, key, value) {
          refs.volumeBarWrapper.classList.toggle('active', value > 0);
          return Reflect.set(target, key, value);
        },
      }
    );

    refs.volume.addEventListener('pointerenter', () => active.value++);
    refs.volume.addEventListener('pointerleave', () => active.value--);

    slider(refs.volumeBar);
    refs.volumeBar.addEventListener('slider:down', () => active.value++);
    refs.volumeBar.addEventListener('slider:move', ({ detail: volume }) => setVolume(volume));
    refs.volumeBar.addEventListener('slider:up', () => active.value--);
  };

  const init = () => {
    update();

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

    initProgress();
    initVolume();
  };

  const audio = new Audio();
  audio.addEventListener('loadedmetadata', init);
  audio.preload = 'metadata';
  audio.src = src;
  audios.push(audio);

  update();
}
