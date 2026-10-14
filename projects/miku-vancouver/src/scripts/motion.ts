import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function initMotion() {
  ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });
  const media = gsap.matchMedia();
  media.add({ desktop: '(min-width: 901px)', landscape: '(min-width: 601px) and (min-aspect-ratio: 23/20)', mobile: '(max-width: 900px)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
    const { desktop, landscape, reduce } = context.conditions!;
    const wide = desktop || landscape;
    const lowPower = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const lite = reduce || lowPower < 4 || window.innerHeight < 480;
    const story = document.querySelector<HTMLElement>('.aburi-story');
    const hero = document.querySelector<HTMLElement>('.hero-content');
    document.documentElement.classList.toggle('motion-lite', Boolean(lite));
    if (story) story.setAttribute('aria-hidden', lite ? 'false' : 'true');
    if (lite) return () => document.documentElement.classList.remove('motion-lite');

    if (hero) {
      // Entrance owns the inner line. The scroll timeline owns the outer block.
      gsap.from('.title-line > span', { yPercent: 115, duration: 1.3, stagger: .12, ease: 'power4.out', delay: .1 });
      gsap.from('.hero-eyebrow, .hero-description, .hero-bottom > *', { opacity: 0, y: 14, duration: .9, stagger: .1, ease: 'power2.out', delay: .45 });
      const pin = document.querySelector<HTMLElement>('.opening-pin')!;
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: '.opening-scene', start: 'top top', end: () => `+=${window.innerHeight * (wide ? 1.7 : 1.25)}`, pin,
        scrub: .65, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => {
          const covered = self.progress > .38;
          hero.inert = covered;
          document.querySelector<HTMLElement>('.hero-bottom')!.inert = covered;
          story!.setAttribute('aria-hidden', covered ? 'false' : 'true');
          pin.querySelector<HTMLElement>('.hero-image')!.style.willChange = self.isActive ? 'clip-path' : 'auto';
        },
      } });
      timeline.to('.hero-content', { y: -65, opacity: 0, duration: .35, ease: 'power1.in' }, 0)
        .to('.hero-bottom', { opacity: 0, y: -15, duration: .25 }, .05)
        .to('.hero-image img', { scale: wide ? 1.10 : 1.04, xPercent: wide ? 19 : 0, yPercent: wide ? -2 : 0, duration: 1, ease: 'none' }, 0)
        .to('.hero-image', { clipPath: () => {
          if (wide) return 'inset(14% 5% 14% 52%)';
          const copy = document.querySelector<HTMLElement>('.story-copy')!;
          const top = Math.max(53, (copy.offsetTop + copy.offsetHeight + 24) / pin.offsetHeight * 100);
          return `inset(${Math.min(top, 73)}% 6% 9% 6%)`;
        }, duration: .72, ease: 'power2.inOut' }, .18)
        .to('.hero-shade', { opacity: 0, duration: .55 }, .28)
        .to('.aburi-story', { opacity: 1, duration: .2 }, .48)
        .from('.aburi-story .eyebrow, .aburi-story h2, .story-copy', { y: 35, opacity: 0, stagger: .08, duration: .4, ease: 'power2.out' }, .5)
        .to('.scene-progress span', { scaleY: 1, duration: 1, ease: 'none' }, 0);
    }

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => {
      gsap.from(el, { y: 32, opacity: 0, duration: .85, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' } });
    });
    if (document.querySelector('.menu-page-intro')) gsap.from('.menu-page-intro h1, .menu-page-intro .eyebrow, .menu-page-intro div > p', { y: 24, opacity: 0, duration: .8, stagger: .07, ease: 'power3.out' });
    gsap.utils.toArray<HTMLElement>('.story-photo img, .private-image img, .dessert-editorial-image img').forEach(el => {
      gsap.fromTo(el, { scale: 1.07, yPercent: -2 }, { scale: 1, yPercent: 2, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: .7 } });
    });
    if (document.querySelector('.dessert-editorial-copy')) gsap.from('.dessert-editorial-copy', { y: 60, opacity: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: '.dessert-editorial', start: 'top 75%', toggleActions: 'play none none reverse' } });
    return () => { if (hero) hero.inert = false; document.querySelector<HTMLElement>('.hero-bottom')?.removeAttribute('inert'); };
  });

  // Actual flowing chapters remain usable with keyboard, reverse scroll, and reduced motion.
  const chapters = [...document.querySelectorAll<HTMLElement>('[data-course]')];
  let current = 0;
  const setCourse = (index: number) => {
    if (index === current) return;
    current = index;
    document.querySelectorAll<HTMLElement>('[data-course-image]').forEach((el, i) => el.classList.toggle('active', i === index));
  };
  const courseTriggers = chapters.map((chapter, index) => ScrollTrigger.create({ trigger: chapter, start: 'top 80%', end: 'bottom 80%', onEnter: () => setCourse(index), onEnterBack: () => setCourse(index) }));
  const refresh = () => { gsap.set('main', { opacity: 1, clearProps: 'transform' }); ScrollTrigger.refresh(); };
  // A small, progressive GSAP page exit; native links remain intact without JS.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin || destination.pathname === location.pathname) return;
    event.preventDefault();
    gsap.to('main', { opacity: 0, duration: .18, ease: 'power1.in', onComplete: () => { location.href = destination.href; } });
  });
  document.fonts.ready.then(refresh);
  document.querySelector<HTMLImageElement>('.hero-image img')?.addEventListener('load', refresh, { once: true });
  window.addEventListener('pageshow', refresh);
  window.addEventListener('pagehide', event => { if (event.persisted) return; media.revert(); courseTriggers.forEach(t => t.kill()); window.removeEventListener('pageshow', refresh); });
}
