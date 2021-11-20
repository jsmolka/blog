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
    this.handler = {
      touchstart: this.touchstart.bind(this),
      touchmove: this.touchmove.bind(this),
      touchend: this.touchend.bind(this),
      mousedown: this.mousedown.bind(this),
      mousemove: this.mousemove.bind(this),
      mouseup: this.mouseup.bind(this),
    };
    this.attach();
  }

  attach() {
    this.element.addEventListener('touchstart', this.handler.touchstart, { passive: true });
    this.element.addEventListener('touchmove', this.handler.touchmove, { passive: true });
    this.element.addEventListener('touchend', this.handler.touchend, { passive: true });
    this.element.addEventListener('mousedown', this.handler.mousedown);
    this.element.addEventListener('mousemove', this.handler.mousemove);
    this.element.addEventListener('mouseup', this.handler.mouseup);
  }

  detach() {
    this.element.removeEventListener('touchstart', this.handler.touchstart);
    this.element.removeEventListener('touchmove', this.handler.touchmove);
    this.element.removeEventListener('touchend', this.handler.touchend);
    this.element.removeEventListener('mousedown', this.handler.mousedown);
    this.element.removeEventListener('mousemove', this.handler.mousemove);
    this.element.removeEventListener('mouseup', this.handler.mouseup);
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
