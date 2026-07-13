// ComboRowCard — a full-width horizontal combo card (Figma Frame 2147241812).
// A row of product thumbnails (each with an "x{qty}" badge) that scrolls
// horizontally when it overflows, a dashed divider, then the combo title,
// price + strikethrough, coupon and an "Add to cart" button. Adding morphs the
// button into a [− qty +] stepper (spring width + crossfade, right-anchored)
// and reports the quantity via `onQtyChange`.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { springs } from '../../utils/motion'
import { Dirham, withDirham } from './Dirham'

export function ComboRowCard({
  thumbs = [],
  title,
  price,
  comparePrice,
  coupon,
  onAdd,
  onQtyChange,
  dataId = 'combo-row-card',
}) {
  const did = (s) => `${dataId}-${s}`
  const [qty, setQty] = useState(0)
  const added = qty > 0
  const set = (n) => {
    const next = Math.max(0, n)
    setQty(next)
    onQtyChange?.(next)
  }
  return (
    <div data-id={dataId} className="flex flex-col gap-2 rounded-2xl bg-white p-3">
      {/* thumbnails — scrolls horizontally when they exceed the card width */}
      <div data-id={did('thumbs')} className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
        {thumbs.map((t, i) => (
          <div key={i} data-id={did(`thumb-${i}`)} className="relative h-24 w-[72px] shrink-0 rounded-xl bg-[#F9F9FB]">
            <img src={t.image} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 m-auto h-[78px] w-auto object-contain" />
            <span data-id={did(`thumb-${i}-qty`)} className="absolute bottom-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-md border border-[rgba(14,14,14,0.04)] bg-white px-1 font-noontree text-[10px] font-semibold leading-none text-[#343D54]">
              x{t.qty ?? 1}
            </span>
          </div>
        ))}
      </div>

      {/* divider */}
      <span data-id={did('divider')} className="h-px w-full border-t border-dashed border-[#F2F3F7]" />

      {/* info */}
      <div data-id={did('info')} className="flex flex-col gap-2">
        <h3 data-id={did('title')} className="truncate font-noontree text-[14px] font-medium leading-[18px] tracking-[-0.14px] text-[#212121]">
          {title}
        </h3>
        <div data-id={did('row')} className="flex items-end gap-2.5">
          <div data-id={did('pricing')} className="flex flex-1 flex-col gap-1">
            <div data-id={did('price')} className="flex items-end gap-1.5">
              <span data-id={did('price-now')} className="inline-flex items-center gap-px font-noontree text-[16px] font-bold leading-[22px] tracking-[-0.15px] text-[#1D2539]">
                <Dirham />
                {price}
              </span>
              {comparePrice && (
                <span data-id={did('price-was')} className="inline-flex items-center gap-px font-noontree text-[12px] font-normal leading-[18px] tracking-[-0.1px] text-[#666D85] line-through">
                  <Dirham />
                  {comparePrice}
                </span>
              )}
            </div>
            {coupon && (
              <span data-id={did('coupon')} className="flex h-5 w-fit items-center rounded border-[0.5px] border-dashed border-[#CBF6E5] bg-[#E3FCF2] px-1 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-[#0B623F]">
                {withDirham(coupon)}
              </span>
            )}
          </div>
          {/* Add ↔ stepper morph — one rounded shell whose colour and width
              spring between the two states; content crossfades inside. The
              shell is right-anchored (flex row end), so growth pushes left. */}
          <motion.div
            data-id={did('atc')}
            layout
            animate={{
              backgroundColor: added ? '#0F61FF' : '#FFFFFF',
              borderColor: added ? '#0F61FF' : '#D6E9FF',
            }}
            transition={springs.snappy}
            className="flex h-9 shrink-0 items-center overflow-hidden rounded-lg border"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {added ? (
                /* qty stepper */
                <motion.div
                  key="stepper"
                  data-id={did('stepper')}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={springs.snappy}
                  className="flex items-center px-1 text-white"
                >
                  <button
                    type="button"
                    data-id={did('stepper-dec')}
                    aria-label="Remove one"
                    onClick={() => set(qty - 1)}
                    className="flex h-9 w-8 items-center justify-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M3 7h8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                  <motion.span
                    key={qty}
                    data-id={did('stepper-count')}
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={springs.snappy}
                    className="min-w-5 text-center font-noontree text-[14px] font-semibold leading-4"
                  >
                    {qty}
                  </motion.span>
                  <button
                    type="button"
                    data-id={did('stepper-inc')}
                    aria-label="Add one"
                    onClick={() => set(qty + 1)}
                    className="flex h-9 w-8 items-center justify-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M7 3v8M3 7h8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="add"
                  type="button"
                  data-id={did('add')}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={springs.snappy}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    set(1)
                    onAdd?.()
                  }}
                  className="flex h-9 items-center justify-center px-3 font-noontree text-[12px] font-semibold leading-4 text-[#0F61FF]"
                >
                  Add to cart
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
