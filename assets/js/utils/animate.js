export function animate(fn) {
  let id;
  let time = 0;
  const wrapper = (now) => {
    fn(now - time);
    time = now;
    id = requestAnimationFrame(wrapper);
  };
  wrapper(0);

  return () => {
    if (id != null) {
      cancelAnimationFrame(id);
    }
  };
}
