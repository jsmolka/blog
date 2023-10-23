import { createApp } from 'petite-vue';
import Audio from './audio';

const href = ({ el, exp }) => {
  el.style.cursor = 'pointer';
  el.addEventListener('click', () => {
    location.href = exp;
  });
};

const app = createApp({ Audio });
app.directive('href', href);
app.mount();
