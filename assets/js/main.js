import AudioPlayer from './audio';
import initMenu from './menu';
import Theme from './theme';

// Todo: selector
const menu = document.getElementById('menu');
const menuButton = document.getElementById('menuButton');

initMenu(menu, menuButton);

for (const player of document.querySelectorAll('.audio-player')) {
  new AudioPlayer(player);
}

window.theme = new Theme();

// Todo: selector theme-button
for (const id of ['themeButtonDesktop', 'themeButtonMobile']) {
  const button = document.getElementById(id);
  button?.addEventListener('click', () => window.theme.toggle());
}
