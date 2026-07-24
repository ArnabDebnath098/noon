import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import AppShell from '../../components/layout/AppShell'
import BottomNav from '../../components/layout/BottomNav'
import FloatingTabs from '../../components/layout/FloatingTabs'
import { Dirham } from '../../components/common/Dirham'
import { AIRPODS, bestPicks } from '../../data/marketplace'
import recAirpods from '../../assets/cart/rec-airpods.png'
import recWasher from '../../assets/cart/rec-washer.png'
import recPhonecase from '../../assets/cart/rec-phonecase.png'
import recPs5 from '../../assets/cart/rec-ps5.png'

// Design tokens (shared with the search SLP work).
const INK = '#1D2539'
const MUTED = 'rgba(2, 6, 12, 0.45)'
const HAIRLINE = 'rgba(2, 6, 12, 0.10)'
const BLUE = '#0F61FF'
const PAGE_BG = '#EEF0F3'

/* Price token — shared dirham glyph + amount, sharing one colour. */
function Price({ amount, className = '', glyphClass = '' }) {
  return (
    <span className={`inline-flex items-center gap-[3px] ${className}`}>
      <Dirham className={`align-[-0.04em] ${glyphClass}`} />
      {amount}
    </span>
  )
}

/* noon One credit-card mark (the layered noon-blob logo). */
function NoonOneLogo({ className = '' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="noon One">
      <g clipPath="url(#clip0_1179_21377)">
        <path d="M19.9788 9.86402C19.9549 9.38933 19.864 8.91926 19.6991 8.47091C19.4565 7.81122 19.0615 7.2312 18.5769 6.74269C18.3198 6.48395 18.0741 6.20743 17.7894 5.98095C17.2853 5.57935 16.7135 5.2765 16.1198 5.05068C14.9819 4.61879 13.7951 4.36202 12.6007 4.17307C10.6753 3.86759 8.74803 3.78068 6.83016 4.18492C5.09976 4.54966 3.42264 5.41344 2.05399 6.58929C1.72483 6.87173 1.28972 7.33983 1.05336 7.71246C0.497247 8.58875 1.14552 9.65992 1.53675 10.4533C1.8822 11.1524 2.23643 11.847 2.59881 12.537C2.92295 13.1539 3.22954 13.7853 3.69662 14.3008C4.79129 15.5181 6.30414 15.9704 7.85712 16.0626C9.11418 16.137 10.3744 16.0204 11.6258 15.8736C12.6684 15.7512 13.7085 15.6083 14.7411 15.4134C15.6672 15.2389 16.6327 15.0809 17.4759 14.6201C18.3154 14.1605 19.0452 13.4581 19.4678 12.5607C19.7073 12.0524 19.8389 11.4803 19.9242 10.9227C19.9775 10.5711 19.9969 10.2156 19.9794 9.86336L19.9788 9.86402Z" fill="#30AE4A" />
        <path d="M0.623267 9.70328C0.553048 8.95011 0.732358 8.19759 1.28095 7.58531C1.42389 7.42598 1.58377 7.28312 1.75744 7.16132C2.10665 6.91706 2.48283 6.7077 2.86966 6.53718C3.63455 6.19944 4.43267 5.92424 5.22515 5.66484C6.00383 5.41006 6.79317 5.19016 7.59443 5.0282C7.97813 4.95051 8.36371 4.88599 8.75117 4.8353C10.1976 4.64569 11.6628 4.64371 13.1142 4.75498C14.5656 4.86624 14.8866 4.74115 17.1192 5.72146C17.9098 6.06843 18.6245 6.64055 19.1556 7.35488C19.6897 8.07316 19.9731 8.90666 19.9976 9.83232C20.0258 10.9101 19.8283 12.2242 19.1844 13.0682C18.0251 14.5858 16.0402 14.8669 14.2584 14.9742C13.0346 15.0479 11.8057 15.0229 10.5806 15.0236C9.97938 15.0236 9.3775 15.0229 8.77625 15.0203C6.40007 15.0111 4.09035 14.0656 2.19694 12.5889C2.14239 12.5461 2.08722 12.5066 2.03581 12.4599C1.29725 11.789 0.721073 10.7461 0.623894 9.70328H0.623267Z" fill="#C52A26" />
        <path d="M0.833252 12.8811C0.567421 12.5677 0.351747 12.2115 0.205039 11.8099C-0.147939 10.8454 -0.0212937 9.7512 0.404412 8.83541C0.881528 7.80967 1.56178 7.24742 2.59563 6.91955C5.53294 5.98796 8.674 6.21114 11.7267 5.88525C12.9166 5.75819 14.1016 5.54619 15.2978 5.53368C15.7599 5.52907 16.2301 5.55541 16.6665 5.71539C17.1818 5.90434 17.6226 6.26974 18.0057 6.67793C18.5323 7.23886 18.9743 7.90184 19.2113 8.64974C19.4483 9.39765 19.469 10.2344 19.1875 10.9646C18.6633 12.3228 17.2558 13.0384 15.9273 13.4881C14.1862 14.0773 12.3775 14.4223 10.5637 14.6719C8.3693 14.9734 6.11789 15.1327 3.9599 14.6192C2.79814 14.3427 1.60567 13.7916 0.834506 12.8817L0.833252 12.8811Z" fill="#F06298" />
        <path d="M8.04332 5.63774C8.60256 5.53833 9.17937 5.42179 9.76683 5.30461C10.9311 5.0722 11.995 4.7417 12.9549 4.7417C14.5825 4.7417 15.8966 5.07418 16.8314 5.73255C18.1204 6.64044 18.3944 7.98417 18.3969 8.95197C18.4013 10.4761 17.8239 11.7342 16.6803 12.6922C15.1298 13.9918 12.6132 14.6251 9.59316 14.4757C7.0383 14.3493 4.72921 13.739 3.09096 12.7567C1.98626 12.0944 0.542375 10.908 0.541748 9.17845C0.541748 6.85902 3.15617 6.50679 8.04206 5.63708L8.04332 5.63774Z" fill="#F3E008" />
        <path d="M5.3536 7.52148C6.71473 7.52148 7.43322 8.3721 7.43322 9.4775C7.43322 10.7844 6.45579 11.9681 5.06144 11.9681C3.66708 11.9681 2.98181 11.1175 2.98181 10.0213C2.98181 8.71445 3.95924 7.52214 5.3536 7.52214V7.52148ZM5.31159 8.71445C4.70219 8.71445 4.30093 9.31093 4.30093 9.95087C4.30093 10.4683 4.61002 10.7751 5.11096 10.7751C5.71222 10.7751 6.12162 10.1787 6.12162 9.53873C6.12162 9.02125 5.81253 8.71445 5.31159 8.71445Z" fill="black" />
        <path d="M10.6232 9.48606C10.6401 9.40705 10.6652 9.2846 10.6652 9.17926C10.6652 8.84612 10.3981 8.71445 10.1141 8.71445C9.73855 8.71445 9.44576 8.92513 9.25391 9.12659L8.67774 11.8628H7.39185L8.28526 7.62682H9.57116L9.45391 8.1443C9.763 7.84606 10.1636 7.52148 10.7649 7.52148C11.5749 7.52148 12.0596 7.97773 12.0596 8.61767C12.0596 8.69667 12.0345 8.88102 12.0176 8.96858L11.4081 11.8628H10.1223L10.6232 9.48606Z" fill="black" />
        <path d="M14.6157 7.52148C15.6345 7.52148 16.4696 8.19697 16.4696 9.43339C16.4696 9.69674 16.4195 10.0213 16.3862 10.1701H13.5298V10.2228C13.5298 10.4335 13.8301 10.9246 14.4985 10.9246C14.8326 10.9246 15.2251 10.8278 15.442 10.6612L15.8345 11.556C15.442 11.8364 14.8909 11.9681 14.3982 11.9681C13.1123 11.9681 12.2521 11.2663 12.2521 10.0476C12.2521 8.68812 13.2377 7.52214 14.6157 7.52214V7.52148ZM15.3342 9.23193C15.3342 8.96002 15.1173 8.56566 14.5574 8.56566C14.0728 8.56566 13.7223 8.96924 13.6552 9.29382H15.3254C15.3336 9.27604 15.3336 9.2497 15.3336 9.23259L15.3342 9.23193Z" fill="black" />
      </g>
      <defs>
        <clipPath id="clip0_1179_21377">
          <rect width="20" height="12.1739" fill="white" transform="translate(0 3.91309)" />
        </clipPath>
      </defs>
    </svg>
  )
}

