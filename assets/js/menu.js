export default function initMenu(menu, button) {
  if (!(menu && button)) {
    return;
  }

  window.addEventListener('click', () => {
    menu.classList.add('hidden');
  });

  window.addEventListener('resize', () => {
    menu.classList.add('hidden');
  });

  menu.addEventListener('click', event => {
    event.stopPropagation();
  });

  button.addEventListener('click', event => {
    event.stopPropagation();
    menu.classList.toggle("hidden");
  });
}
