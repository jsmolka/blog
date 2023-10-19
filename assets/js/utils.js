export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function isMobileDevice() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator#non-standard_properties
  const isIosStandalone = () => {
    return typeof navigator.standalone === "boolean";
  };

  // https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html#//apple_ref/doc/uid/TP40009523-CH5-SW11
  const isIosAudioQuirk = () => {
    const audio = new Audio();
    audio.volume = 0.5;
    return audio.volume === 1;
  };

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_tablet_or_desktop
  return /Mobi|Android|iPad|iPhone|iPod/i.test(navigator.userAgent) || isIosStandalone() || isIosAudioQuirk();
}

export function onIntersect(element, callback, options = {}) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.intersectionRatio > 0 || entry.isIntersecting) {
          observer.unobserve(entry.target);
          callback();
        }
      }
    }, options);
    observer.observe(element);
  } else {
    callback();
  }
}
