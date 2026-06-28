// ComboCounter — a different approach: when the count appears, the leading
// number rolls UP from 0 to its value (an animated counter), while the "Combo"
// chip swaps in/out with a soft scale-fade. Distinct from the other variants,
// which only move/reveal existing text — here the number itself animates.
import { animate, AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useComboToggle } from './useComboToggle'

const COMBO_CLASS =
  'inline-flex h-[20px] items-center rounded-md bg-[#F5FAFF] px-1.5 font-noontree text-[12px] font-semibold leading-none text-[#0F61FF]'
const COUNT_CLASS =
  'inline-flex items-center whitespace-nowrap font-noontree text-[12px] font-medium leading-none tracking-[-0.1px] text-[#666D85]'

function parseCount(count) {
  const m = String(count).match(/^(\d+)(.*)$/)
  return m
    ? { num: parseInt(m[1], 10), suffix: m[2] }
    : { num: null, suffix: String(count) }
}

export function ComboCounter({ count, delay = 0, dataId }) {
  const showCombo = useComboToggle(delay)
  const { num, suffix } = parseCount(count)
  const [display, setDisplay] = useState(num ?? 0)

  useEffect(() => {
    if (showCombo || num == null) return
    const controls = animate(0, num, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [showCombo, num])

  return (
    <div data-id={dataId} className="flex h-[20px] items-center">
      <AnimatePresence mode="wait" initial={false}>
        {showCombo ? (
          <motion.span
            key="combo"
            className={COMBO_CLASS}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            Combo
          </motion.span>
        ) : (
          <motion.span
            key="count"
            className={COUNT_CLASS}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {num != null ? `${display}${suffix}` : count}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
