// The per-marketplace header under the (constant) switcher. Layout:
//   ┌ group ───────────────────────────────────┐
//   │ ⚡ delivery promise                        │  ⟶  wishlist (centred to the
//   │ Home - address …                  ⌄        │      whole group, right)
//   └────────────────────────────────────────────┘
//   [ full-bleed banner (optional) ]
//   [ search ]
// Everything is theme-driven (marketplaceViews.js) and animates on switch:
// delivery / location / placeholder slide-swap, banner expands, colours tween.
import { motion, AnimatePresence } from 'framer-motion'
import { springs } from '../../../utils/motion'

const SLIDE = { type: 'spring', stiffness: 460, damping: 40, mass: 0.7 }
const TINT = { duration: 0.4 }

// A clip whose content slides up-and-out / up-and-in on key change. Uses a
// 1-cell grid so old + new stack (no absolute positioning) and the container
// still sizes to its content — content-width, or flex via containerClassName.
function Slide({ k, className = '', containerClassName = '', children }) {
  return (
    <span className={`grid overflow-hidden ${containerClassName}`}>
      <AnimatePresence initial={false}>
        <motion.span
          key={k}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-110%', opacity: 0 }}
          transition={SLIDE}
          className={`col-start-1 row-start-1 block ${className}`}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// --- odometer digit reel for the delivery time ----------------------------
const CELL = 28 // px — matches the delivery line height
const REEL = { type: 'spring', stiffness: 300, damping: 30, mass: 0.85 }

function Digit({ d }) {
  return (
    <span className="relative inline-block overflow-hidden align-top" style={{ height: CELL, width: '0.6em' }}>
      <motion.span className="flex flex-col" animate={{ y: `${-d * 10}%` }} transition={REEL}>
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="flex items-center justify-center" style={{ height: CELL }}>
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

// Each digit rolls to its target; keying includes the length so a change in
// digit count remounts cleanly rather than mis-mapping columns.
function NumberReel({ value }) {
  const s = String(value)
  return (
    <span className="inline-flex tabular-nums">
      {s.split('').map((ch, i) => (
        /\d/.test(ch) ? <Digit key={`${s.length}-${i}`} d={Number(ch)} /> : <span key={i}>{ch}</span>
      ))}
    </span>
  )
}

function Bolt({ color }) {
  return (
    <motion.svg width="22" height="22" viewBox="0 0 24 24" animate={{ color }} transition={TINT} style={{ color }} className="shrink-0" aria-hidden="true">
      <path d="M13 2 4 13.5h5.2L8 22l11-12.5h-5.5L15 2z" fill="currentColor" />
    </motion.svg>
  )
}

function DeliveryRow({ view, mins }) {
  const d = view.delivery
  const numeric = d.mins != null
  // Slide-key is the unit (numeric) or the text (non-numeric): the whole line
  // slide-swaps when the unit changes (e.g. across marketplaces), while within
  // the same unit only the reel rolls (e.g. on an address change).
  return (
    <div data-id="addr-delivery" className="flex items-center gap-1.5">
      <Bolt color={d.bolt} />
      <Slide k={numeric ? d.unit : d.text} className="whitespace-nowrap font-noontree text-[21px] font-bold leading-[28px] tracking-[-0.2px]">
        <motion.span animate={{ color: view.onTheme }} transition={TINT} className="inline-flex items-center" style={{ color: view.onTheme }}>
          {numeric ? (
            <>
              <NumberReel value={mins} />
              <span className="ml-1">{d.unit}</span>
            </>
          ) : (
            d.text
          )}
        </motion.span>
      </Slide>
    </div>
  )
}

function LocationButton({ view, label, line, revision, onClick }) {
  return (
    <button type="button" data-id="addr-location" onClick={onClick} className="flex w-full min-w-0 items-center gap-1 text-left">
      <Slide
        k={`${revision}|${view.sep}`}
        containerClassName="min-w-0 flex-1"
        className="truncate font-noontree text-[15px] leading-[22px]"
      >
        <motion.span animate={{ color: view.onTheme }} transition={TINT} className="font-semibold" style={{ color: view.onTheme }}>
          {label} {view.sep}{' '}
        </motion.span>
        <motion.span animate={{ color: view.muted }} transition={TINT} style={{ color: view.muted }}>
          {line}
        </motion.span>
      </Slide>
      <motion.svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
        animate={{ color: view.onTheme }}
        transition={TINT}
        style={{ color: view.onTheme }}
      >
        <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </button>
  )
}

function Wishlist({ show, onWishlist }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.button
          key="wishlist"
          type="button"
          data-id="addr-wishlist"
          aria-label="Wishlist"
          onClick={onWishlist}
          initial={{ opacity: 0, scale: 0.8, width: 0 }}
          animate={{ opacity: 1, scale: 1, width: 36 }}
          exit={{ opacity: 0, scale: 0.8, width: 0 }}
          transition={springs.snappy}
          className="flex h-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
            <path d="M10 17.5S2.5 13 2.5 7.8A4.3 4.3 0 0 1 10 5a4.3 4.3 0 0 1 7.5 2.8C17.5 13 10 17.5 10 17.5Z" fill="#035794" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

function Banner({ banner }) {
  return (
    <AnimatePresence initial={false}>
      {banner && (
        <motion.div
          key="addr-banner"
          data-id="addr-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
          className="-mx-4 overflow-hidden"
        >
          {/* full-bleed, no corner radius */}
          <div className="mt-3 flex items-center gap-2 bg-[#FBF1B8] px-4 py-3">
            <p className="flex-1 font-noontree text-[15px] leading-[20px] text-[#1B282C]">
              {banner.text}{' '}
              <button type="button" className="font-bold underline underline-offset-2">
                {banner.action}
              </button>
            </p>
            <button type="button" aria-label="Dismiss" className="shrink-0 text-[#1B282C]">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SearchRow({ view }) {
  const { search } = view
  return (
    <div data-id="addr-search" className="flex items-center gap-3">
      <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-[12px] border border-[#D7DAE3] bg-white px-3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="9" cy="9" r="6" stroke="#1D2539" strokeWidth="1.6" />
          <path d="m14 14 3 3" stroke="#1D2539" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <Slide
          k={search.placeholder}
          containerClassName="min-w-0 flex-1"
          className="truncate font-noontree text-[15px] font-medium text-[#5C667E]"
        >
          {search.placeholder}
        </Slide>
        <AnimatePresence initial={false}>
          {search.trailing === 'camera' && (
            <motion.span
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex shrink-0 items-center gap-3"
            >
              <span className="h-6 w-px bg-[#D9DADB]" />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
                <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h1.2l.9-1.5h6.8L15.3 6h.2A1.5 1.5 0 0 1 17 7.5V15A1.5 1.5 0 0 1 15.5 16.5h-11A1.5 1.5 0 0 1 3 15V7.5Z" stroke="#1F1D1D" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="10" cy="11" r="2.6" stroke="#1F1D1D" strokeWidth="1.5" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {search.trailing === 'magic' && (
          // clip-reveal: animate a fixed width on an overflow-hidden wrapper so
          // the fixed-width button inside never reflows. A monotonic tween (no
          // spring overshoot) keeps the search box's flex re-expansion smooth.
          <motion.div
            key="magic"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 124, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 0.61, 0.36, 1] }}
            className="h-12 shrink-0 overflow-hidden"
          >
            <button
              type="button"
              data-id="addr-magic-list"
              className="flex h-12 w-[124px] flex-col items-center justify-center rounded-[12px] border border-[#EAD9F2] bg-white leading-tight"
            >
              <span className="whitespace-nowrap font-noontree text-[11px] text-[#5C667E]">Shop with</span>
              <span className="whitespace-nowrap font-noontree text-[15px] font-bold text-[#9A1FB0]">Magic List</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MarketHeader({ view, label, line, revision, closer = false, onLocation, onWishlist }) {
  // a nearer address (closer) shows the reduced delivery time
  const mins = closer && view.delivery.minsClose != null ? view.delivery.minsClose : view.delivery.mins
  return (
    <div data-id="addr-market-header" className="px-4 pb-2 pt-1">
      {/* group: delivery + location (2px gap) on the left, wishlist centred on the right */}
      <div data-id="addr-delivery-location" className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <DeliveryRow view={view} mins={mins} />
          <LocationButton view={view} label={label} line={line} revision={revision} onClick={onLocation} />
        </div>
        <Wishlist show={view.wishlist !== false} onWishlist={onWishlist} />
      </div>

      <Banner banner={view.banner} />

      <div className="pt-3">
        <SearchRow view={view} />
      </div>
    </div>
  )
}
