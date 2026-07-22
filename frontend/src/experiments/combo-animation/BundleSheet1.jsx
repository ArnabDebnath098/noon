// BundleSheet1 — variation-1 "Buy as combo" bottom sheet (Figma redesign).
// Blue-tinted gradient sheet with a decorative line-art pattern behind the
// header, then a vertical list of white combo cards. Each card shows the
// combo's products as individual 92x142 image tiles (white inner tile with a
// cut-out product image + mini add button, qty strip below), a dashed divider,
// the combo title, price + coupon, and an "Add combo" secondary CTA.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import { springs } from '../../utils/motion'
import { ComboGif, Dirham, withDirham } from '../../components/common'
import patternBg from '../../assets/icons/combo-sheet-pattern.svg'

/* Serrated price ticket — same ticket shape as the PDP bundle rows, in the
   deep-blue #082F8C of this sheet's header. */
function PriceTicket({ savings, dataId }) {
  return (
    <span data-id={dataId} className="flex items-center">
      <svg width="4" height="20" viewBox="0 0 4 20" fill="none" aria-hidden="true" className="shrink-0">
        <path d="M3.14258 20H0V18.5713C0.86787 18.5713 1.57129 17.9316 1.57129 17.1426C1.57116 16.3537 0.867791 15.7139 0 15.7139V14.2852C0.867721 14.2851 1.57105 13.6462 1.57129 12.8574C1.57129 12.1179 0.953321 11.5089 0.161133 11.4355L0 11.4287V9.28516C0.867721 9.28515 1.57105 8.64621 1.57129 7.85742C1.57129 7.11789 0.953321 6.50889 0.161133 6.43555L0 6.42871V4.28516C0.867721 4.28515 1.57105 3.64621 1.57129 2.85742C1.57129 2.11789 0.953321 1.50889 0.161133 1.43555L0 1.42871V0H3.14258V20Z" fill="#082F8C" />
      </svg>
      <span className="-mx-px flex h-5 items-center gap-1 bg-[#082F8C] px-1 font-noontree text-[13px] font-semibold leading-5 tracking-[-0.1px] text-white">
        <span>save upto</span>
        <span className="inline-flex items-center gap-px">
          <Dirham />
          {savings}
        </span>
      </span>
      <svg width="4" height="20" viewBox="0 0 4 20" fill="none" aria-hidden="true" className="shrink-0">
        <path d="M3.14258 1.42871C2.27482 1.42884 1.57129 2.06852 1.57129 2.85742C1.57153 3.64613 2.27497 4.28503 3.14258 4.28516V6.42871C2.27482 6.42884 1.57129 7.06852 1.57129 7.85742C1.57153 8.64613 2.27497 9.28503 3.14258 9.28516V11.4287C2.27482 11.4288 1.57129 12.0685 1.57129 12.8574C1.57153 13.6461 2.27497 14.285 3.14258 14.2852V15.7139C2.2749 15.714 1.57142 16.3538 1.57129 17.1426C1.57129 17.9315 2.27482 18.5712 3.14258 18.5713V20H0V0H3.14258V1.42871Z" fill="#082F8C" />
      </svg>
    </span>
  )
}

/* Product image tile — 92x142: grey shell, white 90x120 image well with a
   mini add button, and a qty strip along the bottom. */
function ProductTile({ image, qty = 1, dataId }) {
  return (
    <div data-id={dataId} className="flex w-[92px] shrink-0 flex-col rounded-xl bg-[#F2F3F7] p-px">
      <div data-id={`${dataId}-well`} className="relative flex h-[120px] w-[90px] items-center justify-center rounded-xl bg-white">
        <img
          data-id={`${dataId}-img`}
          src={image}
          alt=""
          className="h-[90px] w-[66px] object-contain"
        />
        <button
          type="button"
          data-id={`${dataId}-add`}
          aria-label="Add item"
          className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-md border border-[rgba(14,14,14,0.04)] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.04)]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M5 1V9M1 5H9" stroke="#343D54" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <span data-id={`${dataId}-qty`} className="flex h-5 items-center justify-center font-noontree text-[11px] font-medium leading-[14px] tracking-[-0.1px] text-[#666D85]">
        Qty {qty}
      </span>
    </div>
  )
}

/* One combo card in the sheet list. Shows up to 3 product tiles; overflow
   collapses into a small "+N" pill (per the Figma 7-product combo). */
