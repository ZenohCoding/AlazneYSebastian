(function () {
  const veil = document.getElementById('transition-veil');
  const skipBtn = document.getElementById('skip-btn');
  const progressFill = document.getElementById('progress-fill');

  const acts = {
    phone: document.getElementById('act-phone'),
    train: document.getElementById('act-train'),
    hug: document.getElementById('act-hug'),
    montage: document.getElementById('act-montage'),
  };
  const captions = {
    phone: document.getElementById('caption-phone'),
    train: document.getElementById('caption-train'),
    hug: document.getElementById('caption-hug'),
    montage: document.getElementById('caption-montage'),
  };

  const chatBody = document.getElementById('chat-body');
  const chatStatus = document.getElementById('chat-status');
  const chatAvatar = document.getElementById('chat-avatar');
  const chatName = document.getElementById('chat-name');
  const chatHeaderText = document.getElementById('chat-header-text');
  const phoneHearts = document.getElementById('phone-hearts');
  const trainSvg = document.getElementById('train-svg');
  const smokeLayer = document.getElementById('smoke-layer');
  const figureHim = document.getElementById('figure-him');
  const figureHer = document.getElementById('figure-her');
  const heartBeatEl = document.getElementById('heart-beat');
  const heartRingsEl = document.getElementById('heart-rings');
  const montageCards = document.getElementById('montage-cards');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cancelled = false;

  const activeTimeouts = [];
  const wait = (ms) => new Promise((resolve) => {
    const id = setTimeout(resolve, ms);
    activeTimeouts.push(id);
  });

  function setProgress(pct) {
    progressFill.style.width = pct + '%';
  }

  async function showCaption(el, text) {
    if (text && el.textContent !== text) {
      if (el.classList.contains('visible')) {
        el.classList.add('caption-fade');
        el.classList.remove('visible');
        await wait(600);
      }
      el.textContent = text;
    }
    el.classList.remove('caption-fade');
    el.classList.add('visible');
  }
  function playVoice(file) {
      const audio = new Audio(`audios/${file}.mp3`);
      audio.play().catch(() => {});
  }
  function crossTo(nextAct) {
    Object.values(acts).forEach(a => { if (a !== nextAct) a.classList.remove('active'); });
    nextAct.classList.add('active');
  }

  /* ---------- Acto 1 : el móvil, con la conversación real ---------- */
  // Tres escenas dentro del mismo móvil: primero Alazne, luego un
  // inciso hablando con Julieta, y de vuelta con Alazne.
const SCENES = [
  {
    contact: { name: 'Alazne', avatar: 'A', colorClass: 'contact-alazne' },
    caption: 'Todo empezó en Instagram, con un mensaje que ni sabía si tenía sentido.',
    system: null,
    lines: [
      { from: 'him', text: 'hola eres de Tudela? es que creo que estuviste con nosotros' },
      { from: 'her', text: 'holaa, no jaja' },
      { from: 'him', text: 'no a cual' },
      { from: 'her', text: 'a ninguna' },
      { from: 'him', text: 'ahh' },
      { from: 'him', text: 'es que pensaba que eras la del otro dia' },
      { from: 'him', text: 'habia una chica q vino y no la conocia se parece a ti' },
      { from: 'her', text: 'AJAJAJ tengo una gemela por ahi' },
      { from: 'him', text: 'Ahh igual' },
      { from: 'him', text: 'Como te llamas?' },
      { from: 'her', text: 'alazne' },
      { from: 'her', text: 'tu?' },
      { from: 'him', text: 'Me llamo Sebastian' },
      { from: 'him', text: 'de donde eres?' },
      { from: 'him', text: 'si no respondo es que estoy bastante ocupado' },
      { from: 'her', text: 'de peralta' },
      { from: 'her', text: 'jajksj tranqui' },
      { from: 'him', text: 'ala' },
      { from: 'him', text: 'a media hora bueno no tan lejos' },
      { from: 'him', text: 'cuantos años tienes?' },
      { from: 'him', text: 'ahh y es nada mas para conocerte ya q sigues a unas de mi grupo' },
      { from: 'her', text: '15' },
      { from: 'her', text: 'jakjskaj sisi ntp' },
    ],
  },
    {
      contact: { name: 'Julieta', avatar: 'J', colorClass: 'contact-julieta' },
      caption: 'Y casi lo dejo ahí… menos mal que alguien me empujó un poco.',
      system: null,
      lines: [
        { from: 'him', text: 'es muy guapa, pero es super borde y muy fría 😔 yo paso' },
        { from: 'her', text: 'inténtalo más, habla con ella' },
        { from: 'him', text: 'voy…' },
      ],
    },
    {
      contact: { name: 'Alazne', avatar: 'A', colorClass: 'contact-alazne' },
      caption: 'Así que volví a escribirle. Y esta vez sí se quedó.',
      system: 'con al.a.z.ne__',
      lines: [
        { from: 'her', text: 'jajksj tranqui' },
        { from: 'him', text: 'ala, a media hora… bueno, no tan lejos' },
        { from: 'him', text: 'es nada más para conocerte, ya que sigues a unas de mi grupo' },
        { from: 'him', text: '¿y qué quieres estudiar o trabajar o algo?' },
        { from: 'him', text: 'yo estudio programación' },
        { from: 'her', text: 'yo quiero ser psicóloga' },
        { from: 'her', text: '❤️' },
      ],
    },
  ];

  function spawnPhoneHeart() {
    const el = document.createElement('span');
    el.className = 'phone-heart';
    el.textContent = '♥';
    el.style.left = (30 + Math.random() * 40) + '%';
    el.style.bottom = (10 + Math.random() * 10) + '%';
    phoneHearts.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  function trimChat() {
    while (chatBody.children.length > 6) chatBody.removeChild(chatBody.firstChild);
  }

  async function switchContact(contact, systemText) {
    chatHeaderText.classList.add('fade-out');
    chatAvatar.classList.add('fade-out');
    chatBody.classList.add('fade-out');
    await wait(480);
    if (cancelled) return;

    chatAvatar.textContent = contact.avatar;
    chatAvatar.classList.remove('contact-alazne', 'contact-julieta');
    chatAvatar.classList.add(contact.colorClass);
    chatName.textContent = contact.name;
    chatStatus.textContent = 'en línea';
    chatBody.innerHTML = '';

    chatHeaderText.classList.remove('fade-out');
    chatAvatar.classList.remove('fade-out');
    chatBody.classList.remove('fade-out');
    await wait(520);
    if (cancelled) return;

    if (systemText) {
      const sys = document.createElement('div');
      sys.className = 'sys-msg';
      sys.textContent = systemText;
      chatBody.appendChild(sys);
      await wait(1250);
    }
  }

  async function runPhoneAct() {
    setProgress(12);
    crossTo(acts.phone);
    playVoice(1);
    await showCaption(captions.phone, SCENES[0].caption);
    chatStatus.textContent = 'en línea';
    await wait(1500);

    for (let s = 0; s < SCENES.length; s++) {
      if (cancelled) return;
      const scene = SCENES[s];

      if (s === 0) {
        chatAvatar.textContent = scene.contact.avatar;
        chatAvatar.classList.add(scene.contact.colorClass);
        chatName.textContent = scene.contact.name;
      } else {
        await switchContact(scene.contact, scene.system);
        playVoice(s + 1);
        await showCaption(captions.phone, scene.caption);
      }
      if (cancelled) return;

      for (const line of scene.lines) {
        if (cancelled) return;
        chatStatus.textContent = 'escribiendo…';
        const typing = document.createElement('div');
        typing.className = 'typing-dots from-' + line.from;
        typing.innerHTML = '<span></span><span></span><span></span>';
        chatBody.appendChild(typing);
        trimChat();
        const typingTime = 800 + Math.min(line.text.length * 16, 850);
        await wait(typingTime);
        if (cancelled) return;
        typing.remove();

        const msg = document.createElement('div');
        msg.className = 'msg from-' + line.from;
        msg.textContent = line.text;
        chatBody.appendChild(msg);
        trimChat();
        chatStatus.textContent = 'en línea';

        if (line.text.includes('❤')) spawnPhoneHeart();

        const readTime = 1300 + Math.min(line.text.length * 28, 2100);
        await wait(readTime);
      }
      await wait(700);
    }

    await wait(2000);
  }

  /* ---------- Acto 2 : el tren ---------- */
  function spawnSmoke() {
    if (cancelled) return;
    const trainRect = trainSvg.getBoundingClientRect();
    const el = document.createElement('span');
    el.className = 'smoke-puff';
    el.style.left = (trainRect.left + trainRect.width * 0.62) + 'px';
    el.style.top = (trainRect.top + trainRect.height * 0.12) + 'px';
    smokeLayer.appendChild(el);
    setTimeout(() => el.remove(), 2300);
  }

  async function runTrainAct() {
    setProgress(45);
    crossTo(acts.train);
    playVoice(4);
    await showCaption(captions.train, captions.train.textContent || 'Después de tanto hablar, llegó el día de conocernos de verdad.');
    await wait(850);
    if (cancelled) return;

    // Reinicio defensivo: se fuerza un reflow antes de lanzar la
    // animación para que siempre arranque limpia, sin importar
    // el estado previo del layout (esto es lo que evitaba que el
    // tren "no pasara" en algunos móviles).
    trainSvg.classList.remove('moving');
    void trainSvg.offsetWidth;
    trainSvg.classList.add('moving');

    let smokeInterval = null;
    if (!prefersReducedMotion) {
      smokeInterval = setInterval(spawnSmoke, 240);
    }
    const travelTime = prefersReducedMotion ? 2400 : 10200;
    await wait(travelTime + 400);
    if (smokeInterval) clearInterval(smokeInterval);
    await wait(1100);
  }

  /* ---------- Acto 3 : el abrazo y el corazón ---------- */
  async function runHugAct() {
    setProgress(68);
    crossTo(acts.hug);
    await wait(600);
    if (cancelled) return;
    figureHim.classList.add('in-view');
    figureHer.classList.add('in-view');
    playVoice(5);
    await showCaption(captions.hug, captions.hug.textContent || 'Y ahí estabas. Un abrazo, y el corazón a mil por hora.');
    await wait(2600);
    if (cancelled) return;
    figureHim.classList.add('meet');
    figureHer.classList.add('meet');
    await wait(1200);
    if (cancelled) return;
    heartBeatEl.classList.add('show');

    if (!prefersReducedMotion) {
      for (let i = 0; i < 3; i++) {
        const ring = document.createElement('span');
        ring.className = 'heart-ring';
        ring.style.animationDelay = (i * 0.6) + 's';
        heartRingsEl.appendChild(ring);
      }
    }

    if (typeof window.spawnHeartBurst === 'function') {
      const rect = heartBeatEl.getBoundingClientRect();
      window.spawnHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 26);
    }
    await wait(6400);
  }

  /* ---------- Acto 4 : el montaje feliz ---------- */
  const MONTAGE = [
    { icon: '☕', text: 'Quedamos otra vez... y otra... y otra.', top: '4%', left: '2%', rot: -4 },
    { icon: '🌅', text: 'Cada cita, un motivo más para sonreír.', top: '50%', left: '4%', rot: -2 },
    { icon: '🎧', text: 'Aprendiendo a querernos en lo pequeño.', top: '22%', left: '58%', rot: 3 },
    { icon: '📸', text: 'Guardando cada momento como un tesoro.', top: '2%', left: '32%', rot: -1 },
    { icon: '🚆', text: 'Y aquel tren que casi no llega a tiempo.', top: '58%', left: '32%', rot: 4 },
    { icon: '♥', text: 'Y así, sin darnos cuenta, fuimos muy felices.', top: '64%', left: '58%', rot: 5 },
  ];

  async function runMontageAct() {
    setProgress(90);
    crossTo(acts.montage);
    playVoice(6);
    await showCaption(captions.montage, captions.montage.textContent || 'Y desde aquel día...');

    MONTAGE.forEach((m, i) => {
      const card = document.createElement('div');
      card.className = 'montage-card';
      card.style.top = m.top;
      card.style.left = m.left;
      card.style.setProperty('--rot', m.rot + 'deg');
      card.innerHTML = '<span class="m-icon">' + m.icon + '</span><span class="m-text">' + m.text + '</span>';
      montageCards.appendChild(card);
      setTimeout(() => { if (!cancelled) card.classList.add('show'); }, 900 + i * 1050);
    });

    await wait(900 + MONTAGE.length * 1050 + 4200);
  }

  /* ---------- salida hacia result.html ---------- */
  function finishAndNavigate() {
    setProgress(100);
    veil.style.setProperty('--veil-x', '50%');
    veil.style.setProperty('--veil-y', '50%');
    veil.classList.remove('veil-intro', 'opening'); // so the exit clip-path rule isn't overridden
    veil.classList.add('active');
    setTimeout(() => { window.location.href = 'result.html'; }, 1050);
  }

  function skip() {
    if (cancelled) return;
    cancelled = true;
    activeTimeouts.forEach(id => clearTimeout(id));
    finishAndNavigate();
  }

  skipBtn.addEventListener('click', skip);

  /* ---------- intro: abrir el velo que llegó de la página anterior ---------- */
  requestAnimationFrame(() => {
    setTimeout(() => veil.classList.add('opening'), 70);
  });

  /* ---------- secuencia principal ---------- */
  async function run() {
    setProgress(4);
    await wait(900);
    await runPhoneAct();
    if (cancelled) return;
    await runTrainAct();
    if (cancelled) return;
    await runHugAct();
    if (cancelled) return;
    await runMontageAct();
    if (cancelled) return;
    finishAndNavigate();
  }

  run();
})();
