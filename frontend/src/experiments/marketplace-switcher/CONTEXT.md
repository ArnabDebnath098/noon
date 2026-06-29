# Marketplace Switcher — Experiment Context

A noon-style home screen exploring different **marketplace switcher** UX
patterns. The switcher variation is chosen live via a floating segmented
control (tabs 1 / 2 / 3); the rest of the page is shared.

Route: `/marketplace-switcher` · Accent: `#15806A`

## Page layout

```
AppShell (fixed 100dvh frame so `main` scrolls internally)
 └─ main (scrollbar-hide, overflow-y-auto)
     ├─ mp-sticky-header  (sticky top-0; gradient painted ON the header so it
     │    stays pinned)                 ┌ ActiveSwitcher (v1 / v2 / v3)
     │                                  ├ LocationBar  (home.svg + address + ♥)
     │                                  └ SearchBar
     └─ mp-content (scrollable body)
         ├─ PromoBanner   (cashback)
         ├─ CategoryGrid  (4-col, no scroll)
         └─ CombosSection (reuses combo data + ProductCard)
 ├─ Floating back-to-experiments FAB (#1D2539)
 ├─ FloatingTabs (variation switcher 1/2/3, accent #15806A)
 └─ BottomNav (shared, sliding marker, safe-area)
```

- Sticky header gradient: `radial-gradient(... #D4EFF6 / #DBE1F9 / #EBF3F9 ...)`,
  `background-size: 100% 256px` so it looks identical at any header height.
- Scroll drives a `progress` MotionValue (`top / 44px`, clamped 0–1) used by the
  switchers to collapse. `collapsed` boolean (hysteresis 28/16) toggles header shadow.

## Data (`data.js`) — 11 marketplaces

Order: noon, supermall, food, minutes, nownow, pay, home, send, out, med, global.

Per-marketplace styling rule (applies to **all variations**):
- **bg is white by default**; `accent` is the brand colour used to **fill the
  tile when selected**, and the logo/text turns **white** on selection via a
  `brightness(0) invert(1)` filter.
- **Exception:** `noon` has `lightAccent: true` → on its yellow accent the logo
  stays **black** (filter skipped).

Logo rendering helpers per marketplace:
- `logo` (+ optional `logoH`/`logoW`) — single mark (noon, nownow).
- `logoStack: [a, b]` — two stacked marks (supermall = super/mall, left-aligned).
- `fadeStack: [top, keep]` (+ `fadeW`, `fadeH`, `keepW`) — top mark fades/collapses
  on scroll, bottom mark stays (food = noon→FOOD, send = noon→send,
  minutes = 15→MINUTES). super & FOOD share equal width (`keepW`).
- text `label`/`pill` fallback (pay, home, out, med, global).

`super`/`mall` are the same x-height; "super" carries a `p` descender so its
baseline sits ~27% above its box — nudge it down ~0.26×height to align baselines.
(Measured via headless-Chrome render, not eyeballed.)

## Variations (`sections/switcherVariants.js`)

### V1 — `MarketplaceSwitcher.jsx` (scroll-collapse row)
- Horizontal row of 76×76 tiles that **collapse to 36px pills** on scroll.
- Scroll-linked, spring-smoothed (`useSpring(progress)`); height/radius/scale are
  continuous functions of progress (no jump, no content crossfade for simple logos).
- Per-tile behaviours: `fadeStack` (food/send/minutes drop the top mark),
  `rowMorph` (supermall: stacked → one-line via position morph, no crossfade),
  others scale (`collapseScale`, noon 0.82).
- All tiles uniform 76px wide.

### V2 — `MarketplaceSwitcherV2.jsx` (deck → grid → stack)
- **Mount intro:** icons sit in a deck next to "Services provided by noon"; the
  switcher height hugs the deck then **springs open** into a 5 / 5 / 1 grid
  (per-icon staggered `reveal` spring); the label slides out left.
- **Scroll:** grid collapses so the first 4 icons stay in a row and icons 5–11
  morph into a **clean layered stack** (uniform size, same line, offset only in x;
  buried marks fade so only colour edges peek).
- Icon geometry derived from **measured container width** (ResizeObserver) so 5
  columns fill the row. Icons are **squircles** (`borderRadius 30%`).
- Continuity: each icon's x/y/scale/opacity is a lerp of two spring drivers —
  `reveal` (deck→grid) and `useSpring(progress)` (grid→collapsed).

### V3 — `MarketplaceSwitcherV3.jsx` (row + grid tile, App-Library expansion)
- **Collapsed:** a row of **3 marketplace tiles (76px squircle) + a grid tile at
  the end** showing a 2×2 preview (Figma-spec layout). Preview minis are circular.
- **Tap the grid tile → Apple App-Library-style open:**
  - press feedback (compress ~0.97, ~45ms) → expansion
  - the grid-tile surface morphs into a full 4-column panel (spring 260/28)
  - **object continuity:** the 3 row tiles + 4 preview icons are the *same*
    elements that travel to their grid slots; the remaining icons emerge from the
    grid-tile centre (scale 0.8, opacity 0, blur)
  - every icon follows a **curved path** via CSS `offset-path` (arc ∝ distance),
    staggered nearest-first (~14ms), gentle overshoot
  - **circle → squircle** morph: preview minis are circular, become squircle in
    the grid; expanded grid is squircle, tiles have light-gray `#E5E7EB` borders,
    no shadow, `EXP_GAP 8px`.
- **Tap a marketplace in the grid → flip-swap** it into the "noon food" row slot
  (slot 2): the picked tile and the slot-2 tile do a 3D `rotateY` card-flip
  (`AnimatePresence`, keyed by marketplace id), then the grid closes with the
  picked marketplace now in the row. Implemented via `slotOrder` state (slot
  positions stay fixed; only the marketplace at each slot swaps).
- Ignores scroll `progress` (interaction is tap-driven, not scroll).

## Spring reference (App-Library feel)

- Container expansion: stiffness ~260, damping ~28 (was 120/18 — sped up on request).
- Icon travel: stiffness ~300, damping ~30, mass 0.7; stagger ~14ms; overshoot 2–3%.
- iOS-style: spring everywhere, restrained bounce, object continuity, curved paths.

## Notes / gotchas

- `AppShell` frame is `h-[100dvh] overflow-hidden` so `main` is the real scroll
  container (otherwise `position: sticky` had nothing to stick within and the
  whole document scrolled).
- Curved motion in V2/V3 uses `offset-path: path('M.. Q.. ..')` + animated
  `offsetDistance` (needs iOS 16+/modern Chrome). If a browser jumps instead of
  gliding, fall back to x/y keyframe arcs.
- Marketplace logos are coloured SVGs imported as URLs; selection recolours them
  white with a CSS `brightness(0) invert(1)` filter (skipped for `lightAccent`).
- Build from `frontend/`: `cd frontend && npx vite build`.

## Assets

`src/assets/marketplace/`: noon, super, mall, food, nownow, send, minutes,
minutes-15, minutes-word, home (`.svg`).
