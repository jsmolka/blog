import lozad from 'lozad';
import { createApp, reactive } from 'petite-vue';
import Player from './player';

const observer = lozad('.lozad', {
  rootMargin: '512px',
  load: function (element) {
    const container = element.parentElement;
    for (const element of container.querySelectorAll('*[data-src]')) {
      element.src = element.getAttribute('data-src');
    }
  }
});
observer.observe();

for (const element of document.querySelectorAll('*[v-scope="Player()"')) {
  createApp({ Player }).mount(element);
}

const store = reactive({
  menu: false,
});

createApp({ store }).mount();

window.addEventListener('click', () => store.menu = false);
window.addEventListener('resize', () => store.menu = false);
