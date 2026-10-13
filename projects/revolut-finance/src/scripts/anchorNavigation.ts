import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

/** Deliberate section navigation; ordinary scrolling and history stay native. */
export function initializeAnchorNavigation() {
  gsap.registerPlugin(ScrollToPlugin);
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let tween: gsap.core.Tween | null = null;
  let frame = 0;
  let generation = 0;
  let restoreBehavior: (() => void) | undefined;
  let restoreFocus: (() => void) | undefined;

  const stop = () => {
    generation++;
    cancelAnimationFrame(frame);
    frame = 0;
    const active = tween;
    tween = null;
    active?.kill();
    restoreBehavior?.();
    restoreBehavior = undefined;
  };

  const useInstantScrollBehavior = () => {
    const roots = [document.documentElement, document.body];
    const previous = roots.map(root => ({
      root,
      value: root.style.getPropertyValue('scroll-behavior'),
      priority: root.style.getPropertyPriority('scroll-behavior'),
    }));
    roots.forEach(root => root.style.setProperty('scroll-behavior', 'auto', 'important'));
    let restored = false;
    return () => {
      if (restored) return;
      restored = true;
      previous.forEach(({ root, value, priority }) => {
        if (value) root.style.setProperty('scroll-behavior', value, priority);
        else root.style.removeProperty('scroll-behavior');
      });
    };
  };

  const focusTarget = (target: HTMLElement) => {
    restoreFocus?.();
    restoreFocus = undefined;
    if (!target.hasAttribute('tabindex') && !target.matches('a[href],button,input,select,textarea,summary,[contenteditable="true"]')) {
      target.setAttribute('tabindex', '-1');
      const restore = () => {
        target.removeEventListener('blur', restore);
        if (target.getAttribute('tabindex') === '-1') target.removeAttribute('tabindex');
        if (restoreFocus === restore) restoreFocus = undefined;
      };
      target.addEventListener('blur', restore, { once: true });
      restoreFocus = restore;
    }
    target.focus({ preventScroll: true });
  };

  const cssPixels = (value: string) => {
    const number = parseFloat(value) || 0;
    return value.endsWith('%') ? number * window.innerHeight / 100 : number;
  };
  const destinationY = (target: HTMLElement, top: boolean) => {
    if (top) return 0;
    const navHeight = document.querySelector<HTMLElement>('.nav')?.offsetHeight ?? 0;
    const padding = cssPixels(getComputedStyle(document.documentElement).scrollPaddingTop);
    const margin = cssPixels(getComputedStyle(target).scrollMarginTop);
    const position = target.getBoundingClientRect().top + window.scrollY - Math.max(navHeight, padding) - margin;
    return Math.max(0, Math.min(ScrollToPlugin.max(window), position));
  };

  const navigate = (target: HTMLElement, url: URL, top: boolean, immediate: boolean) => {
    if (!target.isConnected) return;
    const y = destinationY(target, top);
    const distance = Math.abs(y - window.scrollY);
    // pushState changes the address without a native hash jump. Popstate and
    // hashchange are only cancellation signals; native restoration is retained.
    if (window.location.href !== url.href) {
      try { history.pushState(history.state, '', url.href); } catch { /* Scrolling also works in restricted file previews. */ }
    }
    const release = useInstantScrollBehavior();
    restoreBehavior = release;
    if (immediate || preference.matches || distance < 2) {
      window.scrollTo(window.scrollX, y);
      release();
      restoreBehavior = undefined;
      focusTarget(target);
      return;
    }
    const duration = 3.2 + Math.min(1.6, Math.sqrt(distance / Math.max(1, window.innerHeight)) * .5);
    tween = gsap.to(window, {
      duration,
      ease: 'power2.inOut',
      scrollTo: { y, autoKill: true, onAutoKill: stop },
      onInterrupt: release,
      onComplete: () => {
        tween = null;
        release();
        restoreBehavior = undefined;
        focusTarget(target);
      },
    });
  };

  const onClick = (event: MouseEvent) => {
    // Any fresh interaction takes control away from the previous navigation.
    stop();
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download')) return;
    if (link.target && link.target.toLowerCase() !== '_self') return;
    const href = link.getAttribute('href') ?? '';
    if (!href.includes('#')) return;
    let url: URL;
    try { url = new URL(link.href, window.location.href); } catch { return; }
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
    let id: string;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
    const target = id ? document.getElementById(id) : document.querySelector<HTMLElement>('.hero');
    if (!(target instanceof HTMLElement)) return;
    const top = !id || target.matches('.hero');
    event.preventDefault();
    if (link.classList.contains('skip-link')) {
      navigate(target, url, top, true);
      return;
    }
    const request = generation;
    let attempts = 0;
    const afterOverlaysClose = () => {
      frame = 0;
      if (request !== generation) return;
      attempts++;
      const locked = document.body.style.overflow === 'hidden'
        || document.querySelector('.nav[data-menu-open="true"], [role="dialog"][aria-modal="true"]');
      // React close handlers still run after capture. Wait for their commit and
      // scroll-lock cleanup before measuring section geometry or moving focus.
      if (attempts < 2 || locked) {
        if (attempts < 12) frame = requestAnimationFrame(afterOverlaysClose);
        return;
      }
      navigate(target, url, top, false);
    };
    frame = requestAnimationFrame(afterOverlaysClose);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar', 'Tab', 'Escape'].includes(event.key)) stop();
  };

  // Capture also reaches anchors inside React dialogs that stop propagation.
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('pointerdown', stop, { passive: true });
  window.addEventListener('popstate', stop);
  window.addEventListener('hashchange', stop);
  window.addEventListener('pagehide', stop);
  preference.addEventListener('change', stop);

  return () => {
    stop();
    restoreFocus?.();
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('pointerdown', stop);
    window.removeEventListener('popstate', stop);
    window.removeEventListener('hashchange', stop);
    window.removeEventListener('pagehide', stop);
    preference.removeEventListener('change', stop);
  };
}
