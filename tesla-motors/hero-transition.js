(() => {
  const hero = document.querySelector('.hero');
  const transition = document.querySelector('.scroll-transition');
  if (!hero || !transition) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  let frame = 0;
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const smoothstep = (value) => value * value * (3 - 2 * value);

  const render = () => {
    frame = 0;
    const viewport = window.innerHeight || 1;
    const raw = clamp(window.scrollY / (viewport * 0.92));
    const progress = smoothstep(raw);
    const pulse = Math.pow(Math.max(0, Math.sin(Math.PI * progress)), 0.72);
    const width = window.innerWidth || 1;

    hero.style.setProperty('--handoff-progress', progress.toFixed(3));
    hero.style.setProperty('--handoff-zoom', (1 + progress * 0.16).toFixed(3));
    hero.style.setProperty('--handoff-copy-y', `${(-72 * progress).toFixed(1)}px`);
    hero.style.setProperty('--handoff-copy-opacity', (1 - progress * 0.82).toFixed(3));
    hero.style.setProperty('--handoff-copy-blur', `${(progress * 4).toFixed(1)}px`);

    transition.style.setProperty('--transition-progress', progress.toFixed(3));
    transition.style.setProperty('--transition-opacity', (pulse * 0.94).toFixed(3));
    transition.style.setProperty('--transition-blur', `${(pulse * 5).toFixed(1)}px`);
    transition.style.setProperty('--transition-drift', `${(-progress * width * 0.13).toFixed(1)}px`);
    transition.style.setProperty('--transition-glow-drift', `${((0.5 - progress) * width * 0.34).toFixed(1)}px`);
    transition.style.setProperty('--transition-trails', (pulse * 0.92).toFixed(3));
    transition.style.setProperty('--transition-glow', (pulse * 0.9).toFixed(3));
    transition.style.setProperty('--transition-cloud-opacity', '0.82');
    transition.style.setProperty('--transition-lightning-opacity', '0.3');
    transition.style.setProperty('--storm-bolt-progress', clamp(progress * 1.45).toFixed(3));
    transition.style.setProperty('--storm-branch-a', clamp((progress - 0.16) * 6.2).toFixed(3));
    transition.style.setProperty('--storm-branch-b', clamp((progress - 0.32) * 5.2).toFixed(3));
    transition.style.setProperty('--storm-branch-c', clamp((progress - 0.49) * 4.8).toFixed(3));
    transition.style.setProperty('--transition-logo-opacity', pulse.toFixed(3));
    transition.style.setProperty('--transition-logo-scale', (0.82 + progress * 0.22).toFixed(3));
    transition.style.setProperty('--transition-logo-y', `${(-18 * progress).toFixed(1)}px`);
  };

  const requestRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  window.addEventListener('pageshow', requestRender);
  requestRender();
})();
