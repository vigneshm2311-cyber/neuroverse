# Neuroverse

An introduction to artificial intelligence for doctors, built entirely out of
neuroscience they already know. Ten chapters; every question is a clinical or
neuroscience question, and the AI concept arrives as the answer's consequence
rather than as a thing to be tested on.

React + TypeScript + Vite + Tailwind v4. No backend, no API keys, no database.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build and deploy

```bash
npm run build        # outputs to dist/
npm run preview      # check the production build locally
```

`dist/` is a static site. Drag it onto https://app.netlify.com/drop, or run
`npx vercel` from this folder. Nothing server-side is required.

## Other scripts

```bash
npm run typecheck    # tsc --noEmit
```

## Where things are

| Path | What it is |
|---|---|
| `src/Neuroverse.tsx` | The whole experience — one file |
| `src/main.tsx` | Mount point |
| `src/index.css` | Tailwind import and page background |

Inside `Neuroverse.tsx`, the content sits at the top and is separate from the
UI, so it can be edited without touching any logic:

- `CHAPTERS` — the ten chapters. Each has the question, options, the correct
  index, the neuroscience paragraph, the bridging sentence, the AI explanation
  and the honest limit. Edit the text here; nothing else needs to change.
- `PICTURE` — the six steps of the closing diagram.
- `C` — the two-colour palette. Teal is biological, violet is artificial.

The brain is a hand-drawn SVG lateral view (`CEREBRUM`, `SULCI`, `GLOW` and
`BrainSVG`). Regions light from within via radial glows, so `region: "frontal"`
on a chapter illuminates that lobe rather than filling a polygon.

## Layout

Two genuinely different layouts, switched at 1024px by a `matchMedia` hook
rather than by CSS alone, because the scroll container differs between them:

- **Laptop and up** — the root is locked to `100dvh`. The illustration pane
  holds still while the text pane beside it scrolls on its own.
- **Phone and tablet** — one column, the page itself scrolls, and the
  illustration is a compact banner sized off viewport height
  (`min(300px, 62vw, 30vh)`) so it can never take over a short screen.

Answering scrolls the collapsed question to the top of whichever container is
scrolling, which keeps the correct answer visible above the reveal. Moving to
the next chapter resets both the pane and the window.

`100dvh` is used rather than `100vh` so that mobile browser chrome does not
crop the fixed elements, and the floating restart button clears the iPhone
home indicator via `env(safe-area-inset-bottom)`.

## Notes

Progress lives in React state, so a refresh restarts the journey. That is
deliberate for a single sitting. If you want people to resume, or want to know
where doctors drop off, that needs adding.

Motion respects `prefers-reduced-motion`: all timed sequences collapse to
instant. Keyboard: 1–4 answers a question, tab and enter work throughout.
