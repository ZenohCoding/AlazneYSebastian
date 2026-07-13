// ============================================
// Razones page — a growing list of reasons.
// Edit the REASONS array below to personalize it;
// everything else (numbering, layout, animation)
// is automatic.
// ============================================

(function () {

const REASONS = [
    'Porque eres la primera persona en la que pienso al despertar.',
    'Porque siempre consigues sacarme una sonrisa.',
    'Porque me haces sentir querido.',
    'Porque contigo puedo ser yo mismo.',
    'Porque me encanta escuchar tu voz.',
    'Porque tus abrazos son mi lugar favorito.',
    'Porque haces que los días malos sean un poco mejores.',
    'Porque siempre encuentras la forma de alegrarme.',
    'Porque eres preciosa.',
    'Porque tienes una sonrisa increíble.',
    'Porque me encanta cuando te ríes.',
    'Porque me haces sentir en paz.',
    'Porque me apoyas en todo.',
    'Porque confías en mí.',
    'Porque siempre intentas entenderme.',
    'Porque me haces sentir importante.',
    'Porque me encanta hablar contigo durante horas.',
    'Porque nunca me canso de ti.',
    'Porque me haces ilusión todos los días.',
    'Porque eres la persona con la que quiero compartir todo.',
    'Porque haces que cualquier plan sea especial.',
    'Porque hasta no hacer nada contigo es perfecto.',
    'Porque me encanta cuando me cuentas tu día.',
    'Porque siempre quiero saber cómo estás.',
    'Porque me gusta cuidar de ti.',
    'Porque me encanta cuando me llamas.',
    'Porque me haces sentir afortunado.',
    'Porque me haces reír incluso cuando no quiero.',
    'Porque eres muy cariñosa.',
    'Porque me encanta tu forma de ser.',
    'Porque contigo el tiempo pasa demasiado rápido.',
    'Porque haces que la distancia se haga más pequeña.',
    'Porque siempre espero con ganas hablar contigo.',
    'Porque me encanta cuando te emocionas.',
    'Porque me gusta hacerte feliz.',
    'Porque eres mi persona favorita.',
    'Porque haces que me sienta seguro.',
    'Porque siempre estás ahí.',
    'Porque nunca me juzgas.',
    'Porque me entiendes.',
    'Porque me gusta tu forma de pensar.',
    'Porque me encanta tu personalidad.',
    'Porque haces que todo tenga sentido.',
    'Porque me das motivos para seguir adelante.',
    'Porque haces que crea más en mí.',
    'Porque me inspiras.',
    'Porque me encanta verte feliz.',
    'Porque me gusta compartir mis logros contigo.',
    'Porque quiero celebrar todos tus logros.',
    'Porque siempre aprendo algo contigo.',
    'Porque eres muy especial.',
    'Porque me haces sentir único.',
    'Porque me encanta cómo me miras.',
    'Porque me encanta cuando me echas de menos.',
    'Porque siempre quiero estar cerca de ti.',
    'Porque contigo todo parece más fácil.',
    'Porque eres una buena persona.',
    'Porque tienes un corazón enorme.',
    'Porque me encanta hacer planes contigo.',
    'Porque me encanta imaginar nuestro futuro.',
    'Porque me haces sentir como en casa.',
    'Porque me encanta cuando te pones nerviosa.',
    'Porque adoro tus pequeños detalles.',
    'Porque nunca dejas de sorprenderme.',
    'Porque siempre consigues mejorar mi día.',
    'Porque contigo aprendí lo que es querer de verdad.',
    'Porque haces que quiera ser mejor.',
    'Porque eres muy fuerte.',
    'Porque admiro todo el esfuerzo que haces.',
    'Porque siempre intentas dar lo mejor de ti.',
    'Porque me encanta cuando hablamos hasta tarde.',
    'Porque contigo nunca faltan temas de conversación.',
    'Porque me encanta hacerte reír.',
    'Porque me encanta cuando me haces reír.',
    'Porque cada recuerdo contigo vale oro.',
    'Porque me encanta crear nuevos recuerdos contigo.',
    'Porque siempre tienes un sitio en mis pensamientos.',
    'Porque contigo soy feliz.',
    'Porque me encanta verte sonreír.',
    'Porque haces que mi corazón vaya más rápido.',
    'Porque cada día me gustas un poco más.',
    'Porque me haces sentir especial.',
    'Porque eres mi mayor casualidad.',
    'Porque me haces sentir querido incluso en silencio.',
    'Porque contigo cualquier lugar es el mejor lugar.',
    'Porque siempre quiero darte un abrazo más.',
    'Porque me encanta cuando me escribes.',
    'Porque me hace ilusión cada notificación tuya.',
    'Porque siempre espero tu mensaje.',
    'Porque me encanta decirte buenos días.',
    'Porque me encanta decirte buenas noches.',
    'Porque haces que todo tenga más color.',
    'Porque haces que los pequeños momentos sean enormes.',
    'Porque eres la mejor parte de mis días.',
    'Porque siempre tienes un hueco en mi corazón.',
    'Porque me haces creer en el amor.',
    'Porque eres mi sitio favorito.',
    'Porque eres mi felicidad.',
    'Porque te elegiría una y mil veces.',
    'Porque me enamoro un poco más de ti cada día.',
    'Porque simplemente eres tú.',
  ];

  const grid = document.getElementById('razones-grid');
  const countEl = document.getElementById('razones-count');
  const totalEl = document.getElementById('razones-total');

  if (grid) {
    totalEl.textContent = REASONS.length;

    REASONS.forEach((text, i) => {
      const card = document.createElement('article');
      card.className = 'razon-card reveal reveal-stagger';
      card.style.setProperty('--reveal-delay', ((i % 6) * 0.08) + 's');

      const num = document.createElement('span');
      num.className = 'razon-number';
      num.textContent = '#' + String(i + 1).padStart(2, '0');

      const p = document.createElement('p');
      p.className = 'razon-text';
      p.textContent = text;

      card.appendChild(num);
      card.appendChild(p);
      grid.appendChild(card);
    });

    // count-up as cards enter view
    let shown = 0;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            shown++;
            countEl.textContent = shown;
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      grid.querySelectorAll('.razon-card').forEach(el => io.observe(el));
    } else {
      countEl.textContent = REASONS.length;
    }
  }

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
