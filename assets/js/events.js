/*
 * Event order:
 * - touchstart
 * - touchmove
 * - touchend
 * - mouseover
 * - mousemove
 * - mousedown
 * - mouseup
 * - click
 *
 * Calling `preventDefault` on touch events prevents mouse emulation.
 */
class Events {
  constructor(element) {
    this.touch = false;
    this.element = element;
    this.attach();
  }

  attach() {
    this.element.addEventListener('touchstart', this.touchstart.bind(this), { passive: true });
    this.element.addEventListener('touchmove', this.touchmove.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.touchend.bind(this), { passive: true });
    this.element.addEventListener('mousedown', this.mousedown.bind(this));
    this.element.addEventListener('mousemove', this.mousemove.bind(this));
    this.element.addEventListener('mouseup', this.mouseup.bind(this));
  }

  detach() {
    this.element.removeEventListener('touchstart', this.touchstart);
    this.element.removeEventListener('touchmove', this.touchmove);
    this.element.removeEventListener('touchend', this.touchend);
    this.element.removeEventListener('mousedown', this.mousedown);
    this.element.removeEventListener('mousemove', this.mousemove);
    this.element.removeEventListener('mouseup', this.mouseup);
  }

  touchstart(event) {
    this.touch = true;
    const custom = new TouchEvent('smolka::down', event);
    this.element.dispatchEvent(custom);
  }

  touchmove(event) {
    this.touch = true;
    const custom = new TouchEvent('smolka::move', event);
    this.element.dispatchEvent(custom);
  }

  touchend(event) {
    this.touch = true;
    const custom = new TouchEvent('smolka::up', event);
    this.element.dispatchEvent(custom);
  }

  mousedown(event) {
    if (!this.touch) {
      const custom = new MouseEvent('smolka::down', event);
      this.element.dispatchEvent(custom);
    }
  }

  mousemove(event) {
    if (!this.touch) {
      const custom = new MouseEvent('smolka::move', event);
      this.element.dispatchEvent(custom);
    }
  }

  mouseup(event) {
    if (!this.touch) {
      const custom = new MouseEvent('smolka::up', event);
      this.element.dispatchEvent(custom);
    }
    this.touch = false;
  }
}

export function attach(element) {
  if (element) {
    element._events = element._events ?? new Events(element);
  }
}

export function detach(element) {
  if (element?._events instanceof Events) {
    element._events.detach();
    element._events = undefined;
  }
}
