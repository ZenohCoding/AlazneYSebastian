// ============================================
// Galería / timeline page — a vertical line of
// milestones. Edit the MILESTONES array below to
// personalize the dates and text; layout, the
// alternating sides, and the animated line fill
// are all automatic.
// ============================================

(function () {

  const MILESTONES = [
    { icon: '💬', date: 'el principio', text: 'El primer mensaje. Eras un poco borde conmigo, pero aun así sentía que había algo especial.' },

    { icon: '👀', date: 'poco después', text: 'Poco a poco empezamos a conocernos más y cada conversación me hacía quererte un poquito más.' },

    { icon: '☕', date: 'nuestra primera quedada', text: 'Nuestro primer día juntos. Me quedé completamente asombrado de lo hermosa que eres, Alazne.' },

    { icon: '✨', date: 'nuestra primera discusión', text: 'Nuestra primera discusión. Fue por Alex... y aunque fue difícil, aprendimos de ello.' },

    { icon: '🛡️', date: 'la primera vez que te defendí', text: 'Cuando Jaime se estaba riendo de ti, me enfrenté a él y a su hermano para que te dejaran en paz. Siempre voy a estar de tu lado.' },

    { icon: '🤍', date: 'nuestro primer susto', text: 'Nuestro primer susto de embarazo. Fueron momentos de muchos nervios, pero también de estar juntos apoyándonos.' },

    { icon: '🎉', date: 'nuestro primer mes', text: 'Nuestro primer mes juntos. Sin duda, el mejor mes de todos y el comienzo de algo que nunca quiero perder.' },
  ];

  const container = document.getElementById('timeline-items');
  const fillEl = document.getElementById('timeline-fill');
  const timelineEl = document.getElementById('timeline');

  if (container) {
    MILESTONES.forEach((m, i) => {
      const item = document.createElement('div');
      item.className = 'timeline-item reveal' + (i % 2 === 1 ? ' right' : '');

      const dot = document.createElement('span');
      dot.className = 'timeline-dot';

      const card = document.createElement('div');
      card.className = 'timeline-card';
      card.innerHTML =
        '<span class="timeline-icon">' + m.icon + '</span>' +
        '<span class="timeline-date">' + m.date + '</span>' +
        '<p class="timeline-text">' + m.text + '</p>';

      item.appendChild(dot);
      item.appendChild(card);
      container.appendChild(item);
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      }, { threshold: 0.5 });
      container.querySelectorAll('.timeline-item').forEach(el => io.observe(el));
    }
  }

  // animate the connecting line filling as the timeline scrolls into view
  function updateLineFill() {
    if (!timelineEl || !fillEl) return;
    const rect = timelineEl.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height;
    if (total <= 0) return;
    const scrolled = Math.min(Math.max(vh * 0.75 - rect.top, 0), total);
    const pct = (scrolled / total) * 100;
    fillEl.style.height = pct + '%';
  }
  window.addEventListener('scroll', updateLineFill, { passive: true });
  window.addEventListener('resize', updateLineFill);
  updateLineFill();

  /* ---------- ambient hearts (shared visual language) ---------- */
  const heartLayer = document.getElementById('ambient-hearts');
  function spawnHeart() {
    const el = document.createElement('span');
    el.className = 'mini-heart';
    el.textContent = '♥';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    const duration = 11 + Math.random() * 9;
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = (Math.random() * 5) + 's';
    el.style.fontSize = (0.6 + Math.random() * 0.7) + 'rem';
    heartLayer.appendChild(el);
    setTimeout(() => el.remove(), (duration + 5) * 1000);
  }
  if (heartLayer) {
    for (let i = 0; i < 8; i++) spawnHeart();
    setInterval(spawnHeart, 1400);
  }

})();
