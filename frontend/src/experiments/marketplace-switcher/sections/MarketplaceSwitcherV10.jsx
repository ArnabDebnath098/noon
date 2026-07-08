// Marketplace switcher — VARIATION 8 ("rail → docked selection header").
//
// Default: a scrollable rail of ALL marketplaces on top (selected highlighted),
// with a grouped one-line location + search bar below it (no wishlist).
// Scroll choreography, strictly sequenced:
//   1. the rail slides up slightly and fades out — the group stays PUT
//      (same width, same position)
//   2. once the rail is gone, the group first settles up into its compact row
//      position (still full width)
//   3. then the SELECTED marketplace slides in from the LEFT while the group
//      shrinks its width by exactly the tile's footprint at the same time —
//      the tile fills precisely the space the group vacates
// Tapping the docked tile opens the marketplaces bottom sheet (variation-7).
import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { scrollSmoothing } from '../../../utils/motion'
import { address } from '../data'
import homeIcon from '../../../assets/marketplace/home.svg'
import MarketplaceMark from './MarketplaceMark'
import MarketplaceSheet from './MarketplaceSheet'
import NewBadge from './NewBadge'

const PAD = 16 // section side padding
const RAIL_TILE = 72 // rail tile size in the default state
const DOCK_TILE = 64 // docked selected tile size
const GAP = 12 // gap between docked tile and group
const GROUP_H = 22 + 8 + 48 // location line + gap + search bar
const TOP = 8
const H0 = TOP + RAIL_TILE + 12 + GROUP_H + 12
const H1 = TOP + GROUP_H + 12

export default function MarketplaceSwitcherV10({ items, activeId, onChange, progress }) {
  const sp = useSpring(progress, scrollSmoothing)
  const railRef = useRef(null)
  const [open, setOpen] = useState(false)
  const m = items.find((i) => i.id === activeId) ?? items[0]

  // Phase 1 [0 → 0.4]: rail slides up slightly and fades — group stays put.
  const railOpacity = useTransform(sp, [0, 0.4], [1, 0])
  const railY = useTransform(sp, [0, 0.4], [0, -16])
  const railPE = useTransform(railOpacity, (o) => (o < 0.3 ? 'none' : 'auto'))
  // Phase 2a [0.4 → 0.7]: the group settles up to the compact row (full width).
  const height = useTransform(sp, [0.4, 0.7], [H0, H1])
  const groupTop = useTransform(sp, [0.4, 0.7], [TOP + RAIL_TILE + 12, TOP])
  // Phase 2b [0.7 → 0.85]: quick, linear. The tile slides in from the left and
  // the group shrinks its width over the SAME range — and dockX is offset by
  // just (GAP + DOCK_TILE) so the gap between them stays a constant GAP the
  // whole way in (never widening/narrowing during the slide).
  const groupLeft = useTransform(sp, [0.7, 0.85], [PAD, PAD + DOCK_TILE + GAP])
  const dockOpacity = useTransform(sp, [0.7, 0.8], [0, 1])
  const dockX = useTransform(sp, [0.7, 0.85], [-(GAP + DOCK_TILE), 0]) // in from the left, constant gap
  const dockPE = useTransform(dockOpacity, (o) => (o < 0.5 ? 'none' : 'auto'))

  // keep the selected marketplace visible in the rail
  useEffect(() => {
    const el = railRef.current
    const tile = el?.querySelector(`[data-id="mp-tile-${activeId}"]`)
    if (!el || !tile) return
    const target = tile.offsetLeft - (el.clientWidth - tile.offsetWidth) / 2
    el.scrollTo({
      left: Math.max(0, Math.min(el.scrollWidth - el.clientWidth, target)),
      behavior: 'smooth',
    })
  }, [activeId])

  const select = (id) => {
    onChange(id)
    setTimeout(() => setOpen(false), 180)
  }

  return (
    <>
      <motion.div data-id="mp-switcher" style={{ height }} className="relative">
        {/* default state: every marketplace in a scrollable rail */}
        <motion.div
          ref={railRef}
          data-id="mp-switcher-rail"
          style={{ top: TOP, y: railY, opacity: railOpacity, pointerEvents: railPE }}
          className="scrollbar-hide absolute inset-x-0 flex items-center gap-2 overflow-x-auto px-4 pb-2"
        >
          {items.map((item) => {
            const active = item.id === activeId
            return (
              <button
                key={item.id}
                type="button"
                data-id={`mp-tile-${item.id}`}
                aria-pressed={active}
                onClick={() => onChange(item.id)}
                style={{ width: RAIL_TILE, height: RAIL_TILE, borderRadius: 20, background: active ? item.accent : item.bg ?? '#FFFFFF' }}
                className="relative flex shrink-0 items-center justify-center border border-[#EFEFEF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform active:scale-95"
              >
                <MarketplaceMark m={item} white={active && !item.lightAccent} active={active} size={64} />
                {item.isNew && <NewBadge dataId={`mp-tile-${item.id}-new`} />}
              </button>
            )
          })}
        </motion.div>

        {/* scrolled state: the selected marketplace docks beside the group —
            tap to switch (opens the sheet) */}
        <motion.button
          type="button"
          data-id="mp-selected-tile"
          aria-label="Switch marketplace"
          onClick={() => setOpen(true)}
          style={{
            width: DOCK_TILE,
            height: DOCK_TILE,
            top: TOP + (GROUP_H - DOCK_TILE) / 2,
            left: PAD,
            borderRadius: 16,
            background: m.accent,
            opacity: dockOpacity,
            x: dockX,
            pointerEvents: dockPE,
          }}
          className="absolute z-10 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform active:scale-95"
        >
          <MarketplaceMark m={m} white={!m.lightAccent} active size={50} />
          {m.isNew && <NewBadge dataId="mp-selected-tile-new" />}
        </motion.button>

        {/* grouped location + search — one unit that docks beside the tile */}
        <motion.div
          data-id="mp-header-group"
          style={{ top: groupTop, left: groupLeft, right: PAD }}
          className="absolute flex flex-col gap-2"
        >
          <div data-id="mp-location" className="flex h-[22px] min-w-0 items-center gap-1.5">
            <img src={homeIcon} alt="" aria-hidden="true" className="h-4 w-auto shrink-0" />
            <span className="shrink-0 whitespace-nowrap font-noontree text-[14px] font-semibold text-black">
              {address.label} -
            </span>
            <span className="min-w-0 truncate font-noontree text-[13px] text-[#343D54]">{address.line}</span>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
              <path d="M6 8l4 4 4-4" stroke="#101628" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div data-id="mp-search" className="flex h-12 items-center gap-3 rounded-[12px] border border-[#D7DAE3] bg-white px-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
              <circle cx="9" cy="9" r="6" stroke="#1D2539" strokeWidth="1.6" />
              <path d="m14 14 3 3" stroke="#1D2539" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="min-w-0 flex-1 truncate font-noontree text-[15px] font-medium text-[#1D2539]">
              Search noon
            </span>
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
          </div>
        </motion.div>
      </motion.div>

      <MarketplaceSheet
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        activeId={activeId}
        onSelect={select}
      />
    </>
  )
}
