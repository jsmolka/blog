const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { JSDOM } = require('jsdom');
require('../assets/js/prism');

function highlight(document) {
  let changed = false;
  if (document.getElementsByTagName('code').length > 0) {
    Prism.highlightAllUnder(document);
    changed = true;
  }
  return changed;
}

function trim(document) {
  let changed = false;
  const isInternalLink = (href) => href.match(/^(https:\/\/smolka\.dev)?\/.*\/$/);
  for (const link of document.getElementsByTagName('a')) {
    const href = link.getAttribute('href');
    if (isInternalLink(href)) {
      link.setAttribute('href', href.slice(0, -1));
      changed = true;
    }
  }
  return changed;
}

function main() {
  glob(path.join(__dirname, '../public/**/*.html'), async (_, files) => {
    for (const file of files) {
      const dom = await JSDOM.fromFile(file);
      const document = dom.window.document;

      let changed = false;
      changed |= highlight(document);
      changed |= trim(document);

      if (changed) {
        fs.writeFileSync(file, dom.serialize());
      }
    }
  });
}

main();
