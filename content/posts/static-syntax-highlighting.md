---
title: "Static Syntax Highlighting"
author: "Julian Smolka"
summary: "An approach to customizable static syntax highlighting in Hugo."
date: 2020-11-23
type: post
draft: true
---
Syntax highlighting is a must-have for every programming-related blog and there are many ways to achieve it in a dynamic or static manner. Of course, Hugo comes with its syntax highlighter based on [chroma](https://github.com/alecthomas/chroma). It is more than enough for your everyday programming languages, but lacks the necessary extensibility when working with custom stuff (new grammars need to be added via pull requests if I understood it correctly).

Let's take my recent posts about GBA emulation as an example. The GBA processor is based on the ARMv4T instruction set which is 20 years old at this point. Of course no sane syntax highlighting library out there supports that out of the box. The result is a bland character soup:

```none
multiply:               ; Label
    mov     r0, 4       ; r0 = 4
    mov     r1, 8       ; r1 = 8
    mul     r0, r0, r1  ; r0 = r0 * r1
    cmp     r0, 32      ; r0 == 32?
    beq     multiply    ; Jump if true
```

### Prism
The initial step towards our goal is including a library called [prism.js](https://github.com/PrismJS/prism). It's a dynamic syntax highlighting library which supports many languages out of the box and offers a simple way of adding custom ones. A rather imcomplete definition of the ARMv4T instruction set would look like this:

```js
Prism.languages.armv4t = {
  comment: {
    pattern: /;.*/,
    greedy: true
  },
  // The function and keyword definitions
  // are longer because I suck at regex
  function: /\b(mov|mul|cmp|beq)?\b/,
  keyword: /\b(r0|r1|r2|r3)\b/,
  number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i
};
```

While this is nowhere close to the full instruction set, it serves it purpose and it does it well. New registers or functions can very easily be added when required at a future point in time. The only thing left to do is including the script in our website and we are good to go. Prism initializes itself automatically and transforms `<code>` blocks into highlighted code.

### Making It Static
Using prism for syntax highlighting has one unfortunate side effect: it's dynamic. This defeats the purpose of using a static site generator where we do as much work as possible when deploying our site so that the clients don't have to. It also doesn't work if the client has JavaScript disabled in his browser (something that seems rather unnecessary in the modern days).

I solved this problem by using the dynamic version for local development

```none
{{ if .Site.IsServer }}
  {{ $scripts = $scripts | append "js/vendor/prism.min.js" }}
  {{ $scripts = $scripts | append "js/prism.js" }}
{{ end }}
```

and a [Node.js](https://nodejs.org/) version for deployment which iterates over all generated `html` files and applies syntax highlighting to them. It loads the file content into a virtual DOM (because Node is no web browser and therefore has no DOM) and then uses the dynamic script to apply syntax highlighting. The result is then serialized and saved back into the original file.

```js
async function main() {
  const pattern = path.join(__dirname, '..', 'public', '**', '*.html');

  // Iterate over all generated html pages
  glob(pattern, async (error, files) => {
    for (const file of files) {
      // Load the content into a virtual DOM
      const dom = await jsdom.JSDOM.fromFile(file);
      // Highlight the code blocks
      Prism.highlightAllUnder(dom.window.document);
      // Save the changes to the original file
      fs.writeFileSync(file, dom.serialize());
    }
  });
}
```

The final deployment script for GitHub pages looks something like this:

```batch
rem build
hugo -s .. -d public
rem highlight
cmd /c npm run prism

rem commit and push
git add .
git commit -m "update site"
git push origin master
```

### Conclusion
And that's it, a simple and customizable approach to static syntax highlighting in Hugo. The boring gray mess of characters got transformed into something more meaningful. Check out the result below! (it's such a nice infinite loop)

```armv4t
multiply:               ; Label
    mov     r0, 4       ; r0 = 4
    mov     r1, 8       ; r1 = 8
    mul     r0, r0, r1  ; r0 = r0 * r1
    cmp     r0, 32      ; r0 == 32?
    beq     multiply    ; Jump if true
```
