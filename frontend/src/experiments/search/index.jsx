import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import AppShell from '../../components/layout/AppShell'
import BottomNav from '../../components/layout/BottomNav'
// The minutes-marketplace home (marketplace-switcher variation 6 = V8) is the
// backdrop the search flow opens over.
import MarketplaceSwitcherV8 from '../marketplace-switcher/sections/MarketplaceSwitcherV8'
import LocationBar from '../marketplace-switcher/sections/LocationBar'
import HomeSearchBar from '../marketplace-switcher/sections/SearchBar'
import PromoBanner from '../marketplace-switcher/sections/PromoBanner'
import CategoryGrid from '../marketplace-switcher/sections/CategoryGrid'
import ProductRail from '../marketplace-switcher/sections/ProductRail'
import CombosSection from '../marketplace-switcher/sections/CombosSection'
import { marketplaces, address, categories, bestPicks, mobileDeals } from '../../data/marketplace'
import skyClouds from '../../assets/marketplace/sky-clouds.png'
import FoodSearchResults, { FoodBottomNav } from './FoodSearch'
import shawarmaImg from '../../assets/marketplace/shawarma.png'
import noonWordmark from '../../assets/marketplace/noon.svg'
import foodWordmark from '../../assets/marketplace/food.svg'
import xsUmbrella from '../../assets/marketplace/xs-umbrella-red.png'
import xsUmbrellaAlt from '../../assets/marketplace/xs-umbrella.png'
import xsAlbaik from '../../assets/marketplace/xs-albaik.png'
import xsYusufBhai from '../../assets/marketplace/xs-yusuf-bhai.png'
import xsShoes from '../../assets/marketplace/xs-shoes.png'
import xsCreatine from '../../assets/marketplace/xs-creatine.png'
import xsPizzaHut from '../../assets/marketplace/xs-pizza-hut.png'
import magicListWordmark from '../../assets/icons/magic-list.svg'
import magicListStar from '../../assets/icons/magic-list-star.svg'

// Primary text / muted colours from the SLP design tokens.
const INK = 'rgba(2, 6, 12, 0.92)'
const MUTED = 'rgba(2, 6, 12, 0.45)'
const HAIRLINE = 'rgba(2, 6, 12, 0.15)'
const ELEVATION_200 = '0px 4px 8px rgba(2, 6, 12, 0.1)'

// A tiny catalogue that feeds the trending-search chips.
const CATALOG = [
  { name: 'iPhone 15 Pro', price: 'AED 4,199', tint: '#EAF0FF' },
  { name: 'Samsung Galaxy S24', price: 'AED 3,299', tint: '#F0ECFF' },
  { name: 'AirPods Pro 2', price: 'AED 899', tint: '#EAF7F0' },
  { name: 'Sony WH-1000XM5', price: 'AED 1,399', tint: '#FDEFEF' },
  { name: 'MacBook Air M3', price: 'AED 4,999', tint: '#EAF4FF' },
  { name: 'Apple Watch Series 9', price: 'AED 1,699', tint: '#FFF1E8' },
]

// Trending terms shown on the empty food SLP (the results page itself is
// static demo data, so any term "matches").
const FOOD_TRENDING = ['shawarma', 'burger', 'pizza', 'biryani', 'falafel', 'karak tea']

// Which vertical actually stocks a term — drives the quick-search cross-sell.
// Food dishes → noonFOOD, quick-commerce staples → minutes, everything else
// (electronics, umbrellas, shoes…) → the noon marketplace.
const FOOD_TERMS = ['shawarma', 'shwarma', 'burger', 'pizza', 'biryani', 'falafel', 'karak', 'kebab', 'wrap', 'sandwich', 'fries', 'manakish', 'shish', 'dish', 'meal']
const MINUTES_TERMS = ['cut fruit', 'milk', 'bread', 'egg', 'banana', 'grocery', 'water', 'ice cream', 'vegetable', 'snack', 'yogurt', 'juice', 'chips', 'chocolate']

// Curated demo terms — each carries its destination vertical + product media
// for the banner tile. `fit` is 'contain' for logos (padded) and 'cover' for
// product photos (fills the tile). Matched before the generic keyword lists.
const CROSS_SELL_ITEMS = [
  { keys: ['umbrella'], dest: 'noon', img: xsUmbrella, fit: 'contain' },
  { keys: ['office chair', 'guitar'], dest: 'noon', img: null, fit: 'cover' },
  { keys: ['shoes', 'shoe', 'shies', 'sneaker'], dest: 'noon', img: xsShoes, fit: 'cover' },
  { keys: ['creatine'], dest: 'minutes', img: xsCreatine, fit: 'cover' },
  { keys: ['yusuf bhai', 'yusuf'], dest: 'minutes', img: xsYusufBhai, fit: 'cover' },
  { keys: ['al baik', 'albaik', 'baik'], dest: 'food', img: xsAlbaik, fit: 'contain' },
  { keys: ['pizza hut', 'pizzahut'], dest: 'food', img: xsPizzaHut, fit: 'contain' },
]

// Resolve a term to { dest, img, fit }: curated items first, then the generic
// keyword lists (no image → the banner falls back to a glyph / shawarma).
function resolveCrossSell(term) {
  const q = term.trim().toLowerCase()
  if (!q) return null
  const item = CROSS_SELL_ITEMS.find((it) => it.keys.some((k) => q.includes(k)))
  if (item) return { dest: item.dest, img: item.img, fit: item.fit }
  if (FOOD_TERMS.some((k) => q.includes(k))) return { dest: 'food', img: null }
  if (MINUTES_TERMS.some((k) => q.includes(k))) return { dest: 'minutes', img: null }
  return { dest: 'noon', img: null }
}

// Autocomplete suggestions — the typed term drives the list. It leads with the
// term itself, weaves it into a couple of phrases ("chicken X", "X spices"),
// and pads with generic query completions, matching the noon SLP suggestion UI.
const GENERIC_SUGGESTIONS = ['shower gel', 'schweppes', 'shaving cream', 'shaving razor', 'shaving foam']
// small product thumbnails cycled per row (reused from the home rails)
const SUGGEST_THUMBS = [...bestPicks, ...mobileDeals].map((p) => p.image)

function buildSuggestions(query) {
  const term = query.trim()
  if (!term) return []
  // interleave term-based + generic completions (reference order)
  return [
    term,
    GENERIC_SUGGESTIONS[0],
    GENERIC_SUGGESTIONS[1],
    `chicken ${term}`,
    GENERIC_SUGGESTIONS[2],
    `${term} spices`,
    GENERIC_SUGGESTIONS[3],
    GENERIC_SUGGESTIONS[4],
  ]
}

// Render a suggestion, bolding + darkening the part that matches the query.
function Highlighted({ text, term }) {
  const t = term.trim()
  const i = t ? text.toLowerCase().indexOf(t.toLowerCase()) : -1
  if (i === -1) return <span style={{ color: '#5C667E' }}>{text}</span>
  return (
    <>
      {i > 0 && <span style={{ color: '#5C667E' }}>{text.slice(0, i)}</span>}
      <span className="font-semibold" style={{ color: INK }}>{text.slice(i, i + t.length)}</span>
      {i + t.length < text.length && <span style={{ color: '#5C667E' }}>{text.slice(i + t.length)}</span>}
    </>
  )
}

function SuggestionRow({ text, term, thumb, onSelect }) {
  return (
    <button
      type="button"
      data-id="search-suggest-row"
      onClick={() => onSelect(text)}
      className="flex w-full items-center gap-3 px-4 py-2 text-left transition active:bg-[#F7F8FA]"
    >
      <span data-id="search-suggest-thumb" className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#F5F6F8]">
        <img src={thumb} alt="" aria-hidden="true" className="h-9 w-9 object-contain" />
      </span>
      <span data-id="search-suggest-text" className="min-w-0 flex-1 truncate font-noontree text-[16px] font-normal leading-6 tracking-[-0.2px]">
        <Highlighted text={text} term={term} />
      </span>
    </button>
  )
}

/* ── Submitted results grid — noon marketplace PLP card (Image #1) ────────
 * A full-detail product card built to the Figma "Product card" spec: image
 * tile (Best Seller tag, wishlist, variant dots, page dots, Ad badge, ATC),
 * a "Mega Deal" strip, then name / rating / price / qty / nudge / coupon and
 * the "Get in 15 Mins" express CTA. Every result reuses the same demo item. */
