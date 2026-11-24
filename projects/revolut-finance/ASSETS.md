# Asset provenance — creative fintech portfolio

This is an independent, unofficial portfolio concept. No financial services are provided.

## Brand references

The black and white Revolut wordmarks are unmodified official SVG assets from:

- https://assets.revolut.com/Brand/Retail/Logos/Wordmark/Revolut_Black.svg
- https://assets.revolut.com/Brand/Retail/Logos/Wordmark/Revolut_White.svg

Revolut's public News & Media page https://www.revolut.com/news/ directs users to its Press Kit for branded assets. Wordmarks identify the design inspiration and appear beside independent-concept labels. No ownership, endorsement, or blanket commercial reuse licence is claimed. Trademark rights remain with Revolut; review applicable permissions before adapting this concept into a commercial service.

The unmodified black R on white favicon and Apple touch icon are the official assets declared by https://www.revolut.com/ on 13 October 2026:

- https://assets.revolut.com/assets/favicons/favicon-32x32.png (32×32)
- https://assets.revolut.com/assets/favicons/favicon-16x16.png (16×16)
- https://assets.revolut.com/assets/favicons/apple-touch-icon.png (180×180)

These identify the design inspiration under the same independent-concept and trademark notice above. No logo is redrawn or recolored.

`public/favicon.ico` packages the original 16×16 and 32×32 PNG files without modifying their pixel data. Desktop icon links include a version query to refresh previously cached icons. The Apple touch icon remains unchanged; the retired generic `favicon.svg` is not referenced by the page.

## Licensed campaign photography

The current ocean campaign uses real photography by **Jess Loiterton**, selected against the attached surfing photograph as a visual quality reference. The attachment remains available as a conversational quality reference but is not redistributed because its reuse rights were not supplied. Its original temporary filesystem path is no longer present; production uses the licensed photographs below.

Each Pexels source page explicitly marks the image Free / Free to use. The Pexels License at https://www.pexels.com/license/ permits website use and modification. The photographs are illustrative; the photographer and depicted people do not endorse this project or Revolut.

| Current asset | Photographer | Source |
| --- | --- | --- |
| Surfing hero | Jess Loiterton | https://www.pexels.com/photo/aerial-view-of-woman-on-a-surfboard-5231686/ |
| Ocean travel / payments | Jess Loiterton | https://www.pexels.com/photo/white-boat-on-blue-sea-water-4784991/ |
| Coastal escape / savings | Jess Loiterton | https://www.pexels.com/photo/landscape-with-green-mountains-and-blue-sea-5007728/ |

CDN identifiers: `5231686`, `4784991`, `5007728` from `images.pexels.com/photos/`.

Source downloads were 4000×2665 (hero and savings) and 3200×4001 (travel). Locally optimized WebP derivatives in `public/images/editorial/` preserve the natural colors and texture without additional upscaling or artificial sharpening. Landscape sources have 960, 1600 and 3200px versions; the portrait travel image uses 800 and 1600px; dedicated 640 and 960px mobile crops retain the surfer and coastal composition. The source pages' listed dimensions should not be treated as a claim of native sensor resolution.