/* ── Header — location selector + wishlist ──────────────────────────────── */
function CartHeader() {
  return (
    <div data-id="cart-header" className="flex items-center gap-3 px-4 pb-2 pt-3">
      <div data-id="cart-header-location" className="flex min-w-0 flex-1 flex-col gap-0.5">
        <button type="button" className="flex items-center gap-1.5">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M9.1 2.6a1.4 1.4 0 0 1 1.8 0l6 4.7c.34.27.55.68.55 1.12v7.5c0 .78-.63 1.42-1.42 1.42H4.4A1.42 1.42 0 0 1 2.98 15.9v-7.5c0-.44.2-.85.55-1.12l6-4.68Z" fill={INK} />
          </svg>
          <span className="font-noontree text-[18px] font-bold leading-6" style={{ color: INK, letterSpacing: '-0.2px' }}>Home</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4.5 6.5 3.5 3.5 3.5-3.5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="truncate font-noontree text-[13px] font-medium leading-4" style={{ color: MUTED }}>
          Villa 52, Springville, K, VGP Layout, Mhada Col...
        </span>
      </div>
      <button
        type="button"
        data-id="cart-header-wishlist"
        aria-label="Wishlist"
        className="flex shrink-0 items-center justify-center bg-white transition active:scale-90"
        style={{ width: 36, height: 36, border: '1.00536px solid #F2F3F7', borderRadius: 46 }}
      >
        <svg width="17.2" height="15.82" viewBox="0 0 18 16" fill="none" aria-hidden="true" style={{ marginTop: 1 }}>
          <path d="M11.1932 0.211445C12.6191 -0.238566 14.2476 0.00587416 15.6023 1.2007C17.8692 3.20034 17.4885 6.55218 15.9236 9.12258C14.4174 11.5952 12.6585 13.2518 11.2713 14.2915C10.5778 14.8113 9.97568 15.1775 9.54375 15.4155C9.32798 15.5345 9.15404 15.622 9.03203 15.6802C8.97126 15.7092 8.92242 15.7315 8.88848 15.7466C8.87196 15.7539 8.85809 15.76 8.84844 15.7642C8.84392 15.7661 8.83963 15.7678 8.83672 15.7691L8.83281 15.771H8.83086C8.68391 15.832 8.51791 15.8328 8.3709 15.772L8.36894 15.771L8.36504 15.7691C8.36214 15.7678 8.35792 15.7661 8.35332 15.7642C8.3436 15.76 8.32916 15.7541 8.3123 15.7466C8.2784 15.7315 8.23043 15.7091 8.16973 15.6802C8.04769 15.622 7.87303 15.5355 7.65703 15.4165C7.22496 15.1786 6.62315 14.8122 5.92949 14.2925C4.54189 13.2529 2.78278 11.5964 1.27715 9.12258C-0.289878 6.55165 -0.668436 3.20026 1.59844 1.2007C2.95393 0.00623107 4.58366 -0.23967 6.00957 0.210469C7.04788 0.538408 7.96753 1.23233 8.60039 2.17043C9.23353 1.23259 10.1547 0.539397 11.1932 0.211445Z" fill="#035794" />
        </svg>
      </button>
    </div>
  )
}

/* ── Card shell — white rounded surface used across the sections ─────────── */
function Card({ children, className = '', dataId }) {
  return (
    <Squircle
      as="div"
      data-id={dataId}
      cornerRadius={16}
      cornerSmoothing={1}
      className={`bg-white ${className}`}
    >
      {children}
    </Squircle>
  )
}

/* ── Free gifts for you ───────────────────────────────────────────────────
 * Gift-unlock card: eyebrow, then a product row (image with a lock badge),
 * FREE price, "X left to unlock", a progress bar and the "+ Add" CTA. */
function FreeGifts() {
  return (
    <Card dataId="cart-free-gifts" className="mx-4 px-4 py-4">
      <div data-id="cart-free-gifts-head" className="mb-3 flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="8.5" width="17" height="4.2" rx="1" fill="#12B76A" />
          <rect x="4.8" y="12.7" width="14.4" height="8" rx="1.4" fill="#12B76A" />
          <rect x="10.8" y="8.5" width="2.4" height="12.2" fill="#0E8F53" />
          <path d="M12 8.2c-1.8 0-3.4-.4-3.4-2 0-1.1.9-2 2-2 1.7 0 2.4 2 2.4 4h-1Z" fill="#12B76A" />
          <path d="M12 8.2c1.8 0 3.4-.4 3.4-2 0-1.1-.9-2-2-2-1.7 0-2.4 2-2.4 4h1Z" fill="#12B76A" />
        </svg>
        <span className="font-noontree text-[18px] font-bold leading-6" style={{ color: INK, letterSpacing: '-0.2px' }}>Free gifts for you</span>
      </div>

      <div data-id="cart-free-gifts-body" className="flex items-start gap-3">
        <Squircle as="div" cornerRadius={12} cornerSmoothing={1} className="relative h-[84px] w-[84px] shrink-0 overflow-hidden bg-[#F5F6F8]">
          <img src={AIRPODS} alt="" aria-hidden="true" className="h-full w-full object-contain p-1.5" />
          <span className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="3.5" y="7" width="9" height="6" rx="1.4" fill={INK} />
              <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" stroke={INK} strokeWidth="1.3" fill="none" />
            </svg>
          </span>
        </Squircle>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="line-clamp-2 font-noontree text-[14px] font-medium leading-[18px]" style={{ color: INK }}>
            Apple Watch Series 9 GPS 41mm Silver Aluminium Case With Storm...
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-noontree text-[14px] font-bold" style={{ color: '#0E8F53' }}>FREE</span>
            <span className="font-noontree text-[13px] line-through" style={{ color: MUTED }}>
              <Price amount="209" />
            </span>
          </span>
          <span className="font-noontree text-[13px] font-semibold" style={{ color: INK }}>
            <Price amount="120" /> left to unlock
          </span>
        </div>

        <Squircle
          as="button"
          type="button"
          data-id="cart-free-gifts-add"
          cornerRadius={10}
          cornerSmoothing={1}
          className="flex h-9 shrink-0 items-center gap-1 border px-3 font-noontree text-[14px] font-semibold transition active:scale-95"
          style={{ borderColor: HAIRLINE, color: INK }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3.5v9M3.5 8h9" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Add
        </Squircle>
      </div>

      <div data-id="cart-free-gifts-bar" className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EAECEF]">
        <div className="h-full rounded-full" style={{ width: '42%', background: 'linear-gradient(90deg,#12B76A,#0E8F53)' }} />
      </div>
    </Card>
  )
}

/* ── Got a coupon? ────────────────────────────────────────────────────────
 * Coupon field + APPLY, a hairline divider, then a "View all coupons" row. */
