const fs = require('fs');
const path = require('path');
const glob = require('glob');
const jsdom = require('jsdom');

require('../assets/js/prism');

function main() {
  const pattern = path.join(__dirname, '../public/**/*.html');

  glob(pattern, async (_, files) => {
    for (const file of files) {
      const dom = await jsdom.JSDOM.fromFile(file);
      const doc = dom.window.document;

      let changed = false;

      // Static syntax highlighting
      if (doc.getElementsByTagName('code').length > 0) {
        Prism.highlightAllUnder(doc);
        changed = true;
      }

      // Remove trailing backslash from links
      const isInternalLink = href => href.match(/^(https:\/\/smolka\.dev)?\/.*\/$/);
      for (const link of doc.getElementsByTagName('a')) {
        const href = link.getAttribute('href');
        if (isInternalLink(href)) {
          link.setAttribute('href', href.slice(0, -1));
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(file, dom.serialize());
      }
    }
  });
}

main();
