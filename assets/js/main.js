import { createApp, reactive } from 'petite-vue';
import Audio from './components/audio';

const store = reactive({
  menu: false,
  get theme() {
    return window.theme.value;
  },
  set theme(value) {
    window.theme.value = value;
  },
 });

createApp({ Audio, store }).mount();

for (const type of ['click', 'resize']) {
  window.addEventListener(type, () => store.menu = false);
}
