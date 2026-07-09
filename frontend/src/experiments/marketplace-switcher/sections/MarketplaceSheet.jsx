// Floating bottom sheet listing every marketplace — dimmed/blurred backdrop,
// 16px padding all around, header copy nudging exploration, and a 4-column
// grid of 72px squircle tiles tinted with each marketplace's brand colour.
// Dumb component: parent owns open state and selection behaviour.
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import { springs } from '../../../utils/motion'
import MarketplaceMark from './MarketplaceMark'
import NewBadge from './NewBadge'

// iOS-smoothed squircle tuned to a 14px corner radius on the 72px tiles
// (radius ≈ 19.4% of the box — the shared #mp-squircle def is ~22%)
export const SQUIRCLE14 = 'url(#mp-squircle-14)'
const SQUIRCLE = SQUIRCLE14

export function SquircleClipDef14() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <clipPath id="mp-squircle-14" clipPathUnits="objectBoundingBox">
          <path d="M .5,0 C .6807,0 .7712,0 .8434,.0226 C .9078,.0435 .9565,.0922 .9774,.1566 C 1,.2288 1,.3193 1,.5 C 1,.6807 1,.7712 .9774,.8434 C .9565,.9078 .9078,.9565 .8434,.9774 C .7712,1 .6807,1 .5,1 C .3193,1 .2288,1 .1566,.9774 C .0922,.9565 .0435,.9078 .0226,.8434 C 0,.7712 0,.6807 0,.5 C 0,.3193 0,.2288 .0226,.1566 C .0435,.0922 .0922,.0435 .1566,.0226 C .2288,0 .3193,0 .5,0 Z" />
        </clipPath>
      </defs>
    </svg>
  )
}

// very subtle entrance — a whisper of lift + scale per tile
const gridContainer = { hidden: {}, show: { transition: { staggerChildren: 0.02, delayChildren: 0.1 } } }
const gridItem = {
  hidden: { opacity: 0, y: 6, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: springs.snappy },
}

export default function MarketplaceSheet({ open, onClose, items, activeId, onSelect }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div data-id="mp-sheet" className="fixed inset-0 z-[60] flex justify-center">
          {/* dimmed, blurred backdrop — tap anywhere outside to dismiss */}
          <motion.div
            data-id="mp-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* the wrapper overlays the backdrop within the frame, so it must
              also dismiss — any click outside the panel closes the sheet */}
          <div
            className="relative flex h-full w-full max-w-md flex-col justify-end p-4"
            onClick={onClose}
          >
            <motion.div
              data-id="mp-sheet-panel"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '110%' }}
              transition={springs.sheet}
              onClick={(e) => e.stopPropagation()}
              className="rounded-[20px] bg-white shadow-[0_24px_70px_rgba(16,24,40,0.35)]"
            >
              <SquircleClipDef14 />
              {/* header */}
              <div data-id="mp-sheet-header" className="flex flex-col gap-1 p-3">
                <span data-id="mp-sheet-title" className="font-noontree text-[18px] font-semibold text-[#1D2539]">
                  Explore noon marketplaces
                </span>
                <span data-id="mp-sheet-subtitle" className="font-noontree text-[12px] font-normal leading-[17px] text-[#7E859B]">
                  Groceries in minutes, food, fashion, pharmacy & more — one account, every marketplace.
                </span>
              </div>

              {/* all marketplaces */}
              <motion.div
                data-id="mp-sheet-grid"
                className="grid grid-cols-4 justify-items-center gap-x-3 gap-y-4 p-3 pb-6"
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
                      data-id={`mp-sheet-tile-${m.id}`}
                      aria-pressed={active}
                      onClick={() => onSelect(m.id)}
                      style={{ width: 72, height: 72 }}
                      className="relative flex items-center justify-center transition-transform active:scale-95"
                    >
                      {/* squircle-smoothed fill; badge overhangs outside the clip */}
                      <Squircle
                        as="span"
                        cornerRadius={14}
                        cornerSmoothing={1}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: active ? m.accent : `${m.accent}14` }}
                      >
                        <MarketplaceMark m={m} white={active && !m.lightAccent} active={active} size={60} />
                      </Squircle>
                      {m.isNew && <NewBadge dataId={`mp-sheet-tile-${m.id}-new`} />}
                    </motion.button>
                  )
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
