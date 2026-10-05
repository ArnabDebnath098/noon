# noon Experiments — Clean Architecture & PRD (v2)

> A proposal for a **new, separate app folder**: a lab that anyone on the team can
> **pull and immediately build with**. It keeps everything good about the current
> prototype repo and fixes the structural problems that made it hard to grow.
>
> **The promise:** *everything is a component.* There are two levels you build
> with — **components** (a card, a nav, a banner) and **pages** (a whole Home,
> Product Details, Payment, Search, Cart screen that assembles itself from those
> components). You call a page, it builds; you wire pages together into a **flow**
> (Home → tap a product → Product Details → Cart → Payment). That's the whole job:
> pull the repo, compose components or call ready-made pages, stitch the flow, ship
> an experiment.
>
> Two runtime views: a **framed iPhone reference** on desktop and a **full-bleed
> native app** with real safe areas on mobile / installed PWA. All UI sits on a
> swappable design-system layer that mirrors the `@field-ds` API so the real noon
> library can drop in later.

---

## 1. What the current repo actually is

A Vite + React 18 + Tailwind + Framer Motion PWA, split into three layers
(`frontend/`, `backend/`, `storage/`). The frontend is the real product; the
backend is stubs (`/api/health`, empty `/api/products`).

The core idea is already right and worth keeping:

- **Experiments are the unit of work.** Each is a self-contained screen/flow under
  `src/experiments/<name>/`, lazy-loaded so each becomes its own chunk.
- **A registry drives discovery.** `experiments/registry.js` lists every experiment
  (id, title, description, path, icon); the landing page maps over it, and
  `routes/AppRoutes.jsx` lazy-imports each one.
- **An `AppShell` gives every screen a phone.** On desktop it draws an iPhone-13
  squircle with a faux status bar + home indicator and exposes `--sat`/`--sab`
  safe-area CSS vars; on mobile it goes edge-to-edge. This is a genuinely clever
  piece and the responsive strategy below builds directly on it.
- **Shared UI lives in `components/`** with a **barrel** (`common/index.js`) that
  deliberately mimics `@field-ds/components`' named-export ergonomics.

Current experiments: `combo-animation` (a full PDP with combo-tag animations),
`marketplace-switcher` (home screen with 9 switcher variants), `price-history`,
`search` (no-results + Magic List), `cart`.

---

## 2. What went wrong (the mistakes to not repeat)

Each has a concrete fix in the new structure.

**2.1 "Reusable" components import from experiment folders.**
`components/layout/BottomNav.jsx` imports `NewBadge` from
`experiments/marketplace-switcher/sections/`. The moment a shared component
depends on an experiment, it is no longer shareable — and a person who pulls the
repo to reuse the nav inherits an experiment they never wanted. Dependencies must
flow **one way**, never back up the chain.

**2.2 The line between "shared" and "experiment-local" is blurry.**
Truly reusable things (`ProductRail`, `PromoBanner`, `SearchBar`, `CategoryGrid`,
`LocationBar`, `MarketplaceSheet`) are buried inside
`experiments/marketplace-switcher/sections/`, so no one else can find or trust
them. There's no rule for where a thing goes, so nothing is discoverable.

**2.3 Mega-components.** `BottomNav.jsx` is **618 lines**; `PDPBody.jsx` (948),
`cart/index.jsx` (965), `search/index.jsx` (1116) and
`price-history/PriceHistorySheet.jsx` (1207) are effectively whole apps in one
file. Nothing can be pulled out and reused in isolation — the opposite of the goal.

**2.4 Variants live as parallel copy-pasted files instead of one configurable
component.** There are **nine** `MarketplaceSwitcherV2…V9.jsx` files (V3 alone is
757 lines). The right model is **one component + a variant prop + a variant
registry**, not N files.

**2.5 The design-system layer is imaginary.** The barrel *comment* claims to mirror
`@field-ds/components`, but there's no real DS boundary — cards hard-code hex
values, spacing, and radii inline everywhere. "Make everything look like the noon
app" means editing dozens of files.

**2.6 Product cards are one big uncontrolled prop-bag, not a variant system.**
Every consumer re-specifies the same 20+ props; you can't say "give me the PDP-rail
variant with rating off." You want named variants + toggleable slots.

