# Combo Animation — Experiment Context

A product-details page whose **"Save more with combos" rail** can be rendered
with several different combo-tag micro-animations, switched live via a floating
segmented control. Built to explore which combo-reveal animation feels best.

Route: `/combo-animation` · Accent: `#0F61FF`

## Layout

```
AppShell
 ├─ Header (back → "/")
 ├─ main (scrollable, #F2F3F7)
 │   └─ CatalogBody
 │       ├─ Product Details accordion
 │       ├─ Combos section  ← the animated rail
 │       └─ Similar products rail
 ├─ ActionBar (sticky bottom)
 └─ FloatingTabs (style switcher 1–7)
```

## Combo-tag animation styles (FloatingTabs)

`COMBO_STYLES` in `index.jsx` — `comboStyle` state, default `chiptop`.

| Tab | value      | group              | behaviour |
|-----|------------|--------------------|-----------|
| 1   | `chiptop`  | gradient banner    | combo chip above the title, shows once |
| 2   | `mediatag` | gradient banner    | combo strip below the image (`delay 2000`) |
| 3   | `static`   | gradient banner    | all combo tags change at the same time |
| 4   | `counter`  | white card         | product-count ⇄ combo highlight, rotate (not flip) |
| 5   | `slide`    | white card         | sliding reveal |
| 6   | `reveal`   | white card         | clip-path reveal — slow, smooth, "fresh" |
| 7   | `bento`    | bento grid card    | combo image grid (2/3/N split, 16px radius) |

- Gradient combo banner colour: bg `#F5FAFF`, text semibold.
- Combo tag height: **20px**.
- Timing rule (important): for every variation, **the combo tag stays visible as
  long as the product count** — asymmetric tick handled by `useComboToggle`.
- "static" variants (1–3) change all tags **simultaneously** (fixed delay, not staggered).

## Key files

- `index.jsx` — `ComboAnimationExperiment`; passes `comboAnim={comboStyle}`,
  `comboStagger={800}`, `idPrefix="combo"`, and `combos/similar/productDetails`.
- `data.js` — per-experiment data: `combos` (5), `similar` (airpods ×3),
  `productDetails`. Imports `koreanGlassHero` hero image.
- `../../components/CatalogBody.jsx` — presentational; chooses banner vs
  SectionCard vs bento based on `comboAnim`.
- `../../components/common/ProductCard.jsx` — unified card (combos + similar).
- `../../components/common/useComboToggle.js` — `useComboToggle(delay, comboMs=2000, countMs=3000)`,
  asymmetric recursive `setTimeout` tick.
- `../../components/common/Dirham.jsx` — AED glyph (`currentColor`, `0.7em`),
  `withDirham(text)` inserts the glyph with tight spacing.

## ProductCard notes

- Wishlist heart: fill on click + heartbeat + heart-shaped ripple + 4 small
  scattered floating hearts (different directions).
- Rating pill (`rating-star.svg`), Express tag (`express-today.svg`),
  delivery banner (`#2122B8` + `thunder.svg`), "Best Seller" tag (top-left, rounded-br).
- Pricing group: main price + strikeout + discount %, savings badge; discount
  text and % are the same red. Coupon badge `#FFF0F0`.
- Bento grid variant: images fill width, 16px corner radius all around,
  "save <amount> extra"; 2 products → equal halves.

## History / decisions

- Custom components (no `@field-ds/*` — that package doesn't exist on npm).
- Reveal animation was sped-down and made smoother on request; combo timing
  iterated to "tag stays as long as count".
- Variants 1–3 are the gradient-banner group; 4–6 plain white card; 7 bento.

## Build / deploy

- Build **must** run from `frontend/`: `cd frontend && npx vite build`.
- Vercel monorepo deploy via root `vercel.json` (installs/builds in `frontend`,
  output `frontend/dist`, SPA rewrites).
