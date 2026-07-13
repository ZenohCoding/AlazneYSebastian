// ============================================
// Letter page — drag-to-open envelope,
// then a paginated, auto-discovering letter reader.
//
// Letters live in /letters/ as plain .txt files:
//   letters/1.txt     -> letter #1, page 1
//   letters/1.2.txt   -> letter #1, page 2 (more text)
//   letters/1.3.txt   -> letter #1, page 3
//   letters/2.txt     -> letter #2, page 1
//   ...and so on. Missing files are simply treated as
//   "no more pages" / "no more letters" — nothing breaks.
// ============================================

(function () {

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
  for (let i = 0; i < 9; i++) spawnHeart();
  setInterval(spawnHeart, 1300);

  /* ============================================
     PART 1 — the envelope drag-to-open interaction
     ============================================ */

  const envelope   = document.getElementById('envelope');
  const dragHint   = document.getElementById('drag-hint');
  const tapOpenBtn = document.getElementById('tap-open');
  const envelopeScene = document.getElementById('envelope-scene');
  const readingScene  = document.getElementById('reading-scene');

  const OPEN_THRESHOLD = 0.55;
  let progress = 0;
  let dragging = false;
  let startY = 0;
  let startProgress = 0;
  let opened = false;
  const DRAG_DISTANCE = () => Math.max(140, Math.min(240, window.innerHeight * 0.24));

  function setProgress(p) {
    progress = Math.max(0, Math.min(1, p));
    envelope.style.setProperty('--progress', progress.toFixed(4));
  }

  function hideHintOnce() {
    if (!dragHint.classList.contains('hidden')) dragHint.classList.add('hidden');
  }

  function onPointerDown(e) {
    if (opened) return;
    dragging = true;
    envelope.classList.remove('snapping');
    envelope.classList.add('dragging');
    startY = e.clientY;
    startProgress = progress;
    hideHintOnce();
    envelope.setPointerCapture && envelope.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const delta = startY - e.clientY; // positive when dragging upward
    setProgress(startProgress + delta / DRAG_DISTANCE());
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    envelope.classList.remove('dragging');
    envelope.classList.add('snapping');

    if (progress >= OPEN_THRESHOLD) {
      finishOpening();
    } else {
      setProgress(0);
    }
  }

  envelope.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  tapOpenBtn.addEventListener('click', () => {
    if (opened) return;
    hideHintOnce();
    envelope.classList.add('snapping');
    finishOpening();
  });

  function finishOpening() {
    if (opened) return;
    opened = true;
    setProgress(1);
    envelopeScene.classList.add('leaving');
    setTimeout(() => {
      envelopeScene.style.display = 'none';
      readingScene.classList.add('active');
      readingScene.setAttribute('aria-hidden', 'false');
      startReading();
    }, 560);
  }

  /* ============================================
     PART 2 — the letter reader
     Reads straight from the CARTAS array defined in
     js/cartas.js. No fetch, no server needed — this
     works even opening index.html with a double click.
     ============================================ */

  const metaEl     = document.getElementById('letter-meta');
  const contentEl  = document.getElementById('letter-content');
  const loadingEl  = document.getElementById('letter-loading');
  const fallbackEl = document.getElementById('letter-fallback');
  const cardEl     = document.getElementById('paper-card');
  const prevBtn    = document.getElementById('prev-btn');
  const nextBtn    = document.getElementById('next-btn');
  const dotsEl     = document.getElementById('nav-dots');
  const closeBtn   = document.getElementById('close-letter');

  const cartas = (typeof CARTAS !== 'undefined' && Array.isArray(CARTAS)) ? CARTAS : [];

  let letterIndex = 0; // 0-based index into `cartas`
  let pageIndex = 0;   // 0-based index into `cartas[letterIndex]`

  function currentPages() {
    return cartas[letterIndex] || [];
  }

  function parseLetter(raw) {
    const lines = raw.replace(/\r\n/g, '\n').trim().split('\n');
    let title = null;
    let signature = null;

    if (lines.length && lines[0].trim().startsWith('# ')) {
      title = lines.shift().trim().slice(2).trim();
    }
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    if (lines.length && lines[lines.length - 1].trim().startsWith('- ')) {
      signature = lines.pop().trim().slice(2).trim();
    }

    const body = lines.join('\n').trim();
    const paragraphs = body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    return { title, paragraphs, signature };
  }

  function renderLetter(raw, { isEnd } = {}) {
    const { title, paragraphs, signature } = parseLetter(raw);
    contentEl.innerHTML = '';

    if (title) {
      const h = document.createElement('h2');
      h.className = 'letter-title';
      h.textContent = title;
      contentEl.appendChild(h);
    }

    paragraphs.forEach(p => {
      const el = document.createElement('p');
      el.className = 'letter-paragraph';
      p.split('\n').forEach((line, i) => {
        if (i > 0) el.appendChild(document.createElement('br'));
        el.appendChild(document.createTextNode(line));
      });
      contentEl.appendChild(el);
    });

    if (signature) {
      const sig = document.createElement('p');
      sig.className = 'letter-signature';
      sig.textContent = signature;
      contentEl.appendChild(sig);
    }

    if (isEnd) {
      const end = document.createElement('p');
      end.className = 'letter-end';
      end.textContent = '✦';
      contentEl.appendChild(end);
    }
  }

  function updateMeta(isEnd) {
    const totalPages = currentPages().length;
    metaEl.textContent = totalPages > 1
      ? `carta ${letterIndex + 1} · página ${pageIndex + 1} de ${totalPages}`
      : `carta ${letterIndex + 1}`;

    dotsEl.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('span');
      dot.className = 'nav-dot' + (i === pageIndex ? ' active' : '');
      dotsEl.appendChild(dot);
    }

    prevBtn.disabled = (letterIndex === 0 && pageIndex === 0);

    if (isEnd) {
      nextBtn.disabled = true;
      nextBtn.querySelector('.nav-label').textContent = 'eso es todo, por ahora';
      nextBtn.querySelector('.nav-arrow').textContent = '♥';
    } else {
      nextBtn.disabled = false;
    }
  }

  function loadCurrentPage({ direction = null } = {}) {
    fallbackEl.hidden = true;
    loadingEl.hidden = true;
    contentEl.innerHTML = '';

    if (direction) {
      cardEl.classList.add(direction === 'next' ? 'turn-out-next' : 'turn-out-prev');
    }

    const pages = currentPages();
    const text = pages[pageIndex];

    if (!text) {
      // no cartas at all yet — friendly empty state, nothing breaks
      fallbackEl.hidden = false;
      metaEl.textContent = 'sin cartas todavía';
      dotsEl.innerHTML = '';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    const hasNextPage = pageIndex + 1 < pages.length;
    const hasNextLetter = !hasNextPage && (letterIndex + 1 < cartas.length);
    const isEnd = !hasNextPage && !hasNextLetter;

    renderLetter(text, { isEnd });
    updateMeta(isEnd);

    nextBtn.dataset.advance = hasNextPage ? 'page' : (hasNextLetter ? 'letter' : '');
    if (!isEnd) {
      nextBtn.querySelector('.nav-label').textContent = hasNextPage ? 'sigue' : 'carta siguiente';
      nextBtn.querySelector('.nav-arrow').textContent = '→';
    }

    requestAnimationFrame(() => {
      cardEl.classList.remove('turn-out-next', 'turn-out-prev');
      cardEl.classList.add('turn-in');
      setTimeout(() => cardEl.classList.remove('turn-in'), 520);
    });
  }

  function goNext() {
    if (nextBtn.disabled) return;
    const advance = nextBtn.dataset.advance;
    if (advance === 'page') {
      pageIndex += 1;
    } else if (advance === 'letter') {
      letterIndex += 1;
      pageIndex = 0;
    } else {
      return;
    }
    loadCurrentPage({ direction: 'next' });
  }

  function goPrev() {
    if (prevBtn.disabled) return;
    if (pageIndex > 0) {
      pageIndex -= 1;
    } else if (letterIndex > 0) {
      letterIndex -= 1;
      pageIndex = currentPages().length - 1;
    } else {
      return;
    }
    loadCurrentPage({ direction: 'prev' });
  }

  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrev);

  window.addEventListener('keydown', (e) => {
    if (!readingScene.classList.contains('active')) return;
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  // simple swipe support on the paper card
  let touchStartX = null;
  cardEl.addEventListener('pointerdown', (e) => { touchStartX = e.clientX; });
  cardEl.addEventListener('pointerup', (e) => {
    if (touchStartX === null) return;
    const dx = e.clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) < 60) return;
    if (dx < 0) goNext(); else goPrev();
  });

  closeBtn.addEventListener('click', () => {
    window.location.href = 'result.html';
  });

  function startReading() {
    loadCurrentPage();
  }

})();
