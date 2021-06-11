const mobileTrigger = document.querySelector(".menu-trigger");
const mobileMenu = document.querySelector(".menu__inner--mobile");
const desktopTrigger = document.querySelector(".menu__sub-inner-more-trigger");
const desktopMenu = document.querySelector(".menu__sub-inner-more");

if (mobileTrigger && mobileMenu && desktopTrigger && desktopMenu) {
  const hide = () => {
    mobileMenu.classList.add('hidden');
    desktopMenu.classList.add('hidden');
  };

  window.addEventListener("click", hide);
  window.addEventListener('resize', hide);

  const toggle = (trigger, menu) => {
    trigger.addEventListener("click", event => {
      event.stopPropagation();
      menu.classList.toggle("hidden");
    });
  };

  toggle(mobileTrigger, mobileMenu);
  toggle(desktopTrigger, desktopMenu);
}
