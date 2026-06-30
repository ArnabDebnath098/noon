// "Recently used a different address" island — a bottom sheet shown when the
// user switches between certain marketplaces (e.g. minutes → supermall). It
// surfaces the address last used in the previous marketplace and offers to
// reuse it. Slides up via AnimatePresence; respects the bottom safe area.
import { motion, AnimatePresence } from 'framer-motion'
import { springs } from '../../../utils/motion'
import mapBg from '../../../assets/address/map.png'
import marker from '../../../assets/address/marker.svg'
import minutesLogo from '../../../assets/address/minutes.svg'

// Pin + soft ground shadow, centred over the map.
function Pin() {
  return (
    <div data-id="recent-addr-pin" className="flex flex-col items-center">
      <img
        data-id="recent-addr-pin-icon"
        src={marker}
        alt=""
        className="h-9 w-auto drop-shadow-[0_6px_8px_rgba(229,0,78,0.25)]"
      />
      <span data-id="recent-addr-pin-shadow" className="-mt-1 h-0.5 w-3 rounded-full bg-[rgba(49,42,42,0.32)] blur-[1px]" />
    </div>
  )
}

export default function RecentAddressSheet({ open, marketplaceLogo = minutesLogo, addressLabel, addressLine, onUse, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="recent-addr-backdrop"
            data-id="recent-addr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-black/90 backdrop-blur-[1px]"
          />

          <motion.div
            key="recent-addr-sheet"
            data-id="recent-addr-sheet"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={springs.sheet}
            className="fixed inset-x-0 bottom-0 z-[60] mx-auto w-full max-w-md px-3"
            style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* island */}
            <div
              data-id="recent-addr-island"
              className="flex w-full flex-col items-center gap-8 rounded-xl px-2 pb-2 pt-6"
              style={{
                // white veil over a zoomed-out generic map so it sits quietly
                // in the background and fades fully to white behind the card
                background: `linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.7) 42%, #FFFFFF 90%), url(${mapBg})`,
                backgroundSize: 'cover, cover',
                backgroundPosition: 'center top, center top',
                backgroundRepeat: 'no-repeat, no-repeat',
              }}
            >
              <Pin />

              {/* parent: card + actions */}
              <div data-id="recent-addr-parent" className="flex w-full flex-col gap-3.5">
                {/* breakdown amount container */}
                <div
                  data-id="recent-addr-card"
                  className="flex flex-col items-center gap-3 rounded-[14px] border border-[#F2F3F7] bg-white px-4 pb-5 pt-2.5 shadow-[0_2px_12px_rgba(14,14,14,0.02)]"
                >
                  {/* header text */}
                  <div data-id="recent-addr-header" className="flex flex-col items-center gap-0.5">
                    <motion.p
                      data-id="recent-addr-title"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12, duration: 0.25 }}
                      className="text-center font-noontree text-[16px] font-bold leading-[22px] tracking-[-0.15px] text-[#1D2539]"
                    >
                      You recently used a different address in
                    </motion.p>
                    <motion.img
                      data-id="recent-addr-marketplace-logo"
                      src={marketplaceLogo}
                      alt="minutes"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.18, ...springs.snappy }}
                      className="h-[14px] w-auto"
                    />
                  </div>

                  {/* dashed divider */}
                  <div data-id="recent-addr-divider" className="h-px w-full border-t border-dashed border-[#F2F3F7]" />

                  {/* address */}
                  <motion.p
                    data-id="recent-addr-address"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.25 }}
                    className="text-center font-noontree text-[14px] leading-[20px] tracking-[-0.1px]"
                  >
                    <span data-id="recent-addr-address-label" className="font-bold text-[#E5004E]">
                      {addressLabel}
                    </span>
                    <span data-id="recent-addr-address-line" className="font-normal text-[#666D85]">
                      {' '}
                      - {addressLine}
                    </span>
                  </motion.p>
                </div>

                {/* actions */}
                <div data-id="recent-addr-actions" className="flex w-full items-center gap-3">
                  <button
                    type="button"
                    data-id="recent-addr-dismiss"
                    onClick={onClose}
                    className="flex h-12 flex-1 items-center justify-center rounded-[10px] border border-[#EAECF0] bg-white font-noontree text-[14px] font-semibold text-[#1D2539] active:scale-[0.98]"
                  >
                    No
                  </button>
                  <button
                    type="button"
                    data-id="recent-addr-use"
                    onClick={onUse}
                    className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-[#101628] font-noontree text-[14px] font-semibold text-white active:scale-[0.98]"
                  >
                    Use this address
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
