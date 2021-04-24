import { gsap, TimelineMax, Quad } from 'gsap';
import { CSSPlugin } from 'gsap/CSSPlugin';

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function init() {
  gsap.registerPlugin(CSSPlugin);

  const element = document.getElementById('index-icon');
  element.classList.toggle('hidden', false);
}

function animate() {
  const rectangles = Array.from(document.getElementsByTagName('rect'));
  shuffle(rectangles);

  const timeline = new TimelineMax();
  timeline.staggerFrom(rectangles, 0.5, {
    y: 16,
    scale: 0,
    ease: Quad.easeInOut
  }, 0.01);
}

init();
animate();
