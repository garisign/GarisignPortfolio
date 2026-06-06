const isIndexPage = Boolean(document.getElementById('splash'));

if (isIndexPage) {
  document.documentElement.style.scrollBehavior = 'auto';
  document.body.style.overflow = 'hidden';
}

/* â”€â”€ SPLASH â”€â”€ */
window.addEventListener('load', () => {
  const splash = document.getElementById('splash');
  const bar = document.querySelector('.splash-bar');
  const percent = document.querySelector('.splash-percent');
  const duration = 2000;
  const start = performance.now();

  function scrollToInitialHashTarget() {
    if (!window.__garisignInitialHash) return;
    const target = document.querySelector(window.__garisignInitialHash);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }

  function finishIndexIntro() {
    if (splash) {
      splash.classList.add('gone');
      splash.addEventListener('transitionend', () => { splash.hidden = true; }, { once: true });
    }
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      document.body.style.overflow = '';
      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        initRevealObserver();
        scrollToInitialHashTarget();
      });
    });
  }

  if (!splash || !bar || !percent) {
    initRevealObserver();
    return;
  }

  function updateSplash(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * 100);

    bar.style.width = `${value}%`;
    percent.textContent = `${value}%`;

    if (progress < 1) {
      requestAnimationFrame(updateSplash);
    } else {
      finishIndexIntro();
    }
  }

  requestAnimationFrame(updateSplash);
});

/* â”€â”€ CUSTOM CURSOR â”€â”€ */
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = -100, my = -100, rx = -100, ry = -100;

if (!isTouchDevice && cursor && ring) {
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function animCursor() {
    cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(animCursor);
  }
  animCursor();

  document.querySelectorAll('[data-hover], a, button, .work-card, .service-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
} else {
  document.body.classList.add('touch-mode');
}

/* â”€â”€ SCROLL PROGRESS â”€â”€ */
window.addEventListener('scroll', () => {
  const prog = document.getElementById('scroll-progress');
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  if (prog) prog.style.width = pct + '%';
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
  updateNavActive();
});

/* â”€â”€ NAV ACTIVE â”€â”€ */
function updateNavActive() {
  const sections = ['hero','works','services','about'];
  if (!sections.some(id => document.getElementById(id))) return;
  let cur = 'hero';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 100) cur = id;
  });
  document.querySelectorAll('[data-nav]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
  });
}

/* â”€â”€ MOBILE MENU â”€â”€ */
function toggleMenu() {
  const m = document.getElementById('mobile-menu');
  if (!m) return;
  const isOpen = !m.classList.contains('open');
  m.classList.toggle('open', isOpen);
  m.setAttribute('aria-hidden', String(!isOpen));
  document.body.classList.toggle('menu-open', isOpen);
}

document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    const m = document.getElementById('mobile-menu');
    if (m && m.classList.contains('open')) toggleMenu();
  });
});

/* â”€â”€ REVEAL ON SCROLL â”€â”€ */
function initRevealObserver() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
}

/* â”€â”€ ANIMATED BACKGROUND â€” liquid blobs â”€â”€ */
(function() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  const blobCount = isTouchDevice ? 3 : 6;
  const blobs = Array.from({length: blobCount}, (_, i) => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 260 + 160,
    hue: i % 2 === 0 ? 38 : 30,
    alpha: Math.random() * 0.045 + 0.02,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.006 + 0.003
  }));

  function drawBlob(b, t) {
    const pulse = 1 + 0.08 * Math.sin(b.phase + t * b.speed);
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * pulse);
    grad.addColorStop(0, `hsla(${b.hue},55%,62%,${b.alpha})`);
    grad.addColorStop(1, `hsla(${b.hue},55%,62%,0)`);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2); ctx.fill();
  }

  let t = 0;
  let bgAnimating = true;
  let lastFrameTs = 0;
  document.addEventListener('visibilitychange', () => {
    bgAnimating = !document.hidden;
    if (bgAnimating) requestAnimationFrame(loop);
  });

  function loop(ts) {
    if (!bgAnimating) return;
    if (ts - lastFrameTs < 66) { requestAnimationFrame(loop); return; }
    lastFrameTs = ts;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, W, H);
    t += 1;
    blobs.forEach(b => {
      b.x += b.vx; b.y += b.vy;
      if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = H + b.r; if (b.y > H + b.r) b.y = -b.r;
      drawBlob(b, t);
    });
    ctx.strokeStyle = 'rgba(221,181,108,0.025)';
    ctx.lineWidth = 0.5;
    const step = 80;
    ctx.beginPath();
    for (let x = 0; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* â”€â”€ HERO VISUAL TILT + EASTER EGGS â”€â”€ */
(function() {
  const layers = document.querySelectorAll('.hero-visual-layer');
  const tilts  = document.querySelectorAll('.hero-layer-tilt');
  if (!tilts.length) return;

  /* Proximity-based tilt â€” only reacts when cursor is near each element */
  if (!isTouchDevice) {
    const RADIUS    = 200; // px â€” influence zone per element
    const MAX_TILT  = 15;  // deg
    const MAX_TRANS = 18;  // px

    document.addEventListener('mousemove', e => {
      tilts.forEach(tilt => {
        const rect = tilt.parentElement.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > RADIUS) { tilt.style.transform = ''; return; }

        const t    = 1 - dist / RADIUS;      // 0â†’1 as cursor closes in
        const ease = t * t;                   // quadratic â€” slow start, sharp near center
        const rx   = -(dy / RADIUS) * MAX_TILT  * ease;
        const ry   =  (dx / RADIUS) * MAX_TILT  * ease;
        const tx   =  (dx / RADIUS) * MAX_TRANS * ease;
        const ty   =  (dy / RADIUS) * MAX_TRANS * ease;
        tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translate(${tx}px, ${ty}px)`;
      });
    });
  }

  /* Easter eggs â€” one unique animation per icon */
  const easterClasses = ['easter-logo', 'easter-stars', 'easter-cursor'];
  layers.forEach((layer, i) => {
    layer.addEventListener('click', () => {
      const img = layer.querySelector('.hero-layer-img');
      if (!img) return;
      const cls = easterClasses[i];
      img.classList.remove(cls);
      img.style.animation = 'none';
      requestAnimationFrame(() => {
        img.style.animation = '';
        img.classList.add(cls);
        img.addEventListener('animationend', () => img.classList.remove(cls), { once: true });
      });
    });
  });
})();
