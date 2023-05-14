import { writeFileSync } from 'fs';
import { dirname } from 'path';
import glob from 'glob';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import Prism from '../assets/js/prism.js';

async function postprocess(file) {
  const dom = await JSDOM.fromFile(file);
  const document = dom.window.document;

  if (document.querySelector(':is(code, pre)[class*="language-"]')) {
    Prism.highlightAllUnder(document);

    writeFileSync(file, dom.serialize());
  }
}

function main() {
  const self = fileURLToPath(import.meta.url);
  const options = {
    cwd: dirname(dirname(self))
  };
  for (const file of glob.sync('public/**/*.html', options)) {
    postprocess(file);
  }
}

main();
