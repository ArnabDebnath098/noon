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
}) {
  const [showCount, setShowCount] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowCount(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  // `bare` drops the chip background/padding (the parent already provides it).
  const base =
    'inline-flex h-[20px] w-fit items-center overflow-hidden font-noontree text-[12px] font-semibold leading-none'

  return (
    <motion.span
      layout
      data-id={dataId}
      className={bare ? base : `${base} rounded-md bg-[#F5FAFF] px-1.5`}
      transition={{ layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={showCount ? 'count' : 'combo'}
          className="whitespace-nowrap"
          style={{ color: showCount ? countColor : '#0F61FF' }}
          initial={{ y: 7, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -7, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {showCount ? count : 'Combo'}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}
