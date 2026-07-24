// Body + header pieces of the noon FOOD marketplace home (the switcher rail is
// shared by MinutesHome). Recreates the reference food home: Big Food Fest promo
// cards → collection tiles → restaurant deal cards → Recommended.
//
// Brand imagery (Subway, Wingstop, Popeyes, cookies, burgers…) isn't in the
// repo, so those are approximated with CSS gradients + shapes + the one food
// photo we do have (shawarma).
import { Squircle } from 'corner-smoothing'
import shawarma from '../../assets/marketplace/shawarma.png'

const INK = 'rgba(2, 6, 12, 0.92)'
const MUTED = 'rgba(2, 6, 12, 0.55)'
const FOOD_PINK = '#E5004E'
const DH = 'Đ'

/* ── Food address bar — pin + "Office - 128, HSBC Tower Branch" ───────────── */
export function FoodLocationBar() {
  return (
    <div data-id="food-location" className="flex items-center gap-2 px-4 pb-1 pt-1">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
        <path d="M10 2.5c-3 0-5.5 2.4-5.5 5.4 0 3.9 5 9.1 5 9.1s5.5-5.2 5.5-9.1c0-3-2.5-5.4-5-5.4Z" fill={INK} />
        <circle cx="10" cy="7.8" r="1.9" fill="#fff" />
      </svg>
      <span className="truncate font-noontree text-[17px] leading-6" style={{ color: INK }}>
        <span className="font-bold">Office</span> - 128, HSBC Tower Branch
      </span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
        <path d="m4.2 6.4 3.8 3.6 3.8-3.6" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/* ── Food search bar — "Search restaurants" (pink magnifier) ──────────────── */
export function FoodSearchBar({ onClick }) {
  return (
    <div data-id="food-home-bar" className="px-4 pb-4 pt-2">
      <div
        role="button"
        data-id="food-home-field"
        onClick={onClick}
        className="flex h-[52px] items-center gap-3 rounded-[14px] border bg-white px-4"
        style={{ borderColor: 'rgba(2, 6, 12, 0.12)', boxShadow: '0px 4px 8px rgba(2, 6, 12, 0.06)' }}
      >
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="9" cy="9" r="6.3" stroke={FOOD_PINK} strokeWidth="1.7" />
          <path d="m14 14 3.3 3.3" stroke={FOOD_PINK} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <span className="font-noontree text-[16px] font-medium" style={{ color: MUTED }}>Search restaurants</span>
      </div>
    </div>
  )
}

/* ── Big Food Fest — promo cards ───────────────────────────────────────────── */
function PromoCards() {
  return (
    <div data-id="food-promo-row" className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pt-2">
      {/* one — free delivery */}
      <Squircle as="div" cornerRadius={18} cornerSmoothing={1} className="relative h-[150px] w-[150px] shrink-0 overflow-hidden" style={{ background: 'linear-gradient(160deg, #FBD3E0 0%, #F7B8CE 100%)' }}>
        <span className="absolute left-3 top-3 flex h-6 items-center rounded-full bg-[#F2C200] px-2 font-noontree text-[13px] font-black italic text-[#0B7A3B]">one</span>
        <div className="absolute left-3 top-11 font-noontree text-[19px] font-black leading-[20px] text-[#C2185B]">FREE<br />DELIVERY</div>
        <span className="absolute bottom-3 left-3 rounded-[6px] bg-[#7B2FF7] px-2 py-1 font-noontree text-[12px] font-black text-white">ABOVE {DH}15</span>
      </Squircle>
      {/* up to 50% off */}
      <Squircle as="div" cornerRadius={18} cornerSmoothing={1} className="relative h-[150px] w-[150px] shrink-0 overflow-hidden bg-[#FCEAF0]">
        {/* burst shapes */}
        <span className="absolute -right-4 -top-4 h-16 w-16 rotate-45 bg-[#F7C6D8]" />
        <span className="absolute -bottom-5 -left-3 h-16 w-16 rotate-45 bg-[#F7C6D8]" />
        <span className="absolute left-3 top-8 font-noontree text-[13px] font-black leading-none text-[#C2185B]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>UP TO</span>
        <div className="absolute left-8 top-9 font-noontree text-[30px] font-black leading-[26px] text-[#C2185B]">50%</div>
        <span className="absolute left-8 top-[76px] rounded-full bg-[#4A0D2B] px-3 py-1 font-noontree text-[15px] font-black text-white">OFF</span>
      </Squircle>
      {/* deals starting Đ5 */}
      <Squircle as="div" cornerRadius={18} cornerSmoothing={1} className="relative h-[150px] w-[150px] shrink-0 overflow-hidden" style={{ background: 'linear-gradient(160deg, #E5165F 0%, #B3093D 100%)' }}>
        <div className="absolute left-3 top-3 font-noontree text-[16px] font-black leading-[17px] text-white">DEALS<br /><span className="text-[13px]">STARTING</span></div>
        <span className="absolute bottom-4 left-1/2 flex h-[64px] w-[64px] -translate-x-1/2 rotate-45 items-center justify-center rounded-[14px] bg-[#7B2FF7]">
          <span className="-rotate-45 font-noontree text-[26px] font-black text-[#F2C200]">{DH}5</span>
        </span>
      </Squircle>
      {/* peek of the next card */}
      <div className="h-[150px] w-4 shrink-0 rounded-l-[18px] bg-[#FBD3E0]" />
    </div>
  )
}

/* ── Collection tiles ──────────────────────────────────────────────────────── */
const COLLECTIONS = [
  { id: 'trio', label: 'TRIO', kind: 'text', bg: '#EFE6D6', ink: '#7A4A1E', text: 'TRIO' },
  { id: 'hidden', label: 'Hidden gems', kind: 'gem' },
  { id: 'cookies', label: 'Cookies', kind: 'grad', grad: 'radial-gradient(circle at 40% 35%, #E7B77A, #8A5A2B)' },
  { id: 'fastfood', label: 'Fast food', kind: 'img', img: shawarma },
  { id: 'bagels', label: 'Bagels', kind: 'grad', grad: 'radial-gradient(circle at 40% 35%, #F0D9A8, #C79A4E)' },
]

function CollectionTile({ c }) {
  return (
    <div data-id={`food-collection-${c.id}`} className="flex w-[92px] shrink-0 flex-col items-center gap-2">
      <div className="flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[16px]" style={{ background: c.kind === 'text' ? c.bg : c.kind === 'gem' ? '#FCEAF0' : '#F3F1F4' }}>
        {c.kind === 'text' && <span className="font-noontree text-[17px] font-black tracking-tight" style={{ color: c.ink }}>{c.text}</span>}
        {c.kind === 'gem' && (
          <div className="flex flex-col items-center">
            <span className="font-noontree text-[12px] font-black leading-none text-[#E5165F]">SELECT</span>
            <span className="mt-1 h-4 w-6 bg-[#F49CC0]" style={{ clipPath: 'polygon(0 40%, 25% 40%, 50% 100%, 75% 40%, 100% 40%, 50% 0)' }} />
          </div>
        )}
        {c.kind === 'grad' && <span className="h-full w-full" style={{ background: c.grad }} />}
        {c.kind === 'img' && <img src={c.img} alt="" aria-hidden="true" className="h-full w-full object-cover" />}
      </div>
      <span className="text-center font-noontree text-[13px] font-bold leading-none" style={{ color: INK }}>{c.label}</span>
    </div>
  )
}

function CollectionRow() {
  return (
    <div data-id="food-collections" className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pt-5">
      {COLLECTIONS.map((c) => <CollectionTile key={c.id} c={c} />)}
    </div>
  )
}

/* ── Restaurant deal cards ─────────────────────────────────────────────────── */
const DEALS = [
  { id: 'subway', brand: 'SUBWAY', brandBg: '#008C15', top: 'linear-gradient(180deg, #0B5D2E 0%, #0E7A3C 100%)', deal: '50% Off', label: 'Full Menu' },
  { id: 'wingstop', brand: 'WINGSTOP', brandBg: '#0C5C36', top: 'linear-gradient(180deg, #16351F 0%, #2C5A38 100%)', deal: '50% Off', label: 'Full Menu' },
  { id: 'tawouk', brand: 'TAWOUK', brandBg: '#C9A227', top: 'linear-gradient(180deg, #6E5A2E 0%, #A98C46 100%)', deal: `${DH} 29`, was: '44', label: 'Combo' },
  { id: 'popeyes', brand: 'POPEYES', brandBg: '#E8801A', top: 'linear-gradient(180deg, #C8641A 0%, #E8801A 100%)', deal: '50% Off', label: 'Full Menu' },
]

function DealCard({ d }) {
  return (
    <Squircle as="div" data-id={`food-deal-${d.id}`} cornerRadius={16} cornerSmoothing={1} className="w-[150px] shrink-0 overflow-hidden bg-[#FCEAF0]">
      {/* brand + food shape area */}
      <div className="relative h-[110px] w-full" style={{ background: d.top }}>
        <span className="absolute left-2 top-2 rounded-[8px] bg-white px-2 py-1 font-noontree text-[12px] font-black tracking-tight" style={{ color: d.brandBg }}>{d.brand}</span>
        {/* food stand-in shapes */}
        <span className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white/25" />
        <span className="absolute bottom-5 right-9 h-7 w-7 rounded-full bg-white/20" />
      </div>
      {/* discount pill + label */}
      <div className="flex flex-col gap-1 px-2 pb-2 pt-2">
        <span className="flex w-fit items-center gap-1 rounded-[6px] bg-[#7B2FF7] px-2 py-1 font-noontree text-[12px] font-black text-[#F2C200]">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#F2C200] text-[9px] text-[#7B2FF7]">%</span>
          {d.deal}{d.was && <span className="text-[10px] text-white/70 line-through">{d.was}</span>}
        </span>
        <span className="font-noontree text-[14px] font-bold" style={{ color: INK }}>{d.label}</span>
      </div>
    </Squircle>
  )
}

function RestaurantDeals() {
  return (
    <div data-id="food-deals" className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pt-5">
      {DEALS.map((d) => <DealCard key={d.id} d={d} />)}
    </div>
  )
}

/* ── Recommended in your area ──────────────────────────────────────────────── */
const RECOMMENDED = [
  { id: 'sushi', name: 'Sushi Zen', grad: 'linear-gradient(135deg, #2B2B3A 0%, #4A4A63 100%)', rating: '4.7', time: '25-35 min' },
  { id: 'albaik', name: 'Al Baik Express', grad: 'linear-gradient(135deg, #C8641A 0%, #E8A01A 100%)', rating: '4.5', time: '30-40 min' },
]

function RecommendedCard({ r }) {
  return (
    <div data-id={`food-rec-${r.id}`} className="w-[300px] shrink-0 overflow-hidden rounded-[16px] border border-[rgba(2,6,12,0.08)] bg-white">
      <div className="relative h-[130px] w-full" style={{ background: r.grad }}>
        <button type="button" aria-label="Favourite" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20.3 5.2 13.9a4.5 4.5 0 1 1 6.4-6.3l.4.4.4-.4a4.5 4.5 0 1 1 6.4 6.3L12 20.3Z" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex flex-col">
          <span className="font-noontree text-[16px] font-bold" style={{ color: INK }}>{r.name}</span>
          <span className="font-noontree text-[12px] font-medium" style={{ color: MUTED }}>{r.time}</span>
        </div>
        <span className="flex items-center gap-1 rounded-[6px] bg-[#0E8345] px-1.5 py-0.5 font-noontree text-[12px] font-bold text-white">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.6-5 4.4 1.5 6.4L12 16.9 5.9 20l1.5-6.5-5-4.4 6.6-.6L12 2.5Z" /></svg>
          {r.rating}
        </span>
      </div>
    </div>
  )
}

function Recommended() {
  return (
    <div data-id="food-recommended" className="pt-6">
      <h2 className="px-4 font-noontree text-[22px] font-black tracking-[-0.02em]" style={{ color: INK }}>Recommended in your area</h2>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pt-3">
        {RECOMMENDED.map((r) => <RecommendedCard key={r.id} r={r} />)}
      </div>
    </div>
  )
}

/* Full body — everything under the sticky header on the food home. */
export default function FoodHomeBody() {
  return (
    <div className="bg-white pt-3">
      <h2 className="px-4 font-noontree text-[26px] font-black tracking-[-0.02em]" style={{ color: FOOD_PINK }}>Big Food Fest</h2>
      <PromoCards />
      <CollectionRow />
      <RestaurantDeals />
      <Recommended />
    </div>
  )
}
