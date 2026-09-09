# Neuroverse

An introduction to artificial intelligence for doctors, built entirely out of
neuroscience they already know. Ten chapters; every question is a clinical or
neuroscience question, and the AI concept arrives as the answer's consequence
rather than as a thing to be tested on.

React + TypeScript + Vite + Tailwind v4.

Reading it alone needs no backend at all. Presentation mode does — see below.

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

## Presentation mode

For running it live in front of a room. No accounts and no login anywhere.

| Route | Who | What |
|---|---|---|
| `/` | anyone | The solo journey. Unchanged, and still needs no backend. |
| `/present` | the presenter | The projected deck plus the controls. Opens a room on first load. |
| `/live/CODE` | the audience | One phone, one vote. Follows the presenter; cannot lead. |

Open `/present`, put the QR on screen, and press space. Each chapter runs:

1. **Question** — the poll is open for `POLL_SECONDS` (30, in `src/live.ts`).
   The room sees the countdown and a turnout count, never a breakdown.
2. **Results** — the poll closes on its own when the clock runs out, and the
   bars maximise to show what the room said. `CLOSE POLL NOW` ends it early.
3. **Reveal** — one click marks the correct answer and brings up the teaching.
4. Another click starts the next question.

`SPACE` / `→` advance, `←` goes back. Going back from Results reopens the poll,
which is the recovery if you advance by accident. The presenter's browser is the
only client that writes state, so the room can never disagree about the slide.

### Who is allowed to do what

There is no login, so two things stand in for it:

- the **room code** is public, and only needs to be unguessable enough that
  nobody wanders into the wrong talk;
- the **presenter key** is generated with the room, kept in the presenter's
  `localStorage`, and checked in the database on every slide change. Refreshing
  keeps the room; opening `/present` on another device starts a different one.

None of this is enforced in the browser, because the browser cannot be trusted
to enforce it. `nv_room_keys` and `nv_votes` have RLS on and no policies at all,
so anon reaches neither. Everything goes through security-definer functions that
check the rule themselves — including `nv_tally`, which refuses to return a
breakdown while the poll is still open.

Schema lives in the Supabase project's migrations: `nv_rooms`, `nv_room_keys`,
`nv_votes`, and the functions `nv_create_room`, `nv_set_phase`, `nv_vote`,
`nv_turnout`, `nv_tally`. The publishable key in `src/live.ts` is meant to sit in
browser code; it carries no privileges of its own.

Rooms are never cleaned up automatically. They are a few rows each, but if you
run many talks, `delete from nv_rooms where created_at < now() - interval '30 days'`
clears them out, votes included.

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
