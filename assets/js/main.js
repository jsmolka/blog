import './menu';
import lozad from 'lozad';
import AudioPlayer from './audioPlayer';
import { attach } from './events';

const lozadOptions = {
  rootMargin: '512px',
};

const observer = lozad('.lozad', lozadOptions);
observer.observe();

const audioObserver = lozad('.audio-player', {
  ...lozadOptions,
  load: function(element) {
    for (const audio of element.querySelectorAll('audio')) {
      audio.src = audio.getAttribute('data-src');
    }
  }
});
audioObserver.observe();

for (const element of document.querySelectorAll('.audio-player')) {
  new AudioPlayer(element);
}

attach(window);
