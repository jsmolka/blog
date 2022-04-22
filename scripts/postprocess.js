const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { JSDOM } = require('jsdom');
require('../assets/js/prism');

const public = path.join(__dirname, '../public').replace(/\\/g, '/');
const hrefRel = `href="/`;
const hrefAbs = `href="file://${public}/`;

function load(file) {
  let html = fs.readFileSync(file).toString();
  html = html.replace(new RegExp(hrefRel, 'g'), hrefAbs);
  const jsdom = new JSDOM(html, { resources: 'usable' });
  return new Promise((resolve) => {
    jsdom.window.onload = () => {
      resolve(jsdom);
    }
  });
}

function save(file, html) {
  html = html.replace(new RegExp(hrefAbs, 'g'), hrefRel);
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

  const analyze = (element) => {
    const computed = window.getComputedStyle(element);
    return [
      computed.getPropertyValue('font-family').split(',')[0],
      computed.getPropertyValue('font-weight'),
      computed.getPropertyValue('font-style')
    ];
  };

  const stack = [];
  stack.push(analyze(document.documentElement));
  stack[0][0] = stack[0][0] || 'sans-serif';
  stack[0][1] = stack[0][1] || 400;
  stack[0][2] = stack[0][2] || 'normal';

  const fonts = new Set();
  const traverse = (element) => {
    const data = analyze(element);
    for (const [index, inherit] of stack[stack.length - 1].entries()) {
      if (!data[index] || data[index] === 'inherit') {
        data[index] = inherit;
      }
    }
    stack.push(data);
    for (const child of element.childNodes) {
      if (child instanceof window.Element) {
        traverse(child);
      }
    }
    stack.pop();

    data[0] = data[0].toLowerCase().replace(/ /g, '-');
    if (data[2] !== 'italic') {
      data.pop();
    }
    fonts.add(data.join('-'));
  }

  traverse(document.getElementsByTagName('body')[0]);

  let changed = false;
  for (const font of fonts) {
    const href = `/fonts/${font}.woff2`;
    const file = path.join(public, href);
    if (fs.existsSync(file)) {
      const link = document.createElement('link');
      link.setAttribute('href', href);
      link.setAttribute('rel', 'preload');
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
  const isInternalLink = (href) => href.match(new RegExp(`^(file://${public}|https://smolka.dev)?/.*/$`, 'g'));
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
  glob(public + '/**/*.html', async (_, files) => {
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
