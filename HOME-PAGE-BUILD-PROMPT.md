# Build Prompt — noon Home Page

> Paste below the line into your coding agent. It reproduces the structure of the
> existing noon home screen (the marketplace-switcher experiment) as a clean,
> reusable `HomePage`. React + Tailwind + Framer Motion.

---

Build a **`HomePage`** for a mobile-first noon-style shopping app. It renders inside
an `AppShell` (a phone-width frame that exposes safe-area CSS vars `--sat` top and
`--sab` bottom). The page is **one vertical scroll container** with a **sticky
header** that collapses on scroll, a **scrollable body**, a **loading skeleton**,
and a **bottom nav**. Use `data-id` on every element.

## Anatomy (top → bottom)

```
AppShell
└─ <main> single scroller (scrollbar-hidden, bg white, paddingBottom = 85px + var(--sab))
   ├─ Sticky header  (position: sticky; top:0; z-45; rounded-b-[12px]; paddingTop: var(--sat))
   │   • Background gradient PAINTED ON THE HEADER so it stays pinned while collapsing:
   │       radial-gradient(187.5% 187.5% at 50% -79%,
   │         #D4EFF6 10%, #DBE1F9 50%, #EBF3F9 70%, rgba(128,213,234,0) 100%), #FFFFFF
   │       background-size: 100% 256px; no-repeat; position top
   │   • Adds a soft shadow (0 2px 8px rgba(0,0,0,0.05)) only once collapsed
   │   1. MarketplaceSwitcher — horizontal row of marketplace logo tiles that
   │      COLLAPSE from 76×76 squares to 76×36 pills as the body scrolls up
   │      (scroll-linked, spring-smoothed). Selected tile is accent-filled;
   │      logo inverts to white (except light accents like noon yellow).
   │   2. LocationBar — home icon + delivery address (label + line) on the left,
   │      wishlist heart on the right. Address text slide-swaps on change.
   │   3. SearchBar — 48px rounded field: search icon · placeholder "Search iphone"
   │      · vertical divider · camera icon.
   │
   └─ Body  (fades in; shows Skeleton while a marketplace "loads" ~750ms)
       a. PromoBanner   — full-width squircle hero image (radius 20) + an offer
                          strip image below it (radius 12), gap-4, px-4.
       b. CategoryGrid  — "Shop by category" heading (17px bold) + horizontal rail
                          of 92px squircle tiles (radius 22, gradient bg) with a
                          12px bold label under each.
       c. ProductRail   — "Best picks for you": titled horizontal rail of 150px
                          product cards.
       d. ProductRail   — "Extra 10% off mobiles | Use code: SAVEBIG" with a blue
                          "View all ›" link on the right.
       e. CombosSection — "Save more with combos" on a #F7F8FA band: rail of 140px
                          combo product cards.

Floating (fixed, above the nav): a round back button (optional).
BottomNav (fixed bottom): Home · Categories · Offers · Cart · Account, sliding
active marker, background extends into var(--sab) safe area.
```

## Behavior

- **Scroll-collapse.** Track scroll via `onScroll` on `<main>`. Compute
  `progress = clamp(scrollTop / 44, 0, 1)` (44px collapse range) and pass it to
  `MarketplaceSwitcher`; spring-smooth it (`useSpring`, `{stiffness:480, damping:48,
  mass:0.45}`). Each tile maps `progress 0→1` to height `76→36`, radius `20→10`,
  logo scale `1→0.5`.
- **Header shadow** toggles with hysteresis (add shadow past ~28px, remove below
  ~16px) so it doesn't flicker.
- **Marketplace change** shows `HomeSkeleton` for ~750ms, then the new body fades in
  (opacity 0→1, 300ms, ease `cubic-bezier(0.32,0.72,0,1)`), keyed by active id.
- **Selection state** for the active marketplace lives in the page.

## Data shapes (mock in a data layer)

```ts
Marketplace = { id, accent /*brand color*/, bg?, lightAccent?,
                logo? | logoStack? | { label, sub? }, logoW?, logoH? }
Category    = { id, name, image, cover? /*full-bleed artwork*/ }
Product     = { id, image, title, price, originalPrice?, discount?,
                rating?, ratingCount?, badge?, delivery? }
Address     = { label /*e.g. "Home"*/, line /*full address*/ }
```
Provide fixtures: ~8 marketplaces, ~6 categories, ~6 "best picks", ~6 mobile deals,
~4 combos, one address.

## Styling / tokens

- Fonts: a display font for logos/labels ("Noontree" in the original) and a UI font
  for headings/body ("Figtree"). Section headings: 17px, bold, `tracking-[-0.02em]`,
  color `#262A33`.
- Pull colors from a token layer — no scattered raw hex in components. Key values
  from the original: header gradient stops above; combos band `#F7F8FA`; "View all"
  link `#3866DF`; primary text `#1D2539`.
- Horizontal rails: `overflow-x-auto` + hidden scrollbar, `gap-3`, `px-4`.
- Respect safe areas: header `padding-top: var(--sat)`; body bottom padding
  `calc(85px + var(--sab))`; bottom nav background fills `var(--sab)`.

## Componentization (important)

Build these as **separate reusable components**, not inline — the HomePage only
composes them: `MarketplaceSwitcher`, `LocationBar`, `SearchBar`, `PromoBanner`,
`CategoryGrid`, `ProductRail` (title + optional `viewAll` + products), `ProductCard`
(shared by both rails and combos, width configurable), `CombosSection`,
`HomeSkeleton`, `BottomNav`. The HomePage file should read as a short composition of
these inside the sticky-header / body / nav skeleton described above.

## Definition of done

- Renders on fixture data with no props.
- The marketplace row visibly collapses to pills as you scroll and expands back.
- Header stays pinned with its gradient; shadow appears only when collapsed.
- Switching marketplace shows the skeleton, then fades in new content.
- Every element has a `data-id`; rails scroll horizontally; layout respects
  `--sat`/`--sab`.
