// ComboChipOnce — blue combo chip with a ONE-TIME reveal: shows "Combo" first,
// then slides up and changes to the product count. Chip width animates (layout);
// runs once and settles on the count.
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function ComboChipOnce({
  count,
  delay = 2000,
  dataId,
  bare = false,
  countColor = '#0F61FF', // colour of the "count" state ("Combo" stays blue)
  countWeight = 600, // font-weight of the "count" state ("Combo" stays 600)
  centered = false, // grow/shrink from the centre instead of the left edge
}) {
  const [showCount, setShowCount] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowCount(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  // `bare` drops the chip background/padding (the parent already provides it).
  // No `layout` width morph. `centered` stacks both states in one grid cell so
  // the swap stays anchored on the centre; otherwise it's left-anchored.
  const base = `relative h-[20px] w-fit overflow-hidden font-noontree text-[12px] font-semibold leading-none ${
    centered ? 'inline-grid place-items-center' : 'inline-flex items-center'
  }`

  return (
    <span data-id={dataId} className={bare ? base : `${base} rounded-md bg-[#F5FAFF] px-1.5`}>
      <AnimatePresence mode={centered ? 'sync' : 'popLayout'} initial={false}>
        <motion.span
          key={showCount ? 'count' : 'combo'}
          className={`whitespace-nowrap ${centered ? 'col-start-1 row-start-1 text-center' : ''}`}
          style={{ color: showCount ? countColor : '#0F61FF', fontWeight: showCount ? countWeight : 600 }}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          // opacity fades fast (front-loaded) so the text is invisible before it
          // slides past the container edge → no clipping; the y move stays smooth
          transition={{
            y: { duration: 0.36, ease: [0.22, 0.61, 0.36, 1] },
            opacity: { duration: 0.16, ease: 'easeOut' },
          }}
        >
          {showCount ? count : 'Combo'}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
