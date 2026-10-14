const body = document.body;

const header = document.querySelector('[data-site-header]');
const hero = document.querySelector('.hero, .about-hero, .service-page-hero');

function updateLogoTransition() {
  if (!header || !hero) return;
  const heroHeight = hero.offsetHeight;
  const position = Math.min(Math.max(window.scrollY / (heroHeight * 0.72), 0), 1);
  const progress = position * position * (3 - 2 * position);
  document.documentElement.style.setProperty('--hero-progress', progress.toFixed(3));
  document.documentElement.style.setProperty('--header-progress', progress.toFixed(3));
  header.classList.toggle('is-scrolled', progress > 0.04);
}

if (hero) {
  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      updateLogoTransition();
      scrollFrame = 0;
    });
  }, { passive: true });
  window.addEventListener('resize', updateLogoTransition);
  updateLogoTransition();
} else if (header) {
  document.documentElement.style.setProperty('--header-progress', '1');
  header.classList.add('is-scrolled');
}

if (header && !header.querySelector('.header-consultation')) {
  const consultationAction = document.createElement('a');
  consultationAction.className = 'header-consultation';
  consultationAction.href = body.classList.contains('service-page') ? '/#contact-form' : '#contact-form';
  consultationAction.setAttribute('aria-label', 'Free Consultation');
  consultationAction.innerHTML = `
    <strong>Free Consultation</strong><span aria-hidden="true">↗</span>
  `;
  header.insertBefore(consultationAction, header.querySelector('.header-cta'));
}

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
      submitButton.querySelector('strong').textContent = 'Request my free consultation';
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

const motionTargets = document.querySelectorAll('.services-intro, .service-card, .about-hero, .about-story-grid, .process-intro, .process-card, .consultation-layout');
if (motionTargets.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const motionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  motionTargets.forEach((target) => motionObserver.observe(target));
  document.documentElement.classList.add('motion-ready');
}
