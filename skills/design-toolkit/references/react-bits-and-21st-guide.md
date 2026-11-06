# React Bits and 21st.dev usage guide (read from reactbits.dev and 21st.dev)

## React Bits (https://reactbits.dev)
- Free and open source. 218 components in four variants: JS+CSS, JS+Tailwind, TS+CSS, TS+Tailwind (all kept in sync).
- Categories: Text Animations (33), Animations (38), Components (48), Micro (35), Backgrounds (63). Full list with one-line descriptions: `react-bits-catalog.txt`. Per-component npm dependencies: `react-bits-dependencies.json`.
- Install a component (the code is copied into the project, there is no package):
  - `npx shadcn@latest add https://reactbits.dev/r/<Name>-<JS|TS>-<CSS|TW>`  (example: `SplitText-TS-TW`)
  - `npx jsrepo@latest add https://reactbits.dev/r/<Name>-<JS|TS>-<CSS|TW>`
  - Each registry JSON (`https://reactbits.dev/r/<Name>-TS-TW.json`) holds the full source in `files[].content` and the dependencies, so the source can be fetched with curl and adapted by hand when a CLI is unavailable.
- Typical dependencies: `gsap`, `motion`, `three`, `ogl`, plus `@gsap/react` and `lucide-react` for some. Check and install before use.
- Names are PascalCase in the CLI and kebab-case in URLs (`/text-animations/split-text`).
- Practical picks: hero headline (SplitText, BlurText, ShinyText, TextType, RotatingText, DecryptedText), numbers (CountUp), backgrounds (Aurora, Particles, Waves, Silk, Galaxy, Orb, DotGrid, Beams, Plasma), cards (SpotlightCard, TiltedCard, MagicBento, ProfileCard, PixelCard), navigation (Dock, GooeyNav, PillNav, StaggeredMenu, CardNav), cursor effects (ClickSpark, SplashCursor, TargetCursor, BlobCursor), transitions (PixelTransition, Stepper), 3D (ModelViewer, Lanyard, Cubes).
- Backgrounds built on three/ogl are heavy: lazy-load and disable on small screens and when `prefers-reduced-motion` is set.
- React Bits Pro (paid: blocks, templates, app UI) exists; use only what the free library offers unless the user owns Pro.
- An MCP server for browsing React Bits exists (https://www.reactbits.dev/get-started/mcp).

## 21st.dev (https://21st.dev)
- Community catalog of 12,000+ React and Tailwind components, templates, themes and libraries (shadcn-style). Categories include Hero sections (1.2K), Shaders (607), Backgrounds (528), Buttons (1.7K), Cards and grids (1.3K), Navigation (507), AI chats (313), Sign ins and widgets, Footers, Galleries and 3D.
- Component page URL pattern: `https://21st.dev/@<author>/components/<slug>`; append `.md` for an agent-friendly markdown page (also for categories, authors, libraries, pricing, changelog, mcp, ai).
- Install with the shadcn CLI (the registry command shown on each component page). Libraries hosted there include shadcn-ui, magic-ui, aceternity-ui, origin-ui, kokonut-ui, kibo-ui, reui, hextaui, geist, 8bitcn.
- 21st MCP (formerly Magic MCP): `npx @21st-dev/cli@latest init --client <cursor|claude|codex|vscode|devin>`; endpoint `https://21st.dev/api/mcp`; API key from https://21st.dev/mcp sent as `x-api-key` or Bearer. Tools: `search` (free), `get_component` (paid retrieval), `get_inspiration`, `search_logo` (free), `generate`.
- REST API: OpenAPI spec at https://21st.dev/openapi.json (search, install, publish). 21st AI (https://21st.dev/ai) generates components from a prompt in several takes; paid plans.
- Agent-discovery files: https://21st.dev/llms.txt and https://21st.dev/.well-known/ard.json. Local copies: `21st-dev-overview.md`, `21st-dev-mcp.md`.
- Workflow: search the catalog for the nearest component, install or copy it, then restyle it to the project's tokens. Components assume Tailwind, shadcn `cn()` helper and often `lucide-react`.
