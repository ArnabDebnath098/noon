// Marketplace switcher — VARIATION 2 ("floating pills").
//
// Two floating light-grey surfaces with fully-round corners: a left circle
// holding the SELECTED marketplace, and a right pill holding every other
// marketplace as a circular tile (horizontally scrollable). Tapping a pill
// tile selects it — the left circle flips (3D rotateY) to reveal the new
// marketplace and the previous selection rejoins the pill.
import { AnimatePresence, motion } from 'framer-motion'
import { springs } from '../../../utils/motion'
import MarketplaceMark from './MarketplaceMark'
import NewBadge from './NewBadge'

const SURFACE = '#DFE3EA' // floating container bg (visible against white chips)
const LEFT = 64 // selected tile size
const CHIP = 64 // pill tile size
const PADR = 8 // rail padding (p-2)
const R = 20 // tile corner radius (squircle)
const RAIL_R = R + PADR // concentric: rail radius = tile radius + padding
const FLIP = { rotateY: springs.flip, opacity: { duration: 0.16 } }
// per-marketplace mark size so every logo reads at a similar visual weight
// (stacked wordmarks / text labels are intrinsically narrower than single logos)
const MARK = 52 // default
const MARK_SIZE = {
  noon: 52,
  supermall: 66,
  food: 62,
  minutes: 60,
  nownow: 60,
  pay: 66,
  send: 64,
  out: 66,
  med: 64,
  global: 66,
  home: 56,
}
const markSize = (id) => MARK_SIZE[id] ?? MARK

export default function MarketplaceSwitcherV2({ items, activeId, onChange }) {
  const selected = items.find((i) => i.id === activeId) ?? items[0]
  const rest = items.filter((i) => i.id !== selected.id)

  return (
    <div data-id="mp-switcher" className="flex items-center gap-3 px-4 py-2">
      {/* left: the selected marketplace, floating in a circle — flips on swap */}
      <div
        data-id="mp-selected"
        style={{ width: LEFT, height: LEFT, perspective: 600, borderRadius: R }}
        className="relative flex shrink-0 items-center justify-center shadow-[0_2px_10px_rgba(16,24,40,0.10)]"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={selected.id}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={FLIP}
            style={{ width: LEFT, height: LEFT, background: selected.accent, backfaceVisibility: 'hidden', borderRadius: R }}
            className="flex items-center justify-center overflow-hidden"
          >
            <MarketplaceMark m={selected} white={!selected.lightAccent} active size={markSize(selected.id)} />
          </motion.span>
        </AnimatePresence>
        {selected.isNew && <NewBadge dataId="mp-selected-new" />}
      </div>

      {/* right: floating pill of the other marketplaces — tiles flip as the
          set changes (the picked one flips out to the circle, the previously
          selected flips back in) and reflow via layout */}
      <div
        data-id="mp-rail"
        style={{ background: SURFACE, perspective: 600, borderRadius: RAIL_R }}
        className="scrollbar-hide flex min-w-0 flex-1 items-center gap-2 overflow-x-auto p-2"
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
      </div>
    </div>
  )
}
