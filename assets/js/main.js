import { createApp } from 'petite-vue';
import AudioPlayer from './audio';
import initMenu from './menu';
import Theme from './theme';

for (const player of document.querySelectorAll('.audio-player')) {
  new AudioPlayer(player);
}

const menu = document.querySelector('header .menu');
const menuButton = document.querySelector('header .menu-button');

initMenu(menu, menuButton);

window.theme = new Theme();

for (const button of document.querySelectorAll('header .theme-button')) {
  button.addEventListener('click', () => window.theme.toggle());
}

createApp().mount();
