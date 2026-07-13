// ============================================
// Shared enhancement layer — runs on every page.
// Everything here is additive and defensive: if an
// element doesn't exist on a given page, that piece
// just quietly does nothing. Nothing here touches or
// depends on the existing per-page scripts.
// ============================================

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState === 'interactive' || document.readyState === 'complete') init();

  function init() {
    initStarfield();
    if (isFinePointer && !prefersReducedMotion) initCursorGlow();
    initScrollReveal();
    initMagnetic();
    initBurstButtons();
    window.spawnHeartBurst = spawnHeartBurst; // exposed for page-specific scripts
  }

  /* ---------- Starfield canvas ---------- */
  function initStarfield() {
    if (prefersReducedMotion) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'star-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w, h, stars, dpr;
    let mouseX = 0.5, mouseY = 0.5;
    let targetMouseX = 0.5, targetMouseY = 0.5;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((w * h) / 16000);
      stars = Array.from({ length: Math.min(count, 130) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.6 + 0.25,
        depth: Math.random() * 0.6 + 0.2
      }));
    }

    window.addEventListener('mousemove', (e) => {
      targetMouseX = e.clientX / w;
      targetMouseY = e.clientY / h;
    }, { passive: true });

    let t = 0;
    function draw() {
      t += 0.016;
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;
      ctx.clearRect(0, 0, w, h);
      const px = (mouseX - 0.5) * 22;
      const py = (mouseY - 0.5) * 22;

      for (const s of stars) {
        const twinkle = Math.sin(t * s.speed + s.phase) * 0.35 + 0.65;
        const alpha = s.baseAlpha * twinkle;
        const ox = px * s.depth;
        const oy = py * s.depth;
        ctx.beginPath();
        ctx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(44, 95, 135, ${alpha})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
  }

  /* ---------- Cursor glow ---------- */
  function initCursorGlow() {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    let tx = gx, ty = gy;
    let shown = false;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; glow.classList.add('active'); gx = tx; gy = ty; }
    }, { passive: true });

    window.addEventListener('mouseleave', () => glow.classList.remove('active'));

    function loop() {
      gx += (tx - gx) * 0.18;
      gy += (ty - gy) * 0.18;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- Scroll reveal ---------- */
  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('in-view'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });

    items.forEach(el => io.observe(el));
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (!isFinePointer || prefersReducedMotion) return;
    const els = document.querySelectorAll('[data-magnetic]');
    els.forEach(el => {
      const strength = 0.28;
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        el.style.setProperty('--mx', (relX * strength) + 'px');
        el.style.setProperty('--my', (relY * strength) + 'px');
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------- Heart burst confetti ---------- */
  function spawnHeartBurst(x, y, count) {
    if (prefersReducedMotion) return;
    const n = count || 10;
    const glyphs = ['♥', '♥', '♥', '✦'];
    for (let i = 0; i < n; i++) {
      const el = document.createElement('span');
      el.className = 'burst-heart';
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const dist = 40 + Math.random() * 70;
      el.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
      el.style.setProperty('--by', Math.sin(angle) * dist - 30 + 'px');
      el.style.setProperty('--br', (Math.random() * 60 - 30) + 'deg');
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.fontSize = (0.8 + Math.random() * 0.7) + 'rem';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }
  }

  function initBurstButtons() {
    const ids = ['ver-btn', 'letter-cta', 'tap-open'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', (e) => {
        spawnHeartBurst(e.clientX, e.clientY);
      });
    });
  }
})();