const AIRPODS_ITEM = {
  title: 'Apple Airpods Pro 2 Wireless Earbuds',
  price: '899',
  was: '1399',
  off: '33%',
  qty: '500ml',
  unit: 'AED 2.35/ml',
  rating: '4.3',
  count: '128',
  tag: 'Best Seller',
  deal: 'Mega Deal',
  nudge: 'Lowest price in 30 days',
  coupon: 'Extra 10% Off',
  couponMore: '+3',
  eta: '15 Mins',
  variants: 4,
}
// The noon results grid is umbrella stock — each card cycles the two umbrella
// photos and carries its own product name (the rest of the demo fields stay).
const UMBRELLA_IMAGES = [xsUmbrella, xsUmbrellaAlt]
const UMBRELLA_NAMES = [
  'Automatic Windproof Travel Umbrella',
  'Large Golf Umbrella Double Canopy',
  'Compact Folding Umbrella Rain & Sun',
  'UV Protection Sun Parasol Umbrella',
  'Reverse Inverted Umbrella C-Handle',
  'Portable Mini Pocket Umbrella',
]
const NOON_RESULTS = UMBRELLA_NAMES.map((title, i) => ({
  ...AIRPODS_ITEM,
  title,
  thumb: UMBRELLA_IMAGES[i % UMBRELLA_IMAGES.length],
}))

/* dirham glyph — the small "AED" prefix rendered in the design's tabular style */
function Dirham({ className = '' }) {
  return <span className={`font-noontree ${className}`}>AED&nbsp;</span>
}

