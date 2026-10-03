(() => {
  const hero = document.querySelector('.hero');
  const handoff = document.querySelector('.drive-track');
  if (!hero || !handoff || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;
  const clamp = (value) => Math.min(1, Math.max(0, value));

  const render = () => {
    frame = 0;
    const viewport = window.innerHeight || 1;
    const start = hero.offsetTop + hero.offsetHeight - viewport * 0.68;
    const end = handoff.offsetTop + Math.min(handoff.offsetHeight * 0.78, viewport * 0.48);
    const raw = clamp((window.scrollY - start) / Math.max(1, end - start));
    const progress = raw * raw * (3 - 2 * raw);

    hero.style.setProperty('--handoff-progress', progress.toFixed(3));
    hero.style.setProperty('--handoff-zoom', (1 + progress * 0.14).toFixed(3));
    hero.style.setProperty('--handoff-copy-y', `${(-58 * progress).toFixed(1)}px`);
    hero.style.setProperty('--handoff-copy-opacity', (1 - progress * 0.72).toFixed(3));
    hero.style.setProperty('--handoff-copy-blur', `${(progress * 3).toFixed(1)}px`);

    handoff.style.setProperty('--handoff-progress', progress.toFixed(3));
    handoff.style.setProperty('--handoff-beam-x', `${(handoff.clientWidth * progress).toFixed(1)}px`);
    handoff.style.setProperty('--handoff-glow-opacity', (progress * 0.72).toFixed(3));
    handoff.style.setProperty('--handoff-beam-opacity', Math.min(1, 4 * progress * (1 - progress)).toFixed(3));
    handoff.style.setProperty('--handoff-content-y', `${(20 * (1 - progress)).toFixed(1)}px`);
    handoff.style.setProperty('--handoff-content-opacity', (0.32 + progress * 0.68).toFixed(3));
    handoff.style.setProperty('--handoff-logo-glow', `${(2 + progress * 12).toFixed(1)}px`);
  };

  const requestRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  window.addEventListener('pageshow', requestRender);
  requestRender();
})();
