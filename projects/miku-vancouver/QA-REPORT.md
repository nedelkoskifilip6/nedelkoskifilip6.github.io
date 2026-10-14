# Validation record — October 14, 2026

Validated the production preview at `http://127.0.0.1:4321/miku-vancouver/`.

## Production build

`npm run build` passed Astro and TypeScript checking with zero errors, warnings or hints. Three static routes were generated: Home, Menu and Photography & sources. The build verifier resolved 215 local references under `/miku-vancouver/`, including images, styles, scripts, module dependencies and navigation anchors.

## Browser behavior

All 14 Playwright scenarios passed in Chromium against the final production build. There were no captured console or page errors.

- Full-screen photographic Hero, menu CTA and independent-concept disclaimer.
- Every internal route, base-path prefix and local anchor.
- All seven menu categories and verified CAD prices.
- Verified dietary filters, empty results, reset and keyboard category selection.
- Dish expansion, next/previous controls, arrow keys, Escape, focus wrapping and restoration.
- Gallery lightbox controls, keyboard navigation, Escape and mobile touch swipe.
- Repeated forward and reverse Hero masking with stable pin geometry on desktop and mobile.
- Landscape tablet headline/copy separation from its photographic mask.
- Mobile navigation, category selector, overlay and responsive layout.
- Reduced-motion presentation and readable static storytelling.
- Date, preferred time and party-size handoff to the verified OpenTable URL. The provider request was intercepted before network access; no booking was made.

A separate responsive sweep checked all three routes at 320×740, 360×800, 390×844, 430×932, 600×900, 768×1024, 800×600, 1024×768 and 1440×900. All 27 checks passed with no document overflow or broken loaded images.

## Lighthouse

The latest recorded mobile Lighthouse simulation on the local production preview scored:

| Category | Score |
| --- | ---: |
| Performance | 98 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

The HTML and JSON reports are delivered beside the source project. These are measurements of the local production preview; hosted performance can vary. Automated accessibility checks complement the verified keyboard/focus behavior and visual review.

## Photography and facts

Thirteen photographs were licensed from verified Unsplash pages, downloaded locally and converted to separate desktop/mobile WebP crops. Original masters ranged from 2590px to 9504px across, with source and license records in `PHOTO-CREDITS.md` and `src/data/photos.json`. Cuisine and atmosphere photographs are explicitly illustrative, rather than actual Miku dishes or interiors.

Restaurant/menu facts use the live official October 14 dinner-menu snapshot. Reservations and private-event inquiries lead to verified official channels. No live availability, confirmation, endorsement, review or affiliation is fabricated.

## Publication status

Prepared for publication on October 14, 2026 in the owner's existing portfolio repository, `nedelkoskifilip6/nedelkoskifilip6.github.io`. Editable source is `projects/miku-vancouver/`; static output is `miku-vancouver/`; the portfolio root lists the new project. GitHub Pages deployment and public verification are recorded in the delivered publication manifest.

The existing Tesla and Revolut projects were not modified. Revolut was inspected only for reusable framework, base-path and animation lifecycle patterns.

## Requested visual refresh

The updated production build passed with zero errors, warnings or hints. All 14 interaction scenarios passed again. A new sweep covered all three routes at nine viewport sizes (27 checks): no horizontal overflow, broken loaded images, visible arrow glyphs, mixed heading families or non-italic headings. Each menu dish has one of 18 distinct photo assets. All 38 photographic source URLs are unique. Hero desktop/mobile WebP SHA-256 values match the previous publication.

Verified the official PNG favicons, absolute Open Graph/Twitter image URL, JPEG MIME/dimensions (1200×675), and clean production Hero screenshot without development UI. The local production browser recorded no console or page errors. Lighthouse scores above describe the earlier published build and were not remeasured for this visual refresh. Viber’s application cache and actual outgoing message rendering were not tested.