**2.7 No page layer.** There's no way to say "give me a Product Details page" and
get a working screen. Whole screens are hand-assembled inside each experiment, so
the next person rebuilds the same PDP from scratch. This is the single biggest gap
for the pull-and-build goal, and §5–§7 fix it.

**2.8 Design-time noise ships in `src/`.** `_shot3.mjs`, Playwright as a frontend
dep, and hand-written `data-id` on *every* element are tooling concerns bleeding
into product code. Keep tooling separate.

---

## 3. The product goal: a repo you pull and build with

Everything below serves one outcome: **a teammate clones this repo and, within
minutes, either (a) drops a ready-made page into a flow, or (b) composes their own
screen from components — without reading the internals.** For that to be true:

- **Everything is a component** — from a price label up to a whole Payment page.
  Nothing is "trapped" inside an experiment.
- **Two things are callable by name:** a **component** (`<ProductCard>`,
  `<BottomNav>`) and a **page** (`<ProductDetailsPage>`, `<PaymentPage>`).
- **Pages self-assemble.** Calling a page with data renders a complete, correct
  screen — shell, header, body blocks, nav — with sensible defaults. You don't
  wire its insides.
- **Flows are just stitching.** An experiment declares which pages exist and how
  navigation moves between them (Home → PDP → Cart → Payment). No screen rebuilding.
- **Fixed once, everywhere.** A given thing — a button style, the product card, the
  bottom nav, a header — is defined in exactly **one** place. Fix or restyle it
  there and every page and every experiment that uses it updates. Nobody ever
  patches the same card in five different screens again. This is the core reason
  the current repo is being replaced.
- **It's documented and templated.** A `_template` experiment, a catalog page that
  renders every component and page live, and a per-item README mean discovery is
  self-service.

---

## 4. The layer model (this is the mental model for the whole repo)

Four layers, each built only from the layer(s) below it. This is what makes the
repo pullable: you can enter at whichever layer you need.

```
┌─────────────────────────────────────────────────────────────┐
│  4. FLOWS  (experiments)                                      │
│     Stitch pages together + define navigation.                │
│     "Home → tap product → PDP → add to cart → Payment"        │
├─────────────────────────────────────────────────────────────┤
│  3. PAGES  (screens)                                          │
│     Full self-assembling screens from blocks.                 │
│     HomePage, ProductDetailsPage, SearchPage, CartPage,       │
│     PaymentPage. Call one with data → complete screen.        │
├─────────────────────────────────────────────────────────────┤
│  2. COMPONENTS  (blocks)                                      │
│     Reusable UI: ProductCard, BottomNav, PromoBanner,         │
│     SearchBar, ProductRail, CartLineItem...                   │
├─────────────────────────────────────────────────────────────┤
│  1. DESIGN SYSTEM  (primitives + tokens)                      │
│     Button, Price, Icon, Text, Sheet + colors/spacing/type.   │
│     The @field-ds mirror.                                     │
└─────────────────────────────────────────────────────────────┘
        Plus a cross-cutting SHELL (device frame + safe areas)
        that any page composes into (see §11).
```

**How the two build styles map onto it:**

- *"I want to build a screen my way"* → enter at **layer 2**, compose components
  inside the shell.
- *"I just want a working Product Details screen"* → enter at **layer 3**, call the
  page, pass data.
- *"I want a clickable multi-screen prototype"* → enter at **layer 4**, list your
  pages and their transitions.

---

## 5. The new folder structure

