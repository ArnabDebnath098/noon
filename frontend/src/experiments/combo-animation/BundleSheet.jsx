// BundleSheet — "Buy together and save" bottom sheet. Dimmed 80% black overlay
// + a slide-up BundleContainer with a "Done" action bar. The Done CTA activates
// (primary color) once any item is added to the cart.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import { springs } from '../../utils/motion'
import BundleContainer from './BundleContainer'

export default function BundleSheet({ open, onClose, items = [], savings = '20', viewAll, onViewAll, showComboIcon = true, dataId = 'bundle-sheet' }) {
  const did = (s) => `${dataId}-${s}`
  // per-card quantity → the Done CTA activates once anything is in the cart
  const [qtys, setQtys] = useState({})
  const anyAdded = Object.values(qtys).some((q) => q > 0)

  const footer = (
    <div
      data-id={did('footer')}
      className="flex flex-col items-center gap-3 p-3"
      style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
    >
      <Squircle
        as="button"
        type="button"
        cornerRadius={12}
        cornerSmoothing={1}
        data-id={did('done')}
        onClick={onClose}
        className={`h-[52px] w-full font-noontree text-[16px] font-semibold leading-6 transition-colors ${
          anyAdded ? 'bg-[#0F61FF] text-white' : 'bg-[#EAECF0] text-[#989FB3]'
        }`}
      >
        Done
      </Squircle>
    </div>
  )

  return (
    <AnimatePresence>
      {open && (
        <div data-id={dataId} className="fixed inset-0 z-[60] flex justify-center">
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
              <BundleContainer
                dataId={dataId}
                items={items}
                savings={savings}
                viewAll={viewAll}
                onViewAll={onViewAll}
                showComboIcon={showComboIcon}
                onQtyChange={(id, q) => setQtys((prev) => ({ ...prev, [id]: q }))}
                footer={footer}
                className="max-h-[680px] shadow-[0px_-2px_16px_rgba(0,0,0,0.12)]"
              />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
