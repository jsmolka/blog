import { mount } from './audio';

for (const element of document.querySelectorAll('[data-audio]')) {
  mount(element, element.getAttribute('data-src'));
}
