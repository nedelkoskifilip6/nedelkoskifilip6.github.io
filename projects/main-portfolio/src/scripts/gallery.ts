import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../data/projects';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const $ = <T extends HTMLElement>(selector: string, root: ParentNode = document) =>
  root.querySelector<T>(selector)!;
const $$ = <T extends HTMLElement>(selector: string, root: ParentNode = document) => [
  ...root.querySelectorAll<T>(selector),
];
const planes = $$<HTMLDivElement>('.scene-camera > .project-plane');
const surfaces = planes.map((plane) => $<HTMLElement>('.project-surface', plane));
const stage = $<HTMLDivElement>('.gallery-stage');
const camera = $<HTMLDivElement>('.scene-camera');
const exhibition = $<HTMLElement>('.exhibition');
const indexLayer = $<HTMLElement>('.index-layer');
const portal = $<HTMLDivElement>('#opening-portal');
const nav = $<HTMLElement>('.site-nav');
const hud = $<HTMLElement>('.exhibition-hud');
const rail = $<HTMLElement>('.project-position');
const announcement = $<HTMLElement>('#project-announcement');
const viewButtons = $$<HTMLButtonElement>('[data-view]');
const jumpButtons = $$<HTMLButtonElement>('[data-jump-project]');
const dialogs = $$<HTMLDialogElement>('dialog');
const returnKey = 'filip-portfolio-return';
let mode: 'overview' | 'index' = 'overview';
let active = -1;
let entering = false;
let openingTimeline: gsap.core.Timeline | undefined;
let journey: gsap.core.Timeline | undefined;
let trigger: ScrollTrigger | undefined;
let reduced = false;
let opener: HTMLElement | null = null;
let panelOpener: HTMLElement | null = null;

// All visual movement derives from the same scroll timeline. No wheel interception.
function pose(distance: number) {
  const mobile = innerWidth <= 700;
  const unit = mobile ? Math.min(innerWidth / 390, 1.3) : Math.min(innerWidth / 1440, 1.35);
  const height = Math.min(innerHeight / (mobile ? 840 : 900), 1.25);
  const desktop = [
    { x: -140, y: -15, z: 150, rotationX: 7, rotationY: -16, rotationZ: -12, opacity: 1 },
    { x: 400, y: 190, z: -200, rotationX: 10, rotationY: -18, rotationZ: -12, opacity: 1 },
    { x: -475, y: -260, z: -600, rotationX: 12, rotationY: -18, rotationZ: -12, opacity: 0.95 },
    { x: 650, y: -240, z: -1000, rotationX: 12, rotationY: -18, rotationZ: -12, opacity: 0.85 },
    { x: -560, y: 370, z: -1300, rotationX: 12, rotationY: -18, rotationZ: -12, opacity: 0.85 },
  ];
  const touch = [
    { x: -12, y: -15, z: 70, rotationX: 5, rotationY: -9, rotationZ: -9, opacity: 1 },
    { x: 95, y: 255, z: -270, rotationX: 9, rotationY: -12, rotationZ: -10, opacity: 0.95 },
    { x: -100, y: -250, z: -520, rotationX: 10, rotationY: -12, rotationZ: -10, opacity: 0.9 },
    { x: 185, y: -325, z: -900, rotationX: 10, rotationY: -12, rotationZ: -10, opacity: 0.7 },
    { x: -170, y: 410, z: -1150, rotationX: 10, rotationY: -12, rotationZ: -10, opacity: 0.65 },
  ];
  const slots = mobile ? touch : desktop;
  const p =
    distance < 0
      ? { x: -750, y: -400, z: 900, rotationX: 2, rotationY: -10, rotationZ: -12, opacity: 0 }
      : slots[Math.min(distance, slots.length - 1)];
  return { ...p, x: p.x * unit, y: p.y * height, force3D: true };
}

function updateCurrent(index: number, progress = 0) {
  if (active !== index) {
    active = index;
    const project = projects[index];
    $('.current-number').textContent = project.number;
    $('.current-title').textContent = project.name;
    $('.current-category').textContent = project.category;
    $('.current-status').textContent = project.status === 'live' ? 'LIVE WEBSITE' : 'COMING SOON';
    jumpButtons.forEach((button, i) =>
      i === index
        ? button.setAttribute('aria-current', 'true')
        : button.removeAttribute('aria-current'),
    );
    announcement.textContent = `${project.number}. ${project.shortName}. ${project.status === 'live' ? 'Live website.' : 'Coming soon.'}`;
  }
  gsap.set('.progress-track > span', { scaleX: Math.max(0.035, progress) });
}

