// Address 2.0 selection — a bottom sheet that slides up over the home screen.
// Pick a saved address, use current location, or add a new one. The sheet and
// backdrop animate via AnimatePresence; the list reveals with a small stagger.
import { motion, AnimatePresence } from 'framer-motion'
import { springs } from '../../../utils/motion'

const ACCENT = '#0F61FF'

// Inline glyphs keyed by address.icon so the sheet has no asset dependencies.
function TypeGlyph({ icon }) {
  if (icon === 'work')
    return (
      <path
        d="M4 8h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Zm5 0V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )
  if (icon === 'other')
    return (
      <path
        d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Zm0-7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )
  return (
    <path
      d="M4 11 12 4l8 7M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

const LIST = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }
const ROW = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: springs.snappy } }

function AddressRow({ a, selected, onClick }) {
  return (
    <motion.button
      type="button"
      variants={ROW}
      data-id={`addr-row-${a.id}`}
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors"
      style={{
        borderColor: selected ? ACCENT : '#E8EAF0',
        backgroundColor: selected ? 'rgba(15,97,255,0.05)' : '#FFFFFF',
      }}
    >
      <span
        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: selected ? ACCENT : '#F2F4F8', color: selected ? '#FFFFFF' : '#5C667E' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <TypeGlyph icon={a.icon} />
        </svg>
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-noontree text-[15px] font-semibold text-[#1B232E]">{a.type}</span>
        <span className="font-noontree text-[13px] leading-[17px] text-[#5C667E]">{a.line}</span>
        <span className="font-noontree text-[12px] text-[#9AA1B2]">{a.city}</span>
      </span>

      {/* radio */}
      <span
        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
        style={{ borderColor: selected ? ACCENT : '#CBD0DC' }}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ACCENT }} />}
      </span>
    </motion.button>
  )
}

export default function AddressSheet({ open, addresses, selectedId, onSelect, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="addr-backdrop"
            data-id="addr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[45] bg-black/35"
          />

          <motion.div
            key="addr-sheet"
            data-id="addr-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springs.panel}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md"
          >
            <div
              className="rounded-t-[24px] bg-white px-5 pt-3 shadow-[0_-12px_40px_rgba(16,24,40,0.18)]"
              style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E0E3EB]" />

              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-noontree text-[18px] font-bold text-[#1B232E]">Select address</h2>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F4F8]"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="m5 5 10 10M15 5 5 15" stroke="#5C667E" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* use current location */}
              <button
                type="button"
                data-id="addr-current-location"
                onClick={onClose}
                className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-[#E8EAF0] p-3 text-left"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(15,97,255,0.1)', color: ACCENT }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2v3m0 14v3m10-10h-3M5 12H2m17 0a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="2.4" fill="currentColor" />
                  </svg>
                </span>
                <span className="flex flex-col">
                  <span className="font-noontree text-[15px] font-semibold" style={{ color: ACCENT }}>
                    Use my current location
                  </span>
                  <span className="font-noontree text-[12px] text-[#9AA1B2]">Enable for accurate delivery</span>
                </span>
              </button>

              <p className="mb-2 font-noontree text-[12px] font-semibold uppercase tracking-[0.5px] text-[#9AA1B2]">
                Saved addresses
              </p>

              <motion.div variants={LIST} initial="hidden" animate="show" className="flex flex-col gap-2.5">
                {addresses.map((a) => (
                  <AddressRow key={a.id} a={a} selected={a.id === selectedId} onClick={() => onSelect(a.id)} />
                ))}
              </motion.div>

              <button
                type="button"
                data-id="addr-add-new"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#C3CAD9] py-3 font-noontree text-[15px] font-semibold"
                style={{ color: ACCENT }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 4v12M4 10h12" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Add new address
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
