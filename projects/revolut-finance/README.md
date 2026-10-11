# Revolut-inspired fintech portfolio concept

Independent Fintech Website Concept — Created for Portfolio Demonstration.

A responsive interactive website by Filip Nedelkoski. This is an independent, unofficial concept, unaffiliated with Revolut. It provides no real banking, authentication, exchange, payment or investment services.

## Architecture

- Astro static architecture with TypeScript and React islands.
- Tailwind CSS v4 through the Vite plugin plus a custom responsive design system.
- GSAP / ScrollTrigger for hero choreography, parallax and one-time section reveals.
- Recharts for interactive spending and simulated investment charts.
- Lucide React icons; interactive device/card mockups use CSS; device and card previews are rendered with CSS.
- Interactive islands hydrate on load so direct section links and the first interaction work reliably. Static marketing content stays server-rendered.

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

For the existing `nedelkoskifilip6.github.io` repository: copy the contents of `dist/` into the repository's `revolut-finance/` directory and push the configured Pages branch. Keep the editable source under `projects/revolut-finance/`. The root portfolio links to `/revolut-finance/` immediately after Tesla Motors.

For a standalone repository named `revolut-finance`, the included workflow builds and publishes through GitHub Actions. Set Settings → Pages → Source to GitHub Actions. The same URL is used; do not enable both deployment approaches simultaneously.

## Quality and data

Semantic landmark sections, accessible labels, focus indicators, responsive layouts at 375/768/1024/1440 pixels, local interaction state, clear demo-data disclaimers and no credential collection. Currency rates and plan pricing are intentionally fictional; savings projection excludes interest. Performance charts show simulated values. No external APIs or analytics are used.

## Design inspiration

https://www.revolut.com/ — visual inspiration only. Original interface composition, fictional banking data and interactive card previews. Unmodified official Revolut wordmarks are used solely to identify the design inspiration, paired with visible independent-concept labels. See ASSETS.md for sources and image provenance. No credentials, testimonials or claims of affiliation.

## Blue visual identity

Primary #0666EB, electric #0075FF, deep #003DB8, light #EAF3FF, white and #101114. Shared styles cover navigation, buttons, charts, card finishes, savings, pricing and footer. High-impact sections use deep blue; spacious sections remain white. Product imagery with the Orbit wordmark is no longer displayed. Arrow decorations are removed throughout; controls keep their text labels.
