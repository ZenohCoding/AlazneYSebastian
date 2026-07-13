// ============================================
// Journey page — arrow and path-draw are driven by
// the SAME progress value every frame, so they can
// never fall out of sync. Captions tell the story
// along the way.
// ============================================

(function () {
  const path = document.getElementById('journey-path');
  const pathGlow = document.getElementById('journey-path-glow');
  const arrow = document.getElementById('arrow-head');
  const heartLayer = document.getElementById('heart-layer');
  const caption = document.getElementById('journey-caption');
  const skipBtn = document.getElementById('skip-btn');
  const veil = document.getElementById('transition-veil');
  const svg = document.getElementById('journey-svg');
  const milestoneLayer = document.getElementById('milestone-layer');

  const pathLength = path.getTotalLength();
  path.style.strokeDasharray = pathLength;
  path.style.strokeDashoffset = pathLength;
  pathGlow.style.strokeDasharray = pathLength;
  pathGlow.style.strokeDashoffset = pathLength;

  const DURATION = 21000; // ms — ritmo pausado, con tiempo de sobra para leer cada frase
  const START_DELAY = 400;
  const BINARY_STRINGS = ['0', '1', '01', '10', '011', '101'];

  const STORY = [
    { text: 'Había una vez dos personas, en dos puntos distintos del mapa...', from: 0.02, to: 0.26 },
    { text: 'que un día, sin planearlo demasiado, decidieron encontrarse.', from: 0.30, to: 0.52 },
    { text: 'Desde entonces, cada vuelta de este camino somos nosotros dos.', from: 0.56, to: 0.80 },
    { text: 'Y esto, Alazne, todavía no lo hemos terminado de escribir.', from: 0.84, to: 1.02 },
  ];
  let activeStoryIndex = -1;

  // --- Milestone dots along the path, one per story beat, lighting up as the arrow passes ---
  const milestones = STORY.map(s => {
    const pt = path.getPointAtLength(s.from * pathLength);
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('class', 'milestone-dot');
    dot.setAttribute('cx', pt.x);
    dot.setAttribute('cy', pt.y);
    dot.setAttribute('r', 5);
    milestoneLayer.appendChild(dot);
    return { from: s.from, el: dot, pt, lit: false };
  });

  let startTime = null;
  let rafId = null;
  let finished = false;
  let lastTrailAt = 0;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function svgPointToScreen(pt) {
    const ctm = svg.getScreenCTM();
    const transformed = pt.matrixTransform(ctm);
    return { x: transformed.x, y: transformed.y };
  }

  function spawnTrail(pt, rawProgress) {
    const el = document.createElement('span');
    const isHeart = rawProgress > 0.55 || (rawProgress > 0.28 && Math.random() < (rawProgress - 0.28) * 1.4);
    el.className = 'trail-mark' + (isHeart ? ' is-heart' : '');
    el.textContent = isHeart ? '♥' : BINARY_STRINGS[Math.floor(Math.random() * BINARY_STRINGS.length)];
    const screenPt = svgPointToScreen(pt);
    el.style.left = screenPt.x + (Math.random() * 18 - 9) + 'px';
    el.style.top = screenPt.y + (Math.random() * 18 - 9) + 'px';
    heartLayer.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }

  function updateCaption(rawProgress) {
    const idx = STORY.findIndex(s => rawProgress >= s.from && rawProgress < s.to);
    if (idx !== activeStoryIndex) {
      caption.classList.remove('visible');
      if (idx !== -1) {
        setTimeout(() => {
          caption.textContent = STORY[idx].text;
          requestAnimationFrame(() => caption.classList.add('visible'));
        }, activeStoryIndex === -1 ? 0 : 350);
      }
      activeStoryIndex = idx;
    }
  }

  function step(timestamp) {
    if (finished) return;
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const rawProgress = Math.min(elapsed / DURATION, 1);
    const progress = easeInOutCubic(rawProgress);

    const currentLen = progress * pathLength;
    const offset = pathLength - currentLen;
    path.style.strokeDashoffset = offset;
    pathGlow.style.strokeDashoffset = offset;

    const pt = path.getPointAtLength(currentLen);
    const lookAheadPt = path.getPointAtLength(Math.min(currentLen + 2, pathLength));
    const angle = Math.atan2(lookAheadPt.y - pt.y, lookAheadPt.x - pt.x) * (180 / Math.PI);

    arrow.classList.add('moving');
    arrow.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${angle})`);

    if (elapsed - lastTrailAt > 170 && rawProgress < 0.98) {
      spawnTrail(pt, rawProgress);
      lastTrailAt = elapsed;
    }

    milestones.forEach(m => {
      if (!m.lit && rawProgress >= m.from) {
        m.lit = true;
        m.el.classList.add('lit');
        if (typeof window.spawnHeartBurst === 'function') {
          const screenPt = svgPointToScreen(m.pt);
          window.spawnHeartBurst(screenPt.x, screenPt.y, 7);
        }
      }
    });

    updateCaption(rawProgress);

    if (rawProgress >= 1) {
      finishJourney();
      return;
    }
    rafId = requestAnimationFrame(step);
  }

  function finishJourney() {
    finished = true;
    if (rafId) cancelAnimationFrame(rafId);
    skipBtn.style.display = 'none';

    milestones.forEach(m => { if (!m.lit) { m.lit = true; m.el.classList.add('lit'); } });

    const endPt = path.getPointAtLength(pathLength);
    const screenPt = svgPointToScreen(endPt);

    if (typeof window.spawnHeartBurst === 'function') {
      window.spawnHeartBurst(screenPt.x, screenPt.y, 22);
    }

    // --- Cinematic push-in: the whole scene zooms toward the final point,
    // then the veil opens from that exact spot, so the cut to the next
    // scene reads as one continuous camera move rather than a jump. ---
    const stage = document.querySelector('.journey-stage');
    const xPct = (screenPt.x / window.innerWidth) * 100;
    const yPct = (screenPt.y / window.innerHeight) * 100;
    stage.style.setProperty('--zoom-x', xPct + '%');
    stage.style.setProperty('--zoom-y', yPct + '%');
    veil.style.setProperty('--veil-x', xPct + '%');
    veil.style.setProperty('--veil-y', yPct + '%');

    setTimeout(() => {
      caption.classList.remove('visible');
      stage.classList.add('zooming');
    }, 550);

    setTimeout(() => {
      veil.classList.add('active');
      setTimeout(() => { window.location.href = 'encuentro.html'; }, 950);
    }, 1900);
  }

  function skip() {
    if (finished) return;
    finished = true;
    if (rafId) cancelAnimationFrame(rafId);
    path.style.strokeDashoffset = 0;
    pathGlow.style.strokeDashoffset = 0;
    const endPt = path.getPointAtLength(pathLength);
    arrow.classList.add('moving');
    arrow.setAttribute('transform', `translate(${endPt.x}, ${endPt.y})`);
    finished = false;
    finishJourney();
  }

  skipBtn.addEventListener('click', skip);

  setTimeout(() => { rafId = requestAnimationFrame(step); }, START_DELAY);
})();
