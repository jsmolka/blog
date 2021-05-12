const fs = require('fs');
const path = require('path');
const glob = require('glob');
const jsdom = require('jsdom');
const Prism = require('../assets/js/vendor/prism.min');

require('../assets/js/prism');

async function main() {
  const pattern = path.join(__dirname, '..', 'public', '**', '*.html');

  glob(pattern, async (error, files) => {
    for (const file of files) {
      const dom = await jsdom.JSDOM.fromFile(file);
      const doc = dom.window.document;

      if (doc.getElementsByTagName('code').length > 0) {
        const preloadMono = doc.createElement('link');
        preloadMono.setAttribute('rel', 'preload');
        preloadMono.setAttribute('href', '/font/mono/JetBrainsMono-Regular.woff2');
        preloadMono.setAttribute('crossorigin', 'anonymous');
        preloadMono.setAttribute('type', 'font/woff2');
        preloadMono.setAttribute('as', 'font');
        doc.head.appendChild(preloadMono);

        Prism.highlightAllUnder(doc);
      }

      if (doc.getElementsByClassName('font-bit').length > 0) {
        const preloadBit = doc.createElement('link');
        preloadBit.setAttribute('rel', 'preload');
        preloadBit.setAttribute('href', '/font/bit/BitOutline.woff2');
        preloadBit.setAttribute('crossorigin', 'anonymous');
        preloadBit.setAttribute('type', 'font/woff2');
        preloadBit.setAttribute('as', 'font');
        doc.head.appendChild(preloadBit);
      }

      fs.writeFileSync(file, dom.serialize());
    }
  });
}

main();
