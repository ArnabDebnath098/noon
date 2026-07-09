// NudgeFlipper — cycles through a small set of product "nudges" (Lowest price,
// Selling out fast, #N bestseller, Free Delivery, N left in stock …), one at a
// time, with a vertical scroll/flip animation. Icon is coloured per nudge; the
// label stays neutral grey.
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { easings } from '../../utils/motion'

export function NudgeFlipper({ nudges = [], interval = 2200, dataId }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (nudges.length < 2) return undefined
    const t = setInterval(() => setI((n) => (n + 1) % nudges.length), interval)
    return () => clearInterval(t)
  }, [nudges.length, interval])

  if (!nudges.length) return null
  const cur = nudges[i % nudges.length]
  return (
    <div data-id={dataId} className="relative h-4 overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={i}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.3, ease: easings.ios }}
          className="flex items-center gap-1"
        >
          <img src={cur.icon} alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="truncate font-figtree text-[12px] leading-4 tracking-[-0.12px] text-[#475067]">
            {cur.text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
