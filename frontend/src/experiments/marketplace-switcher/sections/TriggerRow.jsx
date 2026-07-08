// Collapsed trigger row shared by the flyout switcher variants (dial, V6):
// 3 marketplace quick tiles + a "grid" tile whose 2×2 mini-logo preview opens
// the full flyout. Pass `rowItems` to control which marketplaces occupy the
// quick tiles (e.g. V6 swaps the picked marketplace into the third slot);
// defaults to the first three. A tile whose marketplace changes flips over.
import { motion, AnimatePresence } from 'framer-motion'
import { springs } from '../../../utils/motion'
import MarketplaceMark from './MarketplaceMark'
import NewBadge from './NewBadge'

const PREVIEW_IDS = ['pay', 'minutes', 'home', 'send'] // 2×2 preview (TL,TR,BL,BR)
// per-marketplace mark size for the preview minis — the raw marks differ a lot
// in intrinsic width, these equalise them inside the circular cells
const PREVIEW_MARK_SIZE = { pay: 34, minutes: 21, home: 23, send: 24 }

export default function TriggerRow({ items, rowItems, activeId, onChange, onOpen, rootRef }) {
  const row = rowItems ?? items.slice(0, 3)
  const preview = PREVIEW_IDS.map((id) => items.find((m) => m.id === id)).filter(Boolean)

  return (
    <div
      ref={rootRef}
      data-id="mp-switcher"
      className="flex items-center justify-center gap-2 px-5 py-2"
    >
      {/* buttons are keyed by slot so a swapped marketplace flips in place */}
      {row.map((m, slot) => {
        const active = m.id === activeId
        return (
          <button
            key={slot}
            type="button"
            data-id={`mp-tile-${m.id}`}
            aria-pressed={active}
            onClick={() => onChange(m.id)}
            style={{ width: 76, height: 76, borderRadius: 20, perspective: 700 }}
            className="relative shrink-0 border border-[#EFEFEF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform active:scale-95"
          >
            <AnimatePresence initial={false}>
              <motion.span
                key={m.id}
                initial={{ rotateY: -110, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 110, opacity: 0 }}
                transition={{ rotateY: springs.flip, opacity: { duration: 0.18 } }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 20,
                  overflow: 'hidden',
                  background: active ? m.accent : m.bg ?? '#FFFFFF',
                  backfaceVisibility: 'hidden',
                }}
                className="flex items-center justify-center"
              >
                <MarketplaceMark m={m} white={active && !m.lightAccent} active={active} size={68} />
              </motion.span>
            </AnimatePresence>
            {m.isNew && <NewBadge dataId={`mp-tile-${m.id}-new`} />}
          </button>
        )
      })}
      <button
        type="button"
        data-id="mp-dial-open"
        aria-label="Open all marketplaces"
        onClick={onOpen}
        style={{ width: 76, height: 76, borderRadius: 20 }}
        className="grid shrink-0 grid-cols-2 grid-rows-2 gap-1.5 border border-[#EFEFEF] bg-[#F4F5F7] p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform active:scale-95"
      >
        {preview.map((m) => (
          <span key={m.id} className="flex items-center justify-center overflow-hidden rounded-full bg-white">
            <MarketplaceMark m={m} size={PREVIEW_MARK_SIZE[m.id] ?? 26} />
          </span>
        ))}
      </button>
    </div>
  )
}
