# noon nano — Kids — Experiment Context

The noon nano Kids home (Figma Kids-Side `Home - Full screen`, 492:26324) with
a 3D-coin bottom nav (Figma `Bottom nav`, 52:5472).

Route: `/noon-nano/*` · Accent: `#7924FF`

## Screens

| Path | Screen | Active tab |
| --- | --- | --- |
| `/noon-nano` | Home — the Figma artwork | none (Figma `Active = None`) |
| `/noon-nano/tasks` | Tasks shell | Tasks |
| `/noon-nano/wallet` | Wallet shell | Wallet |
| `/noon-nano/account` | Account shell | Account |

Home is the default screen. Each tab opens its own screen, so the browser back
button works. The tab screens are shells (header with back to home + title)
until their Figma screens are mapped.

## Page layout

```
AppShell
 ├─ main (nano-body, scrollbar-hide, keyed per screen → opens at the top)
 │    └─ HomeScreen: NanoHomeArt (375 × 2409) scaled to the frame width
 │         └─ switcher slot: MarketplaceSwitcherV8 (search's), nano first
 │       TabScreen:  header (back · title)
 ├─ Floating back-to-experiments FAB (#1D2539, bottom left)
 ├─ NanoBot (home only; draggable 3D noon bot, starts bottom right above the nav)
 └─ NanoBottomNav (fixed, eased white fade, safe area ≥ 16px + --sbp)
```

## Files

- `index.jsx` — routes the screens, scroll-direction → compact nav.
- `NanoHomeArt.jsx` — the Figma frame mapped 1:1 (export values; `data-node-id`
  is the Figma layer). Assets in `src/assets/nano/home`.
- `NanoBottomNav.jsx` — Figma Bottom nav layout; labels / wordmarks; drives
  the 3D scene.
- `coinNav.js` — the three.js scene (no React): coins, modelled book & pencil,
  extruded glass nano card, avatar, top-lit two-layer shadows. Placed on the
  nav's DOM slots; `select` / `setCompact` / `setPressed` / `dispose`.
- Marketplace switcher — the search experiment's `MarketplaceSwitcherV8` with
  the shared `marketplaces`, plus a nano tile first (`index.jsx`
  `NANO_MARKETPLACE`: always Figma purple, `sw-nano-mark.svg` = the Figma
  noon / nano marks combined). Tiles only highlight; the home stays nano.
- `updates/` — "Updates today", the bell's stack (Figma 36:10275); the bot is
  the bell. `UpdatesOverlay.jsx`: blurred overlay, header art, swipeable stack
  (read cards stack above), pager, first-view swipe hint, loading / single /
  end of list / couldn't load (toast + Try again) / offline states.
  Intro on each open, from the centre (the visible title — bell + words — is
  centred on screen: the box sits `TITLE_VISUAL` = 30px below / 5px left of
  the midpoint to compensate for the bell above and the art's right lean): a glow pulses out, then each title
  layer starts as a point at the art's centre and springs out to its place
  (one soft overshoot, then settles), staggered Updates → Today → ring →
  streaks (an eased wipe out from the centre + fade + blur → sharp, behind
  the words) → bell (lands with a swing); settled by ~0.9s, rises to its Figma
  spot at 1.45s, cards spring up at 1.8s, then a slow 3D sway.
  The words are a touch more 3D (tipped back 9°, a stacked purple edge +
  soft drop) and shine: a gloss band masked to the letters sweeps across 3×
  from 0.9s (~5.5s), "Today" a beat after "Updates", then fades out. Reduced
  motion: no intro.
  Pager: a recessed glass groove; on each card change the gel marker springs
  to its slot with a squash & stretch (leading edge anchored, tail streaks
  back so it never leaves the groove), dots slide aside, a newly read dot pops
  in as a chrome bead. Stops are absolutely placed so they can move.
  `CardDeck.jsx`: the swipe deck on GSAP Draggable + InertiaPlugin — top
  card + next two as real cards in the sliver slots (frosted); drag follows
  1:1 with tilt while the next card rises (anticipation); release throws on a
  flick (> 400 px/s, past 24px — max of Inertia + pointer-sampled velocity) or
  past 96px, else elastic spring-back; a throw keeps its speed off-screen and
  promotes the deck (expo-out); arrow keys mark read without animation.
  `NotificationCard.jsx`: all 18 card variants (33:3405), data-driven.
  `updatesData.js`: the happy path's 4 cards + `loadUpdates()`; QA with
  `?updates=all` (every variant) or `?updates=error` (fails once). Assets in
  `assets/nano/updates` as WebP at ~3× display size (27.6 MB of Figma PNGs →
  0.94 MB), preloaded on idle by `preloadUpdates()` (index.jsx); declined art = colour art + CSS grayscale (Figma's
  filtered fills don't export). Dev: `window.nanoUpdates.reset()` / `.open()`.
- `NanoBot.jsx` — the floating bot: pointer drag within the free area
  (status bar → nav), position kept as fractions and remembered in
  localStorage (`nano.bot.pos`); tap = hop; arrows / Enter when focused.
- `bot/noonBot.js` — Bot 2 engine ported from `saswata2002/3D-noon-bot`
  (main.js @ e1835af), trimmed to Bot 2 with a transparent background:
  `tap` / `setLean` / `setState` / `dispose`. `bot/robo.js` is the repo's
  Bot 2 look, copied unchanged.

## Behaviour

- **Tap a tab** → it shows selected at once (wordmark, glow) while its coin
  flips (Wallet spins only the nano card); after 420ms the route catches up
  without re-syncing the scene, so the flip isn't cut short. Tapping the
  current tab just flips. Label ⇄ wordmark cross-fade in place (both mounted).
- **Active pose** (Figma): icon grows 56 → 60.48, rises 1.76px, glows in the
  item colour; label becomes the 88 × 24 coloured wordmark.
- **Compact on scroll**: scrolling down (12px travel) fades the labels and
  settles the coins 24px into their space; scrolling up or reaching the top
  (≤16px) brings them back.
- **Hover** (mouse): only the coin under the pointer leans toward it, gently
  (≤ 0.14 rad, fading out ~2 radii from its centre); the others keep their
  idle sway. Touch doesn't tilt.
- Tasks pencil: hexagonal flat-shaded lacquer barrel, sharpened wood cone,
  graphite point, crimped metal ferrule, eraser (`pencilModel` in coinNav).
- Account avatar: a 2.5D relief built from the art's alpha (pillow inflate,
  headset pushed forward), lit + glossy, with a soft shadow on the face.
  Selected: springs out (overshoot) — up, forward, 1.22×, leaning in, head
  past the rim — then sways and breathes so the depth reads.
- Reduced motion: no flip / sway / bob, instant compact, no delay before the
  screen changes.

## Deviations from the Figma export (each to match the Figma render)

- "Wallet is Ready": its white outline isn't in the export → stroked underlay.
- Marketplace product shots: the export's layer blurs aren't visible in the
  render → dropped.
- "win dhm5" badge: tracking 0 so Chrome keeps Noontree's dirham ligature.
- Mini Pixel Dash isn't available → mono fallback squeezed to its 56px box;
  Space Grotesk → Noontree.
- The Figma status bar is left to the AppShell (its ink is dark, so it reads
  low over the dark wallet hero in the framed preview).