function CouponCard() {
  const [code, setCode] = useState('')
  return (
    <Card dataId="cart-coupon" className="mx-4 flex flex-col gap-3 px-4 py-4">
      <span className="font-noontree text-[18px] font-bold leading-6" style={{ color: INK, letterSpacing: '-0.2px' }}>Got a coupon?</span>
      <Squircle as="div" cornerRadius={12} cornerSmoothing={1} data-id="cart-coupon-field" className="flex h-12 items-center bg-[#F5F6F8] px-3.5">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your coupon code here"
          className="min-w-0 flex-1 bg-transparent font-noontree text-[15px] font-medium outline-none placeholder:text-[rgba(2,6,12,0.4)]"
          style={{ color: INK }}
        />
        <button
          type="button"
          data-id="cart-coupon-apply"
          className="shrink-0 font-noontree text-[12px] font-normal"
          style={{ color: code.trim() ? BLUE : MUTED }}
        >
          APPLY
        </button>
      </Squircle>

      <div className="w-full border-t border-dashed" style={{ borderColor: '#F2F3F7' }} />

      <button type="button" data-id="cart-coupon-all" className="flex w-full items-center gap-2.5">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0">
          <rect width="31.9978" height="32" rx="15.9989" fill="#EFF7FF" />
          <path fillRule="evenodd" clipRule="evenodd" d="M15.9914 8.19385C14.9061 8.19385 13.9332 8.67462 13.2739 9.4329C12.2715 9.36293 11.2436 9.71104 10.4762 10.4785C9.70879 11.246 9.36074 12.2741 9.4307 13.2765C8.67259 13.9359 8.19196 14.9088 8.19196 15.9941C8.19196 17.0794 8.67254 18.0523 9.43059 18.7117C9.36055 19.7142 9.70859 20.7423 10.4761 21.5099C11.2435 22.2774 12.2716 22.6255 13.274 22.5555C13.9333 23.3137 14.9062 23.7944 15.9914 23.7944C17.0767 23.7944 18.0496 23.3136 18.7089 22.5554C19.7111 22.6252 20.7389 22.2771 21.5062 21.5097C22.2736 20.7423 22.6216 19.7144 22.5517 18.712C23.31 18.0527 23.7908 17.0796 23.7908 15.9941C23.7908 14.9089 23.3102 13.936 22.5522 13.2766C22.6222 12.2741 22.2742 11.246 21.5067 10.4784C20.7392 9.71085 19.7112 9.36275 18.7088 9.43279C18.0495 8.67457 17.0766 8.19385 15.9914 8.19385ZM18.8155 14.0173C19.0498 13.783 19.0498 13.4031 18.8155 13.1688C18.5812 12.9345 18.2013 12.9345 17.967 13.1689L13.1674 17.969C12.9331 18.2034 12.9331 18.5833 13.1674 18.8176C13.4017 19.0519 13.7816 19.0518 14.0159 18.8175L18.8155 14.0173ZM14.1916 13.2931C13.6945 13.2931 13.2916 13.6961 13.2916 14.1931C13.2916 14.6901 13.6945 15.0931 14.1916 15.0931C14.6887 15.0931 15.0915 14.6901 15.0915 14.1931C15.0915 13.6961 14.6887 13.2931 14.1916 13.2931ZM17.7913 16.8932C17.2942 16.8932 16.8914 17.2962 16.8914 17.7933C16.8914 18.2903 17.2942 18.6933 17.7913 18.6933C18.2884 18.6933 18.6913 18.2903 18.6913 17.7933C18.6913 17.2962 18.2884 16.8932 17.7913 16.8932Z" fill="#0057FF" />
        </svg>
        <span className="flex-1 text-left font-noontree text-[15px] font-semibold" style={{ color: INK }}>View all coupons &amp; offers</span>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m8 5 5 5-5 5" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </Card>
  )
}

/* ── Recommendation rail card (Figma "SKU") ───────────────────────────────
 * 134px column: a 134×174 image tile (Best Seller tag, wishlist, ATC) over a
 * 96px content block (2-line name, price row, express badge). */
const RECS = [
  { name: 'Apple Airpods Pro 2 Wireless Earbuds', image: recAirpods, imgSize: 122, price: '899', was: '1399', off: '33%', tag: 'Best Seller', wished: false, express: true },
  { name: 'Whirlpool 7 kg Magic Clean Washing Machine', image: recWasher, imgSize: 142, price: '899', was: '1399', off: '33%', tag: 'Best Seller', wished: true, express: true },
  { name: 'MAYNOS Suction Phone Case Mount Holder', image: recPhonecase, imgSize: 122, price: '899', was: '1399', off: '33%', tag: 'Best Seller', wished: false, express: true },
]

// "Steal Deals" tab — a different product set (distinct photos) shown when the
// tab flips over.
const RECS_STEAL = [
  { name: 'Sony PlayStation 5 Console Disc Edition', image: recPs5, imgSize: 132, price: '1,899', was: '2,499', off: '24%', tag: 'Steal Deal', wished: false, express: true },
  { name: 'BARE ANATOMY Anti Hair Fall Shampoo', image: bestPicks[1].image, imgSize: 122, price: '106', was: '145', off: '26%', tag: 'Steal Deal', wished: false, express: true },
  { name: 'Samsung Galaxy S25 Ultra AI Dual SIM', image: bestPicks[2].image, imgSize: 130, price: '2,799', was: '5,099', off: '45%', tag: 'Steal Deal', wished: false, express: true },
]

