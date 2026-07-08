// Marketplace switcher — VARIATION 2 ("selected + rail → docked").
//
// Expanded: a floating left squircle (SELECTED marketplace) + a right pill of
// the other marketplaces as equal-size squircle tiles, with a 2-line location
// and a separate search bar below.
// Collapsed (scrolled up): the selected tile smoothly travels up-left and
// shrinks to dock beside the 2-line location; the pill fades out and the search
// slides up beneath.
//
// One shared layout (absolute-positioned motion elements) so the selected tile
// MORPHS between the two poses instead of cross-fading. The collapse is binary
// — driven by the parent's `collapsed` boolean (a hysteresis threshold) — so it
// always springs to fully expanded or fully collapsed. Swapping the selection
// flips the tiles (3D rotateY).
import { AnimatePresence, motion } from 'framer-motion'
import { springs } from '../../../utils/motion'
import { address } from '../data'
import homeIcon from '../../../assets/marketplace/home.svg'
import MarketplaceMark from './MarketplaceMark'
import NewBadge from './NewBadge'

const SURFACE = '#DFE3EA'
const PAD = 16
const TOP = 8
const GAP = 12
const R = 20
const ROW = 80 // expanded selected/rail row height
const BIG = 72 // expanded selected tile
const CHIP = 64 // rail tile
const DOCK_W = 92 // collapsed selected chip (wide, ~2:1)
const DOCK_H = 44
const DOCK_ROW = Math.max(DOCK_H, 40)
const LOC_H = 40 // 2-line location block
const SEARCH_H = 48
const BOTTOM = 16 // padding below the search
const H0 = TOP + ROW + GAP + LOC_H + GAP + SEARCH_H + BOTTOM
const H1 = TOP + DOCK_ROW + GAP + SEARCH_H + BOTTOM

const T = springs.snappy
const FLIP = { rotateY: springs.flip, opacity: { duration: 0.16 } }

// per-marketplace mark size so every logo reads at a similar visual weight
const MARK = 52
const MARK_SIZE = {
  noon: 52, supermall: 66, food: 62, minutes: 60, nownow: 60,
  pay: 66, send: 64, out: 66, med: 64, global: 66, home: 56,
}
const markSize = (id) => MARK_SIZE[id] ?? MARK

export default function MarketplaceSwitcherV2({ items, activeId, onChange, collapsed = false }) {
  const selected = items.find((i) => i.id === activeId) ?? items[0]
  const rest = items.filter((i) => i.id !== selected.id)

  // poses
  const selPose = collapsed
    ? { width: DOCK_W, height: DOCK_H, top: TOP + (DOCK_ROW - DOCK_H) / 2, left: PAD }
    : { width: BIG, height: BIG, top: TOP + (ROW - BIG) / 2, left: PAD }
  const locPose = collapsed
    ? { top: TOP + (DOCK_ROW - LOC_H) / 2, left: PAD + DOCK_W + GAP }
    : { top: TOP + ROW + GAP, left: PAD }
  const searchTop = collapsed ? TOP + DOCK_ROW + GAP : TOP + ROW + GAP + LOC_H + GAP

  return (
    <motion.div
      data-id="mp-switcher"
      className="relative"
      initial={false}
      animate={{ height: collapsed ? H1 : H0 }}
      transition={T}
    >
      {/* right pill of the other marketplaces — fades out on collapse */}
      <motion.div
        data-id="mp-rail"
        initial={false}
        animate={{ opacity: collapsed ? 0 : 1 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'absolute',
          top: TOP,
          left: PAD + BIG + GAP,
          right: PAD,
          height: ROW,
          background: SURFACE,
          borderRadius: R + 8,
          perspective: 600,
          pointerEvents: collapsed ? 'none' : 'auto',
        }}
        className="scrollbar-hide flex items-center gap-2 overflow-x-auto p-2"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {rest.map((m) => (
            <motion.button
              key={m.id}
              type="button"
              layout
              data-id={`mp-tile-${m.id}`}
              aria-label={`Switch to ${m.pill ?? m.id}`}
              onClick={() => onChange(m.id)}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ ...FLIP, layout: springs.snappy }}
              whileTap={{ scale: 0.95 }}
              style={{ width: CHIP, height: CHIP, background: m.bg ?? '#FFFFFF', backfaceVisibility: 'hidden', borderRadius: R }}
              className="flex shrink-0 items-center justify-center overflow-hidden shadow-[0_1px_3px_rgba(16,24,40,0.08)]"
            >
              <MarketplaceMark m={m} size={markSize(m.id)} />
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* selected marketplace — morphs between the square row tile and the wide
          docked chip (short horizontal logo, 8px corners); keeps its accent
          fill; flips on swap */}
      <motion.div
        data-id="mp-selected"
        initial={false}
        animate={{ ...selPose, backgroundColor: selected.accent, borderRadius: collapsed ? 8 : R }}
        transition={T}
        style={{ position: 'absolute', perspective: 600, zIndex: 10 }}
        className="shadow-[0_2px_10px_rgba(16,24,40,0.10)]"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={selected.id}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={FLIP}
            style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}
            className="flex items-center justify-center"
          >
            {/* crossfade the mark between full (stacked, on accent) and short
                (horizontal, on white) when docking */}
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={collapsed ? 'short' : 'full'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="flex items-center justify-center"
              >
                <MarketplaceMark
                  m={selected}
                  white={!selected.lightAccent}
                  active
                  collapsed={collapsed}
                  size={collapsed ? 84 : markSize(selected.id)}
                />
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
        {selected.isNew && <NewBadge dataId="mp-selected-new" />}
      </motion.div>

      {/* 2-line location — slides beside the docked tile on collapse */}
      <motion.div
        data-id="mp-location"
        initial={false}
        animate={locPose}
        transition={T}
        style={{ position: 'absolute', right: PAD, height: LOC_H }}
        className="flex min-w-0 flex-col justify-center"
      >
        <div className="flex items-center gap-1.5">
          <img src={homeIcon} alt="" aria-hidden="true" className="h-[18px] w-auto shrink-0" />
          <span className="whitespace-nowrap font-noontree text-[16px] font-semibold text-black">{address.label} -</span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
            <path d="M6 8l4 4 4-4" stroke="#101628" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="truncate font-noontree text-[13px] text-[#343D54]">{address.line}</span>
      </motion.div>

      {/* separate search row — slides up as the section collapses */}
      <motion.div
        data-id="mp-search"
        initial={false}
        animate={{ top: searchTop }}
        transition={T}
        style={{ position: 'absolute', left: PAD, right: PAD }}
        className="flex h-12 items-center gap-3 rounded-[12px] border border-[#D7DAE3] bg-white px-3"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="9" cy="9" r="6" stroke="#1D2539" strokeWidth="1.6" />
          <path d="m14 14 3 3" stroke="#1D2539" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="min-w-0 flex-1 truncate font-noontree text-[15px] font-medium text-[#1D2539]">Search noon</span>
        <span className="h-6 w-px shrink-0 bg-[#D9DADB]" />
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
          <path
            d="M3 7.5A1.5 1.5 0 0 1 4.5 6h1.2l.9-1.5h6.8L15.3 6h.2A1.5 1.5 0 0 1 17 7.5V15A1.5 1.5 0 0 1 15.5 16.5h-11A1.5 1.5 0 0 1 3 15V7.5Z"
            stroke="#1F1D1D"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="11" r="2.6" stroke="#1F1D1D" strokeWidth="1.5" />
        </svg>
      </motion.div>
    </motion.div>
  )
}
