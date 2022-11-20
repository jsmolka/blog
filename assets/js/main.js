import { createApp, reactive } from 'petite-vue';
import Audio from './audio';

const store = reactive({
  get theme() {
    return window.theme.value;
  },
  set theme(value) {
    window.theme.value = value;
  },
 });

createApp({ Audio, store }).mount();
