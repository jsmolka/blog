export function intersect(element, callback, options = {}) {
  const observer = new IntersectionObserver(([entry], observer) => {
    const visible = entry.intersectionRatio > 0 || entry.isIntersecting;
    if (callback(visible) === false) {
      observer.unobserve(entry.target);
    }
  }, options);
  observer.observe(element);
}
