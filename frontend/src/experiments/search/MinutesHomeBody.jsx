// Body of the noon-minutes marketplace home (the header — switcher + address +
// search — is rendered by MinutesHome). Recreates the 12-Minutes grocery home:
// category tabs → Swatch promo → collection cards → Bestsellers grid.
//
// Brand imagery in the reference (Swatch, Brooklyn Creamery, Pampers, Vaseline,
// masafi…) isn't in the repo, so those are approximated with CSS gradients +
// existing product/marketplace assets.
import { useState } from 'react'
import { Squircle } from 'corner-smoothing'
import korean from '../../assets/products/korean-glass-hero.png'
import bareAnatomy from '../../assets/products/bare-anatomy-shampoo.png'
import redmi from '../../assets/products/redmi-watch-5-active.png'
import bundleSC from '../../assets/products/bundle-shampoo-conditioner.png'
import bundleRW from '../../assets/products/bundle-shampoo-ricewater.png'
import promoGrocery from '../../assets/marketplace/promo-grocery-saver.png'
import categoryGrocery from '../../assets/marketplace/category-grocery.png'
import swatchBanner from '../../assets/marketplace/swatch-banner.png'

const INK = 'rgba(2, 6, 12, 0.92)'
const MUTED = 'rgba(2, 6, 12, 0.45)'

/* ── Category tabs — horizontal, icon over label, active gets a dark underline ── */
const TABS = [
  { id: 'all', label: 'All' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'shot', label: 'SHOT' },
  { id: 'health', label: 'Health' },
  { id: 'deals', label: 'Deal Zone' },
  { id: 'baby', label: 'Baby' },
]

function TabIcon({ id, active }) {
  const c = active ? INK : 'rgba(2, 6, 12, 0.6)'
  const common = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true }
  switch (id) {
    case 'beauty':
      return (
        <svg {...common}><rect x="9" y="3" width="6" height="5" rx="1.2" stroke={c} strokeWidth="1.6" /><path d="M8 8h8v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8Z" stroke={c} strokeWidth="1.6" /></svg>
      )
    case 'shot':
      return (
        <svg {...common}><path d="M6 8h9v6a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4V8Z" stroke={c} strokeWidth="1.6" /><path d="M15 9h2.2a2 2 0 0 1 0 4H15" stroke={c} strokeWidth="1.6" /></svg>
      )
    case 'health':
      return (
        <svg {...common}><path d="M12 20s-7-4.3-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.7 12 20 12 20Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" /><path d="M12 10.5v3M10.5 12h3" stroke={c} strokeWidth="1.4" strokeLinecap="round" /></svg>
      )
    case 'deals':
      return (
        <svg {...common}><path d="M12.5 4H6a2 2 0 0 0-2 2v6.5l8.5 8.5 7.5-7.5L12.5 4Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" /><circle cx="8.5" cy="8.5" r="1.3" fill={c} /></svg>
      )
    case 'baby':
      return (
        <svg {...common}><path d="M10 4h4l-1 3h-2l-1-3Z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" /><rect x="7" y="7" width="10" height="14" rx="3" stroke={c} strokeWidth="1.6" /></svg>
      )
    default: // all — basket
      return (
        <svg {...common}><path d="M5 9h14l-1.3 9.2a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8L5 9Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" /><path d="M8.5 9 12 4l3.5 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      )
  }
}

