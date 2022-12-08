import { writeFileSync } from 'fs';
import { dirname } from 'path';
import glob from 'glob';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import Prism from '../assets/js/prism.js';

function highlight(document) {
  let changed = false;
  if (document.querySelector(':is(code, pre)[class*="language-"]')) {
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

async function postprocess(file) {
  const dom = await JSDOM.fromFile(file);
  const document = dom.window.document;

  let changed = false;
  changed |= highlight(document);
  changed |= trim(document);

  if (changed) {
    console.log(file);
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
