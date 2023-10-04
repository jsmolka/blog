import { createApp, reactive } from 'petite-vue';
import Audio from './audio';

const store = reactive({
  get theme() {
    return window.theme.theme;
  },
  set theme(theme) {
    window.theme.theme = theme;
  },
 });

createApp({ Audio, store }).mount();
