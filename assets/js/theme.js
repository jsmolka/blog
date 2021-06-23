const html = document.documentElement;

window.theme = {
  get isDark() {
    return html.classList.contains('dark');
  },

  toggle() {
    const dark = html.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    this.onChange(dark);
  },

  onChange: dark => {}
}

const theme = localStorage.getItem('theme');
if (theme) {
  html.classList.toggle('dark', theme === 'dark');
}

for (const id of ['themeButtonDesktop', 'themeButtonMobile']) {
  const button = document.getElementById(id);
  button?.addEventListener('click', () => window.theme.toggle());
}
