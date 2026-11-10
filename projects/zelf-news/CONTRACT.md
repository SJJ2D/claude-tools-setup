# ZLF News — build contract (read fully before writing code)

Work dir: `/home/user/work/zelf`. One HTML composition (`index.html`), classic scripts (file:// safe, NO ES modules, NO network).
Globals: `THREE` (r159, `lib/three.min.js`), `OM` (onetake `lib/motion.js`: `OM.ease.{cubicOut,quartOut,expoOut,backOut,cubicInOut,expoInOut,smooth,...}`, `OM.spring`, `OM.clamp/lerp/seg/sstep`), `ZN` (`core.js`), `ZN_ASSETS`/`ZN_META` (`assets.js`), `ZN_TL` (`timeline.js`).
Read `core.js` (150 lines) and `scenes/_example.js` first: they are the API.

## Hard rules
1. **Everything is a pure function of `t`.** `update(t, ctx)` sets every transform/opacity/uniform from `t` (use `lt = t - ctx.t0`). No CSS transitions/animations, no `requestAnimationFrame`, no `setTimeout`, no `Math.random()`/`Date` (use `ZN.rng(seed)`), no state carried between frames. Seeking to the same `t` twice must give the same picture; seeking backwards must work.
2. **Only edit the file(s) you own.** Never touch `core.js`, `index.html`, `timeline.js`, `assets.js`, or another scene's file. If you need something from core, work around it inside your file and say so in your report.
3. **Cue times come from the timeline, not from constants**: `ZN.cut('S3')` → `[t0,t1]`, `ZN.L('l5')`/`ZN.LE('l5')` line start/end, `ZN.wordT('l5', i)` i-th word time, `ZN.wordAt('l5', 'الزلف')` time of the first word containing that fragment. Put the visual hit ON the spoken word. The VO will be re-recorded later and everything must re-flow.
4. **Arabic**: all visible text in Arabic exactly as in `script.json` (Bahraini). Fonts: `ZN.F.ui` (Almarai 400/700/800) for news UI, `ZN.F.stamp` (Lalezar) for punchy stamps. `direction:rtl`. Never animate Arabic letter by letter (breaks joining): animate whole words or phrases. In canvas: `ctx.direction='rtl'`.
5. **Look**: palette `ZN.C` only (navy/navy2/navy3, red/red2, white, gold, cyan, ink, paper) plus the photos' own colours. One film, one look. Mean frame luma at your scene's main hold should be **0.45 ± 0.08** (the sheet tool prints it per frame). Light 3D characters from the side or from behind the camera, never backlit.
6. **Camera**: steady with smooth eased moves (slow push-ins, gentle orbit, whip between setups). NO continuous shake/wobble. At most one short light shake (≤0.25 s, ≤6 px) on the single biggest hit of your scene.
7. **Safe areas** owned by the persistent news UI (`scenes/newsui.js`): bottom `ZN.SAFE.ticker` px (ticker bar), top-right `ZN.SAFE.bugW×bugH` (channel bug), and the lower-third band from `y=ZN.SAFE.lowerTop` down to the ticker. Keep your key content out of them. A transition wipe from newsui covers about 0.15 s on each side of every cut.
8. **Photos**: `ZN_ASSETS` keys `p1` (side profile, purple light, 1530×2040), `p2` (dog filter, 1260×2436), `p3` (towel on head, 1260×2436), `p4` (warped grin, 1290×2476), crops `p2_face` (640²), `p3_face` (640×851), `p4_face` (640²), `p1_zelf` (640×731, the sideburn close-up). `ZN_META.p1.zelf = {cx,cy,r}` (sideburn centre in p1 pixels), `.ear`, `.eye`. View them in `assets/*.jpg`. DOM: `ZN.photo(parent, key, css)`; 3D: `ZN.tex(key)`. These are real photos of a friend who consented: keep it affectionate, never deform his face beyond what the photo already shows, no other people.
9. **Sound**: register events in `init()` with `ZN.ev(name, time, gain)`; names ONLY from: `sting whoosh whip impact boom bark fail scream pop tick stamp riser beep ding typing slide shutter scratch boing sad`. Few, meaningful events (the mix is one room, not a note per element).
10. **9:16**: the same file must also run with `?v` (`ZN.VERT===true`, stage 1080×1920). Use `ZN.W/ZN.H` and a `const V = ZN.VERT` switch for positions/camera. Horizontal is the priority; vertical must be clean (nothing off-screen or overlapping) and is verified with `tools/shots.sh "<times>" <name> <only> v`.
11. **Motion craft**: enter `cubicOut/quartOut/expoOut`, exits 65–75 % of the enter time with an ease-in, playful hits `backOut`/`OM.spring`. No frame fully static while a scene holds (tiny drift ≤ 1 %); shot lengths vary; fast moves 0.3–0.6 s. Text cards have OPAQUE backgrounds. Nothing moves faster than ~80 px/frame at 30 fps unless it is a whip covered by the wipe.

## Scene contract
```js
ZN.scene({ id: 'S3', init(ctx) { /* build once: ctx.ui (full-stage div), ctx.t0, ctx.t1 */ }, update(t, ctx) { /* set everything from t; 3D: ZN.render3d(scene, camera) */ } });
```
A scene's `id` must be a key in `ZN_TL.cuts`. 2D-only scenes must paint their own opaque full-stage background. `layer:'overlay'` scenes run for the whole film above everything.

## Verify loop (mandatory, every change)
```bash
cd /home/user/work/zelf && tools/shots.sh "21.2,24.0,27.5,31.0" s3 S3,newsui      # horizontal; add a 4th arg  v  for 9:16
```
It prints PNG paths, `no page errors` (or the errors), and writes `out/stills/<name>_sheet.jpg`. **Read the sheet AND at least two full-res PNGs** and look for: overflow/clipped Arabic, broken joining, overlaps with the news UI safe areas, unreadable text, wrong luma, empty frames. Fix what you see, re-shoot. A passing run without looking at the pictures is not verification.

## Text, cues and units (added)
- **Every visible Arabic string comes from `script.json`** (loaded as `window.ZN_SCRIPT`): `ZN.S('txt.S3.suspect')`, `ZN.S('channel_ar')`, `ZN.S('ticker')`… Do not retype or reword Arabic in your code (a dialect editor will correct `script.json` centrally). Digits, Latin and symbols may be literal. Your scene brief is `scenes.<ID>` in `script.json`; the spoken lines of your scene are in `lines`.
- **Anchors**: `ZN.at(['word','l9','مو فيه', 0.0])`, `['line_start','l5',-0.2]`, `['line_end','l1',0.9]`, `['cut_start','S3',0.1]`, `['cut_end','S3',-0.4]`, `['start',1]`, `['end',-0.9]`.
- **The timeline is provisional**: `timeline.js` is regenerated when the real voice replaces the estimates, so cut and word times move. Never hardcode an absolute time. Before every shots run get the current times: `python3 tools/times.py S3`.
- **3D units**: 1 unit = 1 metre, Y up. The anchor sits behind a desk; the Zelf is about 0.35 tall.
- **The Zelf** (`scenes/zelf.js`, built by the S2 builder, also used on the studio desk in S6): `ZN.makeZelf(opts) → { group, pose(p) }`, `p = { t, walk, hop, wave, talk, yaw, squash, tie, sandals, sip, tiltZ }` (all optional, no internal state), origin at its feet, facing +Z.
- **If your file already exists** (an earlier run was interrupted), read it and continue from it; do not start over.

## Economy (the account has a usage limit: be frugal)
- Read only what you need; do not print big files (never `cat` `assets.js`, `fonts.js`, `lib/*`).
- At most ~6 verify rounds. Per round: the sheet plus at most 2 full-res PNGs. Shoot 4-8 well-chosen times per round, not dozens.
- Stop when the scene is clear, funny and clean; report honestly what is still weak.
