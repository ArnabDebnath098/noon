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
- `NanoBot.jsx` — the floating bot: pointer drag within the free area
  (status bar → nav), position kept as fractions and remembered in
  localStorage (`nano.bot.pos`); tap = hop; arrows / Enter when focused.
- `bot/noonBot.js` — Bot 2 engine ported from `saswata2002/3D-noon-bot`
  (main.js @ e1835af), trimmed to Bot 2 with a transparent background:
  `tap` / `setLean` / `setState` / `dispose`. `bot/robo.js` is the repo's
  Bot 2 look, copied unchanged.

## Behaviour

- **Tap a tab** → its coin flips (Wallet spins only the nano card), then after
  420ms the screen changes. Tapping the current tab just flips.
- **Active pose** (Figma): icon grows 56 → 60.48, rises 1.76px, glows in the
  item colour; label becomes the 88 × 24 coloured wordmark.
- **Compact on scroll**: scrolling down (12px travel) fades the labels and
  settles the coins 24px into their space; scrolling up or reaching the top
  (≤16px) brings them back.
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
