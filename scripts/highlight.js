const fs = require('fs');
const path = require('path');
const glob = require('glob');
const jsdom = require('jsdom');

require('../assets/js/prism');

function main() {
  const pattern = path.join(__dirname, '..', 'public', '**', '*.html');

  glob(pattern, async (error, files) => {
    for (const file of files) {
      const dom = await jsdom.JSDOM.fromFile(file);
      const doc = dom.window.document;

      if (doc.getElementsByTagName('code').length > 0) {
        Prism.highlightAllUnder(doc);

        fs.writeFileSync(file, dom.serialize());
      }
    }
  });
}

main();
