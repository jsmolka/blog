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
  for (const link of document.getElementsByTagName('a')) {
    const href = link.getAttribute('href');
    const matches = href.match(/^((?:https:\/\/smolka\.dev)?\/.*\/)(#.*)?$/);
    if (matches) {
      matches.splice(0, 1);  // Remove match
      matches[0] = matches[0].slice(0, -1);  // Remove trailing slash
      link.setAttribute('href', matches.join(''));
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
