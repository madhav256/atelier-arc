# Motion

Restrained, gallery-paced animation built on [GSAP](https://gsap.com) 3.15 with ScrollTrigger (free under GSAP's standard no-charge license since v3.13) and [Lenis](https://github.com/darkroomengineering/lenis) smooth scrolling (MIT). References: Awwwards Sites of the Day for galleries such as [Southern Guild](https://www.awwwards.com/sites/southern-guild), [ICG Galleries](https://www.awwwards.com/sites/icg-galleries) and [ArtPill](https://www.awwwards.com/sites/artpill): big still images, slow wipes and masked type, micro-interactions that don't compete with the work.

| Where | What | Code |
|---|---|---|
| Home hero | Cycles up to 4 featured works: slow horizontal clip-path wipe (1.8 s), outgoing image drifts, incoming image settles from 1.18x scale, masked line-by-line title reveal. 8 s per work with a hairline progress bar; prev/next and pause controls; pauses on hover and focus. Scroll parallax on image and copy. | `components/HeroCarousel.jsx` |
| All pages | Lenis smooth wheel scrolling; ivory curtain wipe and gentle content lift on route change (header stays put). | `lib/motion.js`, `components/Layout.jsx` |
| Cards, detail, spotlight, journal | Images reveal upward from a clip mask while scaling down from 1.16x; headings and meta rise out of a mask; staggered in batches as they scroll in. Spotlight portrait has scrubbed parallax. | `lib/motion.js` (`watchReveals`) |
| Artwork cards | 1.6 s slow zoom, soft bottom veil, title underline drawn on hover and keyboard focus. | `styles.css` |
| Browse by price | Hairlines draw in left to right on scroll; on hover or focus a gold rule draws over the line, the tier glides right (transform, no reflow), number turns gold, arrow nudges. | `pages/Home.jsx`, `styles.css` |

Rules we kept:

- `prefers-reduced-motion: reduce` turns everything off: no smooth scroll, no curtain, no reveals, the hero starts paused and changes instantly (handled by `gsap.matchMedia` and the existing CSS guard).
- Text is never faded with opacity; it is revealed with clip-path + transform, so accessibility contrast checks never see half-transparent copy.
- Motion never delays content: everything already on screen starts revealing on load, and every tween clears its inline styles when done.
- The hero autoplays for more than 5 seconds, so it has a visible pause control (WCAG 2.2.2).
