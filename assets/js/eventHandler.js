export default class EventHandler {
  constructor(element) {
    this.element = element;
    this.interceptors = [];
    this.touch = false;
  }

  on(mouseEvent, touchEvent, handler) {
    const mouseInterceptor = event => {
      if (this.touch) {
        event.preventDefault();
      } else {
        handler(event);
      }
    };

    const touchInterceptor = event => {
      this.touch = true;
      handler(event);
    };

    this.element.addEventListener(mouseEvent, mouseInterceptor);
    this.element.addEventListener(touchEvent, touchInterceptor, { passive: true });

    this.interceptors.push({
      event: mouseEvent,
      handler: handler,
      interceptor: mouseInterceptor
    });

    this.interceptors.push({
      event: touchEvent,
      handler: handler,
      interceptor: touchInterceptor
    });
  }

  onDown(handler) {
    this.on('mousedown', 'touchstart', handler);
  }

  onMove(handler) {
    this.on('mousemove', 'touchmove', handler);
  }

  onUp(handler) {
    this.on('mouseup', 'touchend', handler);
  }

  off(mouseEvent, touchEvent, handler) {
    for (let i = this.interceptors.length - 1; i >= 0; --i) {
      const interceptor = this.interceptors[i];
      if ((interceptor.event === mouseEvent || interceptor.event === touchEvent) && interceptor.handler === handler) {
        this.element.removeEventListener(interceptor.event, interceptor.interceptor);
        this.interceptors.splice(i, 1);
      }
    }
  }

  offAll() {
    for (const interceptor of this.interceptors) {
      this.element.removeEventListener(interceptor.event, interceptor.interceptor);
    }
    this.interceptors.length = 0;
  }

  offDown(handler) {
    this.off('mousedown', 'touchstart', handler);
  }

  offMove(handler) {
    this.off('mousemove', 'touchmove', handler);
  }

  offUp(handler) {
    this.off('mouseup', 'touchend', handler);
  }
}
