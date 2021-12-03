import lozad from 'lozad';
import { createApp, reactive } from 'petite-vue';
import AudioPlayer from './audioPlayer';

const lozadOptions = {
  rootMargin: '512px',
};

const observer = lozad('.lozad', lozadOptions);
observer.observe();

const audioObserver = lozad('.lozad-audio', {
  ...lozadOptions,
  load: function(element) {
    for (const audio of element.getElementsByTagName('audio')) {
      audio.src = audio.getAttribute('data-src');
    }
  }
});
audioObserver.observe();

const store = reactive({
  menu: false,
});

createApp({
  store,
  AudioPlayer,
}).mount();

window.addEventListener('click', () => {
  store.menu = false;
});

window.addEventListener('resize', () => {
  store.menu = false;
});
