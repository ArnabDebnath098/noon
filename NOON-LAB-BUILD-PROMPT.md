# Build Prompt — "noon-lab" experiments app (fresh scaffold)

> Paste everything below the line into your coding agent. It is written as
> instructions to the agent. Adjust the app name / brand values if needed.

---

You are building a **new React app from scratch** called **`noon-lab`** — an
internal prototype lab where teammates compose reusable **components** and
**pages** into **experiments** (clickable flows) they can share so anyone gets a
real, hands-on feel of the app in the browser or as an installed PWA.

Create everything in a **new empty folder** named `noon-lab/`. Do not modify any
existing project.

## 0. Non-negotiable principles

1. **Everything is a component. Fixed once, used everywhere.** Every UI thing —
   button, product card, bottom nav, header — is defined in exactly one place.
   Fixing it there updates every page and experiment. Never duplicate a component.
2. **Four layers, one-way dependencies:** `flows → pages → blocks → design-system`,
   with a cross-cutting `shell`. A lower layer must never import from a higher one.
   Enforce with ESLint `import/no-restricted-paths` and fail CI on violation.
3. **No hardcoded styling values.** No raw hex, px spacing, radii, or shadows in
   components/pages. Everything comes from the token layer (§5).
4. **Separate hooks and services layers** from UI (§6, §7).
5. **Every rendered HTML/JSX element gets a `data-id`** (§8).
6. **Production-level code**, TypeScript strict, documented, accessible (§9).

## 1. Tech stack

- Vite + React 18 + **TypeScript (strict)**.
- Tailwind CSS (configured from design tokens, not ad-hoc classes).
- Framer Motion for animation; `corner-smoothing` for iOS squircles.
- `react-router-dom` for routing.
- ESLint + Prettier. Vitest + React Testing Library for tests.
- Path aliases: `@ds @blocks @pages @flows @shell @data @lib @hooks @services @assets`
  (configure in both `vite.config.ts` and `tsconfig.json`).

## 2. Folder structure (create exactly this)

```
noon-lab/
├─ index.html
├─ package.json  vite.config.ts  tailwind.config.ts  tsconfig.json
├─ .eslintrc.cjs  .prettierrc  postcss.config.js
├─ public/
│  ├─ manifest.webmanifest
│  ├─ icons/            # 192, 512, maskable, apple-touch-icon
│  └─ fonts/            # self-hosted brand font
└─ src/
   ├─ app/             # main.tsx, App.tsx, routes.tsx, providers.tsx (thin)
   ├─ design-system/   # LAYER 1 — @field-ds mirror (swappable). NO app logic.
   │  ├─ tokens/       # colors.ts typography.ts spacing.ts radii.ts shadows.ts index.ts
   │  ├─ primitives/   # Box Text Stack Icon Squircle Sheet Scroll
   │  ├─ components/    # Button IconButton Chip Badge Rating Price Skeleton Accordion
   │  ├─ index.ts      # barrel
   │  └─ README.md     # the public API we promise to keep stable
   ├─ shell/           # device frame + safe-area engine (cross-cutting)
   │  ├─ AppShell.tsx DeviceFrame.tsx StatusBar.tsx HomeIndicator.tsx
   │  ├─ useDeviceMode.ts   # 'framed' | 'mobile' | 'standalone'
   │  └─ useSafeArea.ts
   ├─ blocks/          # LAYER 2 — reusable components
   │  ├─ nav/          # ★ BottomNav (+ bottomNav.variants.ts)
   │  │                # ★ MarketplaceSwitcher — top marketplace bar (+ variants)
   │  ├─ header/       # PageHeader, ★ LocationBar
   │  ├─ search/       # ★ SearchBar, SearchEmptyState, MagicList
   │  ├─ product-card/ # ProductCard (+ productCard.variants.ts) + parts/
   │  ├─ banner/ cart/ rails/ payment/ account/
   │  └─ index.ts      # barrel
   │  # ★ = shared "chrome" components fed into page regions (see §4)
   ├─ pages/           # LAYER 3 — self-assembling full screens
   │  ├─ HomePage.tsx ProductListingPage.tsx ProductDetailsPage.tsx
   │  ├─ SearchPage.tsx CartPage.tsx PaymentPage.tsx AccountsPage.tsx
   │  ├─ page.types.ts registry.ts index.ts
   ├─ flows/           # LAYER 4 — experiments = stitched pages
   │  ├─ registry.ts   # drives routes + landing
   │  ├─ _template/     # copy-to-start (flow.ts index.tsx CONTEXT.md)
   │  └─ shop-demo/
   ├─ catalog/         # live gallery rendering every block + page with sample data
   ├─ landing/         # ExperimentsLanding.tsx (reads flows/registry)
   ├─ data/            # LAYER: mock data (products, images, marketplaces) — §10
   ├─ hooks/           # reusable React hooks — §6
   ├─ services/        # data-access / API layer — §7
   ├─ lib/             # framework-free helpers: cn.ts motion.ts defineFlow.ts
   └─ assets/          # icons/ images/
tooling/               # OUTSIDE src — screenshot/e2e scripts, playwright (devDeps)
```

