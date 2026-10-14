# Animation architecture

The opening is a single viewport composition, pinned by one GSAP ScrollTrigger timeline. The full-bleed image remains the same element as its clip-path contracts, eliminating duplicate-image crossfade seams. Its scale, horizontal framing, shade, headline exit, story reveal and progress line share the same scrubbed time. Reverse scrolling reverses the complete timeline.

Desktop and landscape tablets end with an editorial split composition. Portrait tablets and phones use a lower photograph mask whose top is measured from the story copy. Geometry is recalculated only on refresh. Short viewports, reduced-motion preferences and reported low-memory devices use a static scene.

Entrance transforms belong to headline inner spans and utility children; the scroll timeline owns their outer blocks. This prevents a fast first scroll from being overwritten by a still-running entrance. Covered Hero controls become inert. Story text is exposed to assistive technology as the composition changes.

Kaiseki uses actual flowing semantic course articles next to a sticky image stage. ScrollTrigger selects the corresponding photographic layer on both forward and backward entry. The text is never replaced, so course names remain readable and discoverable without motion.

React islands own signature selection, category switching, dish overlays and gallery transitions. Their local animation contexts revert on state change/unmount. Native dialogs provide Escape and restoration; a small explicit Tab loop keeps keyboard focus within each open modal. Images support touch swipes without blocking vertical page scrolling.

Fonts, Hero-image load and pageshow refresh measurements. Persisted pagehide keeps timelines intact for back-forward cache restoration; a real document teardown kills its contexts and triggers. No artificial wheel interception or smooth-scroll library is used.
