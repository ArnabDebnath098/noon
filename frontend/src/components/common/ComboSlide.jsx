// ComboSlide — alternates between the "Combo" chip and the product count with a
// vertical roll (odometer-style): the old line slides up and out while the new
// one rolls up from below. A different feel from ComboType's per-letter spin.
import { AnimatePresence, motion } from 'framer-motion'
import { useComboToggle } from './useComboToggle'

const COMBO_CLASS =
  'inline-flex h-[20px] items-center rounded-md bg-[#F5FAFF] px-1.5 font-noontree text-[12px] font-semibold leading-none text-[#0F61FF]'
const COUNT_CLASS =
  'inline-flex items-center font-noontree text-[12px] font-medium leading-none tracking-[-0.1px] text-[#666D85]'

export function ComboSlide({ count, interval = 2600, delay = 0, dataId }) {
  const showCombo = useComboToggle(delay)

  return (
    <div
      data-id={dataId}
      className="relative h-[20px] w-full overflow-hidden"
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={showCombo ? 'combo' : 'count'}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute left-0 top-0 flex h-full items-center ${
            showCombo ? COMBO_CLASS : COUNT_CLASS
          }`}
        >
          {showCombo ? 'Combo' : count}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
