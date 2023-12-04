// Linear congruential generator
export function lcg(seed = null) {
  const m = 4294967296;
  const a = 1664525;
  const c = 1013904223;

  let z = (seed == null ? Math.random() * m : seed) >>> 0;
  return () => {
    z = (a * z + c) % m;
    return z / m;
  };
}
