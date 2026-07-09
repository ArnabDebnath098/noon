// SearchPage — a search results / PLP page that slides in from the right when
// the user taps "View all combos". Reuses the marketplace-home search field
// (back · query · camera), a marketplace tab row, filter chips and a 2-column
// grid of PlpProductCards.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { easings } from '../../utils/motion'
import { ComboProductCard, PlpProductCard } from '../../components/common'
import { COMBO_GIF } from './BundleContainer'
import BundleShowcase from './BundleShowcase'
import cameraIcon from '../../assets/icons/camera.svg'
import mpNoon from '../../assets/icons/mp-noon.svg'
import mpMinutes from '../../assets/icons/mp-minutes.svg'
import mpSupermall from '../../assets/icons/mp-supermall.svg'
import mpExpress from '../../assets/icons/mp-express.svg'

const MP_LOGOS = {
  noon: mpNoon,
  minutes: mpMinutes,
  supermall: mpSupermall,
  express: mpExpress,
}

function SearchField({ query, onBack }) {
  return (
    <div data-id="plp-search" className="px-4 pb-2 pt-1">
      <div className="flex h-12 items-center gap-2 rounded-xl border border-[rgba(64,69,83,0.15)] bg-white pl-0 pr-2">
        <button type="button" data-id="plp-back" aria-label="Back" onClick={onBack} className="flex h-10 w-10 shrink-0 items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12.5 4.5L7 10l5.5 5.5" stroke="#343D54" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span data-id="plp-query" className="flex-1 truncate font-figtree text-[14px] font-medium text-[#343D54]">
          {query}
        </span>
        <span className="h-6 w-px bg-[rgba(2,6,12,0.15)]" />
        <button type="button" data-id="plp-camera" aria-label="Search by image" className="flex h-8 w-8 shrink-0 items-center justify-center">
          <img src={cameraIcon} alt="" aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

function MarketplaceTabs({ tabs }) {
  const [active, setActive] = useState(tabs[0]?.id)
  return (
    <div data-id="plp-mps" className="scrollbar-hide flex h-[52px] items-stretch overflow-x-auto">
      {tabs.map((t) => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            type="button"
            data-id={`plp-mp-${t.id}`}
            onClick={() => setActive(t.id)}
            className="relative flex w-[112px] shrink-0 flex-col items-center justify-center gap-1"
          >
            <img
              data-id={`plp-mp-${t.id}-logo`}
              src={MP_LOGOS[t.id]}
              alt={t.label}
              className="max-h-[18px] w-auto max-w-[80px] object-contain"
            />
            <span
              data-id={`plp-mp-${t.id}-name`}
              className="font-noontree text-[12px] font-normal leading-[14px] text-[#262A33]"
            >
              {t.name ?? t.label}
            </span>
            {isActive && (
              <motion.span layoutId="plp-mp-underline" className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-[#0E0E0E]" />
            )}
          </button>
        )
      })}
    </div>
  )
}

function FilterChips({ chips }) {
  return (
    <div data-id="plp-chips" className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-3 py-3">
      {chips.map((c, i) => {
        const isFilter = c === 'Filter'
        const hasChevron = c === 'Sort' || c === 'Price'
        return (
          <button
            key={c}
            type="button"
            data-id={`plp-chip-${i}`}
            className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-[#EBEAEA] bg-white px-2 font-figtree text-[14px] font-medium leading-5 text-[#262A33]"
          >
            {isFilter && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 4.5h9M13.5 4.5h.5M2 11.5h.5M5 11.5h9" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="11.5" cy="4.5" r="1.6" stroke="#0F172A" strokeWidth="1.4" />
                <circle cx="4" cy="11.5" r="1.6" stroke="#0F172A" strokeWidth="1.4" />
              </svg>
            )}
            <span>{c}</span>
            {hasChevron && (
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M6 8l4 4 4-4" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default function SearchPage({ open, onClose, plp, bundle, variant }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="plp"
          data-id="plp"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: easings.ios }}
          className="fixed inset-0 z-[70] flex justify-center overflow-hidden"
        >
          <div className="relative flex h-full w-full max-w-md flex-col bg-white">
            {/* sticky header */}
            <div data-id="plp-header" className="shrink-0 bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.06)]">
              <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />
              <SearchField query={plp.query} onBack={onClose} />
              <MarketplaceTabs tabs={plp.marketplaces} />
              <FilterChips chips={plp.chips} />
            </div>

            {/* grid */}
            <div
              data-id="plp-products"
              className="scrollbar-hide flex-1 overflow-y-auto bg-white"
              style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
            >
              {(() => {
                const renderCard = (p) =>
                  p.kind === 'product' ? (
                    <PlpProductCard key={p.id} dataId={`plp-card-${p.id}`} {...p} />
                  ) : (
                    <ComboProductCard key={p.id} dataId={`plp-card-${p.id}`} bordered comboIcon={COMBO_GIF} width="100%" {...p} />
                  )

                const showcase = variant === 3 && bundle?.items?.length > 0
                if (!showcase) {
                  return (
                    <div className="grid grid-cols-2 items-stretch gap-2.5 px-3 py-3">
                      {plp.products.map(renderCard)}
                    </div>
                  )
                }

                // variation 3: a row of product cards, then the combos showcase,
                // then the rest of the results.
                const firstRow = plp.products.slice(0, 2)
                const rest = plp.products.slice(2)
                return (
                  <>
                    <div className="grid grid-cols-2 items-stretch gap-2.5 px-3 pb-3 pt-3">
                      {firstRow.map(renderCard)}
                    </div>
                    <BundleShowcase
                      dataId="plp-bundle"
                      items={bundle.items}
                      off={bundle.off}
                      benefits={bundle.benefits}
                      bleed={false}
                    />
                    <div className="grid grid-cols-2 items-stretch gap-2.5 px-3 py-3">
                      {rest.map(renderCard)}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
