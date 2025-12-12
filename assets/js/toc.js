const tocLinks = [...document.querySelectorAll('#TableOfContents a[href^="#"]')];
const headings = tocLinks
  .map((tocLink) => document.querySelector(`#${tocLink.getAttribute('href').slice(1)}`))
  .reverse();

function update() {
  const heading = headings.find(
    (heading) => heading.getBoundingClientRect().top <= 0.2 * window.innerHeight
  );

  for (const tocLink of tocLinks) {
    const isActive = heading != null && tocLink.getAttribute('href').slice(1) === heading.id;
    tocLink.classList.toggle('active', isActive);
  }
}

if (tocLinks.length > 0) {
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('hashchange', update, { passive: true });
}
