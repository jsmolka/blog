import lozad from 'lozad';
import { createApp, reactive } from 'petite-vue';
import Player from './player';

const observer = lozad('.lozad', {
  rootMargin: '512px',
  load: function (element) {
    const elements = [element, ...element.querySelectorAll('*[data-src]')];
    for (const element of elements) {
      if (element.hasAttribute('data-src')) {
        element.src = element.getAttribute('data-src');
      }
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

for (const type of ['click', 'resize']) {
  window.addEventListener(type, () => store.menu = false);
}