```
noon-lab/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tailwind.config.ts
├─ tsconfig.json                 # recommended (see §13)
├─ public/
│  ├─ manifest.webmanifest
│  ├─ icons/                     # pwa icons, apple-touch-icon
│  └─ fonts/                     # Noontree (self-hosted)
│
├─ src/
│  ├─ app/                       # app-level wiring only — thin
│  │  ├─ main.tsx                # ReactDOM root + Router
│  │  ├─ App.tsx                 # <Providers><AppRoutes/></Providers>
│  │  ├─ routes.tsx              # route table, generated from the registry
│  │  └─ providers.tsx          # Theme + Device + Router providers
│  │
│  ├─ design-system/             # LAYER 1 — the @field-ds mirror. No app logic.
│  │  ├─ tokens/                 # colors, typography, spacing, radii, shadows
│  │  ├─ primitives/             # Box, Text, Stack, Icon, Squircle, Sheet...
│  │  ├─ components/             # Button, IconButton, Chip, Badge, Rating, Price...
│  │  ├─ index.ts                # `export { Button, Price } from '@ds'`
│  │  └─ README.md               # the API we promise to keep stable
│  │
│  ├─ shell/                     # cross-cutting device frame + safe-area engine (§11)
│  │  ├─ AppShell.tsx
│  │  ├─ DeviceFrame.tsx  StatusBar.tsx  HomeIndicator.tsx
│  │  ├─ useDeviceMode.ts        # 'framed' | 'mobile' | 'standalone'
│  │  └─ useSafeArea.ts          # resolves --sat/--sab/--sal/--sar
│  │
│  ├─ blocks/                    # LAYER 2 — the component marketplace
│  │  ├─ nav/                    # ★ BottomNav (+ variants)
│  │  │                          # ★ MarketplaceSwitcher — the top marketplace bar (+ variants)
│  │  ├─ header/                 # PageHeader, ★ LocationBar
│  │  ├─ search/                 # ★ SearchBar, SearchEmptyState, MagicList
│  │  ├─ product-card/           # ProductCard (+ variants) + parts/
│  │  ├─ banner/                 # PromoBanner, HeroBanner, StripBanner
│  │  ├─ cart/                   # CartLineItem, SavingsBlock, CouponRow, GiftRow
│  │  ├─ rails/                  # ProductRail, CategoryGrid, CombosRail
│  │  ├─ payment/                # PaymentMethodRow, OrderSummary, PayButton
│  │  └─ index.ts                # `import { ProductCard } from '@blocks'`
│  │  # ★ = shared "chrome" components fed into page regions (see §7)
│  │
│  ├─ pages/                     # LAYER 3 — self-assembling full screens
│  │  ├─ HomePage.tsx
│  │  ├─ ProductListingPage.tsx  # (PLP)
│  │  ├─ ProductDetailsPage.tsx  # (PDP)
│  │  ├─ SearchPage.tsx
│  │  ├─ CartPage.tsx
│  │  ├─ PaymentPage.tsx
│  │  ├─ AccountsPage.tsx
│  │  ├─ page.types.ts           # shared page prop contracts (see §7)
│  │  ├─ registry.ts             # every page, callable by id
│  │  └─ index.ts                # `import { HomePage } from '@pages'`
│  │
│  ├─ flows/                     # LAYER 4 — experiments = stitched pages (§8)
│  │  ├─ registry.ts             # single source of truth (drives routes + landing)
│  │  ├─ _template/              # copy-to-start a new flow
│  │  │  ├─ flow.ts   index.tsx   CONTEXT.md
│  │  ├─ marketplace-switcher/
│  │  ├─ combo-animation/
│  │  ├─ price-history/
│  │  ├─ search/
│  │  └─ cart/
│  │
│  ├─ catalog/                   # live gallery of every block + page (docs)
│  │  └─ index.tsx               # renders each component/page with sample data
│  │
│  ├─ landing/
│  │  └─ ExperimentsLanding.tsx  # reads flows/registry, renders cards
│  │
│  ├─ data/                      # mock/fixture data (products, marketplaces...)
│  ├─ lib/                       # motion.ts, cn.ts, hooks/
│  └─ assets/                    # icons/, images/ (see §9)
│
└─ tooling/                      # OUT of src — screenshots, playwright, scripts
```

### Path aliases (imports read like a sentence)

`@ds → design-system`, `@blocks → blocks`, `@pages → pages`, `@flows → flows`,
`@shell → shell`, `@data → data`, `@lib → lib`, `@assets → assets`. Set in
`vite.config.ts` + `tsconfig.json`.

### The one dependency rule (enforce it with ESLint)

```
flows → pages → blocks → design-system → tokens
  └──────────────→ shell ←──────────────┘
```

Lower layers **never** import from higher ones. `blocks/` must not import from
`pages/` or `flows/`; `pages/` must not import from `flows/`. This is what keeps
every layer independently pullable. Enforce with `import/no-restricted-paths` so CI
blocks violations.

