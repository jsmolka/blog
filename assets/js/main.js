import AudioPlayer from './audio';
import initMenu from './menu';
import Theme from './theme';

// Todo: selector
const menu = document.getElementById('menu');
const menuButton = document.getElementById('menuButton');

initMenu(menu, menuButton);

// Todo: .audio-player instead?
for (const container of document.querySelectorAll('.audio-container')) {
  new AudioPlayer(container);
}

window.theme = new Theme();

// Todo: selector theme-button
for (const id of ['themeButtonDesktop', 'themeButtonMobile']) {
  const button = document.getElementById(id);
  button?.addEventListener('click', () => window.theme.toggle());
}
