if (localStorage) {
  const theme = localStorage.getItem('theme');
  const themeToggle = document.querySelector('.theme-toggle');

  if (theme) {
    document.body.classList.toggle('dark', theme === 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const dark = document.body.classList.toggle('dark');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }
}