## 3. Component pattern (blocks — layer 2)

- **One component per concept; behavior differences are a `variant` prop**, never a
  new file. List variants in a co-located `*.variants.ts` as a typed preset map.
- **Toggleable slots:** each visual element is its own `part` in `parts/`, rendered
  only when its `show*` prop (sourced from the variant, overridable inline) is true.
  Example: `<ProductCard variant="plp" product={p} showDealBar={false} />`.
- Blocks are named for **what they are** (`ProductRail`, not `CombosSection`).
- No block imports from `pages/` or `flows/`. No block hardcodes color/spacing.

## 4. Page pattern (pages — layer 3): skeletons fed with components

A page is a **skeleton**, not a hard-coded screen. It defines a screen's layout as
named **regions** and nothing more; the component that fills each region is **fed
in** by the flow, with a sensible default so the page also renders standalone. This
is what lets the shared chrome — `MarketplaceSwitcher` (top), `SearchBar`,
`LocationBar`, `BottomNav` — be reused identically across every page while only the
`body` differs.

Build a single `PageSkeleton` layout (in `pages/`) that renders the canonical
regions in order inside `AppShell`; every page composes it, so the chrome layout is
fixed-once too.

```ts
// pages/page.types.ts
export interface PageProps<Data> {
  data?: Data                     // content; falls back to fixtures if omitted
  theme?: ThemeOverride           // per-experiment accent tokens
  on?: PageEvents                 // navigation intents the flow listens to
  regions?: Partial<PageRegions>  // feed a component into any named region
}
export interface PageRegions {    // each value is a ready component or null-to-hide;
  marketplaceBar: React.ReactNode //   defaults are the shared chrome blocks
  locationBar:    React.ReactNode
  searchBar:      React.ReactNode
  bottomNav:      React.ReactNode
  body:           React.ReactNode // page-specific (PDP/PLP/Cart supply their own)
}
```

Experiments test new ideas by feeding **one** region (or a finer body slot the page
also exposes), keeping the rest shared:
`<ProductDetailsPage regions={{ searchBar: <NewSearchBar/> }} />`. Build pages:
Home, ProductListing (PLP), ProductDetails (PDP), Search, Cart, Payment, Accounts —
each un-fed page renders a complete screen on fixture data with default chrome.

## 5. Design tokens + Tailwind (layer 1)

- Create `design-system/tokens/` as the **single source of truth**: `colors`
  (brand + semantic: `brand`, `accent`, `surface`, `textPrimary`, `success`,
  `danger`, `priceRed`, …), `typography`, `spacing` (4pt scale), `radii`, `shadows`.