function syncLock() {
  document.body.style.overflow =
    mode === 'index' || dialogs.some((dialog) => dialog.open) || entering ? 'hidden' : '';
}

function clearHover() {
  if (entering) return;
  gsap.to(surfaces, {
    opacity: 1,
    scale: 1,
    z: 0,
    duration: 0.45,
    overwrite: 'auto',
    ease: 'power2.out',
  });
}

function setMode(next: 'overview' | 'index', instant = false) {
  if (entering || next === mode) return;
  mode = next;
  const duration = instant || reduced ? 0 : 0.55;
  const isIndex = next === 'index';
  clearHover();
  document.body.classList.toggle('view-index', isIndex);
  viewButtons.forEach((button) =>
    button.setAttribute('aria-pressed', String(button.dataset.view === next)),
  );
  indexLayer.classList.toggle('is-visible', isIndex);
  indexLayer.inert = !isIndex;
  exhibition.inert = isIndex;
  rail.inert = isIndex;
  gsap.to(stage, { autoAlpha: isIndex ? 0 : 1, duration, overwrite: true });
  gsap.to(indexLayer, { autoAlpha: isIndex ? 1 : 0, duration, overwrite: true });
  if (isIndex && !instant && !reduced) {
    gsap.fromTo(
      '.index-heading,.index-labels,.index-row,.index-footnote',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.045, ease: 'power3.out', overwrite: true },
    );
  }
  syncLock();
  document.dispatchEvent(new Event('portfolio:state'));
}

function jumpTo(index: number) {
  if (entering) return;
  if (mode === 'index') setMode('overview');
  if (reduced || !trigger)
    planes[index].scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' });
  else
    window.scrollTo({
      top: trigger.start + ((trigger.end - trigger.start) * index) / (projects.length - 1),
      behavior: 'smooth',
    });
}

function resetOpening() {
  openingTimeline?.kill();
  openingTimeline = undefined;
  entering = false;
  document.body.classList.remove('is-entering');
  portal.classList.remove('is-open');
  portal.replaceChildren();
  gsap.set([nav, hud, rail], { clearProps: 'opacity,visibility' });
  gsap.set(stage, { autoAlpha: mode === 'overview' ? 1 : 0 });
  gsap.set(indexLayer, { autoAlpha: mode === 'index' ? 1 : 0 });
  clearHover();
  syncLock();
}

function saveReturn() {
  const state = { y: scrollY, view: mode, time: Date.now(), progress: trigger?.progress ?? 0 };
  const fragment = new URLSearchParams({ view: mode, position: state.progress.toFixed(5) });
  history.replaceState(
    { ...history.state, portfolioReturn: state },
    '',
    `${location.pathname}${location.search}#${fragment}`,
  );
  try {
    sessionStorage.setItem(returnKey, JSON.stringify(state));
  } catch {
    /* History state also preserves the visit. */
  }
}

function numberProperty(element: Element, property: string) {
  return Number(gsap.getProperty(element, property)) || 0;
}

