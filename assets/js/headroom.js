import Headroom from 'headroom.js';

(function() {
  const header = document.querySelector('header');
  const headroom = new Headroom(header, {
    offset: 64,
    tolerance: 16
  });

  headroom.init();
})();
