// ComboReveal — both the "Combo" chip and the count stream in left-to-right via
// an animated clip-path inset (GPU-composited, so no layout-thrash lag). The
// chip uses `round 6px` on the clip so its right corner stays rounded as the
// reveal grows or reduces.
import { AnimatePresence, motion } from 'framer-motion'
import { useComboToggle } from './useComboToggle'

const COMBO_CLASS =
  'inline-flex h-[20px] items-center whitespace-nowrap rounded-md bg-[#F5FAFF] px-1.5 font-noontree text-[12px] font-semibold leading-none text-[#0F61FF]'
const COUNT_CLASS =
  'inline-flex items-center whitespace-nowrap font-noontree text-[12px] font-medium leading-none tracking-[-0.1px] text-[#666D85]'

const comboClip = {
  initial: { clipPath: 'inset(0 100% 0 0 round 6px)' },
  animate: { clipPath: 'inset(0 0% 0 0 round 6px)' },
  exit: { clipPath: 'inset(0 100% 0 0 round 6px)' },
}
const countClip = {
  initial: { clipPath: 'inset(0 100% 0 0)' },
  animate: { clipPath: 'inset(0 0% 0 0)' },
  exit: { clipPath: 'inset(0 100% 0 0)' },
}

export function ComboReveal({ count, interval = 2600, delay = 0, dataId }) {
  const showCombo = useComboToggle(delay)

  const clip = showCombo ? comboClip : countClip

  return (
    <div data-id={dataId} className="flex h-[20px] items-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={showCombo ? 'combo' : 'count'}
          className={showCombo ? COMBO_CLASS : COUNT_CLASS}
          style={{ willChange: 'clip-path' }}
          initial={clip.initial}
          animate={clip.animate}
          exit={clip.exit}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          {showCombo ? 'Combo' : count}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