function CategoryTabs() {
  const [active, setActive] = useState('all')
  return (
    <div data-id="minutes-tabs" className="border-b border-[rgba(2,6,12,0.08)] bg-white">
      <div className="scrollbar-hide flex gap-6 overflow-x-auto px-4">
        {TABS.map((t) => {
          const on = t.id === active
          return (
            <button
              key={t.id}
              type="button"
              data-id={`minutes-tab-${t.id}`}
              onClick={() => setActive(t.id)}
              className="relative flex shrink-0 flex-col items-center gap-1 pt-2 pb-2.5"
            >
              <TabIcon id={t.id} active={on} />
              <span className="font-noontree text-[13px] leading-none" style={{ color: on ? INK : 'rgba(2,6,12,0.6)', fontWeight: on ? 700 : 500 }}>
                {t.label}
              </span>
              {on && <span className="absolute inset-x-1 -bottom-px h-[2.5px] rounded-full bg-[#1D2539]" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── AP × Swatch promo banner — full-artwork image (text baked in) ─────────── */
function SwatchPromoBanner() {
  return (
    <div data-id="minutes-swatch-scroller" className="px-4 pt-4">
      <Squircle
        as="div"
        data-id="minutes-swatch-banner"
        cornerRadius={14}
        cornerSmoothing={1}
        className="overflow-hidden"
      >
        <img src={swatchBanner} alt="AP × Swatch — get yours in 15 mins, free strap included" className="block w-full" />
      </Squircle>
    </div>
  )
}

/* ── Collection cards — amber-bordered gradient tiles, title + product shot ── */
const COLLECTIONS = [
  { id: 'creamery', title: 'Brooklyn\nCreamery', grad: 'linear-gradient(180deg, #A9865B 0%, #6E4E2E 100%)', img: bundleRW, ink: '#FFFFFF' },
  { id: 'comfort', title: 'Our no.1\ncomfort fit', grad: 'linear-gradient(180deg, #BFEBF2 0%, #EAF9FB 100%)', img: promoGrocery, ink: '#0B2B33' },
  { id: 'dairy', title: 'Dairy\ndelights', grad: 'linear-gradient(180deg, #F2B23C 0%, #E88A1F 100%)', img: categoryGrocery, ink: '#3A2500' },
  { id: 'sourdough', title: 'Sourdough\nselect', grad: 'linear-gradient(180deg, #A6D858 0%, #7CB33A 100%)', img: bundleSC, ink: '#123000' },
]

function CollectionCards() {
  return (
    <div data-id="minutes-collections" className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pt-4">
      {COLLECTIONS.map((c) => (
        // nested squircles: amber outer shape reads as the 2px border, the inner
        // one (inset 2px) carries the gradient + content so the border follows
        // the squircle's smoothed corners
        <Squircle
          key={c.id}
          as="div"
          data-id={`minutes-collection-${c.id}`}
          cornerRadius={18}
          cornerSmoothing={1}
          className="h-[210px] w-[152px] shrink-0 p-[2px]"
          style={{ background: 'rgba(240,150,40,0.9)' }}
        >
          <Squircle
            as="div"
            data-id={`minutes-collection-${c.id}-inner`}
            cornerRadius={16}
            cornerSmoothing={1}
            className="relative h-full w-full overflow-hidden"
            style={{ background: c.grad }}
          >
            <span className="absolute left-3 top-3 z-[2] whitespace-pre-line font-noontree text-[17px] font-extrabold leading-[20px]" style={{ color: c.ink }}>
              {c.title}
            </span>
            <img src={c.img} alt="" aria-hidden="true" className="absolute bottom-2 left-1/2 h-[110px] w-auto max-w-[130px] -translate-x-1/2 object-contain drop-shadow" />
          </Squircle>
        </Squircle>
      ))}
    </div>
  )
}

/* ── Bestsellers — toggle pill + peeking Vaseline banner, then product grid ── */
const PRODUCTS = [
  { id: 'water', name: 'Masafi Pure Bottled Water 1.5L (Pack of 6)', img: promoGrocery, price: '9.75', was: '12.00', qty: '1.5L x6' },
  { id: 'milk', name: 'Almarai Fresh Milk Full Fat 2L', img: categoryGrocery, price: '11.50', was: '13.00', qty: '2L' },
  { id: 'shampoo', name: 'BARE ANATOMY Anti Hair Fall Shampoo 250ml', img: bareAnatomy, price: '106', was: '145', qty: '250ml' },
  { id: 'glass', name: 'Korean Glass Skin Serum Set', img: korean, price: '89', was: '120', qty: 'Set' },
  { id: 'bundle', name: 'Shampoo + Conditioner Duo Pack', img: bundleSC, price: '78', was: '96', qty: 'Duo' },
  { id: 'watch', name: 'Redmi Watch 5 Active Smartwatch', img: redmi, price: '149', was: '199', qty: '1 pc' },
]

function ProductCard({ p }) {
  return (
    <div data-id={`minutes-product-${p.id}`} className="flex w-full flex-col overflow-hidden rounded-[12px] border-[0.5px] border-[#F2F3F7] bg-white">
      <div className="relative aspect-square w-full bg-[rgba(0,40,136,0.03)]">
        <img src={p.img} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-contain p-3" />
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-[6px] bg-white/90 px-1.5 py-0.5 font-noontree text-[10px] font-bold text-[#E5004E]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#E5004E" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
          15 min
        </span>
        <button type="button" aria-label="Add to cart" className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-[9px] border-[1.2px] border-[#F2F3F7] bg-white text-[#E5004E] shadow-sm transition active:scale-90">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className="flex flex-col gap-1 px-2 pb-2.5 pt-1.5">
        <span className="font-noontree text-[11px] font-medium leading-none text-[#7E8595]">{p.qty}</span>
        <span className="line-clamp-2 h-8 font-noontree text-[12px] font-medium leading-4 text-[#1D2539]">{p.name}</span>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="font-noontree text-[15px] font-bold text-[#1D2539]">AED {p.price}</span>
          <span className="font-noontree text-[11px] font-medium text-[#9AA0AD] line-through">{p.was}</span>
        </div>
      </div>
    </div>
  )
}

function BestsellersSection() {
  return (
    <div data-id="minutes-bestsellers" className="bg-white pt-5">
      {/* toggle pill + peeking Vaseline banner */}
      <div className="relative flex items-center px-4">
        <span className="z-[2] flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 font-noontree text-[16px] font-bold text-[#1D2539] shadow-[0_2px_10px_rgba(2,6,12,0.12)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 16 9 11l3 3 7-7" stroke="#1D2539" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 7h4v4" stroke="#1D2539" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Bestsellers
        </span>
        <div className="relative -ml-3 h-[52px] flex-1 overflow-hidden rounded-[14px]" style={{ background: 'linear-gradient(100deg, #F3D9EC 0%, #DCE7FA 55%, #CFE0F7 100%)' }}>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-right font-noontree text-[13px] font-extrabold leading-[15px] text-[#243B7A]">
            SAY HYA TO<br />PLUMPER LIPS
          </span>
        </div>
      </div>

      {/* product grid */}
      <div data-id="minutes-product-grid" className="grid grid-cols-2 gap-3 px-4 pt-4">
        {PRODUCTS.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  )
}

/* ── Floating "View cart" pill — thumbnails + count, red gradient ─────────── */
export function MinutesViewCart() {
  return (
    <div className="pointer-events-none fixed left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 justify-center px-4" style={{ bottom: 'calc(85px + var(--sab, 0px) + 12px)' }}>
      <button
        type="button"
        data-id="minutes-view-cart"
        className="pointer-events-auto flex items-center gap-3 rounded-full py-2 pl-2 pr-6 text-white shadow-[0_8px_24px_rgba(235,0,48,0.4)] transition active:scale-[0.98]"
        style={{ background: 'linear-gradient(180deg, #FF3B63 0%, #EB0030 100%)' }}
      >
        <span className="flex items-center">
          {[promoGrocery, categoryGrocery, bareAnatomy].map((img, i) => (
            <span key={i} className="-ml-4 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 bg-white first:ml-0" style={{ zIndex: 3 - i, borderColor: '#F42A4C' }}>
              <img src={img} alt="" aria-hidden="true" className="h-full w-full object-contain p-0.5" />
            </span>
          ))}
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="font-noontree text-[17px] font-bold">View cart</span>
          <span className="font-noontree text-[12px] font-medium text-white/85">4 Items</span>
        </span>
      </button>
    </div>
  )
}

/* Full body — everything under the sticky header on the minutes home. */
export default function MinutesHomeBody() {
  return (
    <>
      <CategoryTabs />
      <SwatchPromoBanner />
      <CollectionCards />
      <BestsellersSection />
    </>
  )
}
