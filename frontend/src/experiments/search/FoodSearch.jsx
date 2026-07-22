// Food-marketplace search results — rendered inside the search SLP when the
// noon FOOD marketplace is active and a term has been typed. Mirrors the noon
// food SLP: Restaurants/Dishes tabs, filter chips, a promo rail of restaurant
// cards, then restaurant sections with horizontally-scrolling dish cards, and
// the food-specific bottom tab bar.
import { useState } from 'react'
import { motion } from 'framer-motion'

const INK = 'rgba(2, 6, 12, 0.92)'
const MUTED = 'rgba(2, 6, 12, 0.45)'
const HAIRLINE = 'rgba(2, 6, 12, 0.15)'
const FOOD_PINK = '#E5004E'
const RATING_GREEN = '#0E8345'
const PAGE_BG = '#EEF0F5'
const DH = 'Đ' // dirham symbol used across the food price points

const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=480&q=80&fit=crop`

// Promo rail — restaurant offer cards (image | name / rating / offer)
const RAIL_RESTAURANTS = [
  { name: 'Arous Beirut', rating: '4.1', time: '40-50 mins', offer: '35% off', image: IMG('1540914124281-342587941389') },
  { name: 'Char & Chill', rating: '4.5', time: '30-40 mins', offer: '25% off', image: IMG('1544025162-d76694265947') },
  { name: 'Wrap Republic', rating: '4.2', time: '20-30 mins', offer: 'Buy 1 Get 1', image: IMG('1561651823-34feb02250e4') },
]

// Restaurant sections with their dish rails
const RESTAURANTS = [
  {
    name: 'Operation:Falafel',
    rating: '4.3',
    ratingCount: '500+',
    time: '25-35 mins',
    express: true, // lightning time icon
    offer: '30% OFF Shawarma Combo',
    dishes: [
      { name: 'Chicken Shawarma Pita', price: '15.50', image: IMG('1529006557810-274b9b2fc783') },
      { name: 'Chicken Shawarma Saj', price: '25', image: IMG('1626700051175-6818013e1d4f') },
      { name: 'Beef Shawarma Pita', price: '16.50', image: IMG('1599487488170-d11ec9c172f0') },
    ],
  },
  {
    name: 'Cheezy Bites',
    ad: true,
    rating: '4.3',
    ratingCount: '300+',
    time: '30-40 mins',
    express: false, // plain clock
    offer: `20% off up to ${DH} 20`,
    dishes: [
      { name: 'Double Cheese Burger', price: '22', image: IMG('1568901346375-23c9450c58cd') },
      { name: 'Cheezy Pepperoni Pizza', price: '32', image: IMG('1565299624946-b28f40a0ae38') },
      { name: 'Loaded Cheese Fries', price: '14', image: IMG('1615870216519-2f9fa575fa5c') },
    ],
  },
]

/* ── tiny glyphs ────────────────────────────────────────────────────────── */
function RatingStar() {
  return (
    <svg data-id="food-rating-star" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="9" cy="9" r="9" fill={RATING_GREEN} />
      <path d="M9 4.2l1.35 2.9 3.05.37-2.25 2.1.6 3.03L9 11.1l-2.75 1.5.6-3.03-2.25-2.1 3.05-.37L9 4.2Z" fill="#fff" />
    </svg>
  )
}

function FlashClock() {
  return (
    <svg data-id="food-time-flash" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="9" cy="9" r="7.2" stroke={RATING_GREEN} strokeWidth="1.5" />
      <path d="M9.8 5 6.9 9.4h1.9L8.2 13l2.9-4.4H9.2L9.8 5Z" fill={RATING_GREEN} />
    </svg>
  )
}

function PlainClock() {
  return (
    <svg data-id="food-time-clock" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="9" cy="9" r="7.2" stroke={INK} strokeWidth="1.5" />
      <path d="M9 5.4V9l2.4 1.6" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Scooter() {
  return (
    <svg data-id="food-scooter" width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="4.4" cy="12" r="2.2" stroke={INK} strokeWidth="1.4" />
      <circle cx="15.6" cy="12" r="2.2" stroke={INK} strokeWidth="1.4" />
      <path d="M11 2h2.2l1.6 8M4.4 12h7.2l2-4.5H8.2" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// pink scalloped %-off rosette
function OfferRosette({ size = 18 }) {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2
    return <circle key={i} cx={9 + Math.cos(a) * 5.2} cy={9 + Math.sin(a) * 5.2} r="3.4" fill={FOOD_PINK} />
  })
  return (
    <svg data-id="food-offer-rosette" width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
      {petals}
      <circle cx="9" cy="9" r="6.4" fill={FOOD_PINK} />
      <path d="M6.4 11.6l5.2-5.2" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="6.9" cy="6.9" r="1.05" fill="#fff" />
      <circle cx="11.1" cy="11.1" r="1.05" fill="#fff" />
    </svg>
  )
}

function GiftIcon() {
  return (
    <svg data-id="food-gift" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="2.5" y="6.5" width="13" height="9" rx="1.4" stroke={FOOD_PINK} strokeWidth="1.5" />
      <path d="M9 6.5V15.5M2.5 9.8h13" stroke={FOOD_PINK} strokeWidth="1.5" />
      <path d="M9 6.3C7.5 6.3 5.6 5.9 5.6 4.4c0-1.6 2.4-1.9 3.4 1.9 1-3.8 3.4-3.5 3.4-1.9 0 1.5-1.9 1.9-3.4 1.9Z" stroke={FOOD_PINK} strokeWidth="1.4" />
    </svg>
  )
}

/* ── header: tabs + filter chips ────────────────────────────────────────── */
const TABS = ['Restaurants', 'Dishes']
const CHIPS = [
  { label: 'Near you' },
  { label: 'Rating 4.0+' },
  { label: 'Rewards', icon: <GiftIcon /> },
  { label: 'Cuisines' },
]

function FoodTabs({ tab, onTab }) {
  return (
    <div data-id="food-tabs" className="flex items-end gap-7 border-b px-4" style={{ borderColor: 'rgba(2, 6, 12, 0.08)' }}>
      {TABS.map((t) => {
        const active = t === tab
        return (
          <button key={t} type="button" data-id={`food-tab-${t.toLowerCase()}`} onClick={() => onTab(t)} className="relative pb-[10px] pt-1">
            <span className="font-noontree text-[19px] leading-6" style={{ color: active ? INK : MUTED, fontWeight: active ? 700 : 500, letterSpacing: '-0.3px' }}>
              {t}
            </span>
            {active && (
              <motion.span
                layoutId="food-tab-indicator"
                data-id="food-tab-indicator"
                className="absolute inset-x-0 -bottom-px h-[3px] rounded-full"
                style={{ background: INK }}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

function FilterChips() {
  return (
    <div data-id="food-chips" className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-3">
      {CHIPS.map((c) => (
        <button
          key={c.label}
          type="button"
          data-id={`food-chip-${c.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          className="flex h-11 shrink-0 items-center gap-[6px] rounded-full border bg-white px-4"
          style={{ borderColor: HAIRLINE }}
        >
          {c.icon}
          <span className="whitespace-nowrap font-noontree text-[15px] font-medium" style={{ color: INK, letterSpacing: '-0.2px' }}>{c.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ── promo rail of restaurant cards ─────────────────────────────────────── */
function RailCard({ r }) {
  return (
    <div data-id="food-rail-card" className="flex h-[120px] w-[300px] shrink-0 overflow-hidden rounded-[16px] bg-white">
      <img data-id="food-rail-card-img" src={r.image} alt={r.name} className="h-full w-[118px] shrink-0 object-cover" />
      <div data-id="food-rail-card-info" className="flex min-w-0 flex-1 flex-col justify-center gap-[6px] px-3">
        <span data-id="food-rail-card-name" className="truncate font-noontree text-[17px] font-bold" style={{ color: INK, letterSpacing: '-0.3px' }}>{r.name}</span>
        <span data-id="food-rail-card-meta" className="flex items-center gap-[5px] font-noontree text-[14px] font-medium" style={{ color: INK }}>
          <RatingStar />
          {r.rating} • {r.time}
        </span>
        <span data-id="food-rail-card-offer" className="flex items-center gap-[5px] font-noontree text-[14px] font-bold" style={{ color: FOOD_PINK }}>
          <OfferRosette size={16} />
          {r.offer}
        </span>
      </div>
    </div>
  )
}

/* ── restaurant section with a dish rail ────────────────────────────────── */
function DishCard({ dish }) {
  return (
    <div data-id="food-dish-card" className="flex w-[118px] shrink-0 flex-col gap-2">
      <div data-id="food-dish-media" className="relative h-[118px] w-[118px] overflow-hidden rounded-[16px] bg-[#F2F3F7]">
        <img src={dish.image} alt={dish.name} className="h-full w-full object-cover" />
        <button
          type="button"
          data-id="food-dish-add"
          aria-label={`Add ${dish.name}`}
          className="absolute bottom-[8px] right-[8px] flex h-9 w-9 items-center justify-center rounded-[12px] border bg-white transition active:scale-95"
          style={{ borderColor: FOOD_PINK }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2.5v11M2.5 8h11" stroke={FOOD_PINK} strokeWidth="1.9" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <span data-id="food-dish-name" className="font-noontree text-[15px] font-medium leading-[1.3]" style={{ color: INK, letterSpacing: '-0.2px' }}>
        {dish.name}
      </span>
      <span data-id="food-dish-price" className="font-noontree text-[15px] font-semibold" style={{ color: INK }}>
        {DH} {dish.price}
      </span>
    </div>
  )
}

function RestaurantSection({ r, showDishes }) {
  return (
    <section data-id="food-restaurant-card" className="flex flex-col rounded-[18px] bg-white p-4">
      <div data-id="food-restaurant-head" className="flex items-center justify-between">
        <span className="flex min-w-0 items-center gap-2">
          {r.ad && (
            <span data-id="food-restaurant-ad" className="flex h-[22px] shrink-0 items-center rounded-[6px] bg-[rgba(2,6,12,0.28)] px-[6px] font-noontree text-[12px] font-semibold text-white">
              Ad
            </span>
          )}
          <span data-id="food-restaurant-name" className="truncate font-noontree text-[19px] font-bold" style={{ color: INK, letterSpacing: '-0.3px' }}>
            {r.name}
          </span>
        </span>
        <svg data-id="food-restaurant-chevron" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
          <path d="m7.5 5 5 5-5 5" stroke={FOOD_PINK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div data-id="food-restaurant-meta" className="mt-2 flex items-center gap-[6px] font-noontree text-[14px] font-semibold" style={{ color: INK }}>
        <RatingStar />
        <span>{r.rating} ({r.ratingCount})</span>
        <span style={{ color: MUTED }}>•</span>
        {r.express ? <FlashClock /> : <PlainClock />}
        <span style={{ color: r.express ? RATING_GREEN : INK }}>{r.time}</span>
        <span style={{ color: MUTED }}>•</span>
        <Scooter />
        <span style={{ color: FOOD_PINK }}>FREE</span>
      </div>

      <div data-id="food-restaurant-offer" className="mt-3 flex items-center gap-[6px] font-noontree text-[15px] font-semibold" style={{ color: FOOD_PINK }}>
        <OfferRosette />
        {r.offer}
      </div>

      {showDishes && (
        <div data-id="food-restaurant-dishes" className="scrollbar-hide -mr-4 mt-4 flex gap-3 overflow-x-auto pr-4">
          {r.dishes.map((d) => (<DishCard key={d.name} dish={d} />))}
        </div>
      )}
    </section>
  )
}

/* ── food bottom tab bar (Home · Meal Plans · Đ10 Deals · Favourites · Account) ── */
function FoodNavIcon({ kind, active }) {
  const stroke = active ? INK : '#9AA1B2'
  if (kind === 'home') {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 10.2 12 3.6l8 6.6V20a1 1 0 0 1-1 1h-4.6v-5.6h-4.8V21H5a1 1 0 0 1-1-1v-9.8Z" fill={active ? INK : 'none'} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === 'meal') {
    return (
      <span className="flex h-[26px] items-center justify-center rounded-[6px] border px-[4px] font-noontree text-[11px] font-extrabold tracking-tight" style={{ borderColor: stroke, color: stroke }}>
        M!X
      </span>
    )
  }
  if (kind === 'deals') {
    return (
      <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full font-noontree text-[10px] font-extrabold text-white" style={{ background: FOOD_PINK }}>
        {DH}10
      </span>
    )
  }
  if (kind === 'fav') {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 20.3 5.2 13.9a4.5 4.5 0 1 1 6.4-6.3l.4.4.4-.4a4.5 4.5 0 1 1 6.4 6.3L12 20.3Z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" stroke={stroke} strokeWidth="1.6" />
      <circle cx="12" cy="9.6" r="2.6" stroke={stroke} strokeWidth="1.6" />
      <path d="M6.4 18.4c1-2.5 3-3.8 5.6-3.8s4.6 1.3 5.6 3.8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const FOOD_TABS = [
  { key: 'home', label: 'Home' },
  { key: 'meal', label: 'Meal Plans' },
  { key: 'deals', label: `${DH}10 Deals` },
  { key: 'fav', label: 'Favourites' },
  { key: 'account', label: 'Account' },
]

export function FoodBottomNav() {
  return (
    <nav
      data-id="food-bottom-nav"
      className="flex w-full shrink-0 flex-col border-t bg-white"
      style={{ borderColor: 'rgba(2, 6, 12, 0.08)', paddingBottom: 'calc(24px + var(--sab, 0px))' }}
    >
      <div className="flex pb-1 pt-2">
        {FOOD_TABS.map((t, i) => {
          const active = i === 0
          return (
            <button key={t.key} type="button" data-id={`food-nav-${t.key}`} className="flex flex-1 flex-col items-center gap-1">
              <FoodNavIcon kind={t.key} active={active} />
              <span className="font-noontree text-[12px] leading-none" style={{ color: active ? INK : '#9AA1B2', fontWeight: active ? 700 : 500 }}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/* ── the results page body ──────────────────────────────────────────────── */
export default function FoodSearchResults() {
  const [tab, setTab] = useState('Dishes')
  const showDishes = tab === 'Dishes'
  return (
    <div data-id="food-results" className="flex min-h-0 flex-1 flex-col">
      {/* white header block — tabs + filter chips, rounded into the grey body */}
      <div data-id="food-results-head" className="shrink-0 rounded-b-[18px] bg-white pb-1">
        <FoodTabs tab={tab} onTab={setTab} />
        <FilterChips />
      </div>

      <main
        data-id="food-results-main"
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ background: PAGE_BG }}
      >
        <div data-id="food-rail" className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2 pt-4">
          {RAIL_RESTAURANTS.map((r) => (<RailCard key={r.name} r={r} />))}
        </div>

        <div data-id="food-restaurant-list" className="flex flex-col gap-3 px-4 pb-6 pt-3">
          {RESTAURANTS.map((r) => (<RestaurantSection key={r.name} r={r} showDishes={showDishes} />))}
        </div>
      </main>
    </div>
  )
}
