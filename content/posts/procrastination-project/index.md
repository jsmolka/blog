---
title: "Procrastination Project"
tags: ["blog", "logo", "programming"]
date: 2023-12-19
type: post
---
If I had to describe this blog in two words, it would be time sink. It went through many design iterations and each time I thought: "This one looks nice. It can stay like that forever". But there was always something I didn't like. Make it more minimalistic. Make it more efficient. Add a feature here. Change a minor thing there. It became the thing I worked on when I had nothing to do. It became the **procrastination project**.

## Minimalism
I strive towards an elegant, minimalistic design, and nothing is more elegant than a dark theme. There used to be a light one, but I was never quite content with it [^theme]. I couldn't replicate the look and feel I was going for, so I decided to remove it. The current color palette is inspired by [Nord](https://www.nordtheme.com/) [^nord].

[^theme]: I understand that some people prefer light over dark themes. I tend to switch between both depending on time of day and ambient brightness in the room.

[^nord]: It's inspired by its blog background color, to be precise. None of the actual colors are used.

<figure>
  <div style="display: flex; height: 4rem; border-width: 1px">
    <div style="flex: 1; background-color: var(--shade-8)"></div>
    <div style="flex: 1; background-color: var(--shade-7)"></div>
    <div style="flex: 1; background-color: var(--shade-6)"></div>
    <div style="flex: 1; background-color: var(--shade-5)"></div>
    <div style="flex: 1; background-color: var(--shade-4)"></div>
    <div style="flex: 1; background-color: var(--shade-3)"></div>
    <div style="flex: 1; background-color: var(--shade-2)"></div>
    <div style="flex: 1; background-color: var(--shade-1)"></div>
    <div style="flex: 1; background-color: var(--brand-3)"></div>
    <div style="flex: 1; background-color: var(--brand-2)"></div>
    <div style="flex: 1; background-color: var(--brand-1)"></div>
  </div>
  <figcaption>8 shades of hue 220 and 3 shades of hue 206</figcaption>
</figure>

The minimalization [^minimalization] process also included:

[^minimalization]: That sounds like a made-up word.

- Removing custom descriptions from posts
- Removing [petite-vue](https://github.com/vuejs/petite-vue) to reduce the JavaScript bundle size to two kilobytes
- Removing the archive (not needed with the new list format)
- Adding consistent hover effects
- Versioning indefinitely cached files

## Logo
The requirements for a good logo are just like the requirements for a good [flag](https://www.youtube.com/watch?v=l4w6808wJcU):

1. Keep it simple
2. Make it distinct at a ~~distance~~ small size
3. Three colors of fewer
4. Symbols, colors and designs should mean something
5. Words on a ~~flag~~ logo: ideally zero

The initial attempt was based on an AI-generated image by Midjourney.

- ![](img/logo-midjourney.jpg "Midjourney version")
- ![](img/logo-midjourney.svg "SVG version")
{.fluent}

I even took the time to [animate it](https://antfu.me/posts/animated-svg-logo). Refresh the page to see it. I thought I liked the logo, but it was way too busy --- not the elegant and simplistic style I was going for. It also looked **horrible** at small sizes due to the lines.

The second attempt was much better. I reduced the S to two bold strokes, angled them and rounded some corners for a clean, modern look. One could argue that it's reduced too much and impossible to figure out the letter it's representing, but I think abstract symbols are better than clear letters.

![](img/logo.svg "Pure artistic perfection")
{.w-50}

## Quality of Write
This section contains quality of life improvements for me, the writer. For you, the reader [^reader], nothing has changed.

[^reader]: Maybe some of you are out there and not just in my head.

> ### Quotes
> I didn't know that quotes support headings. It looks ridiculous, and I won't use it anywhere else in this blog, but rest assured, I support them. In fact, quotes are just like any other content, which means lists, code and even quoteception.
>
> > If you're going to perform inception, you need imagination. You need the simplest version of the idea, the one that will grow naturally in the subject's mind. Subtle art.
> >
> > <cite>Inception</cite>
>
> But wait, there is more. Citing someone is now easier than ever. Just wrap the citee into the `<cite>` tag, and formatting will be handled for you.
>
> ```markdown
> > Living life one obsession at a time.
> >
> > <cite>Me</cite>
> ```
> It uses the `:has` selector under the hood, which is supported by Firefox since **today**!
>
> <cite>[Firefox 121 release notes](https://www.mozilla.org/en-US/firefox/121.0/releasenotes/)</cite>

I also added support for SVG images and made it easier to display multiple images in a fluent [^fluent] list.

[^fluent]: Fluent refers to the way the layout shifts to a column-based one on mobile devices.

```markdown
- ![](img/logo.svg)
- ![](img/logo.svg)
- ![](img/logo.svg)
{.fluent}
```

- ![](img/logo.svg)
- ![](img/logo.svg)
- ![](img/logo.svg)
{.fluent}

Another thing I added is a wrapper around tables, which allows scrolling once the table gets too large for the screen. It seems like a trivial problem, but I had to resort to a regex replacement hack to make it work.

```go
{{ $table := `(<table>(?:.|\n)*?</table>)` }}
{{ $tableWrapper := `<div class="table-wrapper">${1}</div>` }}
{{ .Content | replaceRE $table $tableWrapper | safeHTML }}
```

Without it, the whole page will scroll instead of the table content, a problem you will find in many blogs.

## Final Words
I hope you enjoy the new design of the blog as much as I do. Time to focus on content!
