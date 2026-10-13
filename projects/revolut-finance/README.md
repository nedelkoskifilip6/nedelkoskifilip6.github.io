# Revolut Finance — Banking & Beyond

Independent Fintech Website Concept — Created for Portfolio Demonstration.

A responsive interactive website by Filip Nedelkoski. This is an independent, unofficial concept, unaffiliated with Revolut. It provides no real banking, authentication, exchange, payment or investment services.

## Architecture

- Astro static architecture with TypeScript and React islands.
- Tailwind CSS v4 through the Vite plugin plus a custom responsive design system.
- GSAP / ScrollTrigger for hero choreography, parallax and one-time section reveals; ScrollToPlugin for deliberate anchor navigation.
- Recharts for interactive spending and simulated investment charts.
- Lucide React icons; interactive device/card mockups use CSS; device and card previews are rendered with CSS.
- Navigation and the global demonstration dialog hydrate on load in lean, separate modules. Financial controls hydrate after the initial paint with an idle timeout of 1200ms; they become interactive when hydration completes. The device preview hydrates within 250px of the viewport. The Recharts bundle is deferred from the first critical navigation render. Static marketing content stays server-rendered.

## Interactive features

Dropdown and mobile navigation, transaction category filtering, currency exchange (fixed illustrative rates), reversible currency selection, physical/virtual card preview and pointer tilt, selectable savings goals and contribution projection, card freeze/unfreeze, working privacy and notification switches, portfolio range filters and chart tooltips, monthly/yearly fictional plan pricing, and accessible demo dialogs. Escape closes dialogs; keyboard focus is contained while open. Reduced-motion settings disable entrance/parallax animations and transitions.

## Run locally

Node 22 or later recommended.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4321/revolut-finance/.

```sh
npm run check
npm run build
npm run preview
```

`astro check` validates TypeScript and Astro files before each production build.

## GitHub Pages

Configured `site: https://nedelkoskifilip6.github.io`, `base: /revolut-finance`, `output: static`. Every built asset uses the project base, so the deployment does not rely on a root URL.

For the existing `nedelkoskifilip6.github.io` repository: copy the contents of `dist/` into the repository's `revolut-finance/` directory and push the configured Pages branch. Keep the editable source under `projects/revolut-finance/`. The root portfolio links to `/revolut-finance/`; Tesla Motors is no longer listed.

For a standalone repository named `revolut-finance`, the included workflow builds and publishes through GitHub Actions. Set Settings → Pages → Source to GitHub Actions. The same URL is used; do not enable both deployment approaches simultaneously.

## Quality and data

Semantic landmark sections, accessible labels, focus indicators, responsive layouts at 375/768/1024/1440 pixels, local interaction state, clear demo-data disclaimers and no credential collection. Currency rates and plan pricing are intentionally fictional; savings projection excludes interest. Performance charts show simulated values. No financial APIs or analytics are used.

## Design inspiration

https://www.revolut.com/ — visual inspiration only. Original interface composition, fictional banking data and interactive card previews. Unmodified official Revolut wordmarks are used solely to identify the design inspiration, paired with visible independent-concept labels. See ASSETS.md for sources and image provenance. No credentials, testimonials or claims of affiliation.

## Next generation creative direction

The existing Astro page and React islands are retained. The consolidated `src/styles/editorial.css` now art-directs each chapter: a full-screen surf hero, open asymmetric phone presentation, editorial travel/converter composition, dark metallic card studio, immersive coastal savings, dark security controls, wide investment canvas and a restrained plan comparison. `cinematic.css` owns only the sticky-scene geometry; `motion.ts` owns GSAP timelines and ScrollTrigger lifecycle.

The hero contains one CTA, **Download the app**, opening the official Revolut website with an explicit external-destination label. Mobile imagery begins edge-to-edge at the first frame and uses `100svh` plus safe-area spacing. The white banking chapter rises over the sticky photograph as the headline fades and the image zooms. Returning through the scene restores its state. Navigation contrast follows the moving curtain rather than the hidden sticky photograph.

Motion includes clipped typography entrances, layered interface reveals, product-stage transitions and subtle pointer-only button/card interactions. Touch devices omit pointer-only movement. Reduced-motion and short viewports use the static presentation. Covered hero controls leave the focus sequence; keyboard focus transfers to banking only if it was inside the covered hero.

Same-page menu, footer and logo links use `src/scripts/anchorNavigation.ts` for a distance-aware 3.2–4.8 second scroll. Mobile menus and dialogs release their scroll locks first; manual input cancels the transition. Reduced-motion navigation and the skip link move immediately. Hash history remains native, and destination focus changes only after completed navigation.

All converter, savings, filter, chart, card, pricing and security interactions remain local demonstrations. Balance animations expose the final value to assistive technology. Existing licensed photography is reused with responsive WebP sources, dedicated mobile crops, reserved dimensions, a prioritized hero and lazy-loaded lower images. No Three.js runtime is needed for this CSS-based card presentation.

Browser regression scenarios are in `tests/experience.spec.ts` and `tests/cinematic.spec.ts`. Run them against a local preview or with `PLAYWRIGHT_BASE_URL` targeting a deployed build. Test discovery alone does not establish that browser scenarios passed.

## Regression checks

`tests/experience.spec.ts` checks transaction filters, converter inputs, exchange preview, card finishes and virtual mode, savings projections, card freezing, privacy, portfolio ranges, fictional pricing and dialog behavior. It also covers navigation and horizontal overflow at 375, 768, 1024 and 1440 pixels, the single external hero CTA, and broken image assets. Run with `npx playwright test` after providing a compatible browser runtime.

