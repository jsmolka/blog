import AudioPlayer from './audio';

for (const element of document.querySelectorAll('.audio-player')) {
  new AudioPlayer(element);
}
