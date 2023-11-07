export function get(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