function openProject(id: string, source: HTMLElement) {
  const project = projects.find((p) => p.id === id);
  if (!project?.url || project.status !== 'live' || entering) return;
  saveReturn();
  if (reduced) {
    location.assign(project.url);
    return;
  }
  entering = true;
  opener = source;
  syncLock();
  document.body.classList.add('is-entering');
  announcement.textContent = `Entering ${project.shortName}.`;
  const original = planes[projects.indexOf(project)];
  const clone = original.cloneNode(true) as HTMLDivElement;
  clone.removeAttribute('data-project');
  clone.removeAttribute('data-status');
  clone.removeAttribute('data-index');
  clone.inert = true;
  clone
    .querySelectorAll('[data-project-link]')
    .forEach((el) => el.removeAttribute('data-project-link'));
  const entryCamera = document.createElement('div');
  entryCamera.className = 'entry-camera';
  entryCamera.append(clone);
  portal.replaceChildren(entryCamera);
  portal.classList.add('is-open');
  const image = $<HTMLImageElement>('.project-image', clone);
  image.loading = 'eager';
  image.sizes = '100vw';
  image.fetchPriority = 'high';
  const surface = $<HTMLElement>('.project-surface', clone);
  gsap.set(surface, { clearProps: 'all' });
  const fromIndex = source.classList.contains('index-project-link');
  if (fromIndex) {
    const thumb = $<HTMLElement>('.index-thumb', source).getBoundingClientRect();
    gsap.set(entryCamera, { x: 0, y: 0, rotationX: 0, rotationY: 0 });
    gsap.set(clone, {
      xPercent: -50,
      yPercent: -50,
      x: thumb.left + thumb.width / 2 - innerWidth / 2,
      y: thumb.top + thumb.height / 2 - innerHeight / 2,
      z: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      width: thumb.width,
      height: thumb.height,
      opacity: 1,
      visibility: 'visible',
      aspectRatio: 'auto',
    });
    gsap.set($<HTMLElement>('.window-bar', clone), { height: 0, opacity: 0 });
  } else {
    gsap.set(entryCamera, {
      x: numberProperty(camera, 'x'),
      y: numberProperty(camera, 'y'),
      rotationX: numberProperty(camera, 'rotationX'),
      rotationY: numberProperty(camera, 'rotationY'),
    });
    gsap.set(clone, {
      xPercent: -50,
      yPercent: -50,
      x: numberProperty(original, 'x'),
      y: numberProperty(original, 'y'),
      z: numberProperty(original, 'z'),
      rotationX: numberProperty(original, 'rotationX'),
      rotationY: numberProperty(original, 'rotationY'),
      rotationZ: numberProperty(original, 'rotationZ'),
      width: original.offsetWidth,
      height: original.offsetHeight,
      opacity: 1,
      visibility: 'visible',
      aspectRatio: 'auto',
    });
  }
  const destination = project.url;
  openingTimeline = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => {
      if (import.meta.env.DEV && new URLSearchParams(location.search).has('inspect-entry')) {
        const bounds = clone.getBoundingClientRect();
        document.dispatchEvent(
          new CustomEvent('portfolio:entry-check', {
            detail: {
              left: Math.round(bounds.left),
              top: Math.round(bounds.top),
              width: Math.round(bounds.width),
              height: Math.round(bounds.height),
              viewport: `${innerWidth} × ${innerHeight}`,
              rotationX: numberProperty(clone, 'rotationX'),
              rotationY: numberProperty(clone, 'rotationY'),
              rotationZ: numberProperty(clone, 'rotationZ'),
              destination,
            },
          }),
        );
      } else location.assign(destination);
    },
  });
  openingTimeline
    .to(
      [nav, hud, rail, mode === 'index' ? indexLayer : stage],
      { autoAlpha: 0, duration: 0.4, ease: 'power2.out' },
      0,
    )
    .to(entryCamera, { x: 0, y: 0, rotationX: 0, rotationY: 0, duration: 1.15 }, 0)
    .to(
      clone,
      {
        x: 0,
        y: 0,
        z: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        width: innerWidth,
        height: innerHeight,
        duration: 1.15,
      },
      0,
    )
    .to(
      surface,
      { borderRadius: 0, borderWidth: 0, boxShadow: '0 0 0 #0000', duration: 0.85 },
      0.15,
    )
    .to($$<HTMLElement>('.preview-overlay,.plane-caption', clone), { opacity: 0, duration: 0.2 }, 0)
    .to($<HTMLElement>('.window-bar', clone), { height: 0, opacity: 0, duration: 0.35 }, 0.7);
}

$$<HTMLAnchorElement>('[data-project-link]').forEach((link) =>
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return;
    event.preventDefault();
    try {
      openProject(link.dataset.projectLink!, link);
    } catch {
      resetOpening();
      location.assign(link.href);
    }
  }),
);
viewButtons.forEach((button) =>
  button.addEventListener('click', () => setMode(button.dataset.view as 'overview' | 'index')),
);
$$<HTMLElement>('[data-switch-view]').forEach((link) =>
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setMode('index');
    $('#index-title').setAttribute('tabindex', '-1');
    $('#index-title').focus();
  }),
);
$$<HTMLElement>('[data-work]').forEach((link) =>
  link.addEventListener('click', (event) => {
    event.preventDefault();
    if (mode === 'index') setMode('overview');
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }),
);
jumpButtons.forEach((button, i) => button.addEventListener('click', () => jumpTo(i)));
$$<HTMLButtonElement>('[data-focus-project]').forEach((button) =>
  button.addEventListener('click', () => jumpTo(Number(button.dataset.focusProject))),
);

