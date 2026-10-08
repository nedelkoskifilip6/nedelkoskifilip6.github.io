(() => {
  const hero = document.querySelector('.hero');
  const transition = document.querySelector('.scroll-transition');
  if (!hero || !transition) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  let frame = 0;
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const smoothstep = (value) => value * value * (3 - 2 * value);
  const chargeColor = (progress) => {
    const red = [255, 49, 61];
    const yellow = [255, 196, 52];
    const green = [74, 220, 130];
    const start = progress < 0.5 ? red : yellow;
    const end = progress < 0.5 ? yellow : green;
    const blend = progress < 0.5 ? progress * 2 : (progress - 0.5) * 2;
    const rgb = start.map((channel, index) => Math.round(channel + (end[index] - channel) * blend));
    return `rgb(${rgb.join(' ')})`;
  };

  const render = () => {
    frame = 0;
    const viewport = window.innerHeight || 1;
    // Finish the battery handoff as the model lineup reaches the top of the viewport.
    const heroHeight = Math.max(hero.offsetHeight || viewport, viewport);
    const raw = clamp(window.scrollY / heroHeight);
    const progress = smoothstep(raw);
    const fadeIn = smoothstep(clamp(raw / 0.045));
    const fadeOut = 1 - smoothstep(clamp((raw - 0.88) / 0.12));
    const pulse = Math.min(fadeIn, fadeOut);
    const width = window.innerWidth || 1;

    hero.style.setProperty('--handoff-zoom', (1 + progress * 0.16).toFixed(3));
    hero.style.setProperty('--handoff-copy-y', `${(-72 * progress).toFixed(1)}px`);
    hero.style.setProperty('--handoff-copy-opacity', (1 - progress * 0.82).toFixed(3));
    hero.style.setProperty('--handoff-copy-blur', `${(progress * 4).toFixed(1)}px`);

    transition.style.setProperty('--transition-opacity', (pulse * (width <= 640 ? 1 : 0.94)).toFixed(3));
    transition.style.setProperty('--transition-blur', `${(pulse * 5).toFixed(1)}px`);
    transition.style.setProperty('--transition-drift', `${(-progress * width * 0.13).toFixed(1)}px`);
    transition.style.setProperty('--transition-trails', (pulse * 0.92).toFixed(3));
    transition.style.setProperty('--transition-cloud-opacity', '0.82');
    transition.style.setProperty('--transition-logo-opacity', pulse.toFixed(3));
    transition.style.setProperty('--transition-logo-scale', (0.574 + pulse * 0.07).toFixed(3));
    transition.style.setProperty('--transition-logo-y', '0px');
    transition.style.setProperty('--transition-battery-opacity', (pulse * 0.9).toFixed(3));
    transition.style.setProperty('--transition-battery-scale', (0.50 + pulse * 0.03).toFixed(3));
    transition.style.setProperty('--battery-charge', (0.035 + progress * 0.965).toFixed(3));
    transition.style.setProperty('--battery-color', chargeColor(progress));
    transition.style.setProperty('--transition-edge-opacity', (pulse * 0.56304).toFixed(3));
  };

  const requestRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  window.addEventListener('pageshow', requestRender);
  requestRender();
})();
