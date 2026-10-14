# Miku Vancouver — The Art of Aburi

Independent Portfolio Concept. Not affiliated with Miku Vancouver.

A Japanese fine-dining design and frontend engineering showcase by Filip Nedelkoski. The project uses Miku Vancouver as a factual culinary reference, with an original typographic identity, editorial design, and interactive experience. It is not commissioned by the restaurant and does not operate a booking or inquiry service.

Target URL: **https://nedelkoskifilip6.github.io/miku-vancouver/**

## Stack and architecture

- Astro static pages with TypeScript and selective React islands.
- Tailwind CSS v4 through the Vite plugin and a custom Japanese luxury design system.
- GSAP and ScrollTrigger for the Hero masking transition, scroll storytelling, and editorial reveals.
- Locally bundled fonts and optimized responsive WebP photography.
- An interactive menu, accessible dish detail overlays, editorial gallery, and honest external reservation handoff.

The Hero entrance and scroll timeline own separate elements so their transforms do not conflict. Responsive timelines adapt the pinned mask and storytelling to the viewport, with a static presentation for reduced-motion preferences. ScrollTrigger measurements refresh after fonts and imagery settle. Below-the-fold content is progressively enhanced; keyboard controls, semantic landmarks, focus management, and safe-area spacing remain part of the experience.

Three.js is intentionally unnecessary for these photographic compositions. This keeps the first screen and mobile interaction lightweight.

## Restaurant facts and photography

[Miku Vancouver](https://mikurestaurant.com/) and its [official menu](https://mikurestaurant.com/menu/) are the factual references. Published prices and menu details are a snapshot checked on **October 14, 2026**; they may change. Unverified prices are omitted and demonstration content is explicitly labeled. Dietary suitability is not inferred from photographs.

Licensed photographs provide illustrative food and atmosphere compositions. Generic photographs are not identified as actual Miku dishes or interiors. The site's **Photography & sources** page records original sources, photographers, and licensing/provenance; read it before reusing assets. Local responsive crops preserve the source photographs' natural proportions and textures.

Reservation controls collect a requested date, preferred time, and party size before opening Miku's verified external booking provider. Preferred times do not represent available inventory. No reservation is confirmed on this concept. Private-dining inquiries link to the restaurant's official channel.

## Local development

Use Node.js **22 or later**. From this project directory:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:4321/miku-vancouver/**. The menu is available at **http://127.0.0.1:4321/miku-vancouver/menu/**.

```sh
npm run check
npm run build
npm run preview
```

The production build runs Astro/TypeScript checks, generates `dist/`, then executes `scripts/verify-build.mjs`. The verifier requires both Home and Menu pages, checks local links and anchors, validates image/script/style/module dependencies, and rejects root paths that omit `/miku-vancouver/`. It strips queries and fragments, decodes URLs, and verifies directory index files. It can also inspect an alternate build directory:

```sh
node scripts/verify-build.mjs path/to/dist
```

## Browser verification

Run the project's interaction scenarios with a compatible Playwright browser installed:

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

Browser-test availability and actual results are separate from a successful production build. Before publishing, check category switching, dish overlays, gallery arrows/swipes/Escape, mobile navigation, reservation handoff, forward and reverse Hero scrolling, reduced motion, keyboard focus, responsive image loading, overflow, and browser console errors.

## GitHub Pages configuration

`astro.config.mjs` sets:

```js
site: 'https://nedelkoskifilip6.github.io',
base: '/miku-vancouver',
trailingSlash: 'always',
output: 'static',
```

Internal routes and asset URLs derive from Astro's `BASE_URL`. The project stays in its own directory inside the portfolio repository. Its source and static output do not replace the existing Tesla or Revolut projects.

`.github/workflows/deploy.yml` installs dependencies with Node.js 22, runs the validated production build, configures Pages, uploads `dist/`, and deploys through the `github-pages` environment. It runs after a push to `main` or a manual workflow dispatch. Its permissions are `contents: read`, `pages: write`, and `id-token: write`.

## Portfolio publication

This project is published as part of `nedelkoskifilip6/nedelkoskifilip6.github.io`, following the existing portfolio layout requested by its owner:

- Editable source: `projects/miku-vancouver/`.
- Generated static website: `miku-vancouver/` at the repository root.
- Portfolio listing: root `index.html`.
- Public URL: **https://nedelkoskifilip6.github.io/miku-vancouver/**.

Build this source with `npm ci && npm run build`, then replace only the repository's `miku-vancouver/` static directory with this project's `dist/` output. Commit the updated Miku source and static files to `main`. The portfolio's existing branch-based GitHub Pages deployment publishes the repository root; `.nojekyll` preserves Astro's asset directories.

The included `.github/workflows/deploy.yml` is a standalone-repository deployment option. GitHub does not run this workflow from inside `projects/miku-vancouver/`. To move the project to a separate repository in future, copy this source to its root and enable Pages with GitHub Actions there.

Tesla and Revolut files are outside the Miku publication scope.

## Asset reproduction

The production-ready responsive WebP files are included in `public/images/`. `PHOTO-CREDITS.md` and `src/data/photos.json` record every licensed source. To regenerate crops from separately downloaded original JPEG masters, use `node scripts/optimize-assets.mjs /absolute/path/to/originals`. Original masters are intentionally outside the source repository.

See `docs/ANIMATION.md` for the scene architecture and `QA-REPORT.md` for the recorded validation results.