$$<HTMLButtonElement>('[data-panel]').forEach((button) =>
  button.addEventListener('click', () => {
    const dialog = $<HTMLDialogElement>(`#${button.dataset.panel}`);
    const previous = dialogs.find((panel) => panel.open);
    if (!previous) panelOpener = button;
    else previous.close();
    dialog.showModal();
    syncLock();
    document.dispatchEvent(new Event('portfolio:state'));
    if (!reduced)
      gsap.fromTo(
        $('.about-body,.contact-body', dialog),
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
      );
  }),
);
dialogs.forEach((dialog) => {
  $('.panel-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    syncLock();
    document.dispatchEvent(new Event('portfolio:state'));
    if (!dialogs.some((panel) => panel.open)) panelOpener?.focus({ preventScroll: true });
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && entering) {
    event.preventDefault();
    resetOpening();
    opener?.focus({ preventScroll: true });
  }
});

const mm = gsap.matchMedia();
mm.add(
  {
    reduce: '(prefers-reduced-motion: reduce)',
    mobile: '(max-width: 700px)',
    desktop: '(min-width: 701px)',
  },
  (context) => {
    reduced =
      Boolean(context.conditions?.reduce) ||
      (import.meta.env.DEV && new URLSearchParams(location.search).get('motion') === 'reduce');
    document.body.classList.toggle('is-reduced-motion', reduced);
    gsap.set(camera, { x: 0, y: 0, rotationX: 0, rotationY: 0 });
    if (reduced) {
      gsap.set(planes, { clearProps: 'all' });
      trigger = undefined;
      journey = undefined;
      return;
    }
    planes.forEach((plane, i) => gsap.set(plane, { xPercent: -50, yPercent: -50, ...pose(i) }));
    journey = gsap.timeline({
      defaults: { duration: 1, ease: 'none' },
      scrollTrigger: {
        trigger: exhibition,
        pin: true,
        start: 'top top',
        end: () => `+=${innerHeight * (innerWidth <= 700 ? 4.2 : 4.5)}`,
        scrub: 0.55,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) =>
          updateCurrent(Math.min(4, Math.round(self.progress * 4)), self.progress),
      },
    });
    for (let step = 1; step < projects.length; step++) {
      planes.forEach((plane, i) => {
        const values = Object.fromEntries(
          Object.keys(pose(i - step)).map((key) => [
            key,
            () => pose(i - step)[key as keyof ReturnType<typeof pose>],
          ]),
        );
        journey!.to(plane, values, step - 1);
      });
    }
    trigger = journey.scrollTrigger;
    updateCurrent(0);
    return () => {
      journey = undefined;
      trigger = undefined;
    };
  },
);

