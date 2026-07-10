// Collapsed trigger row shared by the flyout switcher variants (dial, V6):
// 3 marketplace quick tiles + a "grid" tile whose 2×2 mini-logo preview opens
// the full flyout. Pass `rowItems` to control which marketplaces occupy the
// quick tiles (e.g. V6 swaps the picked marketplace into the third slot);
// defaults to the first three. A tile whose marketplace changes flips over.
// `dialLayoutId` + `dialVisible` let a variant morph the grid tile itself into
// its expanded surface (framer shared-layout): while the surface is open the
// tile yields to an invisible placeholder that preserves the row's layout.
import { motion, AnimatePresence } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import { springs } from '../../../utils/motion'
import MarketplaceMark from './MarketplaceMark'
import NewBadge from './NewBadge'

const PREVIEW_IDS = ['pay', 'nownow', 'home', 'send'] // 2×2 preview (TL,TR,BL,BR)
// per-marketplace mark size for the preview minis — the raw marks differ a lot
// in intrinsic width, these equalise them inside the circular cells
const PREVIEW_MARK_SIZE = { pay: 34, nownow: 24, home: 23, send: 24 }

export default function TriggerRow({ items, rowItems, activeId, onChange, onOpen, rootRef, dialLayoutId, dialVisible = true }) {
  const row = rowItems ?? items.slice(0, 3)
  const preview = PREVIEW_IDS.map((id) => items.find((m) => m.id === id)).filter(Boolean)

  return (
    <div
      ref={rootRef}
      data-id="mp-switcher"
      className="flex items-center gap-3 py-2 pl-4"
    >
      {/* grid tile on the LEFT — opens the flyout/panel */}
      {dialVisible ? (
        <motion.button
          type="button"
          data-id="mp-dial-open"
          aria-label="Open all marketplaces"
          onClick={onOpen}
          layoutId={dialLayoutId}
          whileTap={{ scale: 0.95 }}
          transition={springs.panel}
          style={{ width: 76, height: 76, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
          className="relative shrink-0"
        >
          <Squircle
            as="span"
            data-id="mp-dial-open-surface"
            cornerRadius={20}
            cornerSmoothing={1}
            style={{ background: '#F4F5F7' }}
            className="absolute inset-0"
          />
          <span data-id="mp-dial-open-grid" className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1.5 p-2">
            {preview.map((m) => (
              <span
                key={m.id}
                data-id={`mp-dial-open-cell-${m.id}`}
                className="flex items-center justify-center overflow-hidden rounded-full bg-white"
              >
                <MarketplaceMark m={m} size={PREVIEW_MARK_SIZE[m.id] ?? 26} />
              </span>
            ))}
          </span>
        </motion.button>
      ) : (
        <span data-id="mp-dial-placeholder" aria-hidden="true" style={{ width: 76, height: 76 }} className="shrink-0" />
      )}

      {/* divider between the grid tile and the marketplaces */}
      <span data-id="mp-switcher-divider" aria-hidden="true" className="h-4 w-px shrink-0 bg-[#D9DADB]" />

      {/* quick tiles — fill the remaining width, left-aligned & scrollable;
          keyed by slot so a swapped marketplace flips in place */}
      <div data-id="mp-tiles" className="scrollbar-hide flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-4">
        {row.map((m, slot) => {
          const active = m.id === activeId
          return (
            <button
              key={slot}
              type="button"
              data-id={`mp-tile-${m.id}`}
              aria-pressed={active}
              onClick={() => onChange(m.id)}
              style={{ width: 76, height: 76, perspective: 700, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
              className="relative shrink-0 transition-transform active:scale-95"
            >
              <AnimatePresence initial={false}>
                <motion.span
                  key={m.id}
                  data-id={`mp-tile-${m.id}-flip`}
                  initial={{ rotateY: -110, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 110, opacity: 0 }}
                  transition={{ rotateY: springs.flip, opacity: { duration: 0.18 } }}
                  style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}
                  className="flex items-center justify-center"
                >
                  <Squircle
                    as="span"
                    data-id={`mp-tile-${m.id}-surface`}
                    cornerRadius={20}
                    cornerSmoothing={1}
                    style={{ background: active ? m.accent : m.bg ?? '#FFFFFF' }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <MarketplaceMark m={m} white={active && !m.lightAccent} active={active} size={68} />
                  </Squircle>
                </motion.span>
              </AnimatePresence>
              {m.isNew && <NewBadge dataId={`mp-tile-${m.id}-new`} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
