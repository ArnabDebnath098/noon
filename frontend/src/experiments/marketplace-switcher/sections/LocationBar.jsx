// Section 2 — location (left) + wishlist heart (right).
// The label and line each slide-swap (framer) when the address changes; pass a
// `revision` that changes per address so they animate even if the text repeats.
// Pass `marketplace` to lead the row with the selected marketplace's chip
// (accent-filled circle, wishlist-sized) followed by a divider.
import { motion, AnimatePresence } from 'framer-motion'
import homeIcon from '../../../assets/marketplace/home.svg'
import MarketplaceMark from './MarketplaceMark'

const SLIDE = { type: 'spring', stiffness: 460, damping: 40, mass: 0.7 }

// A fixed-height clip whose text slides up-and-out / up-and-in on key change.
// An invisible static copy sizes the clip to the text itself (the animated
// copies are absolute), so trailing elements like the chevron hug the text
// instead of being pushed to the row's far edge.
function SlideText({ text, k, className, height }) {
  return (
    <span className="relative block min-w-0 max-w-full overflow-hidden" style={{ height }}>
      <span aria-hidden="true" className={`invisible block ${className}`} style={{ lineHeight: `${height}px` }}>
        {text}
      </span>
      <AnimatePresence initial={false}>
        <motion.span
          key={k}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={SLIDE}
          className={`absolute inset-0 flex items-center ${className}`}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function LocationBar({ label, line, onClick, onWishlist, marketplace, onMarketplace, revision = '' }) {
  // The location area is a button only when an onClick is supplied (e.g. the
  // address-selection experiment opens its sheet); otherwise it's a plain div.
  const Info = onClick ? 'button' : 'div'
  // same for the marketplace chip — clickable when onMarketplace is supplied
  const Chip = onMarketplace ? 'button' : 'span'
  return (
    <div data-id="mp-location" className="flex items-center gap-2 px-5 py-1.5">
      {marketplace && (
        <>
          <Chip
            type={onMarketplace ? 'button' : undefined}
            onClick={onMarketplace}
            aria-label={onMarketplace ? 'Switch marketplace' : undefined}
            data-id="mp-location-marketplace"
            style={{ background: marketplace.accent }}
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform active:scale-95"
          >
            <MarketplaceMark
              m={marketplace}
              white={!marketplace.lightAccent}
              active
              size={48}
            />
          </Chip>
          <span aria-hidden="true" className="h-4 w-px shrink-0 bg-[#D9DADB]" />
        </>
      )}
      <Info
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        data-id="mp-location-info"
        className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
      >
        <div data-id="mp-location-label" className="flex items-center gap-1.5">
          <img src={homeIcon} alt="" className="h-[18px] w-auto" aria-hidden="true" />
          <SlideText
            k={`${revision}|${label}`}
            text={`${label} -`}
            height={22}
            className="whitespace-nowrap font-noontree text-[16px] font-semibold text-black"
          />
        </div>
        <div className="flex items-center gap-1">
          <span data-id="mp-location-line" className="flex min-w-0">
            <SlideText
              k={`${revision}|${line}`}
              text={line}
              height={20}
              className="truncate font-noontree text-[14px] text-[#343D54]"
            />
          </span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
            <path d="M6 8l4 4 4-4" stroke="#101628" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Info>

      <button
        type="button"
        data-id="mp-wishlist"
        aria-label="Wishlist"
        onClick={onWishlist}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 17.5S2.5 13 2.5 7.8A4.3 4.3 0 0 1 10 5a4.3 4.3 0 0 1 7.5 2.8C17.5 13 10 17.5 10 17.5Z"
            fill="#035794"
          />
        </svg>
      </button>
    </div>
  )
}
