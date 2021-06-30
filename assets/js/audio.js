class AudioPlayer {
  constructor(player, options) {
    this.audioPlayer = typeof player === 'string' ? document.querySelector(player) : player;
    const opts = options || {};

    const audioElement = this.audioPlayer.innerHTML;
    this.audioPlayer.classList.add('audio-player');
    this.audioPlayer.innerHTML = AudioPlayer.getTemplate() + audioElement;

    this.isDevice = /ipad|iphone|ipod|android/i.test(window.navigator.userAgent.toLowerCase()) && !window.MSStream;
    this.playPauseBtn = this.audioPlayer.querySelector('.play-pause-btn');
    this.loading = this.audioPlayer.querySelector('.loading');
    this.sliders = this.audioPlayer.querySelectorAll('.slider');
    this.progress = this.audioPlayer.querySelector('.controls__progress');
    this.volumeBtn = this.audioPlayer.querySelector('.volume__button');
    this.volumeControls = this.audioPlayer.querySelector('.volume__controls');
    this.volumeProgress = this.volumeControls.querySelector('.volume__progress');
    this.player = this.audioPlayer.querySelector('audio');
    this.currentTime = this.audioPlayer.querySelector('.controls__current-time');
    this.totalTime = this.audioPlayer.querySelector('.controls__total-time');
    this.speaker = this.audioPlayer.querySelector('.volume__speaker');
    this.svg = this.audioPlayer.getElementsByTagName('svg');
    this.img = this.audioPlayer.getElementsByTagName('img');
    this.draggableClasses = ['pin'];
    this.currentlyDragged = null;
    this.stopOthersOnPlay = opts.stopOthersOnPlay || true;

    this.player.removeAttribute('controls');

    this.labels = {
      volume: {
        open: 'Open Volume Controls',
        close: 'Close Volume Controls',
      },
      pause: 'Pause',
      play: 'Play',
    };

    this.initEvents();
    this.directionAware();
    this.overcomeIosLimitations();

    if ('preload' in this.player.attributes && this.player.attributes.preload.value === 'none') {
      this.playPauseBtn.style.visibility = 'visible';
      this.loading.style.visibility = 'hidden';
    }
  }

  static init(options) {
    for (const player of document.querySelectorAll(options.selector)) {
      new AudioPlayer(player, options);
    }
  }

  static getTemplate() {
    return `
      <div class="holder">
        <div class="loading">
          <div class="loading__spinner"></div>
        </div>
        <div class="play-pause-btn" aria-label="Play" role="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
            <path fill="#566574" fill-rule="evenodd" d="M18 12L0 24V0" class="play-pause-btn__icon"/>
          </svg>
        </div>
      </div>
      <div class="controls">
        <span class="controls__current-time" aria-live="off" role="timer">00:00</span>
        <div class="controls__slider slider" data-direction="horizontal">
          <div class="controls__progress gap-progress" aria-label="Time Slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" role="slider">
            <div class="pin progress__pin" data-method="rewind"></div>
          </div>
        </div>
        <span class="controls__total-time">00:00</span>
      </div>
      <div class="volume">
        <div class="volume__button" aria-label="Open Volume Controls" role="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path class="volume__speaker" fill="#566574" fill-rule="evenodd" d="M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z"/>
          </svg>
        </div>
        <div class="volume__controls hidden">
          <div class="volume__slider slider" data-direction="vertical">
            <div class="volume__progress gap-progress" aria-label="Volume Slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="81" role="slider">
              <div class="pin volume__pin" data-method="changeVolume"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initEvents() {
    const self = this;

    self.audioPlayer.addEventListener('mousedown', (event) => {
      if (self.isDraggable(event.target)) {
        self.currentlyDragged = event.target;
        const handleMethod = self.currentlyDragged.dataset.method;
        const listener = self[handleMethod].bind(self);
        window.addEventListener('mousemove', listener, false);
        if (self.currentlyDragged.parentElement.parentElement === self.sliders[0]) {
          self.paused = self.player.paused;
          if (self.paused === false) self.togglePlay();
        }
        window.addEventListener('mouseup', () => {
          if (self.currentlyDragged !== false
            && self.currentlyDragged.parentElement.parentElement === self.sliders[0]
            && self.paused !== self.player.paused) {
            self.togglePlay();
          }
          self.currentlyDragged = false;
          window.removeEventListener('mousemove', listener, false);
        }, false);
      }
    });

    // for mobile touches
    self.audioPlayer.addEventListener('touchstart', (event) => {
      if (self.isDraggable(event.target)) {
        [self.currentlyDragged] = event.targetTouches;
        const handleMethod = self.currentlyDragged.target.dataset.method;
        const listener = self[handleMethod].bind(self);
        window.addEventListener('touchmove', listener, false);
        if (self.currentlyDragged.parentElement.parentElement === self.sliders[0]) {
          self.paused = self.player.paused;
          if (self.paused === false) self.togglePlay();
        }
        window.addEventListener('touchend', () => {
          if (self.currentlyDragged !== false
            && self.currentlyDragged.parentElement.parentElement === self.sliders[0]
            && self.paused !== self.player.paused) {
            self.togglePlay();
          }
          self.currentlyDragged = false;
          window.removeEventListener('touchmove', listener, false);
        }, false);

        event.preventDefault();
      }
    });

    this.playPauseBtn.addEventListener('click', this.togglePlay.bind(self));
    this.player.addEventListener('timeupdate', this.updateProgress.bind(self));
    this.player.addEventListener('volumechange', this.updateVolume.bind(self));
    this.player.volume = 0.81;
    this.player.addEventListener('loadedmetadata', () => {
      self.totalTime.textContent = AudioPlayer.formatTime(self.player.duration);
    });
    this.player.addEventListener('seeking', this.showLoadingIndicator.bind(self));
    this.player.addEventListener('seeked', this.hideLoadingIndicator.bind(self));
    this.player.addEventListener('canplay', this.hideLoadingIndicator.bind(self));
    this.player.addEventListener('ended', () => {
      AudioPlayer.pausePlayer(self.player, 'ended');
      self.player.currentTime = 0;
      self.playPauseBtn.setAttribute('aria-label', self.labels.play);
    });

    this.volumeBtn.addEventListener('click', this.showHideVolume.bind(self));
    window.addEventListener('resize', self.directionAware.bind(self));
    window.addEventListener('scroll', self.directionAware.bind(self));

    for (let i = 0; i < this.sliders.length; i++) {
      const pin = this.sliders[i].querySelector('.pin');
      this.sliders[i].addEventListener('click', self[pin.dataset.method].bind(self));
    }
  }

  overcomeIosLimitations() {
    const self = this;
    if (this.isDevice) {
      // iOS does not support "canplay" event
      this.player.addEventListener('loadedmetadata', this.hideLoadingIndicator.bind(self));
      // iOS does not let "volume" property to be set programmatically
      this.audioPlayer.querySelector('.volume').style.display = 'none';
      this.audioPlayer.querySelector('.controls').style.marginRight = '0';
    }
  }

  isDraggable(element) {
    // Fix for IE 11 not supporting classList on SVG elements
    if (typeof element.classList !== 'undefined') {
      for (let i = 0; i < this.draggableClasses.length; i++) {
        if (element.classList.contains(this.draggableClasses[i])) {
          return true;
        }
      }
    }
    return false;
  }

  inRange(event) {
    const touch = ('touches' in event); // instanceof TouchEvent may also be used
    const rangeBox = this.getRangeBox(event);
    const sliderPositionAndDimensions = rangeBox.getBoundingClientRect();
    const { dataset: { direction } } = rangeBox;
    let min = null;
    let max = null;

    if (direction === 'horizontal') {
      min = sliderPositionAndDimensions.x;
      max = min + sliderPositionAndDimensions.width;
      const clientX = touch ? event.touches[0].clientX : event.clientX;
      if (clientX < min || clientX > max) return false;
    } else {
      min = sliderPositionAndDimensions.top;
      max = min + sliderPositionAndDimensions.height;
      const clientY = touch ? event.touches[0].clientY : event.clientY;
      if (clientY < min || clientY > max) return false;
    }
    return true;
  }

  updateProgress() {
    const current = this.player.currentTime;
    const percent = (current / this.player.duration) * 100;
    this.progress.setAttribute('aria-valuenow', percent);
    this.progress.style.width = `${percent}%`;

    this.currentTime.textContent = AudioPlayer.formatTime(current);
  }

  updateVolume() {
    this.volumeProgress.setAttribute('aria-valuenow', this.player.volume * 100);
    this.volumeProgress.style.height = `${this.player.volume * 100}%`;
    if (this.player.volume >= 0.5) {
      this.speaker.attributes.d.value = 'M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z';
    } else if (this.player.volume < 0.5 && this.player.volume > 0.05) {
      this.speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667M17.333 11.373C17.333 9.013 16 6.987 14 6v10.707c2-.947 3.333-2.987 3.333-5.334z';
    } else if (this.player.volume <= 0.05) {
      this.speaker.attributes.d.value = 'M0 7.667v8h5.333L12 22.333V1L5.333 7.667';
    }
  }

  getRangeBox(event) {
    let rangeBox = event.target;
    const element = this.currentlyDragged;
    if (event.type === 'click' && this.isDraggable(event.target)) {
      rangeBox = event.target.parentElement.parentElement;
    }
    if (event.type === 'mousemove') {
      rangeBox = element.parentElement.parentElement;
    }
    if (event.type === 'touchmove') {
      rangeBox = element.target.parentElement.parentElement;
    }
    return rangeBox;
  }


  getCoefficient(event) {
    const touch = ('touches' in event); // instanceof TouchEvent may also be used

    const slider = this.getRangeBox(event);
    const sliderPositionAndDimensions = slider.getBoundingClientRect();
    let K = 0;
    if (slider.dataset.direction === 'horizontal') {
      // if event is touch
      const clientX = touch ? event.touches[0].clientX : event.clientX;
      const offsetX = clientX - sliderPositionAndDimensions.left;
      const { width } = sliderPositionAndDimensions;
      K = offsetX / width;
    } else if (slider.dataset.direction === 'vertical') {
      const { height } = sliderPositionAndDimensions;
      const clientY = touch ? event.touches[0].clientY : event.clientY;
      const offsetY = clientY - sliderPositionAndDimensions.top;
      K = 1 - offsetY / height;
    }
    return K;
  }

  rewind(event) {
    if (this.player.seekable && this.player.seekable.length) { // no seek if not (pre)loaded
      if (this.inRange(event)) {
        this.player.currentTime = this.player.duration * this.getCoefficient(event);
      }
    }
  }

  showVolume() {
    if (this.volumeBtn.getAttribute('aria-attribute') === this.labels.volume.open) {
      this.volumeControls.classList.remove('hidden');
      this.volumeBtn.classList.add('open');
      this.volumeBtn.setAttribute('aria-label', this.labels.volume.close);
    }
  }

  showHideVolume() {
    this.volumeControls.classList.toggle('hidden');

    if (this.volumeBtn.getAttribute('aria-label') === this.labels.volume.open) {
      this.volumeBtn.setAttribute('aria-label', this.labels.volume.close);
      this.volumeBtn.classList.add('open');
    } else {
      this.volumeBtn.setAttribute('aria-label', this.labels.volume.open);
      this.volumeBtn.classList.remove('open');
    }
  }

  changeVolume(event) {
    if (this.inRange(event)) {
      this.player.volume = Math.round(this.getCoefficient(event) * 50) / 50;
    }
  }

  static formatTime(time) {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${(min < 10) ? `0${min}` : min}:${(sec < 10) ? `0${sec}` : sec}`;
  }

  preloadNone() {
    const self = this;
    if (!this.player.duration) {
      self.playPauseBtn.style.visibility = 'hidden';
      self.loading.style.visibility = 'visible';
    }
  }

  togglePlay() {
    this.preloadNone();
    if (this.player.paused) {
      if (this.stopOthersOnPlay) {
        AudioPlayer.stopOtherPlayers();
      }
      AudioPlayer.playPlayer(this.player);
      this.playPauseBtn.setAttribute('aria-label', this.labels.pause);
    } else {
      AudioPlayer.pausePlayer(this.player, 'toggle');
      this.playPauseBtn.setAttribute('aria-label', this.labels.play);
    }
  }

  setCurrentTime(time) {
    const pos = this.player.currentTime;
    const end = Math.floor(this.player.duration);
    if (pos + time < 0 && pos === 0) {
      this.player.currentTime = this.player.currentTime;
    } else if (pos + time < 0) {
      this.player.currentTime = 0;
    } else if (pos + time > end) {
      this.player.currentTime = end;
    } else {
      this.player.currentTime += time;
    }
  }

  setVolume(volume) {
    if (this.isDevice) return;
    const vol = this.player.volume;
    if (vol + volume >= 0 && vol + volume < 1) {
      this.player.volume += volume;
    } else if (vol + volume <= 0) {
      this.player.volume = 0;
    } else {
      this.player.volume = 1;
    }
  }

  static pausePlayer(player) {
    const playPauseButton = player.parentElement.querySelector('.play-pause-btn__icon');
    playPauseButton.attributes.d.value = 'M18 12L0 24V0';
    player.pause();
  }

  static playPlayer(player) {
    const playPauseButton = player.parentElement.querySelector('.play-pause-btn__icon');
    playPauseButton.attributes.d.value = 'M0 0h6v24H0zM12 0h6v24h-6z';
    player.play();
  }

  static stopOtherPlayers() {
    const players = document.querySelectorAll('.audio-player audio');

    for (let i = 0; i < players.length; i++) {
      AudioPlayer.pausePlayer(players[i]);
    }
  }

  showLoadingIndicator() {
    this.playPauseBtn.style.visibility = 'hidden';
    this.loading.style.visibility = 'visible';
  }

  hideLoadingIndicator() {
    this.playPauseBtn.style.visibility = 'visible';
    this.loading.style.visibility = 'hidden';
  }

  directionAware() {
    this.volumeControls.classList.remove('top', 'middle', 'bottom');

    if (window.innerHeight < 250) {
      this.volumeControls.classList.add('middle');
    } else if (this.audioPlayer.getBoundingClientRect().top < 180) {
      this.volumeControls.classList.add('bottom');
    } else {
      this.volumeControls.classList.add('top');
    }
  }
}

AudioPlayer.init({
  selector: '.audio-wrapper',
  stopOthersOnPlay: true
});
