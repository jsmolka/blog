const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { JSDOM } = require('jsdom');
require('../assets/js/prism');

const root = path.join(__dirname, '../public/').replace(/\\/g, '/');
const hrefWeb = `href="/`;
const hrefFile = `href="file://${root}`;

function load(file) {
  let html = fs.readFileSync(file).toString();
  html = html.replace(new RegExp(hrefWeb, 'g'), hrefFile);
  const jsdom = new JSDOM(html, {
    resources: 'usable'
  });
  return new Promise((resolve) => {
    jsdom.window.onload = () => {
      resolve(jsdom);
    }
  });
}

function save(file, html) {
  html = html.replace(new RegExp(hrefFile, 'g'), hrefWeb);
  fs.writeFileSync(file, html);
}

function highlight(window) {
  const document = window.document;
  if (document.getElementsByTagName('code').length > 0) {
    Prism.highlightAllUnder(document);
    return true;
  }
  return false;
}

function preload(window) {
  const document = window.document;

  const analyze = element => {
    const computed = window.getComputedStyle(element);
    return [
      computed.getPropertyValue('font-family').split(',')[0],
      computed.getPropertyValue('font-weight') || 400,
      computed.getPropertyValue('font-style') || 'normal'
    ];
  };

  const html = document.documentElement;
  const parent = analyze(html);
  if (!parent[0]) {
    return false;
  }

  const analyzeChild = element => {
    const data = analyze(element);
    const inherit = (value, parentValue) => !value || value === 'inherit' ? parentValue : value;
    return [
      inherit(data[0], parent[0]),
      inherit(data[1], parent[1]),
      inherit(data[2], parent[2])
    ];
  };

  const fonts = new Set();
  const addFont = data => {
    data[0] = data[0].toLowerCase().replace(/ /g, '-');
    if (data[2] !== 'italic') {
      data.pop();
    }
    fonts.add(data.join('-'));
  };

  addFont(parent);
  for (const element of document.getElementsByTagName('*')) {
    addFont(analyzeChild(element));
  }

  let changed = false;
  for (const font of fonts) {
    const href = `/fonts/${font}.woff2`;
    const file = path.join(root, href);
    if (fs.existsSync(file)) {
      const link = document.createElement('link');
      link.href = href;
      link.rel = 'preload';
      link.setAttribute('as', 'font');
      link.setAttribute('type', 'font/woff2');
      link.setAttribute('crossorigin', '');
      document.head.appendChild(link);
      changed = true;
    }
  }
  return changed;
}

function trim(window) {
  let changed = false;
  const document = window.document;
  const isInternalLink = href => href.match(/^(https:\/\/smolka\.dev)?\/.*\/$/);
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
  glob(root + '**/*.html', async (_, files) => {
    for (const file of files) {
      const jsdom = await load(file);
      const window = jsdom.window;

      let changed = false;
      changed |= highlight(window);
      changed |= preload(window);
      changed |= trim(window);

      if (changed) {
        save(file, jsdom.serialize())
      }
    }
  });
}

main();