function ComboCard({ item, onAdd, added, dataId }) {
  const thumbs = item.thumbs ?? []
  const visible = thumbs.slice(0, 3)
  const extra = thumbs.length - visible.length

  return (
    <div data-id={dataId} className="flex flex-col gap-3 rounded-2xl bg-white p-3">
      {/* product tiles */}
      <div data-id={`${dataId}-tiles`} className="flex items-center gap-2">
        {visible.map((t, i) => (
          <ProductTile key={i} dataId={`${dataId}-tile-${i}`} image={t.image} qty={t.qty} />
        ))}
        {extra > 0 && (
          <span data-id={`${dataId}-more`} className="flex h-[22px] w-[92px] shrink-0 items-center justify-center self-center rounded-xl bg-[#F2F3F7] font-noontree text-[11px] font-medium leading-[14px] tracking-[-0.1px] text-[#666D85]">
            +{extra} more
          </span>
        )}
      </div>

      {/* dashed divider */}
      <div data-id={`${dataId}-divider`} className="border-t border-dashed border-[#F2F3F7]" />

      {/* title */}
      <span data-id={`${dataId}-title`} className="truncate font-noontree text-[13px] font-medium leading-[18px] tracking-[-0.1px] text-[#212121]">
        {item.title}
      </span>

      {/* price + coupon | Add combo */}
      <div data-id={`${dataId}-bottom`} className="flex items-center gap-2.5">
        <div data-id={`${dataId}-pricing`} className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span data-id={`${dataId}-price-row`} className="flex items-end gap-1.5">
            <span data-id={`${dataId}-price`} className="inline-flex items-center gap-0.5 font-noontree text-[16px] font-bold leading-[22px] tracking-[-0.15px] text-[#1D2539]">
              <Dirham />
              {item.price}
            </span>
            {item.comparePrice && (
              <span data-id={`${dataId}-compare`} className="font-noontree text-[12px] font-normal leading-[18px] tracking-[-0.1px] text-[#666D85] line-through">
                {item.comparePrice}
              </span>
            )}
          </span>
          {item.coupon && (
            <span data-id={`${dataId}-coupon`} className="self-start rounded border-[0.5px] border-dashed border-[#CBF6E5] bg-[#E3FCF2] px-1 py-0.5 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-[#0B623F]">
              {withDirham(item.coupon)}
            </span>
          )}
        </div>
        <button
          type="button"
          data-id={`${dataId}-cta`}
          onClick={onAdd}
          className={`h-10 shrink-0 rounded-[10px] border px-4 font-noontree text-[12px] font-semibold leading-4 transition-colors ${
            added ? 'border-[#0F61FF] bg-[#0F61FF] text-white' : 'border-[#D6E9FF] bg-white text-[#0F61FF]'
          }`}
        >
          {added ? 'Added' : 'Add combo'}
        </button>
      </div>
    </div>
  )
}

export default function BundleSheet1({ open, onClose, items = [], savings = '20', dataId = 'bundle-sheet' }) {
  const did = (s) => `${dataId}-${s}`
  const [added, setAdded] = useState({})

  return (
    <AnimatePresence>
      {open && (
        <motion.div key={dataId} data-id={dataId} className="fixed inset-0 z-[60] flex justify-center">
          {/* frame-width column so the scrim + sheet track the phone frame */}
          <div className="relative w-full max-w-md">
            {/* Overlay — 80% #000 */}
            <motion.div
              data-id={did('overlay')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80"
            />

            {/* Sheet */}
            <motion.div
              data-id={did('sheet-wrap')}
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '110%' }}
              transition={springs.sheet}
              className="absolute inset-x-0 bottom-0 p-3"
            >
              <Squircle
                as="div"
                cornerRadius={16}
                cornerSmoothing={1}
                data-id={did('sheet')}
                className="relative flex max-h-[680px] flex-col p-0.5 shadow-[0px_-2px_16px_rgba(0,0,0,0.12)]"
                style={{ background: 'linear-gradient(180deg, #E8F2FF 0%, #F7F7F7 100%)' }}
              >
                {/* decorative line-art pattern behind the header */}
                <img
                  data-id={did('pattern')}
                  src={patternBg}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 z-0 w-full"
                />

                {/* Header — combo gif + "Buy as combo &" + save ticket */}
                <div data-id={did('header')} className="relative z-[1] flex items-center gap-2 px-3 pb-2 pt-4">
                  <ComboGif dataId={did('header-icon')} className="h-6 w-6 shrink-0" />
                  <div data-id={did('header-text')} className="flex items-center gap-1">
                    <span data-id={did('header-title')} className="font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#0A49B8]">
                      Buy as combo &amp;
                    </span>
                    <PriceTicket dataId={did('header-ticket')} savings={savings} />
                  </div>
                </div>

                {/* Combo card list */}
                <div data-id={did('list')} className="scrollbar-hide relative z-[1] flex flex-1 flex-col gap-2 overflow-y-auto p-3">
                  {items.map((it) => (
                    <ComboCard
                      key={it.id}
                      dataId={did(`card-${it.id}`)}
                      item={it}
                      added={!!added[it.id]}
                      onAdd={() => setAdded((prev) => ({ ...prev, [it.id]: !prev[it.id] }))}
                    />
                  ))}
                  <div data-id={did('spacer')} className="h-1 shrink-0" />
                </div>
              </Squircle>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