function NoonResultCard({ item, thumb }) {
  return (
    <div data-id="search-result-card" className="flex flex-col overflow-hidden rounded-[12px] border-[0.5px] border-[#F2F3F7] bg-white">
      {/* Top container — image tile with all the overlays */}
      <div data-id="search-card-image" className="relative aspect-[170.5/227.33] w-full bg-[rgba(0,40,136,0.03)]">
        <img src={thumb} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-contain p-2" />

        {/* Best Seller tag — notched into the top-left corner */}
        {item.tag && (
          <span
            data-id="search-card-tag"
            className="absolute left-0 top-0 flex items-center rounded-br-[10px] bg-[#0A4F4A] px-1.5 py-0.5 font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-white"
            style={{ boxShadow: '0px 0px 0px 1px #EFF7FF' }}
          >
            {item.tag}
          </span>
        )}

        {/* Wishlist heart */}
        <button
          type="button"
          data-id="search-card-wishlist"
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition active:scale-90"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 16.5c-.15 0-2.9-.9-5-4.1C3.7 10.5 3.9 8 5.2 6.9c1-.8 2.1-.6 2.9.1.5.4.7 1 .9 1.5.2-.5.4-1.1.9-1.5.8-.7 1.9-.9 2.9-.1 1.3 1.1 1.5 3.6.2 5.5-2.1 3.2-4.85 4.1-5 4.1Z" stroke="#475067" strokeWidth="1.3" fill="none" />
          </svg>
        </button>

        {/* Variant indicator — stacked colour dots + count */}
        {item.variants && (
          <div data-id="search-card-variants" className="absolute right-2 bottom-[46px] flex w-5 flex-col items-center rounded-[4px] py-0.5 backdrop-blur-sm">
            <span className="-my-[3px] h-3 w-3 rounded-full border-[0.5px] border-white bg-[#F43333]" />
            <span className="-my-[3px] h-3 w-3 rounded-full border-[0.5px] border-white bg-[#05AF25]" />
            <span className="h-3 w-3 rounded-full border-[0.5px] border-white bg-[#0076FF]" />
            <span className="mt-1 font-figtree text-[11px] font-semibold leading-none tracking-[-0.12px] text-[#343D54]">{item.variants}</span>
          </div>
        )}

        {/* Page-control dots */}
        <div data-id="search-card-dots" className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[rgba(14,14,14,0.02)] px-2 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0E0E0E]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[rgba(14,14,14,0.25)]" />
          <span className="h-1 w-1 rounded-full bg-[rgba(14,14,14,0.25)]" />
          <span className="h-0.5 w-0.5 rounded-full bg-[rgba(14,14,14,0.25)]" />
        </div>

        {/* Ad badge */}
        <span data-id="search-card-ad" className="absolute bottom-2 left-2 flex items-center rounded-[4px] bg-[#F2F3F7] px-1 py-0.5 font-noontree text-[10px] font-normal leading-[11px] text-[#475067]">
          Ad
        </span>

        {/* Add to cart */}
        <button
          type="button"
          data-id="search-card-atc"
          aria-label="Add to cart"
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-[8px] border-[1.2px] border-[#F2F3F7] bg-white transition active:scale-90"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="#101628" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Deal strip */}
      {item.deal && (
        <div data-id="search-card-deal" className="flex h-5 items-center bg-[#101628] px-2">
          <span className="font-figtree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-white">{item.deal}</span>
        </div>
      )}

      {/* Bottom container */}
      <div data-id="search-card-body" className="flex flex-col gap-2 px-2 pb-2.5 pt-2">
        {/* Name + rating */}
        <div className="flex flex-col gap-1">
          <span data-id="search-card-name" className="line-clamp-2 min-h-[36px] font-noontree text-[14px] font-medium leading-[18px] tracking-[-0.14px]" style={{ color: '#1D2539' }}>
            {item.title}
          </span>
          <span data-id="search-card-rating" className="flex w-fit items-center gap-0.5 rounded-[4px] bg-[#F9F9FB] px-1 py-0.5">
            <svg width="12" height="12" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M5.53 8.57a.5.5 0 0 0-.52 0l-2.42 1.49c-.38.23-.85-.11-.75-.55l.66-2.79a.5.5 0 0 0-.16-.49L.17 4.36c-.34-.29-.16-.84.29-.88l2.83-.23a.5.5 0 0 0 .42-.31L4.81.31a.5.5 0 0 1 .92 0l1.09 2.64a.5.5 0 0 0 .42.31l2.84.23c.44.04.62.59.29.88L8.2 6.23a.5.5 0 0 0-.16.5l.66 2.79c.1.44-.37.78-.75.55L5.53 8.57Z" fill="#42BD4C" />
            </svg>
            <span className="font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-[#101628]">{item.rating} ({item.count})</span>
          </span>
        </div>

        {/* Pricing + nudges */}
        <div className="flex flex-col gap-1">
          <div data-id="search-card-price" className="flex flex-wrap items-end gap-x-1 gap-y-0.5">
            <span className="flex items-center font-noontree text-[15px] font-bold leading-4 tracking-[0.07px]" style={{ color: '#1D2539' }}>
              <Dirham className="text-[11px]" />{item.price}
            </span>
            {item.was && <span className="font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#989FB3] line-through">{item.was}</span>}
            {item.off && <span className="font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-[#13645F]">{item.off}</span>}
          </div>

          {item.qty && (
            <span data-id="search-card-qty" className="flex w-fit items-center gap-1.5 rounded-[4px] bg-[#F9F9FB] px-1 py-0.5 font-noontree text-[12px] font-medium leading-[14px] tracking-[-0.12px] text-[#343D54]">
              {item.qty}
              <span className="h-3 w-px bg-[#D0D4DD]" />
              {item.unit}
            </span>
          )}

          {item.nudge && (
            <span data-id="search-card-nudge" className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
                <circle cx="8" cy="8" r="6" stroke="#DE1C1C" strokeWidth="1.1" />
                <path d="M8 5v6m0 0-2-2m2 2 2-2" stroke="#DE1C1C" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-figtree text-[12px] font-normal leading-4 tracking-[-0.12px] text-[#475067]">{item.nudge}</span>
            </span>
          )}

          {item.coupon && (
            <div data-id="search-card-coupons" className="flex items-start gap-1">
              <span className="flex items-center rounded-[4px] border-[0.5px] border-dashed border-[#BBE0DE] bg-[#E9FBF9] px-1 py-0.5 font-figtree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-[#0A4F4A]">
                {item.coupon}
              </span>
              {item.couponMore && (
                <span className="flex items-center rounded-[4px] border-[0.5px] border-dashed border-[#BBE0DE] bg-[#E9FBF9] px-1 py-0.5 font-figtree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-[#0A4F4A]">
                  {item.couponMore}
                </span>
              )}
            </div>
          )}

          {/* Express ETA CTA */}
          {item.eta && (
            <button type="button" data-id="search-card-eta" className="flex w-fit items-center gap-1 rounded-[4px] bg-[#D62925] px-1.5 py-1 transition active:scale-95">
              <svg width="12" height="12" viewBox="0 0 8 13" fill="none" aria-hidden="true">
                <path d="M4.14.22a.44.44 0 0 1 .81.27L4.43 4.67h3a.44.44 0 0 1 .38.66l-4.08 7a.44.44 0 0 1-.8-.27l.52-4.18H.44a.44.44 0 0 1-.38-.66l4.08-7Z" fill="#fff" />
              </svg>
              <span className="font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-white">Get in <span className="font-semibold">{item.eta}</span></span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M3 2.5 6 5 3 7.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Minutes / generic results — the simple grocery grid shown on every
 * non-noon, non-food vertical (what the search flow showed before the noon
 * marketplace PLP was added). Compact 3-up card: image tile with a discount
 * flag / frozen tag + ATC, then name, weight and price. */
const GROCERY_RESULTS = [
  { title: 'Americana Air Fryer Breaded Chicken', weight: '720g', price: '16.10', was: '42.90', off: '62%' },
  { title: 'Sadia Frozen Breaded Chicken Nuggets', weight: '1kg', price: '26.90', tag: 'Frozen' },
  { title: 'Freshly Foods Chicken Shawarma', weight: '650g', price: '44.90', was: '49.15', off: '8%' },
  { title: 'Al Areesh Breaded Chicken Nuggets', weight: '2 x 270g', price: '28.80', tag: 'Frozen' },
  { title: 'Farm Fresh x McCain Tempura Combo', weight: '560g', price: '23.80', was: '26.60', off: '10%' },
  { title: 'Sadia Broasted Chicken ZINGs Strips', weight: '1kg', price: '45', was: '49', off: '8%' },
]

function GroceryResultCard({ item, thumb }) {
  return (
    <div data-id="search-result-card" className="flex flex-col">
      <div className="relative mb-2 flex h-[128px] items-center justify-center overflow-hidden rounded-[12px] bg-[#F5F6F8]">
        {item.off && (
          <span className="absolute left-0 top-0 rounded-tl-[12px] rounded-br-[10px] bg-[#0F8A4C] px-1.5 py-0.5 font-noontree text-[11px] font-bold leading-3 text-white">
            {item.off} OFF
          </span>
        )}
        {item.tag && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-[#6E56CF] px-2 py-0.5 font-noontree text-[10px] font-semibold leading-3 text-white">
            ❄ {item.tag}
          </span>
        )}
        <img src={thumb} alt="" aria-hidden="true" className="h-[92px] w-auto object-contain" />
        <button type="button" aria-label="Add to cart" className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-[#F91A47] bg-white transition active:scale-90">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3.5v9M3.5 8h9" stroke="#F91A47" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <span className="line-clamp-2 min-h-[34px] font-noontree text-[13px] font-medium leading-[17px]" style={{ color: INK }}>{item.title}</span>
      <span className="mt-0.5 font-noontree text-[12px]" style={{ color: MUTED }}>{item.weight}</span>
      <span className="mt-0.5 flex items-baseline gap-1">
        <span className="font-noontree text-[14px] font-bold" style={{ color: INK }}>AED {item.price}</span>
        {item.was && <span className="font-noontree text-[12px] line-through" style={{ color: MUTED }}>{item.was}</span>}
      </span>
    </div>
  )
}

/* ── noonFOOD wordmark — colour comes from the `color` prop via currentColor
 * (white on the pink banner subtitle, brand-pink on the white CTA button). */
function NoonFoodMark({ className = '', color = '#FFFFFF' }) {
  return (
    <svg viewBox="0 0 65 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="noonFOOD" style={{ color }}>
      <g clipPath="url(#clip0_3400_12658)">
        <path d="M37.1584 0.715332C35.917 0.715332 34.6902 0.715332 33.5142 0.715332C33.1657 0.715332 32.8971 0.837926 32.7084 1.0763C32.5487 1.28743 32.5342 1.51218 32.5342 1.66884C32.5342 2.42482 32.5342 3.1808 32.5342 3.93684L32.5342 5.31937C32.5342 6.11623 32.5342 6.90627 32.5342 7.70313C32.5342 7.81208 32.5414 7.90749 32.5632 7.98915C32.6431 8.34328 32.9407 8.60211 33.3182 8.65659C33.3763 8.66341 33.4271 8.67024 33.4852 8.67024C33.8409 8.67024 34.1458 8.51364 34.32 8.23433C34.4361 8.05044 34.4506 7.8529 34.4506 7.7236C34.4506 7.16511 34.4506 6.61343 34.4506 6.05493V5.51009C35.1693 5.51009 35.8807 5.51009 36.5994 5.51009C36.6865 5.51009 36.7664 5.51009 36.8535 5.49644C37.1076 5.46244 37.3326 5.3262 37.4706 5.11501C37.6085 4.91076 37.652 4.65875 37.5722 4.43404C37.4633 4.09343 37.1294 3.85507 36.7519 3.84142C36.7011 3.84142 36.6502 3.84142 36.5994 3.84142H36.5777C35.8662 3.84142 35.1548 3.84142 34.4434 3.84142C34.4434 3.32387 34.4434 2.82667 34.4434 2.39076H35.1113C35.7719 2.39076 36.4325 2.39076 37.0858 2.39076H37.1221C37.1802 2.39076 37.2455 2.39076 37.3108 2.39076C37.6157 2.35672 37.8843 2.18645 38.0223 1.94126C38.1529 1.70288 38.1529 1.42365 38.0077 1.17165C37.8916 0.967332 37.652 0.722145 37.1439 0.722145L37.1584 0.715332Z" fill="currentColor" />
        <path d="M63.5613 4.05308C63.4742 3.31752 63.2491 2.69771 62.8716 2.16648C62.545 1.69654 62.1167 1.32875 61.6157 1.07677C61.1149 0.831578 60.556 0.708984 59.9098 0.708984C58.9516 0.708984 58.0225 0.708984 57.2384 0.708984C56.8972 0.708984 56.6286 0.831579 56.4471 1.06314C56.2802 1.27427 56.2656 1.50583 56.2656 1.66249C56.2656 2.42529 56.2656 3.18128 56.2656 3.94402V7.60137C56.2656 7.68996 56.2656 7.78526 56.2802 7.89432C56.3238 8.24846 56.5632 8.52082 56.919 8.62989C57.057 8.67071 57.1876 8.67754 57.2892 8.67754C57.6594 8.67754 58.0297 8.67754 58.3999 8.67754C58.8137 8.67754 59.2202 8.67754 59.634 8.67754H59.6485C59.9389 8.67754 60.1784 8.67071 60.4035 8.65024C61.1367 8.58212 61.7683 8.3234 62.2982 7.86703C62.8426 7.39712 63.2128 6.7978 63.4306 6.03494C63.6049 5.42197 63.6557 4.75453 63.5686 4.06661L63.5613 4.05308ZM61.4561 5.8374C61.3181 6.24613 61.0787 6.54579 60.7301 6.76368C60.5632 6.86592 60.3672 6.93393 60.113 6.96122C59.9825 6.97487 59.8373 6.98852 59.6702 6.98852C59.1694 6.98852 58.6685 6.98852 58.1675 6.98852V2.3776C58.2765 2.3776 58.3854 2.3776 58.4942 2.3776C58.9153 2.3776 59.3581 2.3776 59.7864 2.3776C60.1784 2.3776 60.4761 2.45253 60.7301 2.61598C61.0205 2.79985 61.2383 3.05186 61.3908 3.39917C61.5287 3.71248 61.6085 4.05308 61.6303 4.48216C61.6593 4.95889 61.594 5.40832 61.4488 5.8374H61.4561Z" fill="currentColor" />
        <path d="M54.2977 1.80538C53.6588 1.15836 52.8603 0.770151 51.9311 0.647557C51.2996 0.565824 50.697 0.606686 50.1236 0.770152C49.1798 1.04939 48.4321 1.58744 47.8949 2.38429C47.4375 3.0722 47.2052 3.84859 47.2126 4.68628C47.2126 5.27207 47.3214 5.83045 47.5464 6.35494C47.8803 7.12451 48.4103 7.73066 49.1073 8.15974C49.775 8.56846 50.5082 8.7727 51.2996 8.7727C51.5319 8.7727 51.7715 8.75235 52.0183 8.71823C52.7151 8.61611 53.3539 8.34363 53.913 7.90772C54.5735 7.39699 55.0309 6.72273 55.2777 5.90539C55.4809 5.23795 55.51 4.5365 55.3721 3.8213C55.2124 3.03808 54.8494 2.35024 54.2905 1.79175L54.2977 1.80538ZM53.4991 4.69993C53.4991 5.23795 53.3684 5.6875 53.1071 6.08246C52.7587 6.6206 52.3086 6.92026 51.7351 7.01556C50.9293 7.14498 50.2905 6.94062 49.7824 6.38212C49.4412 6.01434 49.2524 5.56491 49.187 5.01323C49.1362 4.55004 49.187 4.1346 49.3322 3.74647C49.6009 3.05173 50.0509 2.62266 50.6897 2.43877C50.9221 2.37066 51.1471 2.33661 51.3649 2.33661C51.8223 2.33661 52.2432 2.48644 52.6208 2.78612C53.0708 3.14032 53.3394 3.61023 53.4483 4.21637C53.4774 4.40026 53.4919 4.55686 53.4919 4.69993H53.4991Z" fill="currentColor" />
        <path d="M45.2743 1.59465C44.3087 0.784176 43.1545 0.470891 41.8405 0.661582C40.9186 0.797801 40.1346 1.20644 39.503 1.88751C39.0602 2.35745 38.748 2.92279 38.5666 3.56294C38.4577 3.9512 38.4069 4.36663 38.4214 4.82971C38.4286 5.17031 38.4722 5.4768 38.5448 5.75599C38.7771 6.62097 39.2344 7.33606 39.9023 7.87409C40.6355 8.4667 41.5066 8.77319 42.4866 8.77989C42.5011 8.77989 42.5157 8.77989 42.5302 8.77989C43.2053 8.77989 43.8441 8.63695 44.4249 8.35093C45.0419 8.04445 45.55 7.60854 45.9348 7.05687C46.4284 6.33495 46.668 5.55163 46.6535 4.64582C46.6607 4.16227 46.5664 3.64471 46.3704 3.14751C46.1236 2.52772 45.7534 2.00329 45.2743 1.59465ZM42.6173 7.05005C41.9712 7.05005 41.4921 6.86616 41.0928 6.48473C40.7734 6.17824 40.5556 5.79011 40.454 5.33373C40.3233 4.76841 40.3596 4.22356 40.5629 3.71954C40.7879 3.14069 41.1654 2.74566 41.7026 2.50729C41.9567 2.39831 42.2326 2.34383 42.5157 2.34383C42.6245 2.34383 42.7334 2.35064 42.8423 2.36426C43.4957 2.4528 43.9893 2.78653 44.3523 3.37905C44.5701 3.74001 44.6862 4.13509 44.7007 4.58452C44.7152 5.06807 44.6354 5.48362 44.4467 5.8514C44.1563 6.42343 43.7425 6.78439 43.1763 6.96146C42.9512 7.02958 42.748 7.05687 42.6245 7.05005H42.6173Z" fill="currentColor" />
        <path d="M25.5786 4.66665C25.5786 3.83575 26.1738 2.99122 27.3063 2.99122C28.1919 2.99122 28.7218 3.57694 28.7218 4.55768V8.56918H30.6456V4.42828C30.6456 2.4736 29.4405 1.21362 27.5749 1.21362C26.7183 1.21362 25.9415 1.47243 25.339 1.95599L25.1648 1.38389H23.6548V8.56918H25.5786V4.66665Z" fill="currentColor" />
        <path d="M11.3001 1.21362C9.14407 1.21362 7.45264 2.86181 7.45264 4.97313C7.45264 7.08445 9.14407 8.73265 11.3001 8.73265C13.4562 8.73265 15.1476 7.08445 15.1476 4.97313C15.1476 2.86181 13.4562 1.21362 11.3001 1.21362ZM11.3001 6.94824C10.2039 6.94824 9.40541 6.11734 9.40541 4.96632C9.40541 3.81531 10.2039 2.99122 11.3001 2.99122C12.3963 2.99122 13.1949 3.82212 13.1949 4.96632C13.1949 6.11053 12.3963 6.94824 11.3001 6.94824Z" fill="currentColor" />
        <path d="M1.99307 4.66665C1.99307 3.83575 2.58833 2.99122 3.7208 2.99122C4.60644 2.99122 5.13638 3.57694 5.13638 4.55768V8.56918H7.06011V4.42828C7.06011 2.4736 5.85506 1.21362 3.98939 1.21362C3.13279 1.21362 2.35604 1.47243 1.75352 1.95599L1.57929 1.38389H0.0693359V8.56918H1.99307V4.66665Z" fill="currentColor" />
        <path d="M19.4159 1.21362C17.2599 1.21362 15.5684 2.86181 15.5684 4.97313C15.5684 7.08445 17.2599 8.73265 19.4159 8.73265C21.5719 8.73265 23.2633 7.08445 23.2633 4.97313C23.2633 2.86181 21.5719 1.21362 19.4159 1.21362ZM19.4159 6.94824C18.3197 6.94824 17.5212 6.11734 17.5212 4.96632C17.5212 3.81531 18.3197 2.99122 19.4159 2.99122C20.5121 2.99122 21.3106 3.82212 21.3106 4.96632C21.3106 6.11053 20.5121 6.94824 19.4159 6.94824Z" fill="currentColor" />
      </g>
      <defs>
        <clipPath id="clip0_3400_12658">
          <rect width="64.3263" height="9.70963" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  )
}

/* ── Cross-sell themes — keyed to the DESTINATION marketplace ─────────────
 * The quick-search cross-sell prompts the shopper to hop into the vertical
 * that actually stocks their term. Colour follows the destination brand:
 * minutes → white, noonFOOD → pink, noon → blue. All three share the layout
 * from the Figma "Sticky bar" (quick-search tab, squircle image, title +
 * subtitle, full-width primary button). */
const CROSS_SELL_THEMES = {
  noon: {
    banner: '#FFFFFF',
    tabInk: '#2122B8',
    tabBody: '#0F61FF',
    tabText: '#FFFFFF',
    imageBg: '#D6E9FF',
    glyph: '#0F61FF',
    titleColor: INK,
    subColor: MUTED,
    destName: 'noon',
    button: { bg: '#0F61FF', text: '#FFFFFF' },
  },
  food: {
    banner: 'linear-gradient(180deg, #F7306F 0%, #B3093D 100%)',
    tabInk: '#B3093D',
    imageBg: 'rgba(255, 255, 255, 0.8)',
    glyph: '#E5004E',
    titleColor: '#FFFFFF',
    subColor: 'rgba(255, 255, 255, 0.85)',
    destName: 'food',
    button: { bg: '#FFFFFF', text: '#1D2539' },
  },
  minutes: {
    banner: '#FFFFFF',
    tabInk: '#EB0030',
    imageBg: '#FFF1F2',
    glyph: '#EB0030',
    titleColor: INK,
    subColor: MUTED,
    destName: 'minutes',
    button: { bg: 'linear-gradient(180deg, #FF3B63 18.95%, #EB0030 122.21%)', text: '#FFFFFF' },
  },
}

/* Quick-search tab that notches out of the banner's top edge (Figma svg).
 * The tab body stays a constant off-white; the flaps + label take the
 * destination-brand ink so the tab reads on any banner colour. */
function QuickSearchTab({ color, body = '#F2F3F7', text = color }) {
  return (
    <svg data-id="search-cross-tab" width="104" viewBox="0 0 83 19" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Quick search">
      <path d="M82.8347 5.43321H78.4102L78.9432 3.73973L78.9719 3.64467C79.1488 3.13438 79.6149 2.77167 80.1647 2.77167C80.5543 2.77167 80.9033 2.95427 81.1352 3.24444C81.1447 3.25195 81.1519 3.26445 81.1567 3.27446L82.8347 5.43321Z" fill={color} />
      <path d="M0.166016 5.43321H4.59058L4.05753 3.73973L4.02884 3.64467C3.85195 3.13438 3.38583 2.77167 2.83605 2.77167C2.44642 2.77167 2.09743 2.95427 1.86556 3.24444C1.856 3.25195 1.84883 3.26445 1.84405 3.27446L0.166016 5.43321Z" fill={color} />
      <path d="M81 3.23419C80.7689 2.94889 80.4211 2.76935 80.0328 2.76935C79.4848 2.76935 79.0203 3.12598 78.844 3.62771L78.8154 3.72117L78.2842 5.38625L75.7804 13.2542C74.8036 16.3236 72.0258 18.3994 68.8955 18.3994H14.1045C10.9742 18.3994 8.19638 16.3236 7.21964 13.2542L4.71583 5.38625L4.18458 3.72117L4.15599 3.62771C3.9797 3.12598 3.51515 2.76935 2.96722 2.76935C2.5789 2.76935 2.23108 2.94889 2 3.23419L2.57175 2.50864C3.12445 1.80769 3.95349 1.39941 4.83018 1.39941L78.1698 1.39941C79.0465 1.39941 79.8755 1.80769 80.4282 2.50864L81 3.23419Z" fill={body} />
      <path d="M21.536 12.8997C19.84 12.8997 18.648 11.6997 18.648 10.0117C18.648 8.30771 19.832 7.10771 21.512 7.10771C23.2 7.10771 24.384 8.31571 24.384 10.0117C24.384 10.7557 24.16 11.3957 23.76 11.8917L24.32 12.4597L23.632 13.1397L23.024 12.5237C22.6 12.7637 22.096 12.8997 21.536 12.8997ZM19.768 10.0117C19.768 11.1157 20.496 11.8997 21.536 11.8997C21.8 11.8997 22.048 11.8437 22.264 11.7477L21.568 11.0437L22.272 10.3797L22.984 11.0997C23.16 10.7957 23.264 10.4277 23.264 10.0117C23.264 8.89971 22.544 8.10771 21.512 8.10771C20.488 8.10771 19.768 8.89971 19.768 10.0117ZM27.6265 12.8037L27.5785 12.2677C27.3145 12.6757 26.9065 12.8997 26.4025 12.8997C25.4505 12.8997 24.9065 12.3397 24.9145 11.0677V8.80371H25.9705V10.8517C25.9705 11.6597 26.2665 11.8997 26.7145 11.9077C27.2665 11.9157 27.5625 11.5637 27.5625 10.8997V8.80371H28.6185V12.8037H27.6265ZM29.4473 12.8037V8.80371H30.5033V12.8037H29.4473ZM29.3673 7.54771C29.3673 7.21971 29.6473 6.93971 29.9753 6.93971C30.3033 6.93971 30.5833 7.21971 30.5833 7.54771C30.5833 7.87571 30.3033 8.15571 29.9753 8.15571C29.6473 8.15571 29.3673 7.87571 29.3673 7.54771ZM33.2551 12.8997C31.9991 12.8997 31.1111 12.0277 31.1111 10.8037C31.1111 9.57971 31.9911 8.70771 33.2391 8.70771C34.0391 8.70771 34.7511 9.12371 35.0551 9.85971L34.0631 10.2117C33.9111 9.89971 33.5751 9.69971 33.1911 9.69971C32.5991 9.69971 32.1911 10.1557 32.1911 10.8037C32.1911 11.4517 32.6071 11.9077 33.2071 11.9077C33.5911 11.9077 33.9271 11.6917 34.0791 11.3557L35.0791 11.7077C34.7671 12.4677 34.0631 12.8997 33.2551 12.8997ZM35.5443 12.8037V7.20371H36.6003V10.3077L37.9683 8.80371H39.2243L37.7123 10.4917L39.3443 12.8037H38.1043L37.0403 11.2437L36.6003 11.7317V12.8037H35.5443ZM42.9512 12.8997C42.1752 12.8997 41.5272 12.5477 41.2392 11.9077L42.1432 11.4917C42.3032 11.7477 42.5832 11.9637 42.9512 11.9637C43.3032 11.9637 43.5032 11.8597 43.5032 11.6677C43.5032 11.4757 43.3352 11.4037 43.0712 11.3397L42.7032 11.2437C41.9352 11.0437 41.4632 10.5717 41.4632 9.99571C41.4632 9.17971 42.0152 8.70771 42.9832 8.70771C43.7272 8.70771 44.3832 9.07571 44.5592 9.59571L43.6872 9.99571C43.6152 9.77971 43.2712 9.63571 42.9832 9.63571C42.6952 9.63571 42.5352 9.77171 42.5352 9.97971C42.5352 10.1157 42.6872 10.2037 42.9672 10.2677L43.4872 10.3957C44.2632 10.5877 44.5672 11.1877 44.5672 11.6837C44.5672 12.4117 43.8792 12.8997 42.9512 12.8997ZM46.8398 12.8997C45.6558 12.8997 44.8158 12.0357 44.8158 10.8037C44.8158 9.57171 45.6798 8.70771 46.8958 8.70771C47.9438 8.70771 48.8478 9.56371 48.8478 11.0837H45.9198C45.9678 11.6277 46.4398 11.9557 46.9518 11.9557C47.3918 11.9557 47.6558 11.7477 47.8078 11.4517L48.7518 11.8197C48.4078 12.4997 47.7838 12.8997 46.8398 12.8997ZM45.9758 10.2997H47.7038C47.6558 9.79571 47.2078 9.60371 46.8638 9.60371C46.5198 9.60371 46.0318 9.79571 45.9758 10.2997ZM51.7275 12.8037L51.7115 12.3397C51.5035 12.6997 51.1435 12.8997 50.6075 12.8997C49.6475 12.8997 49.0955 12.4597 49.0955 11.6757C49.0955 10.8197 49.6955 10.3877 50.7275 10.3877H51.6715C51.5995 9.90771 51.3755 9.62771 50.9355 9.62771C50.5915 9.62771 50.3115 9.77171 50.1195 10.0837L49.1915 9.76371C49.4075 9.25171 49.9275 8.70771 50.9355 8.70771C52.1515 8.70771 52.7515 9.44371 52.7355 10.5877L52.7115 12.8037H51.7275ZM50.1755 11.6437C50.1755 11.8757 50.3995 12.0197 50.7835 12.0197C51.3035 12.0197 51.6955 11.5877 51.6955 11.1717H51.0955C50.3995 11.1717 50.1755 11.3477 50.1755 11.6437ZM53.4271 12.8037V8.80371H54.4831V9.53971C54.8111 9.03571 55.3551 8.78771 55.8991 8.78771V9.81171C55.1631 9.81171 54.4831 10.0757 54.4831 10.6997V12.8037H53.4271ZM58.2363 12.8997C56.9803 12.8997 56.0923 12.0277 56.0923 10.8037C56.0923 9.57971 56.9723 8.70771 58.2203 8.70771C59.0203 8.70771 59.7323 9.12371 60.0363 9.85971L59.0443 10.2117C58.8923 9.89971 58.5563 9.69971 58.1723 9.69971C57.5803 9.69971 57.1723 10.1557 57.1723 10.8037C57.1723 11.4517 57.5883 11.9077 58.1883 11.9077C58.5723 11.9077 58.9083 11.6917 59.0603 11.3557L60.0603 11.7077C59.7483 12.4677 59.0443 12.8997 58.2363 12.8997ZM60.5335 12.8037V7.20371H61.5895V9.31571C61.8535 8.92371 62.2535 8.70771 62.7495 8.70771C63.7015 8.70771 64.2455 9.26771 64.2375 10.5397V10.7557H64.2455V12.8037H63.1895V10.7557H63.1815C63.1815 9.94771 62.8855 9.70771 62.4375 9.69971C61.8855 9.69171 61.5895 10.0437 61.5895 10.7077V12.8037H60.5335Z" fill={text} />
    </svg>
  )
}

/* Term glyphs for the image tile — a lightweight stand-in for the product
 * photo when the destination isn't food (noon → umbrella, minutes → bag). */
function ProductGlyph({ dest, color }) {
  if (dest === 'minutes') {
    return (
      <svg viewBox="0 0 40 40" fill="none" className="h-8 w-8" aria-hidden="true">
        <path d="M10 14h20l-1.8 20.2a3 3 0 0 1-3 2.8H14.8a3 3 0 0 1-3-2.8L10 14Z" fill={color} opacity="0.15" />
        <path d="M10 14h20l-1.8 20.2a3 3 0 0 1-3 2.8H14.8a3 3 0 0 1-3-2.8L10 14Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M15 16v-2.5a5 5 0 0 1 10 0V16" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    )
  }
  // umbrella (noon / generic)
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-8 w-8" aria-hidden="true">
      <path d="M20 5C11.7 5 4.9 11.4 4.2 19.6a1 1 0 0 0 1 1.1h29.6a1 1 0 0 0 1-1.1C35.1 11.4 28.3 5 20 5Z" fill={color} opacity="0.18" />
      <path d="M20 5C11.7 5 4.9 11.4 4.2 19.6a1 1 0 0 0 1 1.1h29.6a1 1 0 0 0 1-1.1C35.1 11.4 28.3 5 20 5Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M20 5v2M20 20.7V32a4 4 0 0 1-8 0" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

/* CTA content per destination — the primary button reads "Switch to <brand>",
 * with the brand rendered as its wordmark where we have one. */
function CrossSellCta({ dest, color }) {
  const labelCls = 'font-noontree text-[16px] font-bold leading-6'
  if (dest === 'noon') {
    return (
      <>
        <span className={labelCls} style={{ color }}>Switch to</span>
        {/* wordmark inverted to white so it reads on the blue button */}
        <img src={noonWordmark} alt="noon" className="h-[10px] w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
      </>
    )
  }
  if (dest === 'food') {
    return (
      <>
        <span className={labelCls} style={{ color }}>Switch to</span>
        <img src={foodWordmark} alt="FOOD" className="h-[13px] w-auto" />
      </>
    )
  }
  // minutes — no clean single-colour wordmark, so plain text on the red button
  return <span className={labelCls} style={{ color }}>Switch to minutes</span>
}

/* ── Rounded-hexagon clip ─────────────────────────────────────────────────
 * Squircle can't cut a hexagon, so we build a pointy-top hexagon path (flat
 * left/right, points top/bottom) with rounded vertices for a `clip-path`.
 * Corners are rounded by trimming each edge back by `r` and joining across the
 * vertex with a quadratic curve. */
function hexPath(w, h, r) {
  const pts = [
    [w / 2, 0],        // top
    [w, h * 0.25],     // upper-right
    [w, h * 0.75],     // lower-right
    [w / 2, h],        // bottom
    [0, h * 0.75],     // lower-left
    [0, h * 0.25],     // upper-left
  ]
  const n = pts.length
  const trim = (from, to) => {
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    const len = Math.hypot(dx, dy)
    const t = Math.min(r / len, 0.5)
    return [from[0] + dx * t, from[1] + dy * t]
  }
  let d = ''
  for (let i = 0; i < n; i++) {
    const curr = pts[i]
    const prev = pts[(i - 1 + n) % n]
    const next = pts[(i + 1) % n]
    const entry = trim(curr, prev)
    const exit = trim(curr, next)
    d += i === 0 ? `M ${entry[0]} ${entry[1]}` : ` L ${entry[0]} ${entry[1]}`
    d += ` Q ${curr[0]} ${curr[1]} ${exit[0]} ${exit[1]}`
  }
  return d + ' Z'
}

/* 52×56 hexagon tile — white outer hexagon reads as the 1px border, the inner
 * (inset 1px) hexagon clips the photo/glyph, which is padded in so it sits
 * smaller than the tile. */
function HexTile({ children, innerBg }) {
  return (
    <div data-id="search-cross-banner-image" className="relative shrink-0" style={{ width: 52, height: 56 }}>
      <div data-id="search-cross-banner-image-border" className="absolute inset-0 bg-white" style={{ clipPath: `path('${hexPath(52, 56, 11)}')` }} />
      <div
        data-id="search-cross-banner-image-clip"
        className="absolute inset-[1px] flex items-center justify-center overflow-hidden p-[6px]"
        style={{ background: innerBg, clipPath: `path('${hexPath(50, 54, 10)}')` }}
      >
        {children}
      </div>
    </div>
  )
}

/* ── Quick-search cross-sell banner — slides up from the bottom (Image #13) ──
 * Reused for every destination; `theme` drives colour + copy so the three
 * variants stay a single component (parameterised, not forked). */
function CrossSellBanner({ dest, term, img = null, fit = 'cover', onSwitch }) {
  const theme = CROSS_SELL_THEMES[dest]
  const t = term.trim()
  const label = t ? t[0].toUpperCase() + t.slice(1) : ''
  return (
    <motion.div
      data-id="search-cross-banner"
      initial={{ y: '120%' }}
      animate={{ y: 0 }}
      exit={{ y: '120%' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 bottom-0 z-[60]"
    >
      {/* shadow surface behind the banner — a secondary-surface rounded panel
          that casts the upward shadow (the squircle sheet sits on top of it) */}
      <div
        data-id="search-cross-banner-shadow"
        className="absolute inset-0 z-0 rounded-t-[12px]"
        style={{ background: '#F9F9FB', boxShadow: '0 -4px 20px 0 rgba(0, 0, 0, 0.20)' }}
      />
      {/* quick-search tab notching out of the top edge */}
      <div data-id="search-cross-banner-tab-wrap" className="pointer-events-none absolute left-1/2 z-[2] -translate-x-1/2" style={{ top: -6 }}>
        <QuickSearchTab color={theme.tabInk} body={theme.tabBody} text={theme.tabText} />
      </div>
      {/* squircle sheet — the smooth-cornered shape carries the fill; top
          corners rounded, bottom squared so it sits flush to the screen edge.
          The slide stays on the motion wrapper above so the static Squircle's
          corner path never gets frozen. */}
      <Squircle
        as="div"
        data-id="search-cross-banner-sheet"
        cornerRadius={16}
        bottomLeftCornerRadius={0}
        bottomRightCornerRadius={0}
        cornerSmoothing={1}
        className="relative z-[1] flex flex-col gap-3 px-[18px] pt-4"
        style={{ background: theme.banner, paddingBottom: 'calc(24px + var(--sbp, 0px) + var(--sab, 0px))' }}
      >
        {/* image + copy row */}
        <div data-id="search-cross-banner-row" className="flex items-center gap-3">
          {/* image box — rounded hexagon: the white outer shape reads as the
              1px border, the inner one clips the photo/glyph */}
          <HexTile innerBg={theme.imageBg}>
              {img ? (
                <img data-id="search-cross-banner-image-media" src={img} alt="" aria-hidden="true" className={fit === 'contain' ? 'h-full w-full object-contain p-[3px]' : 'h-full w-full object-cover'} />
              ) : dest === 'food' ? (
                <img data-id="search-cross-banner-image-media" src={shawarmaImg} alt="" aria-hidden="true" className="h-full w-full object-cover" />
              ) : (
                <ProductGlyph dest={dest} color={theme.glyph} />
              )}
          </HexTile>
          {/* copy */}
          <div data-id="search-cross-banner-copy" className="flex min-w-0 flex-1 flex-col gap-1">
            <span data-id="search-cross-banner-title" className="truncate font-noontree text-[18px] font-bold leading-6 tracking-[-0.2px]" style={{ color: theme.titleColor }}>
              Find &ldquo;{label}&rdquo; on {theme.destName}
            </span>
            <span data-id="search-cross-banner-sub" className="font-noontree text-[13px] font-medium leading-5" style={{ color: theme.subColor }}>
              Switch and continue your search
            </span>
          </div>
        </div>
        {/* full-width primary button — squircle-cornered like the sheet */}
        <Squircle
          as="button"
          type="button"
          data-id="search-cross-banner-cta"
          cornerRadius={16}
          cornerSmoothing={1}
          onClick={onSwitch}
          className="flex h-14 w-full items-center justify-center gap-1 transition active:scale-[0.98]"
          style={{ background: theme.button.bg }}
        >
          <CrossSellCta dest={dest} color={theme.button.text} />
        </Squircle>
      </Squircle>
    </motion.div>
  )
}

/* ── "Shop with Magic List" AI button (Figma "AI Assistance", 90×52) ──────
 * Centered copy column (eyebrow + wordmark svg overflowing it by 5px each
 * side); the sparkle floats absolutely at the button's top-left, per spec. */
function MagicListButton() {
  return (
    <button
      type="button"
      data-id="search-magic-list"
      className="relative h-[52px] w-[90px] shrink-0 rounded-[12px] border bg-white transition active:scale-[0.97]"
      style={{ borderColor: HAIRLINE, boxShadow: '0px 0px 8px rgba(2, 6, 12, 0.1)' }}
    >
      <span
        data-id="search-magic-list-copy"
        className="absolute flex w-[62px] flex-col items-center gap-[2px]"
        style={{ left: 'calc(50% - 31px)', top: 'calc(50% - 13.57px)', height: '29.14px' }}
      >
        <span data-id="search-magic-list-eyebrow" className="w-full text-center font-noontree text-[10px] font-semibold leading-3" style={{ color: MUTED }}>
          Shop with
        </span>
        <img
          data-id="search-magic-list-wordmark"
          src={magicListWordmark}
          alt="Magic List"
          className="absolute -left-[5px] top-[14px] h-[15.14px] w-[72px] max-w-none"
        />
      </span>
      <img
        data-id="search-magic-list-spark"
        src={magicListStar}
        alt=""
        aria-hidden="true"
        className="absolute left-[3px] w-[6.75px] max-w-none"
        style={{ top: '31.25%', height: '18.75%' }}
      />
    </button>
  )
}

/* ── Minutes address bar — replaces mp-location on the minutes home ───────
 * Figma "Address Bar": pink-gradient home glyph + "10 min delivery" (H4/Bold)
 * over "Home, <address> ⌄" (Label-2). */
function MinutesLocationBar() {
  return (
    <div data-id="search-minutes-location" className="flex h-[62px] items-center gap-3 px-3">
      <div data-id="search-minutes-location-info" className="flex min-w-0 flex-1 flex-col items-start justify-center gap-1 py-2">
        <div data-id="search-minutes-location-title" className="flex h-6 items-center gap-1">
          <svg data-id="search-minutes-location-home" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
            <defs>
              <linearGradient id="minutes-home-grad" x1="10" y1="2" x2="10" y2="18" gradientUnits="userSpaceOnUse">
                <stop offset="0.19" stopColor="#FF3B63" />
                <stop offset="1" stopColor="#EB0030" />
              </linearGradient>
            </defs>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.1 2.3a1.5 1.5 0 0 1 1.8 0l6 4.6c.37.29.6.74.6 1.22v7.98c0 .94-.76 1.7-1.7 1.7H4.2a1.7 1.7 0 0 1-1.7-1.7V8.12c0-.48.23-.93.6-1.22l6-4.6Zm-.9 15v-2.9a1.8 1.8 0 0 1 3.6 0v2.9H8.2Z"
              fill="url(#minutes-home-grad)"
            />
          </svg>
          <span data-id="search-minutes-location-heading" className="font-noontree text-[19px] font-bold leading-6" style={{ color: INK, letterSpacing: '-0.2px' }}>
            10 min delivery
          </span>
        </div>
        <div data-id="search-minutes-location-line" className="flex h-[18px] w-full items-center gap-1">
          <span data-id="search-minutes-location-label" className="shrink-0 font-noontree text-[15px] font-semibold leading-[18px]" style={{ color: INK, letterSpacing: '-0.26px' }}>
            Home,
          </span>
          <span data-id="search-minutes-location-address" className="truncate font-noontree text-[15px] font-medium leading-[18px]" style={{ color: 'rgba(2, 6, 12, 0.6)', letterSpacing: '-0.26px' }}>
            Gate B, arkan plaza, sheikh zayed
          </span>
          <svg data-id="search-minutes-location-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
            <path d="m4.2 6.4 3.8 3.6 3.8-3.6" stroke="rgba(2, 6, 12, 0.6)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ── Home search bar (minutes) — replaces mp-search on the minutes home ───
 * White field (red magnifier + `Search "cut fruits"`) with a "Shop with
 * Magic List" pill beside it; tapping either opens the SLP overlay. */
function MinutesSearchBar({ onClick }) {
  return (
    <div data-id="search-home-bar" className="flex items-center gap-2 px-4 pb-5 pt-2">
      <div
        role="button"
        data-id="search-home-field"
        onClick={onClick}
        className="flex h-[52px] flex-1 items-center gap-[10px] rounded-[14px] border bg-white px-[14px]"
        style={{ borderColor: HAIRLINE, boxShadow: ELEVATION_200 }}
      >
        <svg data-id="search-home-field-icon" width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="9" cy="9" r="6.3" stroke="#F91A47" strokeWidth="1.7" />
          <path d="m14 14 3.3 3.3" stroke="#F91A47" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <span data-id="search-home-field-placeholder" className="font-noontree text-[16px] font-medium" style={{ color: MUTED, letterSpacing: '-0.2px' }}>
          Search &ldquo;cut fruits&rdquo;
        </span>
      </div>
      <button
        type="button"
        data-id="search-home-magic"
        onClick={onClick}
        className="relative flex h-[52px] shrink-0 items-center justify-center rounded-[14px] border bg-white pl-[24px] pr-[14px] transition active:scale-[0.97]"
        style={{ borderColor: HAIRLINE, boxShadow: ELEVATION_200 }}
      >
        <img
          data-id="search-home-magic-spark"
          src={magicListStar}
          alt=""
          aria-hidden="true"
          className="absolute left-[7px] top-1/2 w-[13px] max-w-none -translate-y-1/2"
        />
        <span data-id="search-home-magic-text" className="flex flex-col items-center gap-[3px]">
          <span data-id="search-home-magic-eyebrow" className="font-noontree text-[10px] font-semibold leading-none" style={{ color: MUTED }}>
            Shop with
          </span>
          <img
            data-id="search-home-magic-label"
            src={magicListWordmark}
            alt="Magic List"
            className="h-[15px] w-auto"
          />
        </span>
      </button>
    </div>
  )
}

/* ── Shared search bar row (search field + Magic List) ──────────────────── */
function SearchRow({ idPrefix, query, onChange, onClear, onEnter, inputRef, showMagic = true, leading }) {
  const hasQuery = query.trim().length > 0
  return (
    <div data-id={`${idPrefix}-bar-row`} className="flex w-full items-center gap-2">
      <div data-id={`${idPrefix}-field`} className="flex h-[52px] flex-1 items-center gap-2 rounded-[12px] border bg-white px-3" style={{ borderColor: HAIRLINE, boxShadow: ELEVATION_200 }}>
        {/* leading slot — a caller-supplied icon (e.g. a back chevron) replaces
            the default search magnifier when provided */}
        {leading ?? (
          <svg data-id={`${idPrefix}-field-icon`} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
            <circle cx="9" cy="9" r="6.3" stroke="#F91A47" strokeWidth="1.7" />
            <path d="m14 14 3.3 3.3" stroke="#F91A47" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        )}
        <input
          ref={inputRef}
          data-id={`${idPrefix}-input`}
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onEnter?.() }}
          placeholder="Search"
          className="min-w-0 flex-1 bg-transparent font-noontree text-[17px] font-medium leading-none outline-none placeholder:text-[rgba(2,6,12,0.45)]"
          style={{ color: INK, letterSpacing: '-0.26px' }}
        />
        {hasQuery && (
          <button type="button" data-id={`${idPrefix}-clear`} aria-label="Clear search" onClick={onClear} className="shrink-0">
            <svg data-id={`${idPrefix}-clear-icon`} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="9" fill="rgba(2,6,12,0.45)" />
              <path d="m7 7 6 6M13 7l-6 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      {showMagic && <MagicListButton />}
    </div>
  )
}

/* ── The minutes-marketplace home (switcher variation 6 = V8) ───────────────
 * Reuses the marketplace-switcher sections with `minutes` preselected. The
 * sticky header morphs its tiles on scroll via a shared `progress` value. */
// Sky-blue gradient with the cloud artwork layered on top (clouds sit at the
// top and fade into the gradient toward the bottom).
const HOME_HEADER_BG =
  `url(${skyClouds}) center top / 100% auto no-repeat, linear-gradient(181.21deg, rgba(47, 182, 250, 0.2) 1%, #CBF1FE 98.93%)`

function MinutesHome({ activeId, onChange, onSearch, progress }) {
  const onScroll = (e) => {
    const top = e.currentTarget.scrollTop
    progress.set(Math.min(1, Math.max(0, top / 44)))
  }
  return (
    <main
      data-id="search-home-main"
      onScroll={onScroll}
      className="scrollbar-hide relative flex-1 overflow-y-auto bg-white"
      style={{ paddingBottom: 'calc(85px + var(--sab, 0px))' }}
    >
      <div
        data-id="search-home-header"
        className="sticky top-0 z-[45] rounded-b-[12px]"
        style={{
          paddingTop: 'var(--sat, 0px)',
          background: HOME_HEADER_BG,
          // opaque white beneath the translucent gradient so the scrolling
          // body never shows through the sticky header
          backgroundColor: '#FFFFFF',
        }}
      >
        <MarketplaceSwitcherV8 items={marketplaces} activeId={activeId} onChange={onChange} progress={progress} showHint={false} />
        {activeId === 'minutes' ? (
          <>
            <MinutesLocationBar />
            <MinutesSearchBar onClick={onSearch} />
          </>
        ) : (
          <>
            <LocationBar label={address.label} line={address.line} />
            <HomeSearchBar onClick={onSearch} />
          </>
        )}
      </div>

      <div data-id="search-home-content" className="relative z-10">
        <PromoBanner />
        <CategoryGrid categories={categories} />
        <ProductRail dataId="search-best-picks" title="Best picks for you" products={bestPicks} />
        <ProductRail
          dataId="search-mobile-deals"
          title="Extra 10% off mobiles | Use code: SAVEBIG"
          viewAll
          products={mobileDeals}
        />
        <CombosSection />
      </div>
    </main>
  )
}

/**
 * Search experiment — opens on the noon minutes home (marketplace-switcher
 * variation 6). Tapping the search bar slides up the SLP; typing filters a demo
 * catalogue and drives the autocomplete suggestions.
 */
export default function SearchExperiment() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searchActive, setSearchActive] = useState(false) // SLP overlay over the home
  const [submitted, setSubmitted] = useState(false) // Enter pressed → results grid
  const [activeId, setActiveId] = useState('minutes') // noon minutes preselected
  const inputRef = useRef(null)
  const progress = useMotionValue(0)

  const hasQuery = query.trim().length > 0
  const isFood = activeId === 'food' // noon FOOD gets its own results page
  // term-driven autocomplete suggestions (shown while typing)
  const suggestions = useMemo(() => buildSuggestions(query), [query])

  // Quick-search cross-sell: after a submit, if the term belongs to a vertical
  // other than the one we're in, prompt a hop there. Same vertical ⇒ no banner.
  const crossSell = useMemo(() => {
    if (!submitted) return null
    const r = resolveCrossSell(query)
    return r && r.dest !== activeId ? r : null
  }, [submitted, query, activeId])

  // Focus the SLP field the moment the overlay opens.
  useEffect(() => {
    if (searchActive) inputRef.current?.focus()
  }, [searchActive])

  const closeSearch = () => {
    setSearchActive(false)
    setSubmitted(false)
    setQuery('')
  }

  // "Switch to …" on the cross-sell banner — hop into the destination vertical
  // with the same term already submitted; on food the body slides into the
  // food results, on minutes/noon it stays on the generic results grid.
  const switchTo = (dest) => {
    setActiveId(dest)
    setSubmitted(true)
  }

  // Search-bar row lives INSIDE each vertical's page so the whole page (bar +
  // results) slides together on a vertical switch. `showMagic` differs per
  // vertical — minutes keeps the Magic List pill, noon/food drop it.
  const renderSearchBar = (showMagic) => (
    <div data-id="search-bar-wrap" className="flex w-full shrink-0 items-center gap-2 px-3 py-4">
      <SearchRow
        idPrefix="search"
        query={query}
        onChange={(v) => { setQuery(v); setSubmitted(false) }}
        onClear={() => { setQuery(''); setSubmitted(false); inputRef.current?.focus() }}
        onEnter={() => { if (hasQuery) { setSubmitted(true); inputRef.current?.blur() } }}
        inputRef={inputRef}
        showMagic={showMagic}
        leading={
          <button
            type="button"
            data-id="search-slp-back"
            onClick={closeSearch}
            aria-label="Back to home"
            className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12.5 5 7.5 10l5 5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        }
      />
    </div>
  )

  return (
    <AppShell>
      {/* Base screen — the noon minutes home */}
      <MinutesHome
        activeId={activeId}
        onChange={setActiveId}
        onSearch={() => setSearchActive(true)}
        progress={progress}
      />
      <BottomNav
        dataId="search-bottom-nav"
        bottomPad={8}
        accent={{
          from: '#FF3B63',
          to: '#EB0030',
          grad: 'linear-gradient(180deg, #FF3B63 18.95%, #EB0030 122.21%)',
          tint: 'rgba(235, 0, 48, 0.12)',
        }}
      />

      {/* Back to experiments (only on the home) — floating black pill on the
          right, above the bottom nav, matching the marketplace switcher */}
      {!searchActive && (
        <div
          className="pointer-events-none fixed left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 justify-end px-4"
          style={{ bottom: 'calc(85px + var(--sab, 0px) + 16px)' }}
        >
          <button
            type="button"
            data-id="search-back"
            onClick={() => navigate('/')}
            aria-label="Back to experiments"
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1D2539] text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:scale-95"
          >
            <svg data-id="search-back-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* SLP overlay — slides over the home when the search bar is tapped */}
      <AnimatePresence>
        {searchActive && (
          <motion.div
            key="search-slp"
            data-id="search-slp"
            className="absolute inset-0 z-50 flex flex-col bg-white"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="w-full shrink-0" style={{ height: 'var(--sat, 0px)' }} />

            {/* Body — each vertical's page carries its OWN search bar at the top
                so the whole page (bar + results) slides together on a switch.
                Results after Enter, else suggestions while typing, else trending.
                noon FOOD is the restaurants/dishes page with the food tab bar. */}
            <div data-id="search-body" className="relative min-h-0 flex-1 overflow-hidden">
            <AnimatePresence initial={false}>
            {submitted && isFood ? (
              <motion.div
                key="search-food-page"
                data-id="search-food-page"
                className="absolute inset-0 flex flex-col bg-white"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
              >
                {renderSearchBar(false)}
                <FoodSearchResults />
                <FoodBottomNav />
              </motion.div>
            ) : (
            <motion.div
              // key by vertical so switching (e.g. minutes → noon via the
              // cross-sell) remounts the page and slides the destination's
              // results in, the same nav-push feel as the food page
              key={`search-generic-page-${activeId}`}
              data-id="search-generic-page"
              className="absolute inset-0 flex flex-col bg-white"
              // destination (e.g. noon) slides in on top; the outgoing page
              // (e.g. minutes) stays put and fades out underneath it
              initial={{ x: '100%', zIndex: 2 }}
              animate={{ x: 0, zIndex: 2 }}
              exit={{ x: 0, opacity: 0, zIndex: 1 }}
              transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
            >
            {/* noon drops the Magic List pill; minutes/other verticals keep it */}
            {renderSearchBar(activeId !== 'noon')}
            <main data-id="search-main" className="flex-1 overflow-y-auto overscroll-contain" style={{ paddingBottom: submitted ? 0 : 'calc(24px + var(--sab, 0px))' }}>
              {submitted ? (
                activeId === 'noon' ? (
                /* ── noon marketplace PLP — the full airpods results page ── */
                <div data-id="search-results">
                  {/* Filter bar — Filters / Sort / Price / category chips */}
                  <div data-id="search-results-controls" className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-3 py-2">
                    <button type="button" className="flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] border px-3 font-noontree text-[15px] font-medium" style={{ borderColor: HAIRLINE, color: INK }}>
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M3 6h14M6 10h8M8 14h4" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
                        <circle cx="13" cy="6" r="2" fill="#fff" stroke={INK} strokeWidth="1.4" />
                        <circle cx="7" cy="10" r="2" fill="#fff" stroke={INK} strokeWidth="1.4" />
                      </svg>
                      Filters
                    </button>
                    <button type="button" className="flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] border px-3 font-noontree text-[15px] font-medium" style={{ borderColor: HAIRLINE, color: INK }}>
                      Sort
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <button type="button" className="flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] border px-3 font-noontree text-[15px] font-medium" style={{ borderColor: HAIRLINE, color: INK }}>
                      Price
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <button type="button" className="flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] border px-3 font-noontree text-[15px] font-medium" style={{ borderColor: HAIRLINE, color: INK }}>
                      Cases &amp; Covers
                    </button>
                  </div>

                  {/* Showing results for … in <brand> */}
                  <div data-id="search-results-summary" className="flex flex-wrap items-center gap-2 px-4 py-2">
                    <span className="font-noontree text-[15px] font-normal" style={{ color: MUTED }}>
                      Showing results for <span className="font-semibold" style={{ color: INK }}>&ldquo;{query.trim()}&rdquo;</span>
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-[#B9D2FF] bg-[#EFF5FF] px-2 py-1 font-noontree text-[14px] font-medium text-[#0F61FF]">
                      in Apple
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m3 3 6 6M9 3l-6 6" stroke="#0F61FF" strokeWidth="1.4" strokeLinecap="round" /></svg>
                    </span>
                  </div>

                  <div data-id="search-results-grid" className="grid grid-cols-2 gap-3 px-3 pb-[120px] pt-1">
                    {NOON_RESULTS.map((it, i) => (
                      <NoonResultCard key={i} item={it} thumb={it.thumb} />
                    ))}
                  </div>
                </div>
                ) : (
                /* ── minutes / other verticals — the earlier grocery grid ── */
                <div data-id="search-results">
                  {/* view toggle + Sort + Filters */}
                  <div data-id="search-results-controls" className="flex items-center gap-2 px-3 py-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#1D2539]">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <rect x="2" y="2" width="5" height="5" rx="1.4" fill="#fff" />
                        <rect x="9" y="2" width="5" height="5" rx="1.4" fill="#fff" />
                        <rect x="2" y="9" width="5" height="5" rx="1.4" fill="#fff" />
                        <rect x="9" y="9" width="5" height="5" rx="1.4" fill="#fff" />
                      </svg>
                    </span>
                    <button type="button" className="flex h-9 items-center gap-1.5 rounded-full border px-3 font-noontree text-[13px] font-medium" style={{ borderColor: HAIRLINE, color: INK }}>
                      Sort
                    </button>
                    <button type="button" className="flex h-9 items-center gap-1.5 rounded-full border px-3 font-noontree text-[13px] font-medium" style={{ borderColor: HAIRLINE, color: INK }}>
                      Filters
                    </button>
                  </div>
                  <div data-id="search-results-grid" className="grid grid-cols-3 gap-2 px-3 pb-[120px] pt-1">
                    {GROCERY_RESULTS.map((it, i) => (
                      <GroceryResultCard key={i} item={it} thumb={SUGGEST_THUMBS[i % SUGGEST_THUMBS.length]} />
                    ))}
                  </div>
                </div>
                )
              ) : hasQuery ? (
                <div data-id="search-suggestions" className="flex flex-col pt-1">
                  {suggestions.map((s, i) => (
                    <SuggestionRow
                      key={`${s}-${i}`}
                      text={s}
                      term={query}
                      thumb={SUGGEST_THUMBS[i % SUGGEST_THUMBS.length]}
                      onSelect={(t) => { setQuery(t); setSubmitted(true); inputRef.current?.blur() }}
                    />
                  ))}
                </div>
              ) : (
                <div data-id="search-trending" className="flex flex-col gap-3 px-4 pb-6 pt-2">
                  <p data-id="search-trending-label" className="font-noontree text-[13px] font-semibold" style={{ color: MUTED }}>Trending searches</p>
                  <div data-id="search-trending-chips" className="flex flex-wrap gap-2">
                    {(isFood ? FOOD_TRENDING : CATALOG.map((c) => c.name)).map((name) => (
                      <button key={name} data-id="search-trending-chip" type="button" onClick={() => setQuery(name)} className="rounded-full border px-3 py-2 font-noontree text-[13px] font-medium" style={{ borderColor: HAIRLINE, color: INK }}>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </main>
            </motion.div>
            )}
            </AnimatePresence>
            </div>

            {/* Quick-search cross-sell — slides up after a submit whenever the
                term lives in a vertical other than the one we're in. Colour +
                copy follow the destination (minutes=white, food=pink, noon=blue). */}
            <AnimatePresence>
              {crossSell && (
                <CrossSellBanner
                  key={crossSell.dest}
                  dest={crossSell.dest}
                  term={query}
                  img={crossSell.img}
                  fit={crossSell.fit}
                  onSwitch={() => switchTo(crossSell.dest)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