// Flip choreography — the outgoing set flips out edge-on (staggered), the
// incoming set flips in behind it. mode="wait" sequences them for a clean turn.
// staggerDirection -1 on both = cards flip in reverse order (last → first).
const RAIL_CONTAINER = {
  initial: {},
  enter: { transition: { staggerChildren: 0.07, delayChildren: 0.04, staggerDirection: -1 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
}
const RAIL_CARD = {
  initial: { rotateY: 90, opacity: 0 },
  enter: { rotateY: 0, opacity: 1, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
  exit: { rotateY: -90, opacity: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
}

// Instant swap (variation 2) — the set changes with no cross-fade or flip; the
// new cards appear immediately on a tab change (zero-duration, no stagger).
const RAIL_DISSOLVE_CONTAINER = {
  initial: {},
  enter: { transition: { duration: 0, staggerChildren: 0 } },
  exit: { transition: { duration: 0, staggerChildren: 0 } },
}
const RAIL_DISSOLVE_CARD = {
  initial: { opacity: 1 },
  enter: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 1, transition: { duration: 0 } },
}

// Slide + fade (variation 1) — the whole set slides in from the right / out to
// the left with a fade, no stagger, no flip. Applied to the container so the
// cards move together. mode="wait" sequences exit → enter.
const RAIL_SLIDE_CONTAINER = {
  initial: { x: 40, opacity: 0 },
  enter: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { x: -40, opacity: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
}

/* express "Today" badge — the combined yellow/black pill (Figma svg, 97×16). */
function ExpressToday() {
  return (
    <svg width="97" height="16" viewBox="0 0 97 16" fill="none" xmlns="http://www.w3.org/2000/svg" data-id="cart-rec-express" role="img" aria-label="express Today">
      <path d="M93.2956 3.192L92.0124 1.136C91.7454 0.708 91.4266 0.33 91.068 0H61.4725V16C69.0442 16 78.9074 15.996 85.6084 15.996C85.6422 15.984 85.6761 15.972 85.71 15.96C85.6801 15.962 85.6502 15.968 85.6183 15.97C87.5053 14.97 89.1292 13.474 90.3108 11.582L93.2956 6.8C93.9791 5.704 93.9791 4.288 93.2956 3.192Z" fill="white" />
      <path d="M94.9996 0H42.9136L32.9249 16H79.4431C83.217 16 85.7305 14.838 87.9996 12C90.2688 9.162 94.9996 0 94.9996 0Z" fill="black" />
      <path d="M79.425 13.2302L79.9192 11.9342C80.0487 11.9922 80.2838 12.0282 80.4951 12.0282C80.7999 12.0282 80.9992 11.9222 81.2004 11.6282L81.5531 11.0982L80.5429 5.36816H82.0931L82.6928 9.33016L85.066 5.36816H86.7098L82.5753 11.9942C81.9536 13.0082 81.318 13.3742 80.3795 13.3742C80.0507 13.3742 79.698 13.3262 79.429 13.2322L79.425 13.2302Z" fill="white" />
      <path d="M76.2371 5.22661C76.9883 5.22661 77.6698 5.55661 78.0464 6.12261L78.1998 5.36861H79.7022L78.4449 11.0626H76.9425L77.1079 10.3546C76.6257 10.9206 76.0857 11.2026 75.4042 11.2026C74.1131 11.2026 73.2423 10.3546 73.2423 8.84461C73.2423 7.12261 74.2984 5.22461 76.2371 5.22461V5.22661ZM76.4722 6.56061C75.4979 6.56061 74.8045 7.49261 74.8045 8.54061C74.8045 9.35461 75.3445 9.87261 76.0618 9.87261C76.5898 9.87261 77.06 9.59061 77.3649 9.20061L77.7993 7.22061C77.5522 6.84261 77.072 6.56061 76.4722 6.56061Z" fill="white" />
      <path d="M69.4266 5.2282C70.1778 5.2282 70.8592 5.5582 71.2358 6.1242L71.8694 3.2002H73.3718L71.6343 11.0642H70.1319L70.2973 10.3562C69.8151 10.9222 69.2751 11.2042 68.5937 11.2042C67.3025 11.2042 66.4318 10.3562 66.4318 8.8462C66.4318 7.1242 67.4878 5.2262 69.4266 5.2262V5.2282ZM69.6617 6.5602C68.6873 6.5602 67.9939 7.49219 67.9939 8.54019C67.9939 9.35419 68.5339 9.8722 69.2512 9.8722C69.7793 9.8722 70.2495 9.5902 70.5544 9.2002L70.9887 7.2202C70.7417 6.8422 70.2615 6.5602 69.6617 6.5602Z" fill="white" />
      <path d="M62.5166 11.2046C60.7074 11.2046 59.7091 10.1086 59.7091 8.62256C59.7091 6.84256 61.072 5.22656 62.9869 5.22656C64.7961 5.22656 65.8063 6.33456 65.8063 7.82056C65.8063 9.58856 64.4434 11.2046 62.5186 11.2046H62.5166ZM62.5744 9.87256C63.5727 9.87256 64.2541 8.91856 64.2541 7.89256C64.2541 7.06656 63.76 6.56056 62.939 6.56056C61.9288 6.56056 61.2474 7.52656 61.2474 8.54056C61.2474 9.36656 61.7415 9.87256 62.5744 9.87256Z" fill="white" />
      <path d="M56.8635 11.0642H55.1838L56.5806 4.67419H54.2911L54.6199 3.2002H60.8686L60.5518 4.67419H58.2623L56.8655 11.0642H56.8635Z" fill="white" />
      <path d="M0.000244141 8.00001C0.000244141 12.42 3.56891 16.002 7.97047 16C16.4627 15.998 30.2373 15.996 37.8389 15.996C41.6128 15.996 44.6893 15.21 46.6918 12C48.6943 8.79 52.5002 0 52.5002 0C52.5002 0 49.8241 6.91414e-06 46.6918 6.91414e-06H7.97047C3.56891 6.91414e-06 0.000244141 3.58201 0.000244141 8.00001Z" fill="#FEEE00" />
      <path d="M7.86265 10.976C8.55207 10.976 9.28732 10.764 9.82731 10.386L9.37898 9.338C9.03427 9.608 8.47037 9.75 7.97622 9.75C6.94208 9.75 6.44793 9.102 6.44793 8.618V8.476H10.5725C10.6184 8.3 10.6881 7.876 10.6881 7.534C10.6881 5.944 9.62008 5 8.1954 5C6.34631 5 4.98938 6.568 4.98938 8.416C4.98938 10.006 6.11517 10.972 7.86265 10.972V10.976ZM9.36702 7.442H6.60933C6.7249 6.818 7.31071 6.228 8.10374 6.228C8.97648 6.228 9.39094 6.746 9.39094 7.324C9.39094 7.348 9.39094 7.418 9.37898 7.442H9.36702Z" fill="black" />
      <path d="M16.1891 10.8336L14.8322 7.91155L17.291 5.14355H15.6132L14.085 6.88755L13.3258 5.14355H11.7397L12.993 7.91155L10.3967 10.8336H12.0625L13.7522 8.91355L14.615 10.8336H16.1891Z" fill="black" />
      <path d="M20.3023 10.976C22.1873 10.976 23.2214 9.06795 23.2214 7.35795C23.2214 5.84995 22.3706 5.00195 21.1193 5.00195C20.4538 5.00195 19.9118 5.28395 19.4415 5.84995L19.6029 5.14395H18.1444L16.4427 13.002H17.9013L18.5329 10.08C18.9016 10.646 19.5551 10.976 20.3023 10.976ZM20.0612 9.64395C19.4754 9.64395 19.0032 9.37195 18.7621 8.98395L19.1985 7.01595C19.4973 6.62795 19.9576 6.33195 20.4617 6.33195C21.1751 6.33195 21.6911 6.84995 21.6911 7.66395C21.6911 8.71195 21.0256 9.64395 20.0592 9.64395H20.0612Z" fill="black" />
      <path d="M25.0701 10.834L25.8751 7.09995C26.1959 6.72195 26.714 6.41595 27.254 6.41595C27.4831 6.41595 27.6903 6.46395 27.782 6.48595L28.1028 5.00195C27.2181 5.00195 26.6203 5.34395 26.1381 5.88595L26.2995 5.14395H24.841L23.6116 10.834H25.0701Z" fill="black" />
      <path d="M30.8432 10.976C31.5327 10.976 32.2679 10.764 32.8079 10.386L32.3596 9.338C32.0149 9.608 31.451 9.75 30.9568 9.75C29.9227 9.75 29.4285 9.102 29.4285 8.618V8.476H33.5531C33.5989 8.3 33.6687 7.876 33.6687 7.534C33.6687 5.944 32.6007 5 31.176 5C29.3269 5 27.97 6.568 27.97 8.416C27.97 10.006 29.0958 10.972 30.8432 10.972V10.976ZM32.3496 7.442H29.5919C29.7075 6.818 30.2933 6.228 31.0863 6.228C31.9591 6.228 32.3735 6.746 32.3735 7.324C32.3735 7.348 32.3735 7.418 32.3616 7.442H32.3496Z" fill="black" />
      <path d="M36.5177 10.976C38.034 10.976 38.9187 10.068 38.9187 8.984C38.9187 7.252 36.0913 7.406 36.0913 6.71C36.0913 6.416 36.3782 6.18 36.8963 6.18C37.5737 6.18 38.2632 6.568 38.5282 6.922L39.2873 5.92C38.7593 5.366 37.8746 5 36.9321 5C35.4497 5 34.6447 5.93 34.6447 6.92C34.6447 8.628 37.4721 8.44 37.4721 9.206C37.4721 9.524 37.1613 9.796 36.6671 9.796C35.8621 9.796 35.0591 9.302 34.7244 8.9L33.9094 9.948C34.5291 10.62 35.5075 10.974 36.5177 10.974V10.976Z" fill="black" />
      <path d="M41.9934 10.976C43.5097 10.976 44.3944 10.068 44.3944 8.984C44.3944 7.252 41.567 7.406 41.567 6.71C41.567 6.416 41.8539 6.18 42.372 6.18C43.0494 6.18 43.7389 6.568 44.0039 6.922L44.763 5.92C44.235 5.366 43.3503 5 42.4078 5C40.9254 5 40.1204 5.93 40.1204 6.92C40.1204 8.628 42.9478 8.44 42.9478 9.206C42.9478 9.524 42.637 9.796 42.1428 9.796C41.3378 9.796 40.5348 9.302 40.2001 8.9L39.3851 9.948C40.0048 10.62 40.9832 10.974 41.9934 10.974V10.976Z" fill="black" />
    </svg>
  )
}

function RecCard({ item }) {
  return (
    <div data-id="cart-rec-card" className="flex shrink-0 flex-col gap-1" style={{ width: 134 }}>
      {/* image tile — 134×174 */}
      <Squircle
        as="div"
        cornerRadius={10}
        cornerSmoothing={1}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ width: 134, height: 174, background: '#EAECF0', border: '1px solid #F2F3F7' }}
      >
        <img src={item.image} alt="" aria-hidden="true" style={{ width: item.imgSize ?? 122, height: item.imgSize ?? 122, objectFit: 'contain' }} />

        {/* Best Seller tag — top-left, notched corner */}
        {item.tag && (
          <div
            className="absolute left-0 top-0 flex items-center justify-center"
            style={{ height: 20, padding: '2px 6px', background: '#084541', boxShadow: '0 0 0 1px #EFF7FF', borderRadius: '0 0 10px 0' }}
          >
            <span className="font-noontree font-semibold" style={{ fontSize: 12, lineHeight: '14px', letterSpacing: '-0.12px', fontFeatureSettings: "'case' on", color: '#FFFFFF' }}>
              {item.tag}
            </span>
          </div>
        )}

        {/* wishlist heart — top-right, translucent chip */}
        <button
          type="button"
          aria-label="Wishlist"
          className="absolute flex items-center justify-center transition active:scale-90"
          style={{ right: 4, top: 4, width: 24, height: 24, background: 'rgba(255,255,255,0.2)', borderRadius: 9999 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M14 5.5C14 3.84315 12.6009 2.5 10.875 2.5C9.58459 2.5 8.47685 3.25085 8 4.32228C7.52315 3.25085 6.41541 2.5 5.125 2.5C3.39911 2.5 2 3.84315 2 5.5C2 10.3137 8 13.5 8 13.5C8 13.5 14 10.3137 14 5.5Z"
              fill={item.wished ? BLUE : 'white'}
              stroke={item.wished ? BLUE : '#344054'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* add to cart — bottom-right, 32×32 white squircle with a 1.2px blue
            border and a centred plus. Nested squircles: the outer blue squircle
            IS the border, the inner white one (inset 1.2px) holds the plus. */}
        <Squircle
          as="button"
          type="button"
          aria-label="Add to cart"
          cornerRadius={8}
          cornerSmoothing={1}
          className="absolute transition active:scale-90"
          style={{ right: 8, bottom: 6, width: 32, height: 32, background: '#0076FF', padding: 1.2 }}
        >
          <Squircle as="span" cornerRadius={6.8} cornerSmoothing={1} className="flex h-full w-full items-center justify-center bg-white">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2.5V13.5M13.5 8H2.5" stroke="#0076FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Squircle>
        </Squircle>
      </Squircle>

      {/* content — 96px block */}
      <div className="flex flex-col" style={{ padding: 4, gap: 8 }}>
        <span
          className="font-noontree font-medium"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 36, fontSize: 14, lineHeight: '18px', letterSpacing: '-0.14px', fontFeatureSettings: "'case' on", color: '#212121' }}
        >
          {item.name}
        </span>
        <div className="flex flex-col" style={{ gap: 2 }}>
          {/* price row */}
          <div className="flex flex-row items-center" style={{ gap: 3 }}>
            <span className="flex flex-row items-center font-noontree font-bold" style={{ gap: 2, fontSize: 15, lineHeight: '20px', letterSpacing: '0.07px', fontFeatureSettings: "'case' on", color: '#0E0E0E' }}>
              <Dirham className="align-[-0.04em]" />
              {item.price}
            </span>
            <span className="font-noontree font-normal" style={{ fontSize: 12, lineHeight: '14px', letterSpacing: '-0.12px', textDecorationLine: 'line-through', color: '#848391' }}>{item.was}</span>
            <span className="font-noontree font-semibold" style={{ fontSize: 12, lineHeight: '14px', letterSpacing: '-0.12px', color: '#329537' }}>{item.off}</span>
          </div>
          {/* express Today */}
          {item.express && <ExpressToday />}
        </div>
      </div>
    </div>
  )
}

// Shimmer block — a grey placeholder with a light highlight sweeping across it
// (background-position animation), giving a proper shimmer loader look.
const SHIMMER_BG = 'linear-gradient(90deg, #E4E7EE 25%, #F2F4F8 50%, #E4E7EE 75%)'
function Shimmer({ className = '', style }) {
  return (
    <motion.span
      className={`block ${className}`}
      style={{ ...style, backgroundImage: SHIMMER_BG, backgroundSize: '200% 100%' }}
      animate={{ backgroundPosition: ['150% 0', '-150% 0'] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
    />
  )
}

/* Skeleton placeholder for a rec card — shown while variation 4 "loads" the
 * new tab's items. Mirrors the 134-wide card: image tile + two text lines +
 * a price bar, each a sweeping shimmer. */
function RecCardSkeleton() {
  // Mirrors RecCard's exact box model (image 174 + 36px name block + price /
  // express rows) so the rail's height stays constant while loading.
  return (
    <div className="flex shrink-0 flex-col gap-1" style={{ width: 134 }}>
      <Shimmer className="rounded-[10px]" style={{ width: 134, height: 174, border: '1px solid #F2F3F7' }} />
      <div className="flex flex-col" style={{ padding: 4, gap: 8 }}>
        <div className="flex flex-col gap-1.5" style={{ height: 36 }}>
          <Shimmer className="rounded" style={{ height: 12, width: '100%' }} />
          <Shimmer className="rounded" style={{ height: 12, width: '68%' }} />
        </div>
        <div className="flex flex-col" style={{ gap: 2 }}>
          <Shimmer className="rounded" style={{ height: 20, width: '70%' }} />
          <Shimmer className="rounded" style={{ height: 16, width: 97 }} />
        </div>
      </div>
    </div>
  )
}

/* Variation-3 tab icons (currentColor so they follow the active/inactive tint). */
function WishHeartIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5.66128 0.106945C6.38247 -0.120662 7.20616 0.00297103 7.89135 0.607292C9.03786 1.61867 8.84535 3.31396 8.05386 4.61402C7.29202 5.86463 6.40243 6.70247 5.70079 7.22837C5.35005 7.49124 5.0455 7.67647 4.82704 7.79688C4.71791 7.85702 4.62993 7.90128 4.56822 7.93073C4.53749 7.94539 4.51278 7.95668 4.49561 7.96432C4.48726 7.96803 4.48025 7.97111 4.47536 7.97321C4.47308 7.97419 4.47091 7.97506 4.46944 7.97568L4.46746 7.97667H4.46647C4.39215 8.00749 4.30819 8.0079 4.23383 7.97716L4.23284 7.97667L4.23087 7.97568C4.22941 7.97506 4.22727 7.9742 4.22494 7.97321C4.22003 7.9711 4.21272 7.9681 4.2042 7.96432C4.18705 7.9567 4.16279 7.94536 4.13208 7.93073C4.07036 7.90131 3.98202 7.85752 3.87277 7.79737C3.65424 7.67704 3.34986 7.4917 2.99902 7.22886C2.2972 6.70305 1.40748 5.86525 0.645955 4.61402C-0.146614 3.31369 -0.338082 1.61863 0.808457 0.607292C1.49404 0.00315155 2.31832 -0.12122 3.03952 0.106451C3.56468 0.272316 4.02982 0.623289 4.34991 1.09776C4.67013 0.623419 5.13603 0.272816 5.66128 0.106945Z" fill="currentColor" />
    </svg>
  )
}
function DealIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g clipPath="url(#cart-deal-clip)">
        <path d="M9.98938 6.06063C9.9675 6.0225 9.9675 5.97437 9.98938 5.93625L10.3 5.39437C10.5131 5.02187 10.5419 4.58125 10.3775 4.18438C10.2131 3.78813 9.88125 3.49625 9.4675 3.38375L8.865 3.22C8.8225 3.20875 8.78875 3.175 8.7775 3.13188L8.61375 2.52938C8.50125 2.115 8.20938 1.78375 7.81313 1.61937C7.41688 1.45562 6.97563 1.48312 6.60313 1.69687L6.06125 2.0075C6.02313 2.02938 5.975 2.02938 5.93687 2.0075L5.395 1.69687C5.0225 1.48375 4.58125 1.45562 4.185 1.61937C3.78875 1.78375 3.49688 2.11563 3.38438 2.52938L3.22062 3.13188C3.20937 3.17438 3.17562 3.20813 3.1325 3.22L2.53 3.38375C2.11562 3.49625 1.78438 3.78813 1.62 4.18438C1.45562 4.58063 1.48375 5.02187 1.6975 5.39437L2.00812 5.93625C2.03 5.97437 2.03 6.0225 2.00812 6.06063L1.6975 6.6025C1.48437 6.975 1.45625 7.41563 1.62 7.8125C1.78438 8.20875 2.11625 8.50062 2.53 8.61312L3.1325 8.77687C3.175 8.78875 3.20875 8.82187 3.22062 8.865L3.38438 9.4675C3.49688 9.88187 3.78875 10.2131 4.185 10.3775C4.35562 10.4481 4.53438 10.4831 4.7125 10.4831C4.94813 10.4831 5.1825 10.4219 5.395 10.3L5.93687 9.98938C5.975 9.9675 6.02313 9.9675 6.06125 9.98938L6.60313 10.3C6.97563 10.5131 7.41625 10.5419 7.81313 10.3775C8.20938 10.2131 8.50125 9.88125 8.61375 9.4675L8.7775 8.865C8.78938 8.8225 8.8225 8.78875 8.86563 8.77687L9.46813 8.61312C9.8825 8.50062 10.2138 8.20875 10.3781 7.8125C10.5425 7.41625 10.5144 6.975 10.3006 6.6025L9.99 6.06063H9.98938ZM4.54187 4.54187C4.76125 4.3225 5.1175 4.3225 5.3375 4.54187C5.5575 4.76125 5.5575 5.1175 5.3375 5.3375C5.1175 5.5575 4.76187 5.55688 4.54187 5.3375C4.32187 5.11813 4.32187 4.76187 4.54187 4.54187ZM7.45813 7.45813C7.23875 7.6775 6.8825 7.6775 6.6625 7.45813C6.4425 7.23875 6.44312 6.8825 6.6625 6.6625C6.88187 6.4425 7.23813 6.44312 7.45813 6.6625C7.67813 6.88187 7.6775 7.23813 7.45813 7.45813ZM7.515 5.015L5.015 7.515C4.94187 7.58812 4.84562 7.625 4.75 7.625C4.65438 7.625 4.55813 7.58812 4.485 7.515C4.33875 7.36875 4.33875 7.13125 4.485 6.985L6.985 4.485C7.13125 4.33875 7.36875 4.33875 7.515 4.485C7.66125 4.63125 7.66125 4.86875 7.515 5.015Z" fill="currentColor" />
        <path d="M10.4375 0.5C10.2556 0.9925 9.8675 1.38062 9.375 1.5625C9.8675 1.74438 10.2556 2.1325 10.4375 2.625C10.6194 2.1325 11.0075 1.74438 11.5 1.5625C11.0075 1.38062 10.6194 0.9925 10.4375 0.5Z" fill="currentColor" />
        <path d="M1.5 9.5C1.32875 9.96312 0.963125 10.3287 0.5 10.5C0.963125 10.6713 1.32875 11.0369 1.5 11.5C1.67125 11.0369 2.03688 10.6713 2.5 10.5C2.03688 10.3287 1.67125 9.96312 1.5 9.5Z" fill="currentColor" />
      </g>
      <defs>
        <clipPath id="cart-deal-clip"><rect width="12" height="12" fill="white" /></clipPath>
      </defs>
    </svg>
  )
}