---

## 6. Components (layer 2): the variant + slot pattern

One component per concept; behavior differences are a `variant`, not a new file.
Two ideas together:

**(a) Named variants** — a preset bundle selected by one string, listed in a
`*.variants.ts` next to the component so the set is discoverable.

```ts
// blocks/product-card/productCard.variants.ts
export const PRODUCT_CARD_VARIANTS = {
  rail:  { showRating: false, showWishlist: true,  showDeliveryTag: false, width: 150 },
  plp:   { showRating: true,  showWishlist: true,  showDeliveryTag: true,  showDealBar: true },
  combo: { showRating: false, showWishlist: false, showComboChip: true },
} as const
export type ProductCardVariant = keyof typeof PRODUCT_CARD_VARIANTS
```

**(b) Toggleable slots** — every element is its own `part`, rendered only when its
`show*` prop (from the variant, overridable inline) is true.

```tsx
<ProductCard variant="plp" product={p} showDealBar={false} />
```

So you get exactly the card you want by name *and* can flip any element on/off — no
new file. The same pattern collapses the nine `MarketplaceSwitcherV*` files into
`<TopSwitcher variant="…" />` with a `switcher.variants.ts` registry, and drives
`<BottomNav variant="classic | floating | marketplace" />`.

**Naming rules:** blocks are named for *what they are*, never which experiment
birthed them (`ProductRail`, not `CombosSection`). Sub-parts live in `parts/`,
PascalCase, single-purpose (`PriceRow`, `WishlistToggle`, `AtcButton`). Files match
their default export. Barrels per folder give the flat `@field-ds`-style named
imports.

---

## 7. Pages (layer 3): skeletons that get fed components

A **page is a skeleton, not a hard-coded screen.** It defines the *layout of a
screen as a set of named **regions*** and nothing more; the actual component that
fills each region is **fed in** — with a sensible default so the page also works on
its own. This is what lets a flow reuse the same shared chrome (the top marketplace
switcher, the search bar, the location bar, the bottom nav) across many pages while
only swapping the parts that differ.

**The region model.** Every page composes into the `AppShell` and exposes the same
canonical regions, so pages are predictable and interchangeable:

```
┌ statusHeader ─────────────┐   ← device chrome (from shell)
│ marketplaceBar            │   ← MarketplaceSwitcher   (shared chrome)
│ locationBar               │   ← LocationBar           (shared chrome)
│ searchBar                 │   ← SearchBar             (shared chrome)
├───────────────────────────┤
│                           │
│ body                      │   ← the page-specific content (rails, PDP, cart…)
│                           │
├───────────────────────────┤
│ bottomNav                 │   ← BottomNav             (shared chrome)
└ homeIndicator ────────────┘   ← device chrome (from shell)
```

**The page contract.** A page takes `data`, navigation intents (`on`), and a
`regions` map. Each region has a default block; a flow overrides only what it needs.

```ts
// pages/page.types.ts
export interface PageProps<Data> {
  data?: Data                       // content; falls back to fixtures if omitted
  theme?: ThemeOverride             // per-experiment accent tokens
  on?: PageEvents                   // navigation intents the flow listens to (§8)
  regions?: Partial<PageRegions>    // feed a component into any named region
}
// A region value is a ready component (or null to hide it). Defaults are the
// shared chrome blocks, so an un-fed page still renders correctly.
export interface PageRegions {
  marketplaceBar: React.ReactNode   // default <MarketplaceSwitcher/>
  locationBar:    React.ReactNode   // default <LocationBar/>
  searchBar:      React.ReactNode   // default <SearchBar/>
  bottomNav:      React.ReactNode   // default <BottomNav/>
  body:           React.ReactNode   // page-specific; PDP/PLP/Cart supply their own
}
```

**Example — the page is a skeleton; the flow feeds components in:**

