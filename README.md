# Gaire Freshpods

Product site for the Freshpods automated helmet sanitizing machine, distributed in
Nepal by Gaire Freshpods Pvt. Ltd. (Kalikanagar, Butwal-11, Rupandehi).

The machine is the subject of the page: a real-time 3D model of the cabinet is the
hero, it can be turned by mouse or touch, it repaints when a finish is chosen, and
the same model is reused as a close-up of the chamber to explain the cycle.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # type-check, then bundle to dist/
npm run preview    # serve the built site
npm run lint
```

Push to `main` on GitHub. Cloudflare Pages builds that commit and publishes
[gaire-freshpods.pages.dev](https://gaire-freshpods.pages.dev).

Node 20 or newer. The 3D assets and responsive images are committed under
`public/`, so a clean checkout runs without regenerating anything.

Source GLBs, the brochure PDF, the asset pipeline, and longer working notes
stay on the local machine (`assets/`, `scripts/`, `docs/`) and are not in git.

## How it is put together

| | |
| --- | --- |
| Build | Vite 7, TypeScript, React 19 |
| 3D | three.js via React Three Fiber and drei |
| Motion | Motion (scroll progress, entrance reveals) |
| Styling | Tailwind CSS 4, with the design system in `src/styles/index.css` |

### Source layout

```
src/
  sections/     one file per band of the page, in the order they appear
  components/   Nav, Footer, Media, MachinePoster, Backdrop, UI primitives
  three/        the WebGL layer — canvas, model, lighting, framing, orbit
  state/        the single piece of shared state (see below)
  lib/          content, device capability, viewport
  styles/       type scale, colour tokens, grid and the few custom utilities
```

### One canvas, two sections

There is a single WebGL context for the whole page. The hero and the cycle
explainer take turns using it: each reports its own visibility, and
`src/state/stage.tsx` resolves which one currently owns the stage. When neither is
on screen the render loop stops, and it also stops when the tab is hidden.

`src/three/framing.ts` is the single source of truth for where the machine sits.
It solves the camera distance and pan from the model's real dimensions, and the
static poster is positioned by the same function — which is what makes the swap
from poster to live model a substitution rather than a jump.

Landscape and portrait are solved by different rules, because the constraint is
different. Landscape shots are a fraction of the window's height, since the
machine shares the frame with the copy beside it. Portrait shots are fitted into
the band of space between the type above the machine and the copy below it, so a
short phone gets a smaller machine instead of one that swallows the headline.

### Loading sequence

1. Type, colour field and fonts paint immediately. Nothing waits on 3D.
2. On a capable browser the 3D chunk is requested on the first paint. The canvas
   stays invisible until the model has actually drawn.
3. The product photograph is **not** shown while that is happening. It only
   mounts when WebGL is unavailable or the scene has thrown.

three.js and React Three Fiber sit behind a dynamic import, so the initial
payload stays small and the 3D code is never requested on devices that will
not use it.

### Falling back

`src/lib/device.ts` decides between the full model, a reduced one, and no 3D at
all, based on WebGL support, `deviceMemory`, `saveData` and the effective
connection type. If any of those rule it out — or if the model request fails, or
the WebGL context is refused, or anything inside the canvas throws — the poster
stays permanently and the page is otherwise complete. The error boundary in
`src/three/Boundary.tsx` is what guarantees a failed model cannot take the page
down with it.

Reduced-motion preferences stop the idle rotation and the entrance animations;
the machine stays interactive.

### Mobile

The 3D runs on phones. Device pixel ratio is capped, antialiasing and the heavier
lighting are dropped on the lower tier, a smaller model is served, and the render
loop is stopped whenever the canvas is not in use.

Rotation is driven by `src/three/orbit.ts` over a transparent gesture surface
with `touch-action: pan-y`, so a vertical swipe scrolls the page and a horizontal
drag turns the machine.

The phone layout is a different arrangement rather than a narrower one: the
cabinet gets the first screen to itself, and the copy follows below it on its own
opaque ground instead of competing with a bright yellow cabinet for the same
pixels. The same arrangement is used on portrait tablets.

### Languages

English is the first-visit default. The header language control switches the
whole site between English and Nepali, shows a British flag for English and a
Nepal flag for Nepali, updates `document.documentElement.lang`, and remembers an
explicit choice in local storage. The copy objects must stay structurally
matched in `src/lib/translations.ts`.

## Assets

Processed images and compressed models live in `public/` and are committed.
Regenerating them from the local workshop (`assets/` + `npm run assets`) is
optional and only needed when the source GLB or photography changes.

## Content and claims

All product copy lives in `src/lib/translations.ts` in matching English and
Nepali objects and comes from the supplied brochure. The claims are deliberately not embellished:

- "99.9%" is presented as the manufacturer's stated germ kill rate, not as a
  measured outcome.
- The laboratory section reports what the supplied document reports — one tested
  swab, no detectable growth after treatment — and says plainly what a single
  sample does and does not establish.
- The footer repeats the scope and notes that Freshpods is a hygiene product and
  not a medical device.

## Contact form

With no backend in this project, the form has an honest fallback. Set
`VITE_CONTACT_ENDPOINT` to POST submissions as JSON:

```bash
VITE_CONTACT_ENDPOINT=https://example.com/leads npm run build
```

Without it, the form composes the full request into the visitor's mail client
addressed to the Butwal office, and tells them that is what it did. It never
reports having sent something it did not send.
