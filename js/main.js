// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

const scroller = document.getElementById('scroller');
const panels = Array.from(document.querySelectorAll('.panel'));
const dots = Array.from(document.querySelectorAll('.dot'));
const navLinkEls = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
const prevBtn = document.getElementById('prevPanel');
const nextBtn = document.getElementById('nextPanel');

const isHorizontalMode = () => window.matchMedia('(min-width: 721px)').matches;

function panelIndex(id) {
  return panels.findIndex((p) => p.id === id);
}

function goToPanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;

  if (isHorizontalMode()) {
    panel.scrollTop = 0;
    scroller.scrollTo({ left: panel.offsetLeft, behavior: 'smooth' });
  } else {
    panel.scrollIntoView({ behavior: 'smooth' });
  }
}

function currentIndex() {
  if (!isHorizontalMode()) return 0;
  const target = scroller.scrollLeft + scroller.clientWidth / 2;
  let closest = 0;
  let closestDist = Infinity;
  panels.forEach((p, i) => {
    const center = p.offsetLeft + p.clientWidth / 2;
    const dist = Math.abs(center - target);
    if (dist < closestDist) {
      closestDist = dist;
      closest = i;
    }
  });
  return closest;
}

function updateEdgeButtons() {
  if (!isHorizontalMode()) return;
  const idx = currentIndex();
  prevBtn.disabled = idx <= 0;
  nextBtn.disabled = idx >= panels.length - 1;
}

// Nav links, hero CTA, footer links -> smooth panel navigation
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    goToPanel(id);
    navLinks.classList.remove('open');
  });
});

// Dot nav
dots.forEach((dot) => {
  dot.addEventListener('click', () => goToPanel(dot.dataset.target));
});

// Edge arrows
prevBtn.addEventListener('click', () => {
  const idx = currentIndex();
  if (idx > 0) goToPanel(panels[idx - 1].id);
});
nextBtn.addEventListener('click', () => {
  const idx = currentIndex();
  if (idx < panels.length - 1) goToPanel(panels[idx + 1].id);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!isHorizontalMode()) return;
  const idx = currentIndex();
  if (e.key === 'ArrowRight' || e.key === 'PageDown') {
    if (idx < panels.length - 1) goToPanel(panels[idx + 1].id);
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    if (idx > 0) goToPanel(panels[idx - 1].id);
  } else if (e.key === 'Home') {
    goToPanel(panels[0].id);
  } else if (e.key === 'End') {
    goToPanel(panels[panels.length - 1].id);
  }
});

// Wheel: let a panel scroll vertically within itself first; only once
// it hits its own top/bottom edge does the wheel move between panels.
scroller.addEventListener(
  'wheel',
  (e) => {
    if (!isHorizontalMode()) return;

    const panel = e.target.closest('.panel');
    if (panel) {
      const needsVerticalScroll = panel.scrollHeight > panel.clientHeight + 1;
      if (needsVerticalScroll) {
        const atTop = panel.scrollTop <= 0;
        const atBottom = Math.ceil(panel.scrollTop + panel.clientHeight) >= panel.scrollHeight;
        const scrollingDown = e.deltaY > 0;
        if ((scrollingDown && !atBottom) || (!scrollingDown && !atTop)) {
          return;
        }
      }
    }

    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    scroller.scrollLeft += e.deltaY;
  },
  { passive: false }
);

// Active-panel tracking: dot nav, edge buttons, nav-link highlight
const panelObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const id = entry.target.id;
        dots.forEach((d) => d.classList.toggle('active', d.dataset.target === id));
        navLinkEls.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
        updateEdgeButtons();
      }
    });
  },
  { threshold: [0.5] }
);
panels.forEach((p) => panelObserver.observe(p));

scroller.addEventListener('scroll', () => updateEdgeButtons());
window.addEventListener('resize', () => updateEdgeButtons());
updateEdgeButtons();
if (dots[0]) dots[0].classList.add('active');

// Nav bar backdrop state
const nav = document.getElementById('nav');
function updateNavScrolled() {
  const scrolled = isHorizontalMode() ? scroller.scrollLeft > 10 : window.scrollY > 10;
  nav.classList.toggle('scrolled', scrolled);
}
scroller.addEventListener('scroll', updateNavScrolled);
window.addEventListener('scroll', updateNavScrolled);
updateNavScrolled();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Scroll reveal (works regardless of scroll axis — root defaults to the viewport)
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i % 4, 3) * 0.08}s`;
  revealObserver.observe(el);
});