```tsx
// pages/ProductDetailsPage.tsx  (skeleton — only the body is page-specific)
export function ProductDetailsPage({ data = sampleProduct, on, regions }: PageProps<Product>) {
  return (
    <PageSkeleton
      regions={regions}                              // shared chrome, fed by the flow
      header={<PageHeader onBack={on?.back} actions={['search','wishlist','share']} />}
      bottomNav={regions?.bottomNav ?? <BottomNav active="home" />}
    >
      {/* body */}
      <ProductHero images={data.images} />
      <PriceBlock price={data.price} was={data.was} discount={data.discount} />
      <CombosRail items={data.combos} onAdd={on?.addToCart} />
      <ProductRail title="Similar products" items={data.similar} onSelect={on?.openProduct} />
      <Reviews summary={data.reviewSummary} />
    </PageSkeleton>
  )
}
```

`PageSkeleton` (a small layout in `pages/`) is the shared frame that renders the
regions in order inside `AppShell`. Every page uses it, so the chrome layout is also
fixed-once. Minimal usage — `<ProductDetailsPage />` — renders a complete PDP with
default chrome on fixture data, so a page is useful the instant you import it; a flow
feeds in the specific `MarketplaceSwitcher` / `BottomNav` / `SearchBar` it wants and
they are **reused identically across every page in that flow**.

**The starter page set** (each in `pages/`, registered in `pages/registry.ts`):
`HomePage`, `ProductListingPage` (PLP), `ProductDetailsPage` (PDP), `SearchPage`,
`CartPage`, `PaymentPage`, `AccountsPage`. Add more (Category, Checkout-success,
Order-tracking) the same way. Because pages are components, a page can also be
dropped inside another experiment's custom screen if someone wants only part of it.

### 7.1 How an experiment tests "something new" inside a page

The common case you described — *"I want to try a new component in the Product
Details page"* or *"something new in the listing / accounts page"* — is handled by
feeding a component into a **region** (or a finer body slot the page also exposes),
so you override one part without forking the whole screen:

```tsx
// flows/pdp-new-widget/index.tsx — feed a new component into ONE region,
// keep the shared chrome + rest of the PDP untouched
<ProductDetailsPage
  data={product}
  regions={{ searchBar: <MyExperimentalSearchBar /> }}  // swap just the search bar
  on={{ addToCart: goToCart }}
/>
```

Pages also expose a few finer body slots (`belowPrice`, `railArea`, `footer`, …) for
experiments that live inside the content rather than the chrome. Either way the
experiment supplies one new component; everything else stays the shared,
fixed-in-one-place version. If a new block proves good, it graduates into `blocks/`
and becomes available to every page — the one-way path from experiment to shared
component.

---

## 8. Flows (layer 4): stitching pages into an experiment

An experiment is now **thin**: it names the pages it uses and how navigation moves
between them. A tiny flow definition keeps this declarative so "stitching in the
flow" is genuinely just a table.

```ts
// flows/shop-demo/flow.ts
import { HomePage, ProductDetailsPage, CartPage, PaymentPage } from '@pages'

export const flow = defineFlow({
  id: 'shop-demo',
  initial: 'home',
  screens: {
    home:    { page: HomePage,           on: { openProduct: 'pdp' } },
    pdp:     { page: ProductDetailsPage, on: { addToCart: 'cart', back: 'home' } },
    cart:    { page: CartPage,           on: { checkout: 'payment', back: 'pdp' } },
    payment: { page: PaymentPage,        on: { done: 'home', back: 'cart' } },
  },
})
```

`defineFlow` (a small helper in `lib/`) turns that map into routes + a navigation
context, so a page's `on.openProduct(id)` moves to the `pdp` screen with that id —
no router boilerplate in the experiment. The example the request describes —
*Home → user clicks something → Product Details → …* — is the two lines
`home: { on: { openProduct: 'pdp' } }` and `pdp: { … }`.

`flows/registry.ts` lists every flow (id, title, description, icon) and drives both
the landing page and the route table, exactly like today's `registry.js` — kept
because it works. A `_template/` flow means starting a new experiment is a copy.

---

## 9. Assets & icons

Centralize under `assets/icons/` behind a single `Icon` primitive in the DS that
takes a name + color token (backed by an SVG sprite or `import.meta.glob`), so
recoloring is `color="accent"` — not the current regex-replace on `?raw` SVG
strings. Imagery lives in `assets/images/` and is referenced through `@data`
fixtures so the source is swappable in one place.

