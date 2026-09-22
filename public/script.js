const body = document.body;
const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.menu-overlay');
const closeButton = document.querySelector('.close-button');
const menuLinks = menu.querySelectorAll('a');

function setMenu(open) {
  body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
}

menuButton.addEventListener('click', () => setMenu(true));
closeButton.addEventListener('click', () => setMenu(false));
overlay.addEventListener('click', () => setMenu(false));
menuLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });

const header = document.querySelector('[data-site-header]');
const hero = document.querySelector('.hero');

function updateLogoTransition() {
  const heroHeight = hero.offsetHeight;
  const progress = Math.min(Math.max(window.scrollY / (heroHeight * 0.62), 0), 1);
  document.documentElement.style.setProperty('--hero-progress', progress.toFixed(3));
  document.documentElement.style.setProperty('--header-progress', progress.toFixed(3));
  header.classList.toggle('is-scrolled', progress > 0.04);
}

window.addEventListener('scroll', updateLogoTransition, { passive: true });
window.addEventListener('resize', updateLogoTransition);
updateLogoTransition();