- Expose tokens **twice**: as typed TS objects (`tokens.color.brand`) **and** as CSS
  variables emitted at `:root`. Wire `tailwind.config.ts` `theme.extend` to those CSS
  variables so classes like `text-brand`, `bg-surface`, `rounded-card`, `shadow-card`
  resolve to tokens. Components use these classes — never arbitrary values like
  `text-[#0F61FF]`. Add an ESLint rule to flag Tailwind arbitrary color values.
- **Per-experiment theming** via a `ThemeProvider` that overrides accent CSS vars for
  its subtree (replaces threading an `accent` prop around).
- Treat `@ds` as a **swappable mirror** of `@field-ds/components`: same export names
  and prop shapes, so later `@ds` can be re-aliased to the real package. Record the
  promised API in `design-system/README.md`.

## 6. Hooks layer (`src/hooks/`)

- All reusable stateful/behavioral logic lives here, **UI-free**: e.g. `useCart`,
  `useProduct`, `useProductList`, `useMediaQuery`, `useElementWidth`,
  `useScrollProgress`, `useDebounce`.
- Hooks may call **services** (§7) but must not import from `blocks`/`pages`/`flows`.
- Data-fetching hooks return `{ data, isLoading, error }` and never contain fetch/URL
  logic themselves — they delegate to services.

## 7. Services layer (`src/services/`)

- The only place that knows **where data comes from**. One typed module per domain:
  `products.service.ts`, `cart.service.ts`, `search.service.ts`.
- Each exposes async functions (`getProducts`, `getProductById`, `getImageUrl`) with
  typed return values. For now they read from the **data layer** (§10); swapping to a
  real API later means editing only these files.
- Define a single `httpClient` wrapper for the day a real backend exists (base URL,
  headers, error normalization). No component or page ever calls `fetch` directly.

## 8. `data-id` on every element (recognition/automation)

- **Every** rendered element gets a stable, human-readable `data-id` — layout wrappers,
  text nodes, icons, buttons, list items. This powers screenshot tooling and e2e.
- **Convention:** kebab-case, namespaced by component and hierarchy, unique in the
  DOM. Pattern: `data-id="{component}-{part}[-{modifier}]"`, and for lists append the
  item id: `product-card-{productId}-atc`, `bottom-nav-cart`, `pdp-price-row`.
- Provide a tiny helper so it's consistent and cheap: a `useDataId(scope)` hook or a
  `<Slot dataId>` primitive that prefixes children — but the requirement stands:
  nothing renders without a `data-id`. Add an ESLint check that flags interactive
  elements (`button`, `a`, `input`) missing `data-id`.

## 9. Production-code guidelines

- TypeScript **strict**; no `any` (use `unknown` + narrowing). Explicit prop types and
  return types on exported functions/components.
- Each file: top-of-file doc comment stating purpose. Public component props documented.
- Components are pure and presentational; side effects live in hooks/services.
- Accessibility: semantic elements, `aria-*` on interactive controls, focus-visible
  styles, `alt` on images, respect `prefers-reduced-motion` for animations.
- Naming: PascalCase components/files, camelCase functions/vars, `*.variants.ts`,
  `*.service.ts`, `use*` hooks. File name matches default export.
- No dead code, no commented-out blocks, no console logs in committed code.
- Small files: if a component exceeds ~200 lines, split it into `parts/`.
- Tests: a Vitest smoke/render test per block and page; the ESLint boundary rule and
  `tsc --noEmit` both run in CI.

## 10. Data layer (`src/data/`)

- `products.ts` — typed `Product[]` fixtures: `id, title, brand, price, wasPrice,
  discount, rating, ratingCount, images[], badges, delivery, variants, comboItems,
  similarIds`. Include enough realistic items to populate PLP/PDP/Home/Cart.
- `images.ts` — a typed map of product-image assets (import from `assets/images/`),
  resolved by a `getImageUrl(key)` helper so image sources are swappable in one place.
- `marketplaces.ts`, `categories.ts` as needed. Export a typed barrel `index.ts`.
- The data layer is consumed **only through services/hooks**, never imported directly
  into a component or page.

