import Headroom from 'headroom.js';

const header = document.querySelector('header');
const headroom = new Headroom(header);

headroom.init();

if (window.location.hash) {
  headroom.unpin();
}
