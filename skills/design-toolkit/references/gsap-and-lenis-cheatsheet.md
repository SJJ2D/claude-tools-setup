# GSAP and Lenis cheatsheet (verified against npm gsap 3.15.1 and lenis 1.3.27)

## GSAP
- 100% free since Webflow's acquisition, including every former Club plugin: SplitText, MorphSVG, DrawSVG, ScrollSmoother, Flip, Draggable, MotionPath, Observer, ScrambleText, InertiaPlugin, ScrollTrigger, CustomEase, Physics2D.
- npm: `npm i gsap`; import `{ gsap } from 'gsap'` and plugins from `gsap/ScrollTrigger`, `gsap/SplitText`, `gsap/Flip`, and so on. Register once: `gsap.registerPlugin(ScrollTrigger, SplitText)`.
- React: `@gsap/react` gives `useGSAP()`, which cleans up automatically. Otherwise use `gsap.context(() => {...}, scopeRef)` and `ctx.revert()`.
- Browser CDN (no build, needs an allowed host): jsdelivr `https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/gsap.min.js` plus `.../dist/ScrollTrigger.min.js`, `SplitText.min.js`, `Flip.min.js`, `Draggable.min.js`, `DrawSVGPlugin.min.js`, `MotionPathPlugin.min.js`, `Observer.min.js`. cdnjs also hosts `gsap/3.12.5/gsap.min.js` and `ScrollTrigger.min.js`.
- Core calls: `gsap.to/from/fromTo/set`, `gsap.timeline({defaults:{ease:'power3.out'}})`, `stagger`, `gsap.quickTo`, `gsap.matchMedia()` (responsive and reduced motion in one place), `gsap.utils.*`.
- ScrollTrigger: `{trigger, start:'top 80%', end:'bottom top', scrub:true, pin:true, once:true, toggleActions:'play none none reverse'}`.
- SplitText: `SplitText.create('.h', {type:'chars,words,lines', autoSplit:true, onSplit(self){ return gsap.from(self.chars,{...}) }})`.
- Sound design for games: tween SVG attributes with `attr:{...}`, animate numbers with an object and `onUpdate`, use `motionPath` for characters walking along a path.

## Lenis
- npm `lenis`; vanilla: `import Lenis from 'lenis'`; React: `lenis/react` (`<ReactLenis root>`); also `lenis/snap`, `lenis/vue`.
- Needs its CSS (`lenis/dist/lenis.css`): `html.lenis, html.lenis body{height:auto}`, `.lenis.lenis-smooth iframe{pointer-events:none}`, and overscroll rules for `[data-lenis-prevent]`. In a CSP-restricted page, inline these rules.
- Key options: `lerp` (0.1 default), or `duration` (1.2) with `easing`; `smoothWheel`, `syncTouch` (off by default, so touch devices keep native scrolling), `autoRaf`, `anchors`, `allowNestedScroll`, `prevent(node)`, `orientation`, `infinite`, `respectReducedMotion` (true by default).
- Methods: `lenis.scrollTo(target,{offset,duration,immediate,lock,onComplete})`, `lenis.stop()`, `lenis.start()` (use around modals and loaders), `lenis.on('scroll',cb)`, `lenis.raf(time)`, `lenis.destroy()`.
- With GSAP: `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)` with `autoRaf:false`.
- Native scroll containers inside the page: add `data-lenis-prevent` or set `allowNestedScroll:true`.
- Full README copy: `lenis-readme.md` in this folder.

## Right-to-left note
Lenis and GSAP work in RTL pages. Mirror horizontal slide-ins (`x` signs) and horizontal ScrollTrigger scrubs.
