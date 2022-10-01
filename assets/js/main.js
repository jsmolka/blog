import { createApp, reactive } from 'petite-vue';
import Audio from './audio';

for (const element of document.querySelectorAll('[v-scope*="Audio"]')) {
  createApp({ Audio }).mount(element);
}

const store = reactive({
  menu: false,
});

createApp({ store }).mount();

for (const type of ['click', 'resize']) {
  window.addEventListener(type, () => store.menu = false);
}
