import { clamp } from './numeric';

export function slider(element) {
  const down = () => {
    element.dispatchEvent(new Event('slider:down'));
  };
  const move = (event) => {
    element.dispatchEvent(
      new CustomEvent('slider:move', {
        detail: clamp((event.pageX - element.offsetLeft) / element.offsetWidth, 0, 1),
      })
    );
  };
  const up = () => {
    element.dispatchEvent(new Event('slider:up'));
  };

  element.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) {
      return;
    }

    const cursor = window.document.body.style.cursor;
    const select = window.document.body.style.userSelect;

    const pointerUp = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', pointerUp);
      window.document.body.style.cursor = cursor;
      window.document.body.style.userSelect = select;
      up();
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', pointerUp);
    window.document.body.style.cursor = element.style.cursor;
    window.document.body.style.userSelect = 'none';
    down();
    move(event);
  });
}