The previous city/Positano/mountain photographs remain unused in the asset archive. Their original credits are Vitaly Gariev (https://unsplash.com/photos/woman-with-coffee-and-phone-on-city-street-Xl8LYNjr3bc), Rafael Peier (https://unsplash.com/photos/positano-coastal-town-with-boats-beach-and-blue-sea-pC_iHok3vac) and lucas Favre (https://unsplash.com/photos/hiker-with-backpack-on-rocky-peak-7EtzgOxT9B4), under https://unsplash.com/license.

## Supplied full-section photography

Section 02 retains the existing owner-supplied warm beach scene and its 1536×1024 AI-restored desktop master from `work/section-photography/`. The active desktop derivatives `security-beach-ai-v1-{960,1536}.webp` are unchanged. A separate, versioned `security-beach-mobile-ai-v2-*.webp` restoration is selected only by the `(max-width:600px)` picture source. Its built-in image generation edit reduces visible compression, grain and softness while using the same portrait framing, people, poses, waves and warm colors as constraints. Reconstructed fine detail is illustrative; it is not a claim of recovered sensor detail or exact identity preservation.

The final “Ready for a different perspective?” section uses a separately AI-cleaned version of the owner-supplied dusk coastline photograph. The built-in image generation edit targets compression artifacts, grain and muddy softness while constraining the original framing, horizon, wave/shoreline positions, twilight exposure and muted natural colors. Versioned `perspective-dusk-ai-v2-*.webp` files provide 960px and native 1539×1022 desktop derivatives, plus 640px and native 715×1022 centered portrait mobile crops; no additional grading or technical upscaling is applied after generation. Reconstructed fine detail is illustrative rather than recovered sensor information. The raw `perspective-dusk-v1-*` files and earlier turquoise-bay assets remain unused in the archive for cached pages or future restoration. The new master, exact prompt and processing metadata are stored under `work/final-dusk-ai/` in the workspace.

Both sections keep edge-to-edge cover images, lazy loading and reserved dimensions, with separate existing CSS layers for readable text. The photographs themselves have no CSS colour filter. These are owner-supplied references, not official Revolut campaign assets; no endorsement, affiliation or general stock-photo licence is claimed. The new source copy, mobile restoration master, prompts and processing metadata are retained under `work/dusk-perspective-mobile/` in the workspace.

## Social sharing preview

`public/social/hero-share-20261124.jpg` is the exact Hero screenshot supplied by the project owner on 24 November 2026, optimized from its 2814×1578 PNG source to a proportional 1600×897 JPEG (quality 95, mozjpeg, 4:4:4 chroma). The entire screenshot remains in frame: glass navigation, wordmark, headline, supporting copy, black App Store and Google Play download badges, captions and unofficial portfolio label. No cropping, AI regeneration, retouching or layout reconstruction is applied. The screenshot combines the existing licensed campaign photo with the site's own design; the rights and notices above continue to apply.

Open Graph and Twitter cards use the new versioned absolute JPEG URL, with matching dimensions and descriptive alternative text. Earlier preview images remain unused in the archive so old cached links do not lose their image. The original supplied PNG and conversion metadata are retained in `work/social-share-20261124/` in the workspace.

## Hero app download badges

`public/brand/app-store-badge.svg` is Apple's unmodified English black download badge from https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg, linked to Revolut's official iOS app (App Store ID `932493382`). Its proportions, gray border and minimum 40px screen height are preserved; no magnetic hover or independent badge animation is applied. Badge guidance: https://developer.apple.com/app-store/marketing/guidelines/.

`public/brand/google-play-badge.png` uses Google's official English “Get it on Google Play” artwork from https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png. Only the fully transparent 41px outer canvas padding is removed; every pixel within the 564×168 badge is preserved, with no recoloring, reshaping or added shadow. The badge links to Revolut Ltd's official Android app: https://play.google.com/store/apps/details?id=com.revolut.revolut. It has the same visible height as the App Store badge, with clear spacing and an explicit external-link caption. Google Play badge guidance: https://partnermarketinghub.withgoogle.com/brands/google-play/google-play/lockups-icons-badges/.

## Previous illustrative portraits (unused archive)

`public/images/community/portraits-restored-v4.webp` is an AI-restored derivative of the supplied four-person montage, retained in the unused asset archive after the Google Play badge replaced it. The edit reduces compression and blur, reconstructs fine photographic detail, and completes the cropped curly-haired crown and upper contour of the second portrait. The original people, ordering, profile poses and monochrome first-three / natural-color fourth treatment were used as references; generated detail is illustrative and is not an identity-verification claim. Transparent exterior cleanup and high-resolution antialiasing remove matte debris while retaining an opaque photographic field inside each tile. The 2172×724 restoration master is delivered as a 960×320 WebP with lossless alpha for sharp small Retina rendering. It does not reuse the previous SVG clip, which would crop the repaired crown. Earlier assets remain unused in the archive. The previous portrait group is no longer referenced by the page.

No identity, testimonial, endorsement or customer status is asserted for the people pictured. The supplied reference is not a general stock-photo licence.

The retired “80+ million customers worldwide” copy referred to Revolut, not this independent portfolio. Revolut's official 4 November 2026 announcement reports over 80 million retail customers: https://www.revolut.com/en-US/news/revolut_completes_fundraising_process_establishing_115_billion_valuation/.

## Original product mockups

Smartphone, physical cards and virtual card previews are original HTML/CSS/React renders. They remain interactive, show fictional data and use no real card credentials. Silver, Graphite and Champagne finishes use neutral metallic shading.

## Retired artwork

The previous AI-generated images with the Orbit wordmark remain only in the asset archive (`public/images/fintech-cards-*.webp`). They are not referenced or displayed by this redesign.

The next generation presentation reuses these existing licensed files. The coastal escape crop shows mountains, beach and water; its alternative text does not claim a visible rainbow. No additional colour grading or generated faces are applied to the campaign photography; the separate supplied portrait montage restoration is described above.
