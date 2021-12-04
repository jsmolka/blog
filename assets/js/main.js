import lozad from 'lozad';
import { createApp, reactive } from 'petite-vue';
import Player from './player';

const lozadOptions = {
  rootMargin: '512px',
};

const observer = lozad('.lozad', lozadOptions);
observer.observe();

for (const element of document.querySelectorAll('*[v-scope="Player()"')) {
  createApp({ Player }).mount(element);
}

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
}).mount('header');

window.addEventListener('click', () => {
  store.menu = false;
});

window.addEventListener('resize', () => {
  store.menu = false;
});
