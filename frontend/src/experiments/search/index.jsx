import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
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

// Primary text / muted colours from the SLP design tokens.
const INK = 'rgba(2, 6, 12, 0.92)'
const MUTED = 'rgba(2, 6, 12, 0.45)'
const HAIRLINE = 'rgba(2, 6, 12, 0.15)'
const ELEVATION_200 = '0px 4px 8px rgba(2, 6, 12, 0.1)'
const AI_GRADIENT =
  'linear-gradient(90deg, #F91A47 -6.74%, #F73B86 56.21%, #034EFC 125.22%)'

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

/* ── Submitted results grid (Image #17) ─────────────────────────────────── */
const SAMPLE_RESULTS = [
  { title: 'Americana Air Fryer Breaded Chicken', weight: '720g', price: '16.10', was: '42.90', off: '62%' },
  { title: 'Sadia Frozen Breaded Chicken Nuggets', weight: '1kg', price: '26.90', tag: 'Frozen' },
  { title: 'Freshly Foods Chicken Shawarma', weight: '650g', price: '44.90', was: '49.15', off: '8%' },
  { title: 'Al Areesh Breaded Chicken Nuggets', weight: '2 x 270g', price: '28.80', tag: 'Frozen' },
  { title: 'Farm Fresh x McCain Tempura Combo', weight: '560g', price: '23.80', was: '26.60', off: '10%' },
  { title: 'Sadia Broasted Chicken ZINGs Strips', weight: '1kg', price: '45', was: '49', off: '8%' },
]

