import AudioPlayer from './audio';
import initMenu from './menu';
import ripplet from './ripplet';
import Theme from './theme';

window.theme = new Theme();

for (const button of document.querySelectorAll('header .theme-button')) {
  button.addEventListener('click', () => window.theme.toggle());
}

for (const element of document.querySelectorAll('.audio-player')) {
  new AudioPlayer(element);
}

const menu = document.querySelector('header .menu');
const menuButton = document.querySelector('header .menu-button');

initMenu(menu, menuButton);

for (const element of document.querySelectorAll('button:not(.no-ripple), .button:not(.no-ripple), .ripple')) {
  element.addEventListener('pointerdown', ripplet);
}
