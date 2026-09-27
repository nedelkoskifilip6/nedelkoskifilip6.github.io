(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const links = [...document.querySelectorAll(
    '.site-header a[href^="#"], .hero-actions a[href^="#"]'
  )];
  if (!links.length) return;

  const motionStyles = document.createElement('style');
  motionStyles.textContent = `
    .site-header nav a { position: relative; }
    .site-header nav a::after {
      content: ""; position: absolute; left: 0; right: 0; bottom: -7px; height: 1px;
      background: linear-gradient(90deg, transparent, #e52b38 18%, #ff7079 50%, #e52b38 82%, transparent);
      transform: scaleX(.15); transform-origin: center; opacity: 0;
      transition: transform .62s cubic-bezier(.16,1,.3,1), opacity .48s ease;
    }
    .site-header nav a.is-navigating::after { transform: scaleX(1); opacity: 1; }
    .site-header nav a.is-navigating, .site-header .header-cta.is-navigating {
      color: #ff858c !important; transition: color .55s ease, transform .55s cubic-bezier(.16,1,.3,1);
    }
    .site-header .header-cta.is-navigating { transform: translateY(-2px); }
    .site-header .brand img { transition: transform .6s cubic-bezier(.16,1,.3,1), filter .55s ease; }
    .site-header .brand.is-navigating img { transform: scale(.93); filter: drop-shadow(0 0 7px rgba(229,43,56,.8)); }
    .hero-actions .button { position: relative; overflow: hidden; transition: color .55s ease, border-color .55s ease, background-color .55s ease, box-shadow .55s ease, transform .55s cubic-bezier(.16,1,.3,1); }
    .hero-actions .button::after {
      content: ""; position: absolute; left: 12px; right: 12px; bottom: 4px; height: 1px;
      background: linear-gradient(90deg, transparent, #e52b38 18%, #ff858c 50%, #e52b38 82%, transparent);
      transform: scaleX(.15); transform-origin: center; opacity: 0;
      transition: transform .62s cubic-bezier(.16,1,.3,1), opacity .48s ease;
    }
    .hero-actions .button.is-navigating { color: #ffb0b5 !important; border-color: #ff858c !important; box-shadow: 0 0 18px rgba(229,43,56,.28); transform: translateY(-2px); }
    .hero-actions .button.is-navigating::after { transform: scaleX(1); opacity: 1; }
  `;
  document.head.append(motionStyles);

  let frame = 0;
  let activeLink = null;
  let cancelOnInput = null;

  const clearNavigation = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    activeLink?.classList.remove('is-navigating');
    activeLink = null;
    if (cancelOnInput) {
      window.removeEventListener('wheel', cancelOnInput);
      window.removeEventListener('touchstart', cancelOnInput);
      window.removeEventListener('keydown', cancelOnInput);
      cancelOnInput = null;
    }
  };

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href')?.slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      clearNavigation();
      activeLink = link;
      link.classList.add('is-navigating');

      const startY = window.scrollY;
      const scrollMargin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const targetY = Math.max(0, window.scrollY + target.getBoundingClientRect().top - scrollMargin);
      const distance = targetY - startY;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = reducedMotion ? 0 : Math.min(2200, Math.max(1100, Math.abs(distance) * 0.58));
      const startTime = performance.now();
      cancelOnInput = clearNavigation;
      window.addEventListener('wheel', cancelOnInput, { passive: true, once: true });
      window.addEventListener('touchstart', cancelOnInput, { passive: true, once: true });
      window.addEventListener('keydown', cancelOnInput, { once: true });

      const finish = () => {
        window.scrollTo(0, targetY);
        history.replaceState(null, '', `${location.pathname}${location.search}#${id}`);
        activeLink?.classList.remove('is-navigating');
        activeLink = null;
        frame = 0;
        if (cancelOnInput) {
          window.removeEventListener('wheel', cancelOnInput);
          window.removeEventListener('touchstart', cancelOnInput);
          window.removeEventListener('keydown', cancelOnInput);
          cancelOnInput = null;
        }
      };

      if (duration === 0 || Math.abs(distance) < 2) {
        finish();
        return;
      }

      const animate = (now) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = progress < .5
          ? 16 * Math.pow(progress, 5)
          : 1 - Math.pow(-2 * progress + 2, 5) / 2;
        window.scrollTo(0, startY + distance * eased);
        if (progress < 1) frame = requestAnimationFrame(animate);
        else finish();
      };
      frame = requestAnimationFrame(animate);
    });
  });
})();
