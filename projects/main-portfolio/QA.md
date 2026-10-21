# Portfolio verification

## Browser checks — 21 October 2026

Reviewed the local application in native Safari at a 1324 × 688 CSS pixel viewport. Also reviewed the actual application in development-only iframe viewports at 390 × 844 and 320 × 740. These are browser viewport checks, not physical iPhone tests.

- The five previews form a diagonal CSS 3D scene. Scroll position drives the GSAP timeline; scrolling backward returns earlier projects. Project position controls correctly focus later projects.
- Overview and Index switch correctly; the hidden mode becomes inert. The index includes five accurate completion states.
- About and Contact open native modal dialogs. Escape closes them and returns focus to the opener. The About-to-Contact action works.
- Both verified live projects open in the same tab after the expansion. The actual Revolut and Miku pages were reached and their interactive content was present.
- A development-only hold at the end of the opening timeline measured the selected preview at left 0, top 0, width 1324, height 688, with X/Y/Z rotation all zero. Escape canceled the held transition and returned to the gallery.
- Browser Back restored Index and the previous third-project camera position. The previous view and normalized scroll position are encoded on the portfolio history entry before navigation, with history/session storage as additional state.
- The mobile 390 × 844 overview and index had no horizontal overflow. The 320 × 740 reduced-motion variant presented a static, vertically scrollable project list.
- axe-core checks for WCAG 2 A/AA and WCAG 2.1 AA reported zero violations in the reviewed desktop overview, mobile overview/index, and narrow reduced-motion states. These checks supplement the manual review; they are not a complete accessibility certification.
- The development runtime error collector reported no uncaught errors or unhandled rejections during these checks.

## Content and release boundary

The two live project images are actual Safari screenshots. Six Senses uses a screenshot of its existing unpublished local concept. The two remaining images are original SVG concept placeholders with visible Coming Soon labels. Media provenance and font licenses accompany the assets.

Only the public GitHub profile could be verified. Email and LinkedIn remain unavailable until the owner supplies them. The contact panel labels this honestly and does not invent destinations.

The reference image mentioned in the brief was not attached in the available conversation. The composition follows the written diagonal, overlapping 3D direction.

The homepage has its own source and asset namespaces inside the existing repository. The publish script and release verifier protect the existing Tesla, Revolut, Miku and other legacy files. A local production build is not evidence of a successful GitHub Pages deployment.

## Local review

Run `npm run dev`. The ordinary homepage is at `http://127.0.0.1:4330/`.

Development-only review addresses:

- `/?audit=1` — accessibility and runtime diagnostics.
- `/?audit=1&inspect-entry=1` — hold the completed opening transition for inspection; Escape returns to the gallery.
- `/__preview?width=390&height=844&audit=1` — mobile viewport review.
- `/__preview?width=320&height=740&audit=1&motion=reduce` — narrow reduced-motion review.

The review middleware and audit library are excluded from the production browser bundle. The production reduced-motion behavior uses the visitor’s operating-system preference.
