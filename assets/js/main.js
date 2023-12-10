import { mount } from './audio';
import { intersect } from './utils/intersect';

for (const element of document.querySelectorAll('[data-audio]')) {
  intersect(
    element,
    (visible) => {
      if (visible) {
        mount(element, element.getAttribute('data-src'));
        return false;
      }
    },
    { rootMargin: '256px' }
  );
}
