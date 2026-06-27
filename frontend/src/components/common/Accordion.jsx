// Accordion — stack of collapsible rows (light grey pill, label + chevron).
// Each row toggles independently; content expands/collapses with a height
// animation and the chevron rotates.
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

function Chevron({ open }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="#1D2539"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  )
}

function AccordionRow({ title, content }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="w-full overflow-hidden rounded-xl bg-[#F7F8FA]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <span className="font-noontree text-[16px] font-semibold text-[#1D2539]">
          {title}
        </span>
        <Chevron open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-4 pb-4 font-noontree text-[14px] leading-[20px] text-[#666D85]">
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Accordion({ items, dataId }) {
  return (
    <div data-id={dataId} className="flex w-full flex-col gap-3">
      {items.map((it) => (
        <AccordionRow key={it.id} title={it.title} content={it.content} />
      ))}
    </div>
  )
}
