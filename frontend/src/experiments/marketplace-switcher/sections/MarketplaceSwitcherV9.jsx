// Marketplace switcher — VARIATION 6 ("folder → header panel").
//
// Same shape as variation 1: the trigger row's grid tile expands into a panel
// pinned at the top over a dimmed backdrop. The differences: the panel opens
// with a title + supporting copy, and its 4-column grid uses larger, more
// generously spaced squircle tiles (light brand tints).
import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useElementWidth from '../../../hooks/useElementWidth'
import { springs, easings } from '../../../utils/motion'
import MarketplaceMark from './MarketplaceMark'
import { SquircleClipDef14, SQUIRCLE14 } from './MarketplaceSheet'
import NewBadge from './NewBadge'
import TriggerRow from './TriggerRow'

const ROW_TILE = 76 // TriggerRow tile size — used to locate the grid tile
const ROW_GAP = 8
const PANEL_MARGIN = 16 // panel inset from each screen edge

// subtle staggered entrance for the tiles
const gridContainer = { hidden: {}, show: { transition: { staggerChildren: 0.02, delayChildren: 0.08 } } }
const gridItem = {
  hidden: { opacity: 0, y: 6, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: springs.snappy },
}

export default function MarketplaceSwitcherV9({ items, activeId, onChange }) {
  const [ref, W] = useElementWidth(390)
  const [open, setOpen] = useState(false)
  // the trigger row's third tile holds the last marketplace picked from the
  // panel (slots 1 & 2 are fixed and select in place)
  const [thirdId, setThirdId] = useState(items[2]?.id)
  const rowItems = [items[0], items[1], items.find((m) => m.id === thirdId)].filter(Boolean)
  // the panel + backdrop portal into the app frame so the overlay paints
  // above EVERYTHING (bottom nav z-30, floating tabs z-40) — inside the
  // sticky header they'd be capped at its z-20 stacking context
  const [frame, setFrame] = useState(null)
  const [panelTop, setPanelTop] = useState(55)

  useLayoutEffect(() => {
    const el = ref.current
    if (el) setFrame(el.closest('[data-id="app-frame"]'))
  }, [ref])

  const ICON = W >= 430 ? 80 : 72 // bigger tiles than the row, roomier on wide frames

  // centre of the trigger row's grid tile — the panel scales out of it
  const rowW = 4 * ROW_TILE + 3 * ROW_GAP
  const folderCx = (W - rowW) / 2 + 3 * (ROW_TILE + ROW_GAP) + ROW_TILE / 2

  const openPanel = () => {
    // anchor the panel to the trigger row's frame position at open time
    const el = ref.current
    if (el && frame) {
      setPanelTop(el.getBoundingClientRect().top - frame.getBoundingClientRect().top + 8)
    }
    setOpen(true)
  }

  // picking from the panel: fixed row marketplaces select in place; anything
  // else swaps into the third tile (variation-1 behaviour)
  const select = (id) => {
    onChange(id)
    if (id !== items[0]?.id && id !== items[1]?.id) setThirdId(id)
    setTimeout(() => setOpen(false), 180) // let the selection register visually
  }

  const overlay = (
    <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              data-id="mp-grid-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: easings.ios }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 z-50 bg-black/30 backdrop-blur-sm"
            />

            <motion.div
              key="panel"
              data-id="mp-grid-panel"
              initial={{ opacity: 0, scale: 0.25 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.25 }}
              transition={springs.panel}
              style={{
                left: PANEL_MARGIN,
                right: PANEL_MARGIN,
                top: panelTop,
                transformOrigin: `${folderCx - PANEL_MARGIN}px 40px`,
              }}
              className="absolute z-[51] rounded-[24px] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.22)]"
            >
              <SquircleClipDef14 />
              {/* header */}
              <div data-id="mp-grid-header" className="flex flex-col gap-1 p-4 pb-2">
                <span data-id="mp-grid-title" className="font-noontree text-[18px] font-semibold text-[#1D2539]">
                  Explore noon marketplaces
                </span>
                <span data-id="mp-grid-subtitle" className="font-noontree text-[12px] font-normal leading-[17px] text-[#7E859B]">
                  Groceries in minutes, food, fashion, pharmacy & more — one account, every marketplace.
                </span>
              </div>

              {/* all marketplaces */}
              <motion.div
                data-id="mp-grid-tiles"
                className="grid grid-cols-4 justify-items-center gap-y-5 p-4 pb-8 pt-3"
                variants={gridContainer}
                initial="hidden"
                animate="show"
              >
                {items.map((m) => {
                  const active = m.id === activeId
                  return (
                    <motion.button
                      key={m.id}
                      type="button"
                      variants={gridItem}
                      data-id={`mp-grid-tile-${m.id}`}
                      aria-pressed={active}
                      onClick={() => select(m.id)}
                      style={{ width: ICON, height: ICON }}
                      className="relative flex items-center justify-center transition-transform active:scale-95"
                    >
                      {/* squircle-clipped fill so the badge can overhang unclipped */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          clipPath: SQUIRCLE14,
                          // very light brand tint instead of white
                          background: active ? m.accent : `${m.accent}14`,
                        }}
                      />
                      <span className="relative flex items-center justify-center">
                        <MarketplaceMark m={m} white={active && !m.lightAccent} active={active} size={ICON - 12} />
                      </span>
                      {m.isNew && <NewBadge dataId={`mp-grid-tile-${m.id}-new`} />}
                    </motion.button>
                  )
                })}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
  )

  return (
    <div ref={ref} data-id="mp-switcher-root" className="relative">
      <TriggerRow items={items} rowItems={rowItems} activeId={activeId} onChange={onChange} onOpen={openPanel} />
      {frame && createPortal(overlay, frame)}
    </div>
  )
}
