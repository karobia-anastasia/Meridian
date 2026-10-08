const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav__link');
const yearNode = document.getElementById('year');

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

/* Header shadow once the page has scrolled */
const header = document.querySelector('.site-header');

if (header) {
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

/* Mobile menu */
function setNavOpen(open) {
  nav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
}

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    setNavOpen(!nav.classList.contains('is-open'));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });
}

/* Highlight the nav link for the section currently in view */
if ('IntersectionObserver' in window && navLinks.length) {
  const linkFor = new Map(
    [...navLinks].map((link) => [link.getAttribute('href').slice(1), link])
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.removeAttribute('aria-current'));
      linkFor.get(entry.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  linkFor.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

/* Copy-to-clipboard buttons */
document.querySelectorAll('[data-copy]').forEach((button) => {
  const label = button.textContent;

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = 'Copied';
    } catch {
      button.textContent = button.dataset.copy;
    }
    setTimeout(() => { button.textContent = label; }, 2000);
  });
});
