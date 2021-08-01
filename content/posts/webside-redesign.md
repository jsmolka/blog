---
title: "Website Redesign"
summary: "Notes on the website redesign."
tags: ["website", "programming"]
date: 2021-08-01T11:14:31+02:00
type: post
---
The website redesign has been in the works for some time now. There are many changes compared to previous versions, but I don't want to go into detail. So here are the key points:

- The theme is based on [Hello Friend](https://github.com/panr/hugo-theme-hello-friend) and got entirely rewritten in [Tailwindcss](https://github.com/tailwindlabs/tailwindcss)
- Assets are small and optimized &ndash; a total of 10kb gzipped
- Syntax highlighting is extensible and done post-build
- The site is developed and optimized for mobile devices
- The `<audio>` element uses a custom player

### Audio
Speaking of the devil, the custom audio player provides a uniform experience across different browsers and operating systems. It works well on all devices and uses a volume slider with an exponential scale for a better user experience. Here's an example:

{{<flex>}}
  {{<audio src="eggvance/emerald-frontier.mp3" caption="Pokémon Emerald battle frontier theme">}}
{{</flex>}}

Time for a quick rant. Fuck Apple and their [inconsistent shit](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html). "On iOS devices, the audio level is always under the user's physical control. The `volume` property is not settable in JavaScript. Reading the `volume` property always returns 1." That's a reasonable standpoint. Is there a clean and reliable test to check if the current device uses iOS and exerts the mentioned behavior? No, you have to rely on two hacks:

```js
// "Works" up until iOS 13
const isIosAudioQuirk = () => {
  const audio = new Audio();
  audio.volume = 0.5;
  return audio.volume === 1;
};

// "Works" on iPad with iOS 14.6
const isIosStandalone = () => {
  return typeof navigator.standalone === 'boolean';
};
```

### Hosting
It's a static website, so hosting will be easy regardless of the provider. Doing it myself is an option, but I don't see the benefits as of yet. I went through some hosting providers, each of which had its pros and cons:

- **GitHub Pages** is where the website was born. It was the obvious solution to get a website up and running. Its main drawback is the lack of cache control. Each asset is cached on the client for only ten minutes. That's something that doesn't fit into my performance worldview. I'd like to cache fonts and scripts for an indefinite amount of time.
- **Netlify** is where the website spent its childhood. The performance and asset optimization are great. Unfortunately, it opposed some annoying restrictions on my code. Netlify automatically redirects assets with mixed-case names to their "canonical" lowercase definition, but that wasn't the deal-breaker. For some reason, the performance for larger files was awful. The WebAssembly version of my GBA emulator and its demo took forever to load.
- **Vercel** is where the website will grow up. Performance is great, and cache control is configurable via regex path strings. There are no restrictions opposed on assets, and the default CI works well with Hugo and NPM. It feels like initial image loading is slightly slower than on Netlify but not enough for me to care about it.

### Epilogue
I like how the website turned out to be. It went to many iterations, and I never was as content with any of them as I'm with the current. Time to fill it with some content!
