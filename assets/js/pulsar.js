import { animate } from './utils/animate';
import { noise } from './utils/noise';

const svg = document.getElementById('icon');
if (svg != null) {
  let i = 0;
  animate((timestamp) => {
    i++;
    svg.innerHTML = '';

    const w = 32;
    const h = 32;

    const s = 100;
    for (let y = h / 2; y < h; y += 2) {
      const points = [];
      for (let x = 0; x <= w; x++) {
        points.push(
          x,
          y - (h / 2 / (1 + (x - w / 2) ** 4 / (32 * w))) * noise(x / (w / 4) + i / s + y)
        );
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      path.setAttributeNS(null, 'points', points);
      path.setAttributeNS(null, 'fill', 'none');
      path.setAttributeNS(null, 'stroke', '#dadee5');
      path.setAttributeNS(null, 'stroke-width', '1px');
      svg.append(path);
    }
  });
}
