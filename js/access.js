const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const contactForm = document.querySelector('#contact-form');
const contactFeedback = document.querySelector('#contact-feedback');

document.querySelector('#year').textContent = new Date().getFullYear();

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  primaryNav.classList.toggle('is-open', !isOpen);
});

primaryNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    primaryNav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  });
});

const solutions = {
  club: {
    number: '01', label: 'Sports & leisure', title: 'More time on the court.<br>Less time at reception.',
    description: 'Let members register guests and book their visits before they arrive. Staff get a clear schedule for courts, classes and club events.',
    points: ['Guest and member check-in', 'Class and facility appointments', 'Daily visitor overview'], image: 'club', tab: 'tab-club'
  },
  home: {
    number: '02', label: 'Apartments', title: 'A smoother welcome<br>for every resident guest.',
    description: 'Residents can register expected visitors ahead of time. Building teams get a reliable view of who is due to arrive.',
    points: ['Resident-led visitor registration', 'Scheduled deliveries and guests', 'A shared view for the front desk'], image: 'home', tab: 'tab-home'
  },
  work: {
    number: '03', label: 'Commercial buildings', title: 'Make every meeting<br>start at the right door.',
    description: 'Coordinate guest appointments across teams and give reception a clear, up-to-date arrival schedule.',
    points: ['Pre-registered business visitors', 'Appointment-based arrival lists', 'One view across the building'], image: 'work', tab: 'tab-work'
  }
};

const solutionTabs = [...document.querySelectorAll('.solution-tab')];
const activateSolution = (tab) => {
  const solution = solutions[tab.dataset.solution];
  solutionTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  document.querySelector('#solution-panel').setAttribute('aria-labelledby', solution.tab);
  document.querySelector('#solution-number').textContent = solution.number;
  document.querySelector('#solution-label').textContent = solution.label;
  document.querySelector('#solution-title').innerHTML = solution.title;
  document.querySelector('#solution-description').textContent = solution.description;
  const points = document.querySelector('#solution-points');
  points.replaceChildren(...solution.points.map((text) => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
  const image = document.querySelector('.solution-image');
  image.className = `solution-image solution-image-${solution.image}`;
  image.setAttribute('aria-label', `${solution.label} facilities`);
};

solutionTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateSolution(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? solutionTabs.length - 1 :
      (index + (event.key === 'ArrowRight' ? 1 : solutionTabs.length - 1)) % solutionTabs.length;
    solutionTabs[nextIndex].focus();
    activateSolution(solutionTabs[nextIndex]);
  });
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const interest = data.get('interest');
  const group = contactForm.querySelector('#contact-interest').selectedOptions[0].parentElement.label;
  const request = group === 'Products' ? `I'd like to book a demo of ${interest}.`
    : group === 'Services' ? `I'd like to discuss ${interest}.`
    : `I'd like advice on which product or service fits my business.`;
  const message = [`Hello, ${request}`, `Name: ${data.get('name')}`, `Phone: ${data.get('phone')}`];
  if (data.get('email')) message.push(`Email: ${data.get('email')}`);
  if (data.get('business')) message.push(`Business: ${data.get('business')}`);
  const whatsappUrl = `https://wa.me/254757622352?text=${encodeURIComponent(message.join('\n'))}`;
  contactFeedback.textContent = 'WhatsApp will open with your request ready to send.';
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
});

// Light deterrent against casual copying and inspecting. Form fields and contact details stay usable.
const allowCopy = (target) => target instanceof Element && target.closest('input, select, textarea, .contact-actions, .phone-link, .footer-inner a[href^="tel:"]');

document.addEventListener('contextmenu', (event) => {
  if (!allowCopy(event.target)) event.preventDefault();
});

['copy', 'cut'].forEach((type) => {
  document.addEventListener(type, (event) => {
    const anchor = window.getSelection()?.anchorNode;
    const selected = anchor?.nodeType === Node.TEXT_NODE ? anchor.parentElement : anchor;
    if (!allowCopy(event.target) && !allowCopy(selected)) event.preventDefault();
  });
});

document.addEventListener('dragstart', (event) => {
  if (!allowCopy(event.target)) event.preventDefault();
});

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const mod = event.ctrlKey || event.metaKey;
  const devtools = event.key === 'F12' || (mod && event.shiftKey && ['i', 'j', 'c'].includes(key)) || (event.metaKey && event.altKey && ['i', 'j', 'c', 'u'].includes(key));
  const source = mod && ['u', 's'].includes(key);
  if (devtools || source) event.preventDefault();
});
