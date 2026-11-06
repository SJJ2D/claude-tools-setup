---
name: design-toolkit
description: Design and motion toolkit (GSAP, Lenis, React Bits, 21st.dev) for any UI work. Make sure to use this skill whenever building or redesigning a website, landing page, web app, dashboard, game, educational game, interactive lesson, artifact, prototype or any visual interface, even if the user does not mention animation, libraries or design. Use it for scroll effects, animated text, hero sections, transitions, hover effects, cards, buttons, navbars, backgrounds and polished component choices.
---

# Design toolkit

Four tools raise the polish of anything with a screen. Reach for them by default on UI work, because plain static pages read as unfinished next to pages with considered motion and well-made components.

| Tool | What it is | Use it for |
|---|---|---|
| GSAP (greensock/GSAP) | Animation engine with ScrollTrigger, Flip, SplitText, Draggable (all free since 2025) | Timelines, entrance sequences, scroll-driven scenes, SVG and number animation, game feedback |
| Lenis (darkroomengineering/lenis) | Smooth-scroll library | Long landing pages and story-style scrolling; pairs with GSAP ScrollTrigger |
| React Bits (DavidHDev/react-bits) | Animated React components: text effects, backgrounds, cards, cursors | Hero text, aurora/particle/grid backgrounds, interactive cards, in React/Tailwind projects |
| 21st.dev | Community marketplace of shadcn/Tailwind React components | Buttons, navbars, pricing, forms, hero blocks, dashboards |

## Reference files
Read these when you need detail instead of guessing:
- `references/gsap-and-lenis-cheatsheet.md`: verified GSAP and Lenis APIs, CDN paths, setup.
- `references/react-bits-and-21st-guide.md`: how to install and choose React Bits and 21st.dev components.
- `references/react-bits-catalog.txt`: every React Bits component with a one-line description.
- `references/react-bits-dependencies.json`: npm dependencies per React Bits component.
- `references/21st-dev-overview.md` and `21st-dev-mcp.md`: 21st.dev catalog, MCP and API notes.
- `references/lenis-readme.md`: full Lenis README.

## Bundled offline copies
`assets/` holds GSAP 3.15.1 with its free plugins, Lenis 1.3.27 and the source of all 218 React Bits components (see `assets/README.md`). When a project has no network or no build step, copy from there instead of fetching.

## Choosing

1. Read the request and any existing design system first. The user's words and the project's own tokens win over anything here.
2. Pick the smallest set that serves the page. A calculator needs none of this; a landing page may use all four. Motion earns its place by explaining or rewarding something (a state change, a reveal, feedback), never by decorating.
3. One orchestrated moment beats scattered effects: a hero entrance, one scroll sequence, consistent hover feedback.

## Environment rules

**In a project with a build step (React, Next, Vite):** install from npm (`gsap`, `lenis`) and register plugins once. For React Bits and 21st.dev, copy the component source into the project (they are copy-paste, not packages), then adapt colors, fonts and copy to the project's tokens. Read the component's dependencies first (often `motion`, `three`, `ogl`, `lucide-react`, Tailwind, `cn` helper) and install what is missing.

**In a single-file page or Claude Artifact (no build, CSP-restricted):**
- Load only from the allowed CDNs, pinned to exact versions at least two weeks old:
  - `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js` and `.../ScrollTrigger.min.js` (the jsdelivr copies `gsap@3.15.1/dist/*.min.js` also carry SplitText, Flip, Draggable, DrawSVG and MotionPath, which are now free) (load ScrollTrigger after gsap, then `gsap.registerPlugin(ScrollTrigger)`).
  - `https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js` (global `Lenis`). Inline the few lines of Lenis CSS from the cheatsheet, since stylesheets from CDNs are blocked.
- React Bits and 21st.dev components are React/Tailwind. In a no-build page, do not try to import them. Re-create the effect in vanilla JS/CSS/canvas (aurora gradients, split-text reveals, spotlight cards, marquee, magnetic buttons, tilt cards are all easy), borrowing the component's look and behavior. If the page genuinely needs React, load React 18 UMD and Tailwind from the allowed CDNs and port the component by hand.
- The artifact frame blocks other hosts, so no remote fetches for assets.

## GSAP patterns

- Entrance: `gsap.from('.hero > *', {y: 24, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out'})`. Animate transform and opacity only, for smoothness.
- Scroll reveal: `ScrollTrigger` with `trigger`, `start: 'top 80%'`, `once: true`. Make content visible at rest if JS fails (set the hidden state from JS, not CSS).
- Sequences: build one `gsap.timeline()` and label it, rather than chaining delays.
- Numbers: tween an object property and write it to the DOM in `onUpdate` for counters and gauges.
- Games and lessons: use short (150-400 ms) eased tweens for feedback on every interaction: a pop on success, a shake on conflict, a smooth camera move between scenes.
- React: wrap in `useGSAP` or `gsap.context()` and call `ctx.revert()` on cleanup. Never leave tweens running after unmount.

## Lenis patterns

- Create once, drive it from GSAP's ticker so both share a clock:
  ```js
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
- Use it on long, scroll-led pages only. Skip it for apps, dashboards and tools with internal scroll containers, where smooth-scroll hijacking hurts.
- Put `data-lenis-prevent` on inner scrollable panels, modals and textareas.

## React Bits and 21st.dev usage

- Browse the catalogs for the closest match to the need (text animation, background, card, nav, pricing, form). Prefer one signature component for the hero and quiet standard components elsewhere.
- Restyle every borrowed component to the page's palette and type; leaving its default colors is what makes pages look assembled from parts.
- Keep the copied code readable: remove unused props and demo scaffolding.

## Quality rules for all motion

- Respect `prefers-reduced-motion`: gate or shorten animations with `gsap.matchMedia()` or a media query.
- Keep text readable at rest and at the first frame; no content stuck at `opacity: 0`.
- Test at phone width; disable heavy effects (particles, WebGL) on small screens.
- Stay on 60 fps: avoid animating layout properties, cap particle counts, kill triggers you no longer need.
- For right-to-left languages such as Arabic, check that horizontal motion directions and slide-ins make sense mirrored, and use a font with real Arabic glyphs.
