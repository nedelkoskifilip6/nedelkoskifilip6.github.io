# Revolut Finance — Banking & Beyond

Independent Fintech Website Concept — Created for Portfolio Demonstration.

A responsive interactive website by Filip Nedelkoski. This is an independent, unofficial concept, unaffiliated with Revolut. It provides no real banking, authentication, exchange, payment or investment services.

## Architecture

- Astro static architecture with TypeScript and React islands.
- Tailwind CSS v4 through the Vite plugin plus a custom responsive design system.
- GSAP / ScrollTrigger for hero choreography, parallax and one-time section reveals; ScrollToPlugin for deliberate anchor navigation.
- Recharts for the simulated investment performance chart.
- Lucide React icons and a CSS-rendered security card demonstration.
- Navigation and the global demonstration dialog hydrate on load in lean, separate modules. Financial controls hydrate after the initial paint with an idle timeout of 1200ms; they become interactive when hydration completes. The Recharts bundle is deferred from the first critical navigation render. Static marketing content stays server-rendered.

## Interactive features

Direct section links and mobile navigation, a contribution calculator with three selectable savings goals, card freeze/unfreeze, working privacy and notification switches, portfolio range filters and chart tooltips, monthly/yearly fictional plan pricing, and accessible demo dialogs. Escape closes dialogs; keyboard focus is contained while open. Reduced-motion settings disable entrance/parallax animations and transitions. Navigation follows the four remaining chapters in page order: 01 Savings, 02 Security, 03 Investments and 04 Plans. The banking, payments and card-showcase chapters have been removed.

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

Semantic landmark sections, accessible labels, focus indicators, responsive layouts at 375/768/1024/1440 pixels, local interaction state, clear demo-data disclaimers and no credential collection. Plan pricing is intentionally fictional; savings projection excludes interest and is capped at each selected goal. Performance charts show simulated values. No financial APIs or analytics are used.

## Link sharing preview

Open Graph and Twitter cards use the versioned image configured by `socialImage` in `src/pages/index.astro`: the owner-supplied Hero screenshot, proportionally optimized to 1600×897 without cropping or regeneration. It includes the glass navigation, wordmark, headline, black App Store and Google Play badges and their captions. Matching image dimensions and alt text are rendered in static HTML, so crawlers do not need to execute animations or JavaScript. When changing the Hero, save a new versioned screenshot and update `socialImage` and its dimensions. Messaging platforms may retain previews of previously shared URLs; existing messages are not controlled by this website.

## Design inspiration

https://www.revolut.com/ — visual inspiration only. Original interface composition and fictional financial demonstrations. Unmodified official Revolut wordmarks are used solely to identify the design inspiration, paired with visible independent-concept labels. The store badges link to Revolut's official listings; this portfolio does not install an app or provide banking services. See ASSETS.md for sources and image provenance. No credentials or claims of affiliation.

## Next generation creative direction

The existing Astro page and React islands are retained. The consolidated `src/styles/editorial.css` art-directs each remaining chapter: a full-screen surf hero, immersive coastal savings photography and contribution calculator, a full-bleed island-and-sea photograph behind dark security controls, a wide investment canvas, a restrained plan comparison and a quiet dusk-coast photographic finale. The final CTA uses an AI-cleaned version of the owner-supplied dusk photograph, with native-resolution WebP variants and dedicated mobile crops. Section 02 uses an AI-cleaned edit of the owner-supplied island photograph on both desktop and mobile, with proportional 640/960/1536px WebP sources and no additional grading or technical upscaling after generation. Both sections keep lazy loading and non-interactive contrast layers. `cinematic.css` owns only the sticky-scene geometry; `motion.ts` owns GSAP timelines and ScrollTrigger lifecycle.

The Hero contains two official download badges: **Download on the App Store** and **Get it on Google Play**, opening Revolut's official listings in a new tab. Both badges share the same visible height and top alignment, with **Official Revolut app · external link** beneath each. Their shared `.hero-acquisition` group participates in the existing GSAP transition and focus handling. Mobile imagery begins edge-to-edge at the first frame and uses `100svh` plus safe-area spacing. The savings chapter rises over the sticky photograph as the headline fades and the image zooms. Returning through the scene restores its state. Navigation contrast follows the moving curtain rather than the hidden sticky photograph.

The initial Hero is fully visible in server-rendered HTML and render-blocking CSS. Loading JavaScript does not replay an entrance or reset its text. Small responsive previews of the same photograph are embedded in the HTML behind the full image, so a cold connection never exposes an empty photographic area. Matching responsive image preloads, eager loading and synchronous decoding prioritize the full-resolution image; scrolling retains the existing cinematic transition. Preview sources are maintained in `src/assets/hero-preview-*.webp`.

Motion includes clipped typography entrances, layered investment interface reveals and subtle pointer-only button interactions. Touch devices omit pointer-only movement. Reduced-motion and short viewports use the static presentation. Covered Hero controls leave the focus sequence; keyboard focus transfers to savings only if it was inside the covered Hero.

Same-page menu, footer and logo links use `src/scripts/anchorNavigation.ts` for a distance-aware 0.9–1.5 second scroll. Menu links start without an underline; selecting a menu link underlines that item, and the header logo clears the selection. Ordinary scrolling does not select menu items. Mobile menus and dialogs release their scroll locks first; manual input cancels the transition. Reduced-motion navigation and the skip link move immediately. Hash history remains native, and destination focus changes only after completed navigation.

All savings, chart, pricing and security interactions remain local demonstrations. Portfolio value animations expose the final value to assistive technology. Existing licensed photography is reused with responsive WebP sources, dedicated mobile crops, reserved dimensions, a prioritized Hero and lazy-loaded lower images. No Three.js runtime is needed.

Browser regression scenarios are in `tests/experience.spec.ts` and `tests/cinematic.spec.ts`. Run them against a local preview; the cinematic scenarios also accept `PLAYWRIGHT_BASE_URL` targeting a deployed build. Test discovery alone does not establish that browser scenarios passed.

## Regression checks

`tests/experience.spec.ts` checks goal selection and savings projections, card freezing, privacy, portfolio ranges, fictional pricing and dialog behavior. It also covers navigation and horizontal overflow at 375, 768, 1024 and 1440 pixels, both official store destinations, matching badge heights and alignment, and broken image assets. `tests/cinematic.spec.ts` covers forward/reverse scrolling, usability of both visible badges, focus handoff from either badge into savings, viewport changes and reduced-motion hydration. Run with `npx playwright test` after providing a compatible browser runtime.

`tests/startup.spec.ts` delays the full Hero photograph and JavaScript independently on fresh mobile and desktop page loads. It records painted frames to verify stable headline dimensions, continuously visible text and immediate photographic coverage before the full image arrives.

