import AudioPlayer from './audioPlayer';
import { attach } from './events';

for (const element of document.querySelectorAll('.audio-player')) {
  new AudioPlayer(element);
}

attach(window);
