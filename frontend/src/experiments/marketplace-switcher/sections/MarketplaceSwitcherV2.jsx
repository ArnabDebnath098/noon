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

const SURFACE = '#ECEEF2' // floating container bg
const LEFT = 64 // selected circle diameter
const CHIP = 52 // pill tile diameter
const FLIP = { rotateY: springs.flip, opacity: { duration: 0.16 } }

export default function MarketplaceSwitcherV2({ items, activeId, onChange }) {
  const selected = items.find((i) => i.id === activeId) ?? items[0]
  const rest = items.filter((i) => i.id !== selected.id)

  return (
    <div data-id="mp-switcher" className="flex items-center gap-3 px-5 py-2">
      {/* left: the selected marketplace, floating in a circle — flips on swap */}
      <div
        data-id="mp-selected"
        style={{ width: LEFT, height: LEFT, background: SURFACE, perspective: 600 }}
        className="relative flex shrink-0 items-center justify-center rounded-full shadow-[0_2px_10px_rgba(16,24,40,0.10)]"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={selected.id}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={FLIP}
            style={{ width: LEFT - 8, height: LEFT - 8, background: selected.accent, backfaceVisibility: 'hidden' }}
            className="flex items-center justify-center overflow-hidden rounded-full"
          >
            <MarketplaceMark m={selected} white={!selected.lightAccent} active size={46} />
          </motion.span>
        </AnimatePresence>
        {selected.isNew && <NewBadge dataId="mp-selected-new" />}
      </div>

      {/* right: floating pill of the other marketplaces — tiles flip as the
          set changes (the picked one flips out to the circle, the previously
          selected flips back in) and reflow via layout */}
      <div
        data-id="mp-rail"
        style={{ background: SURFACE, perspective: 600 }}
        className="scrollbar-hide flex min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-full px-2.5 py-2.5"
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
              style={{ width: CHIP, height: CHIP, background: m.bg ?? '#FFFFFF', backfaceVisibility: 'hidden' }}
              className="flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-[0_1px_3px_rgba(16,24,40,0.08)]"
            >
              <MarketplaceMark m={m} size={40} />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
