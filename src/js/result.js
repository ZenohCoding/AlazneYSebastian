// ============================================
// Result page — live, calendar-accurate counter
// since 23 May 2026, 6:52 AM (local time), totals,
// typewriter closing message, ambient hearts
// ============================================

(function () {
  const START = new Date(2026, 4, 23, 6, 52, 0); // month is 0-indexed: 4 = May

  const els = {
    years:   document.getElementById('c-years'),
    months:  document.getElementById('c-months'),
    days:    document.getElementById('c-days'),
    hours:   document.getElementById('c-hours'),
    minutes: document.getElementById('c-minutes'),
    seconds: document.getElementById('c-seconds'),
    totalDays:  document.getElementById('t-days'),
    totalHours: document.getElementById('t-hours'),
  };

  function pad(n) { return n.toString().padStart(2, '0'); }

  function getElapsed(start, now) {
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    let hours = now.getHours() - start.getHours();
    let minutes = now.getMinutes() - start.getMinutes();
    let seconds = now.getSeconds() - start.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += prevMonthLastDay;
      months--;
    }
    if (months < 0) { months += 12; years--; }

    return { years, months, days, hours, minutes, seconds };
  }

  function setDigit(el, value) {
    if (el.textContent === value) return;
    el.textContent = value;
    el.classList.remove('digit-pulse');
    // force reflow so the animation can retrigger on rapid changes
    void el.offsetWidth;
    el.classList.add('digit-pulse');
  }

  let firstRender = true;

  function render() {
    const now = new Date();
    const e = getElapsed(START, now);
    setDigit(els.years, String(e.years));
    setDigit(els.months, String(e.months));
    setDigit(els.days, String(e.days));
    setDigit(els.hours, pad(e.hours));
    setDigit(els.minutes, pad(e.minutes));
    setDigit(els.seconds, pad(e.seconds));

    const msTotal = now - START;
    els.totalDays.textContent = Math.floor(msTotal / 86400000).toLocaleString('es-ES');
    els.totalHours.textContent = Math.floor(msTotal / 3600000).toLocaleString('es-ES');

    if (firstRender) {
      firstRender = false;
      setTimeout(() => {
        const rect = els.seconds.getBoundingClientRect();
        if (typeof window.spawnHeartBurst === 'function') {
          window.spawnHeartBurst(rect.left + rect.width / 2, rect.top, 14);
        }
      }, 650);
    }
  }

  render();
  setInterval(render, 1000);

  // --- Typewriter closing message ---
  const closing = document.getElementById('closing-message');
  const MESSAGE = 'Y contando. Cada segundo de esta cuenta es uno que elegiría vivir otra vez, Alazne.';
  let ci = 0;
  function typeClosing() {
    if (ci <= MESSAGE.length) {
      closing.textContent = MESSAGE.slice(0, ci);
      ci++;
      setTimeout(typeClosing, 32);
    }
  }
  setTimeout(typeClosing, 2100);

  // --- Ambient hearts ---
  const container = document.getElementById('ambient-hearts');
  function spawnHeart() {
    const el = document.createElement('span');
    el.className = 'mini-heart';
    el.textContent = '♥';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
    const duration = 10 + Math.random() * 9;
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = (Math.random() * 5) + 's';
    el.style.fontSize = (0.6 + Math.random() * 0.7) + 'rem';
    container.appendChild(el);
    setTimeout(() => el.remove(), (duration + 5) * 1000);
  }
  for (let i = 0; i < 10; i++) spawnHeart();
  setInterval(spawnHeart, 1100);
})();
