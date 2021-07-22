import ripplet from 'ripplet.js';
import AudioPlayer from './audio';
import initMenu from './menu';
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

ripplet.defaultOptions.spreadingDuration = '0.2s';
ripplet.defaultOptions.spreadingTimingFunction = 'ease-out';

for (const element of document.querySelectorAll('button:not(.button-none), .button, .ripple')) {
  element.addEventListener('pointerdown', ripplet);
}