## 11. Shell + two runtime views (safe areas)

Build `shell/AppShell` with `useDeviceMode()` returning `'framed' | 'mobile' |
'standalone'`, and `useSafeArea()` that sets CSS vars `--sat --sab --sal --sar`:

- **framed** (desktop, `min-width:768px and (hover:hover) and (pointer:fine)`): render
  an iPhone-13 squircle with a faux status bar (9:41) + home indicator; safe-area vars
  are chosen constants (`--sat:47px`, `--sab:34px`).
- **mobile** (browser tab): edge-to-edge; safe-area vars = 0 (opaque iOS status bar,
  **no** `viewport-fit=cover` in the tab, to avoid the phantom bottom white strip).
- **standalone** (installed PWA, `matchMedia('(display-mode: standalone)')` /
  `navigator.standalone`): opt into `viewport-fit=cover` and honor real
  `env(safe-area-inset-*)` for a true native edge-to-edge feel.

Blocks/pages never branch on device — they only pad by `var(--sat)` / `var(--sab)`.
Use `100dvh` for the shell and `max(minGap, env(safe-area-inset-*))` for insets.
Ship a valid `manifest.webmanifest` (standalone, theme/background color, 192/512 +
maskable icons), apple-touch-icon, `apple-mobile-web-app-capable`, `theme-color`, and
a minimal service worker so the app is installable.

## 12. Flows (layer 4) + landing

- `lib/defineFlow.ts` turns a declarative screen map into routes + a nav context:

```ts
export const flow = defineFlow({
  id: 'shop-demo', initial: 'home',
  screens: {
    home:    { page: HomePage,           on: { openProduct: 'pdp' } },
    plp:     { page: ProductListingPage, on: { openProduct: 'pdp', back: 'home' } },
    pdp:     { page: ProductDetailsPage, on: { addToCart: 'cart', back: 'plp' } },
    cart:    { page: CartPage,           on: { checkout: 'payment', back: 'pdp' } },
    payment: { page: PaymentPage,        on: { done: 'home', back: 'cart' } },
  },
})
```

- `flows/registry.ts` lists every flow (id, title, description, icon); the landing page
  and `app/routes.tsx` are generated from it. Provide a `_template` flow and a
  `catalog/` route that renders every block + page with sample data.

## 13. Build order (do in this sequence, committing per step)

1. Scaffold Vite+TS+Tailwind+ESLint+aliases+import-boundary rule; empty folders + barrels.
2. `design-system/tokens` + Tailwind wiring; primitives + `Button`, `Price`, `Icon`.
3. `shell/` with the three device modes + safe-area engine + PWA manifest/SW.
4. `data/` fixtures + `services/` + core `hooks/` (`useProduct`, `useProductList`, `useCart`).
5. Blocks: `ProductCard` (variants+slots) and `BottomNav` (variants) end-to-end as the
   template, each with tests and full `data-id` coverage.
6. Pages: `ProductDetailsPage` + `HomePage` proving the page data-contract + slots.
7. `defineFlow` + one `shop-demo` flow (Home → PLP → PDP → Cart → Payment).
8. Remaining blocks + pages (Search, Cart, Payment, Accounts, PLP), `catalog/`, `_template`.

## 14. Definition of done

- `npm run dev` renders the landing page; the `shop-demo` flow is fully clickable
  Home → PLP → PDP → Cart → Payment on both desktop (framed) and mobile (full-bleed).
- `tsc --noEmit`, ESLint (incl. import-boundary, arbitrary-color, and data-id rules),
  and Vitest all pass in CI.
- No hardcoded colors/spacing in blocks or pages; a token change restyles the whole app.
- Every element has a `data-id`; every page is callable with just fixture data;
  every reusable component lives in `blocks/` (nothing UI-reusable trapped in a flow).
- `design-system/README.md` documents the `@ds` API; each block/page has a doc comment.
```