/* Variation-3 active-tab background — a raised curved plateau that dips into the
 * card at both ends (Figma "Union"). Gradient + unique ids are parameterised. */
function RecTabShape({ id, from, to, width = 207, height = 44, className = '', style }) {
  return (
    <svg width={width} height={height} viewBox="0 0 207 36" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <g filter={`url(#${id}-shadow)`}>
        <path d="M147.806 0C153.853 0 156.877 0.000213265 159.534 1.02246C161.295 1.70036 162.924 2.69811 164.339 3.96875C166.473 5.88486 167.9 8.61506 170.754 14.0742C174.899 22.0028 176.972 25.9673 180.056 28.792C182.103 30.666 184.455 32.1566 187.005 33.1973C190.848 34.7658 197.683 35.7381 206.461 36.0054H-1.53929C7.23915 35.7381 12.0055 34.7659 15.8491 33.1973C18.3991 32.1566 20.7512 30.666 22.7972 28.792C25.8812 25.9673 27.9535 22.0026 32.0989 14.0742C34.9532 8.61506 36.3807 5.88486 38.5149 3.96875C39.9301 2.69816 41.5583 1.70034 43.3202 1.02246C45.977 0.000295639 49.0003 5.41098e-10 55.0469 0H147.806Z" fill={`url(#${id}-grad)`} />
      </g>
      <defs>
        <filter id={`${id}-shadow`} x="-1.54" y="0" width="208" height="40.01" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="bg" />
          <feBlend mode="normal" in="SourceGraphic" in2="bg" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.39 0" />
          <feBlend mode="normal" in2="shape" result="innerShadow" />
        </filter>
        <linearGradient id={`${id}-grad`} x1="102.461" y1="36.0054" x2="102.461" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Noon Recommendation (Figma "Product Carousel") ───────────────────────
 * A borderless white card with no padding of its own — each of the three
 * sections (heading / tabs / product rail) carries its own padding per spec. */
function Recommendation({ variant = 1 }) {
  const [tab, setTab] = useState('wishlist')
  // variations 1 & 4: on a tab switch, show a skeleton loader instead of
  // animating the cards, then reveal the new tab's items (1 = 400ms, 4 = 1s)
  const [loading, setLoading] = useState(false)
  const loadTimer = useRef(null)
  useEffect(() => () => clearTimeout(loadTimer.current), [])
  const selectTab = (id) => {
    if (id === tab) return
    setTab(id)
    if (variant === 1 || variant === 4) {
      setLoading(true)
      clearTimeout(loadTimer.current)
      loadTimer.current = setTimeout(() => setLoading(false), variant === 1 ? 400 : 1000)
    }
  }
  const TABS = [
    { id: 'wishlist', label: 'Wishlisted item', icon: <WishHeartIcon />, accent: '#0F61FF' },
    { id: 'steal', label: 'Steal deals', icon: <DealIcon />, accent: '#9C3FBF' },
  ]
  return (
    <Card dataId="cart-recommendation" className="mx-4 border border-[#F2F3F7]">
      {/* 1 — heading (padding 16 12 4). Only variation 1 shows it; variations 2
          and 3 let the tabs act as the header. */}
      {variant === 1 && (
        <div data-id="cart-rec-header" style={{ padding: '16px 12px 4px' }}>
          <span className="font-figtree font-bold" style={{ fontSize: 17, lineHeight: '22px', letterSpacing: '-0.02em', fontFeatureSettings: "'ss04' on", color: '#262A33' }}>
            Recommendations
          </span>
        </div>
      )}

      {/* 2 — tabs. 4 = raised curved-plateau tabs (icon + sliding shape);
          3 = iOS segmented pill control; 2 = underline; 1 (default) = pills. */}
      {variant === 4 ? (
        <div data-id="cart-rec-tabs" className="relative flex flex-row items-end" style={{ height: 52 }}>
          {TABS.map((t) => {
            const active = t.id === tab
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTab(t.id)}
                className="relative flex flex-1 items-center justify-center gap-1.5"
                // paddingTop nudges the icon+label down so they sit lower on the
                // plateau shape (which starts at top:8)
                style={{ height: 52, paddingTop: 6, paddingRight: 6, color: active ? t.accent : '#666D85', transition: 'color 200ms' }}
              >
                {/* active-tab background shape — slides between tabs via layoutId */}
                {active && (
                  <motion.div
                    layoutId="cart-rec-tab-shape"
                    className="pointer-events-none absolute"
                    // centre the shape on the tab's TEXT: left:50% is the button
                    // centre; marginLeft −(width/2) centres the over-wide shape,
                    // and −3 more offsets the text left-shift from the 6px right pad
                    style={{ top: 8, left: '50%', width: t.id === 'wishlist' ? 208 : 200, marginLeft: (t.id === 'wishlist' ? -104 : -100) - 3 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 42 }}
                  >
                    {t.id === 'wishlist' ? (
                      <RecTabShape id="rec-tab-wish" from="#D7EEFE" to="#C3E6FE" width={208} />
                    ) : (
                      <RecTabShape id="rec-tab-steal" from="#FBF0FE" to="#F6DBFF" width={200} />
                    )}
                  </motion.div>
                )}
                <span className="relative z-10">{t.icon}</span>
                <span className="relative z-10 font-noontree font-semibold" style={{ fontSize: 13, letterSpacing: '-0.1px' }}>{t.label}</span>
              </button>
            )
          })}
        </div>
      ) : variant === 3 ? (
        <div data-id="cart-rec-tabs" style={{ padding: '12px 12px 8px' }}>
          {/* iOS-style segmented control — white thumb slides under the active tab */}
          <div
            className="flex flex-row items-center"
            style={{ height: 40, padding: 4, background: '#F9F9FB', boxShadow: 'inset 0px 1px 4px rgba(36, 36, 36, 0.04)', borderRadius: 9999 }}
          >
            {TABS.map((t) => {
              const active = t.id === tab
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className="relative flex flex-1 items-center justify-center"
                  style={{ height: 32 }}
                >
                  {active && (
                    <motion.span
                      layoutId="cart-rec-seg-thumb"
                      className="absolute inset-0"
                      style={{ background: '#FFFFFF', border: '1px solid #FFFFFF', boxShadow: '0px 1px 6px rgba(34, 34, 34, 0.06)', borderRadius: 9999 }}
                      transition={{ type: 'spring', stiffness: 480, damping: 42 }}
                    />
                  )}
                  <span
                    className="relative z-10 font-noontree font-semibold"
                    style={{ fontSize: 12, lineHeight: '18px', letterSpacing: '-0.1px', color: active ? '#1D2539' : '#666D85', transition: 'color 200ms' }}
                  >
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : variant === 2 ? (
        <div
          data-id="cart-rec-tabs"
          className="flex flex-row items-center justify-center"
          style={{ padding: '12px 4px 6px', borderBottom: '1px solid #EAECF0' }}
        >
          {TABS.map((t) => {
            const active = t.id === tab
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="relative flex flex-1 items-center justify-center"
                style={{ padding: '8px 10px', height: 32 }}
              >
                <span className="font-noontree font-semibold" style={{ fontSize: 14, lineHeight: '20px', letterSpacing: '-0.1px', color: active ? '#1D2539' : '#666D85', transition: 'color 200ms' }}>
                  {t.label}
                </span>
                {active && (
                  <motion.span
                    layoutId="cart-rec-underline"
                    className="absolute"
                    style={{ bottom: -6, left: 0, right: 0, marginInline: 'auto', width: 116, height: 3, background: '#1D2539', borderRadius: '2px 2px 0 0' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div data-id="cart-rec-tabs" className="flex flex-row items-center" style={{ padding: '8px 12px', gap: 6 }}>
          {TABS.map((t) => {
            const active = t.id === tab
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTab(t.id)}
                className="flex items-center justify-center font-noontree font-semibold transition"
                style={{
                  boxSizing: 'border-box',
                  height: 32,
                  padding: '8px 20px',
                  borderRadius: 9999,
                  fontSize: 12,
                  lineHeight: '16px',
                  background: active ? '#EBF4FF' : '#FFFFFF',
                  border: active ? '1px solid #0F7EFF' : '1px solid #EAECF0',
                  color: active ? '#0F61FF' : '#1D2539',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      )}

      {/* 3 — product rail (gap 12). Variation 2 swaps the cards instantly on a
          tab change; other variations flip the cards. In variation 4 the rail
          carries a soft top gradient tinted to the active tab, its rounded top
          corner on the active tab's side so it reads as one shape with the tab. */}
      <div
        data-id="cart-rec-rail"
        className="scrollbar-hide overflow-x-auto"
        style={{
          padding: `${variant === 3 ? 12 : variant === 1 ? 16 : variant === 4 ? 14 : 20}px 12px 12px`,
          perspective: variant === 2 ? undefined : 1200,
          // marginTop:-1 tucks the rail under the plateau's bottom edge so no
          // hairline of the white card shows in the seam
          ...(variant === 4
            ? tab === 'steal'
              ? { marginTop: -1, borderRadius: '12px 0 0 0', background: 'linear-gradient(0deg, #FFF 63.87%, #FBF0FE 100%)' }
              : { marginTop: -1, borderRadius: '0 12px 0 0', background: 'linear-gradient(0deg, #FFF 74.9%, #D7EEFE 100%)' }
            : {}),
        }}
      >
        {variant === 1 || variant === 4 ? (
          // no flip — skeleton loader on switch (400ms for v1, 1s for v4), then
          // the new tab's cards
          <div className="flex flex-row" style={{ gap: 12 }}>
            {loading
              ? [0, 1, 2].map((i) => <RecCardSkeleton key={i} />)
              : (tab === 'wishlist' ? RECS : RECS_STEAL).map((item, i) => <RecCard key={i} item={item} />)}
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              className="flex flex-row"
              style={{ gap: 12, transformStyle: variant === 2 || variant === 1 ? undefined : 'preserve-3d' }}
              // flip direction follows the tab move: → steal flips L→R, →
              // wishlist flips R→L (staggerDirection +1 / -1)
              variants={
                variant === 2
                  ? RAIL_DISSOLVE_CONTAINER
                  : variant === 1
                    ? RAIL_SLIDE_CONTAINER
                    : {
                        initial: {},
                        enter: { transition: { staggerChildren: 0.07, delayChildren: 0.04, staggerDirection: tab === 'steal' ? 1 : -1 } },
                        exit: { transition: { staggerChildren: 0.05, staggerDirection: tab === 'steal' ? 1 : -1 } },
                      }
              }
              initial="initial"
              animate="enter"
              exit="exit"
            >
              {(tab === 'wishlist' ? RECS : RECS_STEAL).map((item, i) => (
                <motion.div
                  key={i}
                  // rotateY sign mirrors with the move direction so → steal and
                  // → wishlist spin opposite ways (not just reverse order)
                  variants={
                    variant === 2 || variant === 1
                      ? RAIL_DISSOLVE_CARD
                      : {
                          // variation 3 flips faster (350ms, expo-out); others 250ms
                          initial: { rotateY: 90 * (tab === 'steal' ? 1 : -1), opacity: 0 },
                          enter: { rotateY: 0, opacity: 1, transition: { duration: variant === 3 ? 0.35 : 0.25, ease: variant === 3 ? [0.16, 1, 0.3, 1] : [0.22, 1, 0.36, 1] } },
                          exit: { rotateY: -90 * (tab === 'steal' ? 1 : -1), opacity: 0, transition: { duration: variant === 3 ? 0.35 : 0.25, ease: variant === 3 ? [0.16, 1, 0.3, 1] : [0.22, 1, 0.36, 1] } },
                        }
                  }
                  style={variant === 2 || variant === 1 ? undefined : { transformStyle: 'preserve-3d', transformOrigin: 'center' }}
                >
                  <RecCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </Card>
  )
}

/* ── Savings & benefits ───────────────────────────────────────────────────
 * Three installment tiles (tabby / tamara / bank) then two noon-One cashback
 * rows. Brand logos are approximated with wordmark text on brand colours. */
function InstallmentTile({ children, sub }) {
  return (
    <Squircle as="button" type="button" cornerRadius={12} cornerSmoothing={1} className="flex flex-1 flex-col gap-1.5 border p-2.5 text-left" style={{ borderColor: HAIRLINE }}>
      <div className="flex items-center justify-between">
        {children}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m6 3.5 4 4.5-4 4.5" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="font-noontree text-[12px] font-semibold" style={{ color: INK }}>
        <Price amount="375" /> * 4
      </span>
      {sub && <span className="font-noontree text-[11px] font-medium" style={{ color: '#0E8F53' }}>{sub}</span>}
    </Squircle>
  )
}

function CashbackRow() {
  return (
    <Squircle as="div" cornerRadius={12} cornerSmoothing={1} className="flex items-center gap-3 border p-2.5" style={{ borderColor: HAIRLINE }}>
      <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-[6px] bg-[#F5F6F8]">
        <NoonOneLogo className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1 font-noontree text-[13px] font-medium leading-[17px]" style={{ color: INK }}>
        Earn <Price amount="105" className="font-bold" /> cashback with the noon One credit card.
      </span>
      <button type="button" className="flex shrink-0 items-center gap-0.5 font-noontree text-[14px] font-bold" style={{ color: BLUE }}>
        Apply
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m6 3.5 4 4.5-4 4.5" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </Squircle>
  )
}

function SavingsBenefits() {
  return (
    <Card dataId="cart-savings" className="mx-4 px-4 py-4">
      <span className="font-noontree text-[18px] font-bold leading-6" style={{ color: INK, letterSpacing: '-0.2px' }}>Savings &amp; benefits</span>
      <div className="mt-3 flex gap-2">
        <InstallmentTile sub="0% Installments">
          <span className="rounded-[6px] bg-[#3FE0A6] px-1.5 py-0.5 font-noontree text-[12px] font-black" style={{ color: '#04231A' }}>tabby</span>
        </InstallmentTile>
        <InstallmentTile sub="0% Installments">
          <span className="rounded-[6px] px-1.5 py-0.5 font-noontree text-[12px] font-black" style={{ background: 'linear-gradient(90deg,#F8C8DC,#CDE3FF)', color: '#1D2539' }}>tamara</span>
        </InstallmentTile>
        <InstallmentTile>
          <span className="flex items-center gap-1">
            <svg width="20" height="14" viewBox="0 0 24 16" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="22" height="14" rx="2.5" fill="#E4EEFF" />
              <rect x="1" y="4" width="22" height="2.4" fill={BLUE} />
              <circle cx="18" cy="10.5" r="2.6" fill="none" stroke={BLUE} strokeWidth="1.2" />
            </svg>
          </span>
        </InstallmentTile>
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        <CashbackRow />
        <CashbackRow />
      </div>
    </Card>
  )
}

/* ── "saved" strip — left-aligned green banner shape riding above the sheet ──
 * The 112×24 savings label (dirham + amount + "saved!" + one-logo) is pinned at
 * left 12 / top 4 over the pale-green banner shape, per the Figma spec. */
function SavedStrip() {
  const savedText = { color: '#1F7A74', letterSpacing: '-0.14px', fontFeatureSettings: "'case' on" }
  return (
    <div data-id="cart-saved" className="relative h-[32px]">
      {/* pale-green banner shape — relatively positioned, top-aligned, 240px wide
          (its 48px height overflows the 32px strip, tucking under the sheet) */}
      <svg width="239" height="48" viewBox="0 0 239 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block h-auto w-[240px]" aria-hidden="true">
        <path d="M0 28C0 14.8007 0 8.20101 4.10051 4.10051C8.20101 0 14.8007 0 28 0H109.965C118.609 0 122.932 0 126.123 1.47359C129.315 2.94718 133.196 7.5021 140.958 16.6119C145.141 21.521 150.299 26.178 156.046 28.4121C171.129 34.2749 212.149 36.9635 239 32.471V48H0V28Z" fill="#E7FBF3" />
      </svg>
      {/* savings label */}
      <div
        data-id="cart-saved-label"
        className="absolute flex flex-row items-center justify-center"
        style={{ left: 12, top: 4, width: 112, height: 24, borderRadius: 5, padding: '2px 4px', gap: 8 }}
      >
        {/* amount + "saved!" */}
        <div className="flex flex-row items-center" style={{ gap: 2, height: 18 }}>
          <span className="flex flex-row items-center font-noontree text-[14px] font-semibold leading-[18px]" style={savedText}>
            <Dirham className="mr-[1px] align-[-0.04em]" />
            130
          </span>
          <span className="font-noontree text-[14px] font-normal leading-[18px]" style={savedText}>saved!</span>
        </div>
        {/* one logo */}
        <span className="flex items-center justify-center" style={{ width: 20, height: 20 }}>
          <NoonOneLogo className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
}

/* ── Checkout bar — total + primary CTA (sits above the bottom nav) ───────── */
function CheckoutBar() {
  return (
    <Squircle
      as="div"
      data-id="cart-checkout"
      cornerRadius={12}
      bottomLeftCornerRadius={0}
      bottomRightCornerRadius={0}
      cornerSmoothing={1}
      className="flex h-[72px] items-center gap-4 bg-white px-4"
    >
      <div className="flex flex-col">
        <span className="font-noontree text-[13px] font-medium" style={{ color: MUTED }}>Total</span>
        <span className="w-fit border-b-2 border-dotted font-noontree text-[20px] font-bold leading-7" style={{ color: INK, borderColor: HAIRLINE }}>
          <Price amount="1,760.00" />
        </span>
      </div>
      <Squircle
        as="button"
        type="button"
        data-id="cart-checkout-cta"
        cornerRadius={14}
        cornerSmoothing={1}
        className="flex h-12 flex-1 items-center justify-center font-noontree text-[17px] font-bold text-white transition active:scale-[0.98]"
        style={{ background: BLUE }}
      >
        Checkout
      </Squircle>
    </Squircle>
  )
}

// Cart variations — switched via the floating tabs (same control the other
// experiments use). They differ in the recommendation-rail tab style:
// 1 = pills, 2 = underline, 3 = segmented pill control, 4 = curved plateau.
const VARIANTS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
]

/**
 * Cart experiment — the noon cart screen: free-gift unlock, coupon entry, a
 * "Noon Recommendation" rail, a savings/benefits block, and a sticky
 * checkout bar over the bottom nav.
 */
export default function CartExperiment() {
  const navigate = useNavigate()
  const [variant, setVariant] = useState(1)
  // Hide the bottom nav while scrolling down, reveal it on scroll up / at top.
  const [navHidden, setNavHidden] = useState(false)
  const lastY = useRef(0)
  const onScroll = (e) => {
    const y = e.currentTarget.scrollTop
    const goingDown = y > lastY.current
    if (y <= 8) setNavHidden(false)
    else if (goingDown && y > 40) setNavHidden(true)
    else if (!goingDown) setNavHidden(false)
    lastY.current = y
  }
  return (
    <AppShell className="bg-white">
      <main
        data-id="cart-main"
        data-variant={variant}
        onScroll={onScroll}
        className="scrollbar-hide flex-1 overflow-y-auto"
        style={{
          background: PAGE_BG,
          // clear the fixed footer (saved strip + checkout bar) and the fixed
          // bottom nav (64px row + safe area) below it
          paddingBottom: 'calc(190px + var(--sab, 0px) + var(--sbp, 0px))',
        }}
      >
        {/* sticky header — pins to the top and carries the page bg up through
            the status-bar inset so the status bar sits on the same colour */}
        <div
          data-id="cart-header-sticky"
          className="sticky top-0 z-40"
          style={{ background: PAGE_BG, paddingTop: 'var(--sat, 0px)' }}
        >
          <CartHeader />
        </div>
        <div className="flex flex-col gap-3 pt-3">
          <FreeGifts />
          <CouponCard />
          <Recommendation variant={variant} />
          <SavingsBenefits />
        </div>
      </main>

      {/* Fixed footer — saved banner then checkout sheet, stacked in flow above
          the bottom nav. Stacking order (front → back): bottom nav (z-30) >
          checkout (z-1, casts the upward shadow) > saved banner. */}
      <div
        data-id="cart-footer"
        className="fixed bottom-0 left-1/2 z-20 w-full max-w-md"
        style={{
          // only the nav ROW (64px) is reserved; the bottom safe-area is filled
          // by the checkout's own white padding below, so no gray shows when the
          // footer slides down over the hidden nav
          paddingBottom: '64px',
          // when the nav hides, the saved strip + checkout settle DOWN into the
          // nav's row (64px) so they stay sticky at the bottom — they never leave
          // the screen; only the nav itself slides off
          transform: `translateX(-50%) translateY(${navHidden ? '64px' : '0'})`,
          transition: 'transform 300ms cubic-bezier(0.4, 0, 1, 1)',
        }}
      >
        <SavedStrip />
        {/* white extends through the bottom safe-area so the home-indicator
            region under the checkout bar is white, never the grey page bg */}
        <div className="relative z-[1] bg-white" style={{ boxShadow: '0 -4px 20px 0 rgba(0, 0, 0, 0.08)', paddingBottom: 'calc(var(--sab, 0px) + var(--sbp, 0px))' }}>
          <CheckoutBar />
        </div>
      </div>

      <BottomNav
        dataId="mp-bottom-nav"
        order={['home', 'categories', 'offers', 'account', 'cart']}
        initialActive="cart"
        badges={{ cart: '2' }}
        hidden={navHidden}
      />

      {/* Back to experiments — floating pill, above the footer */}
      <button
        type="button"
        data-id="cart-back"
        onClick={() => navigate('/')}
        aria-label="Back to experiments"
        className="absolute right-3 z-[70] flex h-11 w-11 items-center justify-center rounded-full bg-[#1D2539] text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:scale-95"
        style={{ bottom: 'calc(210px + var(--sab, 0px) + var(--sbp, 0px))' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Floating variation switcher (1 / 2 / 3) — sits above the footer, left */}
      <FloatingTabs
        dataId="cart-variant-tabs"
        tabs={VARIANTS}
        value={variant}
        onChange={setVariant}
        offset="calc(172px + var(--sab, 0px) + var(--sbp, 0px))"
      />
    </AppShell>
  )
}