const canHover = matchMedia('(hover: hover) and (pointer: fine)');
const cameraX = gsap.quickTo(camera, 'x', { duration: 0.9, ease: 'power3.out' });
const cameraY = gsap.quickTo(camera, 'y', { duration: 0.9, ease: 'power3.out' });
const cameraRX = gsap.quickTo(camera, 'rotationX', { duration: 1.1, ease: 'power3.out' });
const cameraRY = gsap.quickTo(camera, 'rotationY', { duration: 1.1, ease: 'power3.out' });
exhibition.addEventListener('pointermove', (event) => {
  if (
    !canHover.matches ||
    reduced ||
    mode === 'index' ||
    entering ||
    dialogs.some((dialog) => dialog.open)
  )
    return;
  const x = event.clientX / innerWidth - 0.5,
    y = event.clientY / innerHeight - 0.5;
  cameraX(x * 16);
  cameraY(y * 12);
  cameraRX(-y * 1.2);
  cameraRY(x * 1.5);
});
exhibition.addEventListener('pointerleave', () => {
  if (entering) return;
  cameraX(0);
  cameraY(0);
  cameraRX(0);
  cameraRY(0);
});
surfaces.forEach((surface) => {
  const highlight = () => {
    if (reduced || entering || mode === 'index') return;
    gsap.to(surfaces, {
      opacity: (_, el) => (el === surface ? 1 : 0.35),
      duration: 0.4,
      overwrite: 'auto',
    });
    gsap.to(surface, {
      z: 35,
      scale: 1.025,
      duration: 0.55,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };
  surface.addEventListener('pointerenter', () => {
    if (canHover.matches) highlight();
  });
  surface.addEventListener('pointerleave', clearHover);
  surface.addEventListener('focus', () => {
    const index = surfaces.indexOf(surface);
    if (index !== active && !reduced) jumpTo(index);
    highlight();
  });
  surface.addEventListener('blur', clearHover);
});

function restoreReturn() {
  let saved: { y: number; view: 'overview' | 'index'; time: number; progress?: number } | undefined;
  saved = history.state?.portfolioReturn;
  try {
    saved ??= JSON.parse(sessionStorage.getItem(returnKey) || 'null');
    sessionStorage.removeItem(returnKey);
  } catch {
    /* Ignore unavailable session storage. */
  }
  const fragment = new URLSearchParams(location.hash.slice(1));
  if (fragment.has('position') && ['overview', 'index'].includes(fragment.get('view') || '')) {
    saved = {
      y: 0,
      view: fragment.get('view') as 'overview' | 'index',
      time: Date.now(),
      progress: Math.max(0, Math.min(1, Number(fragment.get('position')) || 0)),
    };
  }
  if (!saved || Date.now() - saved.time > 30 * 60 * 1000) return;
  const state = { ...history.state };
  delete state.portfolioReturn;
  history.replaceState(state, '');
  ScrollTrigger.refresh();
  window.scrollTo({
    top:
      trigger && saved.progress !== undefined
        ? trigger.start + saved.progress * (trigger.end - trigger.start)
        : saved.y,
    behavior: 'instant',
  });
  ScrollTrigger.update();
  journey?.progress(trigger ? trigger.progress : 0);
  if (saved.view === 'index') setMode('index', true);
}
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    resetOpening();
    ScrollTrigger.refresh();
    restoreReturn();
  }
});
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
document.documentElement.classList.remove('is-loading');
const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
if (!reduced) {
  intro
    .fromTo(
      [nav, hud, rail],
      { opacity: 0 },
      { opacity: 1, duration: 0.8, clearProps: 'opacity' },
      0.1,
    )
    .fromTo(
      surfaces,
      { opacity: 0, scale: 0.86, y: 55 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, stagger: 0.08, clearProps: 'transform,opacity' },
      0.12,
    );
}
restoreReturn();
// Lazy, distant previews must never delay history restoration.
document.fonts.ready.then(() =>
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    restoreReturn();
  }),
);

// Development-only diagnostics are visible to browser QA without shipping audit code.
if (import.meta.env.DEV && new URLSearchParams(location.search).has('audit')) {
  const failures: string[] = [];
  window.addEventListener('error', (event) => {
    failures.push(event.message);
    renderAudit();
  });
  window.addEventListener('unhandledrejection', (event) => {
    failures.push(String(event.reason));
    renderAudit();
  });
  let report = 'Waiting for accessibility audit…';
  let entryReport = '';
  function renderAudit() {
    let node = document.getElementById('qa-results');
    if (!node) {
      node = document.createElement('pre');
      node.id = 'qa-results';
      Object.assign(node.style, {
        position: 'fixed',
        bottom: '120px',
        left: '20px',
        zIndex: '1000',
        maxHeight: '45vh',
        maxWidth: '70vw',
        overflow: 'auto',
        background: '#fff',
        color: '#000',
        padding: '16px',
        fontSize: '11px',
        whiteSpace: 'pre-wrap',
      });
      document.body.append(node);
    }
    node.textContent = `QA: ${report}\nRuntime errors: ${failures.length ? failures.join('\n') : 'none'}\nViewport: ${innerWidth} × ${innerHeight}. Horizontal overflow: ${document.documentElement.scrollWidth > innerWidth ? 'YES' : 'none'}.\nView: ${mode}. Focus: ${projects[Math.max(0, active)].shortName}.${entryReport}`;
  }
  const runAudit = async () => {
    try {
      const { default: axe } = await import('axe-core');
      const result = await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      });
      report = result.violations.length
        ? JSON.stringify(
            result.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodes: v.nodes.map((n) => n.target),
            })),
            null,
            2,
          )
        : 'Accessibility: 0 violations';
    } catch (error) {
      report = String(error);
    }
    renderAudit();
  };
  let auditTimer = window.setTimeout(runAudit, 2300);
  document.addEventListener('portfolio:state', () => {
    clearTimeout(auditTimer);
    auditTimer = window.setTimeout(runAudit, 750);
  });
  document.addEventListener('portfolio:entry-check', (event) => {
    entryReport = `\nEntry check: ${JSON.stringify((event as CustomEvent).detail)}`;
    renderAudit();
  });
}
