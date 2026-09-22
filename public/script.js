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
const hero = document.querySelector('.hero, .service-page-hero');

function updateLogoTransition() {
  if (!header || !hero) return;
  const heroHeight = hero.offsetHeight;
  const progress = Math.min(Math.max(window.scrollY / (heroHeight * 0.62), 0), 1);
  document.documentElement.style.setProperty('--hero-progress', progress.toFixed(3));
  document.documentElement.style.setProperty('--header-progress', progress.toFixed(3));
  header.classList.toggle('is-scrolled', progress > 0.04);
}

if (hero) {
  window.addEventListener('scroll', updateLogoTransition, { passive: true });
  window.addEventListener('resize', updateLogoTransition);
  updateLogoTransition();
} else if (header) {
  document.documentElement.style.setProperty('--header-progress', '1');
  header.classList.add('is-scrolled');
}

if (header && !header.querySelector('.header-consultation')) {
  const consultationAction = document.createElement('a');
  consultationAction.className = 'header-consultation';
  consultationAction.href = '/request-consultation/';
  consultationAction.textContent = 'Request a consultation';
  header.insertBefore(consultationAction, header.querySelector('.header-cta'));
}

document.querySelectorAll('a.primary-button, a.menu-cta, a.section-link').forEach((link) => {
  link.href = '/request-consultation/';
});

document.querySelectorAll('.desktop-nav a[href="#contact"], .mobile-menu nav a[href="#contact"]').forEach((link) => link.remove());

const consultationForm = document.querySelector('.consultation-form');
if (consultationForm) {
  const formStatus = consultationForm.querySelector('.form-status');
  const submitButton = consultationForm.querySelector('button[type="submit"]');
  consultationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    submitButton.querySelector('strong').textContent = 'Sending...';
    formStatus.textContent = '';
    try {
      const response = await fetch(consultationForm.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(consultationForm),
      });
      if (!response.ok) throw new Error('Unable to submit form');
      consultationForm.reset();
      formStatus.textContent = 'Thank you — we’ll be in touch shortly.';
      formStatus.classList.add('is-success');
    } catch (error) {
      formStatus.textContent = 'Something went wrong. Please call us at (918) 955-1381.';
      formStatus.classList.remove('is-success');
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector('strong').textContent = 'Request my free site walk';
    }
  });
}

const revealSections = document.querySelectorAll('.reveal-on-scroll');

if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('has-reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  revealSections.forEach((section) => revealObserver.observe(section));
}

document.querySelectorAll('[data-logo-reel]').forEach((reel) => {
  [...reel.children].forEach((item) => {
    const duplicate = item.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    reel.appendChild(duplicate);
  });
});
