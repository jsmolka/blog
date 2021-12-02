const menu = document.getElementById('menu');
const menuButton = document.getElementById('menu-button');

if (!(menu && menuButton)) {
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

menuButton.addEventListener('click', event => {
  event.stopPropagation();
  menu.classList.toggle("hidden");
});