---

## 10. The design-system layer (swappable `@field-ds` mirror)

`design-system/` is a **local library that promises the same public API** as
`@field-ds/components`, so when the real noon package is installable you flip one
alias (`@ds → node_modules/@field-ds/components`) and delete the local impl.

- **Tokens first.** Move every hex/radius/shadow/font-size that's inline today into
  `design-system/tokens/`, exposed both as TS objects and as CSS vars / Tailwind
  theme extensions (`text-brand`, `rounded-card`, `shadow-card`).
- **Mirror the export surface** (`Button`, `Price`, `Rating`, `Chip`, `Sheet`…)
  with the same names and prop shapes; record the promised API in a README so the
  mirror doesn't drift.
- **Blocks and pages consume only `@ds` + tokens — never raw hex.** That's what
  makes "everything looks like the noon app" a token change.
- **Per-experiment theming** via a `ThemeProvider` that overrides accent tokens for
  a subtree, replacing today's hand-threaded `accent` object.

---

## 11. The two views: desktop reference frame + mobile native (safe areas)

Your current `AppShell` already gets the hard parts right; `shell/` just formalizes
it and every page composes into it.

### 11.1 Three runtime modes, one API

`useDeviceMode()` returns:

- **`framed`** — desktop with room + a fine pointer
  (`min-width:768px and (hover:hover) and (pointer:fine)`). Render the iPhone
  squircle with a **faux** status bar + home indicator; safe-area vars are the
  **constants** you choose (`--sat: 47px`, `--sab: 34px`) because you're
  *simulating* a phone.
- **`mobile`** — a real phone in a browser tab. Browser chrome already reserves the
  status-bar area, so within the tab `env(safe-area-inset-*)` is effectively 0 and
  you fill the visible viewport. Safe-area vars = 0.
- **`standalone`** — installed to home screen / launched as a PWA. The webview is
  edge-to-edge and the OS insets are **yours to honor**. Safe-area vars =
  `env(safe-area-inset-*)`.

`useSafeArea()` maps the mode to `--sat/--sab/--sal/--sar`. Blocks and pages never
branch on device — they just pad by `var(--sat)` / `var(--sab)`. (Generalize to all
four edges for landscape notches.)

### 11.2 How safe areas actually work (the mechanics)

- **`env(safe-area-inset-top|right|bottom|left)`** are CSS environment variables the
  browser exposes for OS-reserved insets (notch, Dynamic Island, rounded corners,
  home indicator, Android gesture bar). They read `0px` unless the page opts into
  drawing under those regions.
- **Opting in requires `viewport-fit=cover`** in the viewport meta:
  `content="width=device-width, initial-scale=1, viewport-fit=cover"`. Without
  `cover`, the browser letterboxes content into the safe region and `env()` stays 0.
- **Always use a fallback / minimum:** `padding-bottom: max(12px, env(safe-area-inset-bottom))`.
- **`dvh` over `vh`.** Use `100dvh` for the shell so it tracks the mobile browser
  bars showing/hiding (you already do this); `svh`/`lvh` for fixed variants.

### 11.3 The iOS-in-a-browser-tab subtlety (why your current choice is right)

Your `index.html` intentionally **omits** `viewport-fit=cover` and uses
`apple-mobile-web-app-status-bar-style=default` (opaque). Preserve this as the tab
default: with an opaque status bar and no `cover`, iOS starts the webview *below*
the status bar — clean top inset, and crucially **no phantom bottom inset** (the
usual cause of a white strip under a bottom nav in a tab).

**Refinement for the new build — make it mode-aware:**

- **Installed / standalone:** opt into `viewport-fit=cover` and honor real `env()`
  insets → truly edge-to-edge "native" (colored header bleeds under the status bar,
  content lifts above the home indicator). This is what "full native experience with
  safe areas" means, and it only fully applies when installed.
- **Browser tab (mobile):** keep opaque-status-bar / no-cover to avoid the bottom
  strip.
- Detect installed mode with `matchMedia('(display-mode: standalone)')` +
  `navigator.standalone` — exactly your current `useStandalone` hook.

### 11.4 Manifest / meta checklist for "save as app"