function ResultProductCard({ item, thumb }) {
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

/* ── noonFOOD wordmark (white) ──────────────────────────────────────────── */
function NoonFoodMark({ className = '' }) {
  return (
    <svg viewBox="0 0 65 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="noonFOOD">
      <g clipPath="url(#clip0_3400_12658)">
        <path d="M37.1584 0.715332C35.917 0.715332 34.6902 0.715332 33.5142 0.715332C33.1657 0.715332 32.8971 0.837926 32.7084 1.0763C32.5487 1.28743 32.5342 1.51218 32.5342 1.66884C32.5342 2.42482 32.5342 3.1808 32.5342 3.93684L32.5342 5.31937C32.5342 6.11623 32.5342 6.90627 32.5342 7.70313C32.5342 7.81208 32.5414 7.90749 32.5632 7.98915C32.6431 8.34328 32.9407 8.60211 33.3182 8.65659C33.3763 8.66341 33.4271 8.67024 33.4852 8.67024C33.8409 8.67024 34.1458 8.51364 34.32 8.23433C34.4361 8.05044 34.4506 7.8529 34.4506 7.7236C34.4506 7.16511 34.4506 6.61343 34.4506 6.05493V5.51009C35.1693 5.51009 35.8807 5.51009 36.5994 5.51009C36.6865 5.51009 36.7664 5.51009 36.8535 5.49644C37.1076 5.46244 37.3326 5.3262 37.4706 5.11501C37.6085 4.91076 37.652 4.65875 37.5722 4.43404C37.4633 4.09343 37.1294 3.85507 36.7519 3.84142C36.7011 3.84142 36.6502 3.84142 36.5994 3.84142H36.5777C35.8662 3.84142 35.1548 3.84142 34.4434 3.84142C34.4434 3.32387 34.4434 2.82667 34.4434 2.39076H35.1113C35.7719 2.39076 36.4325 2.39076 37.0858 2.39076H37.1221C37.1802 2.39076 37.2455 2.39076 37.3108 2.39076C37.6157 2.35672 37.8843 2.18645 38.0223 1.94126C38.1529 1.70288 38.1529 1.42365 38.0077 1.17165C37.8916 0.967332 37.652 0.722145 37.1439 0.722145L37.1584 0.715332Z" fill="white" />
        <path d="M63.5613 4.05308C63.4742 3.31752 63.2491 2.69771 62.8716 2.16648C62.545 1.69654 62.1167 1.32875 61.6157 1.07677C61.1149 0.831578 60.556 0.708984 59.9098 0.708984C58.9516 0.708984 58.0225 0.708984 57.2384 0.708984C56.8972 0.708984 56.6286 0.831579 56.4471 1.06314C56.2802 1.27427 56.2656 1.50583 56.2656 1.66249C56.2656 2.42529 56.2656 3.18128 56.2656 3.94402V7.60137C56.2656 7.68996 56.2656 7.78526 56.2802 7.89432C56.3238 8.24846 56.5632 8.52082 56.919 8.62989C57.057 8.67071 57.1876 8.67754 57.2892 8.67754C57.6594 8.67754 58.0297 8.67754 58.3999 8.67754C58.8137 8.67754 59.2202 8.67754 59.634 8.67754H59.6485C59.9389 8.67754 60.1784 8.67071 60.4035 8.65024C61.1367 8.58212 61.7683 8.3234 62.2982 7.86703C62.8426 7.39712 63.2128 6.7978 63.4306 6.03494C63.6049 5.42197 63.6557 4.75453 63.5686 4.06661L63.5613 4.05308ZM61.4561 5.8374C61.3181 6.24613 61.0787 6.54579 60.7301 6.76368C60.5632 6.86592 60.3672 6.93393 60.113 6.96122C59.9825 6.97487 59.8373 6.98852 59.6702 6.98852C59.1694 6.98852 58.6685 6.98852 58.1675 6.98852V2.3776C58.2765 2.3776 58.3854 2.3776 58.4942 2.3776C58.9153 2.3776 59.3581 2.3776 59.7864 2.3776C60.1784 2.3776 60.4761 2.45253 60.7301 2.61598C61.0205 2.79985 61.2383 3.05186 61.3908 3.39917C61.5287 3.71248 61.6085 4.05308 61.6303 4.48216C61.6593 4.95889 61.594 5.40832 61.4488 5.8374H61.4561Z" fill="white" />
        <path d="M54.2977 1.80538C53.6588 1.15836 52.8603 0.770151 51.9311 0.647557C51.2996 0.565824 50.697 0.606686 50.1236 0.770152C49.1798 1.04939 48.4321 1.58744 47.8949 2.38429C47.4375 3.0722 47.2052 3.84859 47.2126 4.68628C47.2126 5.27207 47.3214 5.83045 47.5464 6.35494C47.8803 7.12451 48.4103 7.73066 49.1073 8.15974C49.775 8.56846 50.5082 8.7727 51.2996 8.7727C51.5319 8.7727 51.7715 8.75235 52.0183 8.71823C52.7151 8.61611 53.3539 8.34363 53.913 7.90772C54.5735 7.39699 55.0309 6.72273 55.2777 5.90539C55.4809 5.23795 55.51 4.5365 55.3721 3.8213C55.2124 3.03808 54.8494 2.35024 54.2905 1.79175L54.2977 1.80538ZM53.4991 4.69993C53.4991 5.23795 53.3684 5.6875 53.1071 6.08246C52.7587 6.6206 52.3086 6.92026 51.7351 7.01556C50.9293 7.14498 50.2905 6.94062 49.7824 6.38212C49.4412 6.01434 49.2524 5.56491 49.187 5.01323C49.1362 4.55004 49.187 4.1346 49.3322 3.74647C49.6009 3.05173 50.0509 2.62266 50.6897 2.43877C50.9221 2.37066 51.1471 2.33661 51.3649 2.33661C51.8223 2.33661 52.2432 2.48644 52.6208 2.78612C53.0708 3.14032 53.3394 3.61023 53.4483 4.21637C53.4774 4.40026 53.4919 4.55686 53.4919 4.69993H53.4991Z" fill="white" />
        <path d="M45.2743 1.59465C44.3087 0.784176 43.1545 0.470891 41.8405 0.661582C40.9186 0.797801 40.1346 1.20644 39.503 1.88751C39.0602 2.35745 38.748 2.92279 38.5666 3.56294C38.4577 3.9512 38.4069 4.36663 38.4214 4.82971C38.4286 5.17031 38.4722 5.4768 38.5448 5.75599C38.7771 6.62097 39.2344 7.33606 39.9023 7.87409C40.6355 8.4667 41.5066 8.77319 42.4866 8.77989C42.5011 8.77989 42.5157 8.77989 42.5302 8.77989C43.2053 8.77989 43.8441 8.63695 44.4249 8.35093C45.0419 8.04445 45.55 7.60854 45.9348 7.05687C46.4284 6.33495 46.668 5.55163 46.6535 4.64582C46.6607 4.16227 46.5664 3.64471 46.3704 3.14751C46.1236 2.52772 45.7534 2.00329 45.2743 1.59465ZM42.6173 7.05005C41.9712 7.05005 41.4921 6.86616 41.0928 6.48473C40.7734 6.17824 40.5556 5.79011 40.454 5.33373C40.3233 4.76841 40.3596 4.22356 40.5629 3.71954C40.7879 3.14069 41.1654 2.74566 41.7026 2.50729C41.9567 2.39831 42.2326 2.34383 42.5157 2.34383C42.6245 2.34383 42.7334 2.35064 42.8423 2.36426C43.4957 2.4528 43.9893 2.78653 44.3523 3.37905C44.5701 3.74001 44.6862 4.13509 44.7007 4.58452C44.7152 5.06807 44.6354 5.48362 44.4467 5.8514C44.1563 6.42343 43.7425 6.78439 43.1763 6.96146C42.9512 7.02958 42.748 7.05687 42.6245 7.05005H42.6173Z" fill="white" />
        <path d="M25.5786 4.66665C25.5786 3.83575 26.1738 2.99122 27.3063 2.99122C28.1919 2.99122 28.7218 3.57694 28.7218 4.55768V8.56918H30.6456V4.42828C30.6456 2.4736 29.4405 1.21362 27.5749 1.21362C26.7183 1.21362 25.9415 1.47243 25.339 1.95599L25.1648 1.38389H23.6548V8.56918H25.5786V4.66665Z" fill="white" />
        <path d="M11.3001 1.21362C9.14407 1.21362 7.45264 2.86181 7.45264 4.97313C7.45264 7.08445 9.14407 8.73265 11.3001 8.73265C13.4562 8.73265 15.1476 7.08445 15.1476 4.97313C15.1476 2.86181 13.4562 1.21362 11.3001 1.21362ZM11.3001 6.94824C10.2039 6.94824 9.40541 6.11734 9.40541 4.96632C9.40541 3.81531 10.2039 2.99122 11.3001 2.99122C12.3963 2.99122 13.1949 3.82212 13.1949 4.96632C13.1949 6.11053 12.3963 6.94824 11.3001 6.94824Z" fill="white" />
        <path d="M1.99307 4.66665C1.99307 3.83575 2.58833 2.99122 3.7208 2.99122C4.60644 2.99122 5.13638 3.57694 5.13638 4.55768V8.56918H7.06011V4.42828C7.06011 2.4736 5.85506 1.21362 3.98939 1.21362C3.13279 1.21362 2.35604 1.47243 1.75352 1.95599L1.57929 1.38389H0.0693359V8.56918H1.99307V4.66665Z" fill="white" />
        <path d="M19.4159 1.21362C17.2599 1.21362 15.5684 2.86181 15.5684 4.97313C15.5684 7.08445 17.2599 8.73265 19.4159 8.73265C21.5719 8.73265 23.2633 7.08445 23.2633 4.97313C23.2633 2.86181 21.5719 1.21362 19.4159 1.21362ZM19.4159 6.94824C18.3197 6.94824 17.5212 6.11734 17.5212 4.96632C17.5212 3.81531 18.3197 2.99122 19.4159 2.99122C20.5121 2.99122 21.3106 3.82212 21.3106 4.96632C21.3106 6.11053 20.5121 6.94824 19.4159 6.94824Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_3400_12658">
          <rect width="64.3263" height="9.70963" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

/* ── noonFOOD cross-sell banner — slides up from the bottom (Image #13) ──── */
function FoodCrossSellBanner({ term, onShopNow }) {
  const t = term.trim()
  const label = t ? t[0].toUpperCase() + t.slice(1) : ''
  return (
    <motion.div
      data-id="search-food-banner"
      initial={{ y: '120%' }}
      animate={{ y: 0 }}
      exit={{ y: '120%' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 bottom-0 z-[60]"
    >
      <div
        className="flex items-center gap-3 rounded-t-[20px] px-4 pt-4"
        style={{ background: 'linear-gradient(180deg, #F7306F 0%, #B3093D 100%)', paddingBottom: 'calc(16px + var(--sab, 0px))' }}
      >
        {/* image box (Frame 2147241798) */}
        <div
          data-id="search-food-banner-image"
          className="flex h-16 w-[53px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-white"
          style={{ background: 'rgba(255, 255, 255, 0.8)' }}
        >
          <img src={shawarmaImg} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        </div>
        {/* copy */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span data-id="search-food-banner-title" className="truncate font-noontree text-[20px] leading-6 tracking-[-0.2px] text-white">
            <span className="font-bold">{label}</span> in food
          </span>
          <span data-id="search-food-banner-sub" className="flex items-center gap-1.5 font-noontree text-[13px] leading-4 text-white/85">
            continue on
            <NoonFoodMark className="h-[13px] w-auto" />
          </span>
        </div>
        {/* Shop now */}
        <button
          type="button"
          data-id="search-food-banner-cta"
          onClick={onShopNow}
          className="flex h-10 shrink-0 items-center justify-center rounded-[12px] bg-white px-[13px] transition active:scale-95"
        >
          <span className="font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px]" style={{ color: '#E22560' }}>Shop now</span>
        </button>
      </div>
    </motion.div>
  )
}

/* ── "Shop with Magic List" AI button ───────────────────────────────────── */
function MagicListButton() {
  return (
    <button
      type="button"
      data-id="search-magic-list"
      className="relative flex h-[52px] w-[90px] shrink-0 flex-col items-center justify-center gap-[3px] rounded-[12px] border bg-white transition active:scale-[0.97]"
      style={{ borderColor: HAIRLINE, boxShadow: ELEVATION_200 }}
    >
      <span data-id="search-magic-list-eyebrow" className="font-noontree text-[10px] font-semibold leading-none" style={{ color: MUTED }}>
        Shop with
      </span>
      <span data-id="search-magic-list-wordmark" className="flex items-center gap-[2px]">
        <svg data-id="search-magic-list-spark" width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 0c.3 2.5 1.2 3.4 3.7 3.7C7.2 4 6.3 5 6 7.4 5.7 5 4.8 4 2.3 3.7 4.8 3.4 5.7 2.5 6 0Z" fill="url(#ml-spark)" />
          <path d="M10 6.4c.15 1.2.6 1.7 1.8 1.85-1.2.15-1.65.6-1.8 1.85-.15-1.25-.6-1.7-1.8-1.85 1.2-.15 1.65-.65 1.8-1.85Z" fill="url(#ml-spark)" />
          <defs>
            <linearGradient id="ml-spark" x1="0" y1="0" x2="12" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F91A47" />
              <stop offset="1" stopColor="#BF0333" />
            </linearGradient>
          </defs>
        </svg>
        <span
          data-id="search-magic-list-label"
          className="font-noontree text-[14px] font-bold leading-[1.2]"
          style={{ background: AI_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Magic List
        </span>
      </span>
    </button>
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
        <svg data-id="search-home-magic-spark" width="15" height="17" viewBox="0 0 15 17" fill="none" aria-hidden="true" className="absolute left-[7px] top-1/2 -translate-y-1/2">
          <path d="M9 1c.32 2.7 1.3 3.68 4 4-2.7.32-3.68 1.3-4 4-.32-2.7-1.3-3.68-4-4 2.7-.32 3.68-1.3 4-4Z" fill="url(#home-ml-spark)" />
          <path d="M3.4 9.8c.18 1.5.72 2.04 2.2 2.2-1.48.16-2.02.7-2.2 2.2-.18-1.5-.72-2.04-2.2-2.2 1.48-.16 2.02-.7 2.2-2.2Z" fill="url(#home-ml-spark)" />
          <defs>
            <linearGradient id="home-ml-spark" x1="1" y1="1" x2="14" y2="15" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F91A47" />
              <stop offset="1" stopColor="#F73B86" />
            </linearGradient>
          </defs>
        </svg>
        <span data-id="search-home-magic-text" className="flex flex-col items-center gap-[3px]">
          <span data-id="search-home-magic-eyebrow" className="font-noontree text-[10px] font-semibold leading-none" style={{ color: MUTED }}>
            Shop with
          </span>
          <span
            data-id="search-home-magic-label"
            className="font-noontree text-[15px] font-bold leading-[1.2]"
            style={{ background: AI_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Magic List
          </span>
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
        <LocationBar label={address.label} line={address.line} />
        {activeId === 'minutes' ? (
          <MinutesSearchBar onClick={onSearch} />
        ) : (
          <HomeSearchBar onClick={onSearch} />
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

  // Focus the SLP field the moment the overlay opens.
  useEffect(() => {
    if (searchActive) inputRef.current?.focus()
  }, [searchActive])

  const closeSearch = () => {
    setSearchActive(false)
    setSubmitted(false)
    setQuery('')
  }

  // "Shop now" on the cross-sell banner — jump into noon FOOD with the same
  // term already submitted; the body slides left→right into the food results.
  const goToFood = () => {
    setActiveId('food')
    setSubmitted(true)
  }

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

            {/* Search bar row — the back chevron is the field's leading icon */}
            <div data-id="search-bar-wrap" className="flex w-full shrink-0 items-center gap-2 px-3 py-4">
              <SearchRow
                idPrefix="search"
                query={query}
                onChange={(v) => { setQuery(v); setSubmitted(false) }}
                onClear={() => { setQuery(''); setSubmitted(false); inputRef.current?.focus() }}
                onEnter={() => { if (hasQuery) { setSubmitted(true); inputRef.current?.blur() } }}
                inputRef={inputRef}
                showMagic={!isFood}
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

            {/* Body — results after Enter, else suggestions while typing, else trending.
                On noon FOOD the submitted view is the restaurants/dishes page
                (its own header + scroll area + food tab bar). Switching between
                the generic and food pages slides left→right like a nav push. */}
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
                <FoodSearchResults />
                <FoodBottomNav />
              </motion.div>
            ) : (
            <motion.div
              key="search-generic-page"
              data-id="search-generic-page"
              className="absolute inset-0 flex flex-col bg-white"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
            >
            <main data-id="search-main" className="flex-1 overflow-y-auto overscroll-contain" style={{ paddingBottom: submitted ? 0 : 'calc(24px + var(--sab, 0px))' }}>
              {submitted ? (
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
                    {SAMPLE_RESULTS.map((it, i) => (
                      <ResultProductCard key={i} item={it} thumb={SUGGEST_THUMBS[i % SUGGEST_THUMBS.length]} />
                    ))}
                  </div>
                </div>
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

            {/* noonFOOD cross-sell — slides up only after the search is
                submitted (pointless inside noon FOOD itself, so skipped there) */}
            <AnimatePresence>
              {submitted && !isFood && <FoodCrossSellBanner term={query} onShopNow={goToFood} />}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
