function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const math = { clamp };
