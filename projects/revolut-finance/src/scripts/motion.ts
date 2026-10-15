import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initializeMotion() {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });
  const journey = document.querySelector<HTMLElement>('.cinematic-journey');
  const hero = document.querySelector<HTMLElement>('.hero');
  const banking = document.querySelector<HTMLElement>('#banking');
  const nav = document.querySelector<HTMLElement>('.nav');
  const description = document.querySelector<HTMLElement>('.hero-description');
  const download = document.querySelector<HTMLAnchorElement>('.hero a');
  const curtain = document.querySelector<HTMLElement>('.concept-strip');
  if (!journey || !hero || !banking || !nav || !description || !download || !curtain) return;

  const media = gsap.matchMedia();
  let disposed = false;
  media.add({
    desktop: '(min-width: 801px)',
    tablet: '(min-width: 601px) and (max-width: 800px)',
    mobile: '(max-width: 600px)',
    finePointer: '(hover: hover) and (pointer: fine)',
    reduce: '(prefers-reduced-motion: reduce)',
    short: '(max-height: 650px)',
  }, context => {
    if (context.conditions?.reduce || context.conditions?.short) return;
    const mobile = !!context.conditions?.mobile;
    let contextActive = true;
    const removeHydrationListeners: Array<() => void> = [];
    const animateHydrated = context.add('animateHydrated', (setup: () => void) => {
      if (contextActive) setup();
    });
    const afterMotionReady = (root: HTMLElement, setup: () => void) => {
      const ready = () => {
        root.removeEventListener('fintech:motion-ready', ready);
        // React sets this marker from useEffect, after the hydration commit.
        // Astro's hydration signal alone can precede a concurrent React commit.
        if (root.isConnected && root.dataset.motionReady === 'true') animateHydrated(setup);
      };
      if (root.dataset.motionReady === 'true') ready();
      else root.addEventListener('fintech:motion-ready', ready, { once: true });
      removeHydrationListeners.push(() => {
        root.removeEventListener('fintech:motion-ready', ready);
      });
    };
    journey.dataset.cinematic = '';
    const previousTabIndex = banking.getAttribute('tabindex');
    banking.setAttribute('tabindex', '-1');

    // Keep the supporting copy and CTA painted while the image is loading.
    // The entrance owns only the line spans; the scrub owns the headline
    // container and description paragraph independently.
    const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
    entrance.from('.hero-title-line > span', {
      yPercent: 108, duration: 1.15, stagger: .12,
    }, .08);

    let wasCovered = false;
    let coverAt = Number.POSITIVE_INFINITY;
    const measureCover = () => {
      // During this scene the hero is sticky at zero and the CTA stays still.
      // Cache document/viewport geometry at refresh, rather than reading two
      // layout boxes on every rendered scrub frame.
      const curtainTop = curtain.getBoundingClientRect().top + window.scrollY;
      const downloadBottom = download.getBoundingClientRect().bottom - hero.getBoundingClientRect().top;
      coverAt = curtainTop - downloadBottom - 8;
    };
    const syncCover = () => {
      const covered = window.scrollY >= coverAt;
      if (covered === wasCovered) return;
      wasCovered = covered;
      if (covered && hero.contains(document.activeElement)) {
        // Continue keyboard navigation in the next chapter without jumping
        // the scroll position. Reversing the scene never steals focus back.
        banking.focus({ preventScroll: true });
      }
      hero.inert = covered;
      description.style.visibility = covered ? 'hidden' : 'visible';
    };
    measureCover();
    syncCover();
    const scene = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: syncCover,
      scrollTrigger: {
        trigger: journey,
        start: 'top top',
        endTrigger: banking,
        end: () => `top ${nav.offsetHeight}px`,
        scrub: mobile ? .4 : .7,
        invalidateOnRefresh: true,
        onRefresh: () => { measureCover(); syncCover(); },
        onUpdate: syncCover,
        onToggle: trigger => {
          gsap.set('.hero-photo', { willChange: trigger.isActive ? 'transform' : 'auto' });
        },
      },
    });
    scene.fromTo('.hero-photo', { scale: 1, yPercent: 0 }, {
      scale: mobile ? 1.09 : 1.17,
      yPercent: mobile ? -1.2 : -2.5,
      duration: 1,
    }, 0);
    // The photograph begins full-bleed on every device. The moving, rounded
    // white chapter creates the image mask without ever introducing gutters.
    scene.to('#hero-title', { y: mobile ? -32 : -84, opacity: 0, duration: mobile ? .27 : .35 }, .035);
    scene.to('.hero-text > .eyebrow', { y: -14, opacity: 0, duration: .24 }, .035);
    scene.to('.hero-description > p', { y: -16, opacity: 0, duration: .23 }, .18);
    scene.to('.hero-caption', { opacity: 0, duration: .23 }, .2);

    // A real white section rises over the native sticky photograph. Rounded
    // masking resolves to a straight edge as the banking chapter takes over.
    gsap.fromTo('.concept-strip', { '--curtain-radius': mobile ? '24px' : '54px' }, {
      '--curtain-radius': '0px', ease: 'none',
      scrollTrigger: { trigger: '.concept-strip', start: 'top bottom', end: () => `top ${nav.offsetHeight}px`, scrub: .5 },
    });
    const chapter = gsap.timeline({
      scrollTrigger: { trigger: '.banking .section-heading', start: 'top 94%', end: 'top 42%', scrub: mobile ? .3 : .55 },
    });
    chapter.from('.banking-title-line > span', { yPercent: 108, stagger: .12, duration: .8, ease: 'power2.out' }, 0);
    chapter.from('.banking .section-heading .eyebrow', { opacity: 0, y: 15, duration: .5 }, .08);
    chapter.from('.banking .section-heading > p', { opacity: 0, y: 28, duration: .7, ease: 'power2.out' }, .25);

    gsap.utils.toArray<HTMLElement>('.reveal').forEach(element => {
      gsap.from(element, {
        y: 28, opacity: 0, duration: .85, ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 94%', once: true },
      });
    });
    const headings = new Set(gsap.utils.toArray<HTMLElement>('.heading-line').map(line => line.closest('h2') ?? line));
    headings.forEach(heading => {
      gsap.from(heading.querySelectorAll('.heading-line > span'), {
        yPercent: 108, duration: 1, stagger: .08, ease: 'power3.out',
        scrollTrigger: { trigger: heading, start: 'top 90%', once: true },
      });
    });
    gsap.utils.toArray<HTMLElement>('.dashboard, .investment-panel').forEach(panel => {
      afterMotionReady(panel, () => {
        const layers = panel.querySelectorAll(':scope > .dashboard-header, :scope > .balance-grid, :scope > .banking-grid, :scope > .dashboard-goal, :scope > .row-between, :scope > .portfolio-value, :scope > .range-filter, :scope > .asset-grid');
        gsap.from(layers, {
          y: mobile ? 14 : 24, opacity: 0, duration: .85, stagger: .1, ease: 'power3.out',
          scrollTrigger: { trigger: panel, start: 'top 88%', once: true },
        });
      });
    });
    gsap.utils.toArray<HTMLImageElement>('.editorial-photo').forEach(image => {
      gsap.fromTo(image, { yPercent: -3, scale: 1.025 }, {
        yPercent: 3, scale: 1.025, ease: 'none',
        scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: .7 },
      });
    });
    gsap.from('.phone-wrap', {
      y: 40, rotation: 3, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: '.device-stage', start: 'top 85%', once: true },
    });
    // Animate only the stage. React keeps ownership of payment-card rotation
    // and material selection, so pointer interaction never fights this tween.
    gsap.utils.toArray<HTMLElement>('.card-stage').forEach(stage => {
      const cardRoot = stage.closest<HTMLElement>('.cards-experience');
      if (!cardRoot) return;
      afterMotionReady(cardRoot, () => gsap.from(stage, {
        y: mobile ? 28 : 56, rotationX: mobile ? 0 : 8, rotationY: mobile ? 0 : -12,
        transformPerspective: 1200, duration: 1.3, ease: 'power3.out',
        scrollTrigger: { trigger: stage.closest('.cards-experience') ?? stage, start: 'top 88%', once: true },
      }));
    });
    gsap.to('.cta-light', {
      xPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '.final-cta', start: 'top bottom', end: 'bottom top', scrub: 1 },
    });

    const removeMagneticListeners: Array<() => void> = [];
    if (context.conditions?.desktop && context.conditions?.finePointer) {
      gsap.utils.toArray<HTMLAnchorElement>('.hero a.button, .final-cta a.button').forEach(button => {
        const moveX = gsap.quickTo(button, 'x', { duration: .35, ease: 'power3.out' });
        const moveY = gsap.quickTo(button, 'y', { duration: .35, ease: 'power3.out' });
        let box: DOMRect | undefined;
        const enter = () => { box = button.getBoundingClientRect(); };
        const move = (event: PointerEvent) => {
          if (!box) return;
          moveX(Math.max(-6, Math.min(6, (event.clientX - box.x - box.width / 2) * .08)));
          moveY(Math.max(-4, Math.min(4, (event.clientY - box.y - box.height / 2) * .1)));
        };
        const reset = () => { box = undefined; moveX(0); moveY(0); };
        button.addEventListener('pointerenter', enter);
        button.addEventListener('pointermove', move);
        button.addEventListener('pointerleave', reset);
        button.addEventListener('focus', reset);
        removeMagneticListeners.push(() => {
          button.removeEventListener('pointerenter', enter);
          button.removeEventListener('pointermove', move);
          button.removeEventListener('pointerleave', reset);
          button.removeEventListener('focus', reset);
        });
      });
    }

    return () => {
      contextActive = false;
      removeHydrationListeners.forEach(remove => remove());
      removeMagneticListeners.forEach(remove => remove());
      delete journey.dataset.cinematic;
      hero.inert = false;
      description.style.removeProperty('visibility');
      if (previousTabIndex === null) banking.removeAttribute('tabindex');
      else banking.setAttribute('tabindex', previousTabIndex);
    };
  });

  // Dimensions are reserved in HTML, but decoded hero imagery and restored
  // browser history can still arrive after the first ScrollTrigger calculation.
  const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
  document.fonts.ready.then(refresh);
  window.addEventListener('pageshow', refresh);
  const photograph = document.querySelector<HTMLImageElement>('.hero-photo');
  photograph?.addEventListener('load', refresh, { once: true });
  return () => {
    disposed = true;
    media.revert();
    window.removeEventListener('pageshow', refresh);
    photograph?.removeEventListener('load', refresh);
  };
}