`manifest.webmanifest` with `display:"standalone"`, correct `theme_color` /
`background_color`, and 192 + 512 + **maskable** icons (you have these);
`apple-touch-icon`; `apple-mobile-web-app-capable` / `mobile-web-app-capable=yes`;
`theme-color` meta; and a minimal **service worker** so Android shows a real install
prompt and the app launches offline.

---

## 12. Recommended stack choices

- **TypeScript.** With a variant/slot system *and* page data-contracts, prop types
  are what make components self-documenting and safe to compose — the difference
  between "pull and build" working and not. Strongly recommended.
- **Keep:** Vite, React 18, Tailwind, Framer Motion, `corner-smoothing` (Squircle),
  `react-router-dom`, `recharts`. Keep `lib/motion.ts` easings.
- **Add:** ESLint import-boundary rule (§5), path aliases (§5), a `cn()` helper, and
  the `catalog/` gallery.
- **Move out of the app:** Playwright + `_shot*.mjs` into `tooling/`.
- **Backend:** omit for now; if a real API appears, add `src/services/` with a typed
  client rather than reviving the empty Express layer.

---

## 13. Suggested build order (once you approve this)

1. Scaffold `noon-lab/` with Vite + aliases + Tailwind wired to tokens + the ESLint
   boundary rule.
2. **Layer 1:** `design-system/tokens` (from the hex/spacing already in the repo) +
   first primitives/components (`Button`, `Price`, `Icon`).
3. **Shell:** `AppShell` + the three device modes + safe-area engine (port your
   logic, add the standalone `cover` path).
4. **Layer 2:** build `ProductCard` (variants + slots) and `BottomNav` (variants)
   end-to-end as the template for every other block.
5. **Layer 3:** build `ProductDetailsPage` and `HomePage` on those blocks, proving
   the page data-contract (§7).
6. **Layer 4:** wire one flow (`Home → PDP → Cart → Payment`) with `defineFlow`,
   proving stitching (§8). Delete the 9 `Vx` switcher files in favor of variants.
7. Fill in remaining blocks + pages (Search, Cart, Payment) and port the rest; stand
   up the `catalog/` gallery and the `_template` flow.

---

## Appendix — current → new mapping

| Current | New home | Layer | Note |
|---|---|---|---|
| `components/layout/AppShell.jsx` | `shell/` (split) | shell | keep logic, name the modes |
| `components/layout/BottomNav.jsx` (618) | `blocks/nav/BottomNav.tsx` + variants | 2 | split the 3 layouts + panel |
| `components/layout/Header.jsx` | `blocks/header/PageHeader.tsx` | 2 | |
| `components/common/ProductCard.jsx` etc. | `blocks/product-card/` + `parts/` | 2 | one component, variants + slots |
| `components/common/Dirham.jsx` | `design-system/components/Price.tsx` | 1 | DS-level |
| `experiments/**/sections/*` (rails, banners, search, sheet) | `blocks/*` | 2 | promote the reusable ones |
| `experiments/combo-animation/PDPBody.jsx` (948) | `pages/ProductDetailsPage.tsx` + blocks | 3 | becomes a callable page |
| `PlpProductCard` + PLP layout | `pages/ProductListingPage.tsx` + `blocks/product-card` | 3 | listing page as a callable page |
| `experiments/cart/index.jsx` (965) | `pages/CartPage.tsx` + `blocks/cart/*` | 3 | |
| `experiments/search/index.jsx` (1116) | `pages/SearchPage.tsx` + `blocks/search/*` | 3 | |
| (new) account/profile screen | `pages/AccountsPage.tsx` + blocks | 3 | callable page |
| `experiments/**/MarketplaceSwitcherV2..V9.jsx` | `blocks/nav/switchers/` + variant prop | 2 | collapse the forks |
| `experiments/registry.js` | `flows/registry.ts` | 4 | drives routes + landing (keep) |
| whole experiment index files | `flows/<name>/flow.ts` + thin `index.tsx` | 4 | stitch pages, don't rebuild |
| `_shot3.mjs`, playwright dep | `tooling/` | — | out of `src` |
| inline hex/spacing everywhere | `design-system/tokens/` | 1 | single source of truth |
