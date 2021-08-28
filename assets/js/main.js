import lozad from 'lozad';
import AudioPlayer from './audioPlayer';
import { attach } from './events';

const load = function(element) {
  if (element.classList.contains('audio-player')) {
    for (const audio of element.querySelectorAll('audio')) {
      load(audio);
    }
  } else {
    element.src = element.getAttribute('data-src');
  }
}

const observer = lozad('.lozad', {
  rootMargin: '256px 0px',
  load
});

observer.observe();

for (const element of document.querySelectorAll('.audio-player')) {
  new AudioPlayer(element);
}

attach(window);
