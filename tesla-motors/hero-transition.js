(() => {
  const hero = document.querySelector('.hero');
  const transition = document.querySelector('.scroll-transition');
  if (!hero || !transition) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;
  let frame = 0;
  let lastWidth = window.innerWidth;
  let heroHeight = 0;
  let easedRaw = null;
  let lastFrameTime = 0;
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
    return 'rgb(' + rgb.join(' ') + ')';
  };
  const render = () => {
    frame = 0;
    const viewport = window.innerHeight || 1;
    // Finish the battery handoff as the model lineup reaches the top of the viewport.
    if (!heroHeight) heroHeight = hero.offsetHeight || viewport;
    const scrollProgress = window.scrollY / heroHeight;
    const animationStart = 0.06;
    const animationSpan = 0.84;
    const targetRaw = clamp((scrollProgress - animationStart) / animationSpan);
    const now = performance.now();
    if (easedRaw === null) {
      easedRaw = targetRaw;
      lastFrameTime = now;
    } else {
      const frameDelta = Math.min(50, Math.max(1, now - lastFrameTime));
      const easing = 1 - Math.exp(-frameDelta / 42);
      easedRaw += (targetRaw - easedRaw) * easing;
      if (Math.abs(targetRaw - easedRaw) < 0.0008) easedRaw = targetRaw;
      lastFrameTime = now;
    }
    const progress = smoothstep(easedRaw);
    const fadeIn = smoothstep(clamp(easedRaw / 0.22));
    const fadeOut = 1 - smoothstep(clamp((easedRaw - 0.65) / 0.35));
    const pulse = Math.min(fadeIn, fadeOut);
    const width = window.innerWidth || 1;
    hero.style.setProperty('--handoff-zoom', (1 + progress * 0.16).toFixed(3));
    hero.style.setProperty('--handoff-copy-y', (-72 * progress).toFixed(1) + 'px');
    hero.style.setProperty('--handoff-copy-opacity', (1 - progress * 0.82).toFixed(3));
    hero.style.setProperty('--handoff-copy-blur', (progress * 4).toFixed(1) + 'px');
    transition.style.setProperty('--transition-opacity', (pulse * (width <= 640 ? 1 : 0.98)).toFixed(3));
    transition.style.setProperty('--transition-blur', (pulse * 5).toFixed(1) + 'px');
    transition.style.setProperty('--transition-drift', (-progress * width * 0.13).toFixed(1) + 'px');
    transition.style.setProperty('--transition-trails', (pulse * 0.52).toFixed(3));
    transition.style.setProperty('--transition-cloud-opacity', '0.52');
    transition.style.setProperty('--transition-logo-opacity', pulse.toFixed(3));
    transition.style.setProperty('--transition-logo-scale', (0.38 + pulse * 0.05).toFixed(3));
    transition.style.setProperty('--transition-logo-y', '0px');
    transition.style.setProperty('--transition-battery-opacity', pulse.toFixed(3));
    transition.style.setProperty('--transition-battery-scale', (0.42 + pulse * 0.02).toFixed(3));
    transition.style.setProperty('--battery-charge', (0.035 + progress * 0.965).toFixed(3));
    transition.style.setProperty('--battery-color', chargeColor(progress));
    transition.style.setProperty('--transition-edge-opacity', (pulse * 0.4).toFixed(3));
    if (Math.abs(easedRaw - targetRaw) > 0.0008) frame = requestAnimationFrame(render);
  };
  const requestRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', () => {
    // LinkedIn's mobile browser expands its top bar on upward scroll. Ignore
    // height-only viewport changes so the battery handoff does not jump.
    const width = window.innerWidth;
    if (width === lastWidth) return;
    lastWidth = width;
    heroHeight = hero.offsetHeight || window.innerHeight || 1;
    requestRender();
  }, { passive: true });
  window.addEventListener('pageshow', requestRender);
  requestRender();
})();
