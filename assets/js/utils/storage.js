function get(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return fallback;
  }
}

function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = { get, set };
