// ============================================
// Landing page — boot sequence, ambient hearts,
// entry transition
// ============================================

(function () {
  // --- Terminal-style boot sequence ---
  const bootLines = document.getElementById('boot-lines');
  const sequence = [
    'iniciando test lol.exe',
    'cargando recuerdos...  [OK]',
    'sincronizando latidos...  [OK]',
    'calculando tiempo juntos...'
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let rendered = '';

  function typeNext() {
    if (lineIndex >= sequence.length) return;
    const line = sequence[lineIndex];

    if (charIndex <= line.length) {
      const soFar = rendered + '> ' + line.slice(0, charIndex);
      bootLines.innerHTML = soFar.replace(/\[OK\]/g, '<span class="ok">[OK]</span>') + '<span class="cursor">&nbsp;</span>';
      charIndex++;
      setTimeout(typeNext, 16 + Math.random() * 18);
    } else {
      rendered += '> ' + line + '\n';
      lineIndex++;
      charIndex = 0;
      setTimeout(typeNext, 220);
    }
  }
  typeNext();

  // --- Ambient hearts (binary digits + real hearts) ---
  const container = document.getElementById('ambient-hearts');
  const BINARY_STRINGS = ['01', '10', '011', '110', '0110', '1001'];

  function spawnHeart() {
    const el = document.createElement('span');
    const isGlyph = Math.random() < 0.35;
    el.className = 'mini-heart' + (isGlyph ? ' is-glyph' : '');
    el.textContent = isGlyph ? '♥' : BINARY_STRINGS[Math.floor(Math.random() * BINARY_STRINGS.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    const duration = 9 + Math.random() * 8;
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = (Math.random() * 4) + 's';
    el.style.fontSize = (0.65 + Math.random() * 0.65) + 'rem';
    container.appendChild(el);
    setTimeout(() => el.remove(), (duration + 4) * 1000);
  }

  for (let i = 0; i < 20; i++) spawnHeart();
  setInterval(spawnHeart, 650);

  // --- Entry transition to the journey page ---
  const btn = document.getElementById('ver-btn');
  const veil = document.getElementById('transition-veil');

  btn.addEventListener('click', () => {
    btn.disabled = true;
    veil.classList.add('active');
    setTimeout(() => { window.location.href = 'journey.html'; }, 850);
  });
})();
