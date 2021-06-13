const theme = localStorage.getItem('theme');
const themeButtons = document.getElementsByClassName('theme-button');

if (theme) {
  document.body.classList.toggle('dark', theme === 'dark');
}

for (const themeButton of themeButtons) {
  themeButton.addEventListener('click', () => {
    const dark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });
}
