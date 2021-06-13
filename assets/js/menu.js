const menu = document.getElementById('menu');
const menuButton = document.getElementById('menu-button');

if (menu && menuButton) {
  const hide = () => {
    menu.classList.add('hidden');
  };

  window.addEventListener("click", hide);
  window.addEventListener('resize', hide);

  menu.addEventListener('click', event => {
    event.stopPropagation();
  });

  menuButton.addEventListener("click", event => {
    event.stopPropagation();
    menu.classList.toggle("hidden");
  });
}
