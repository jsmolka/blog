import { createApp } from 'petite-vue';
import { Audio } from './audio';
import './pulsar';

const href = ({ el, exp }) => {
  el.style.cursor = 'pointer';
  el.addEventListener('click', () => {
    location.href = exp;
  });
};

const app = createApp({ Audio });
app.directive('href', href);
app.mount();
