// ComboType — alternates between a highlighted "Combo" chip and the product
// count. Each character types in sequentially while rotating into place
// (staggered rotateX), giving a "typed with a spin" feel. Loops on an interval.
import { AnimatePresence, motion } from 'framer-motion'
import { useComboToggle } from './useComboToggle'

const group = {
  initial: {},
  animate: { transition: { staggerChildren: 0.045 } },
  exit: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
}

const char = {
  initial: { opacity: 0, rotateX: -90, y: 3 },
  animate: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 0.22 } },
  exit: { opacity: 0, rotateX: 90, y: -3, transition: { duration: 0.16 } },
}

function Typed({ text }) {
  return [...text].map((ch, i) => (
    <motion.span
      key={i}
      variants={char}
      className="inline-block origin-bottom [backface-visibility:hidden]"
    >
      {ch === ' ' ? ' ' : ch}
    </motion.span>
  ))
}

export function ComboType({ count, interval = 2600, delay = 0, dataId }) {
  const showCombo = useComboToggle(delay)

  return (
    <div
      data-id={dataId}
      className="flex h-[20px] items-center overflow-hidden [perspective:400px]"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={showCombo ? 'combo' : 'count'}
          variants={group}
          initial="initial"
          animate="animate"
          exit="exit"
          className={
            showCombo
              ? 'inline-flex h-[20px] items-center rounded-md bg-[#F5FAFF] px-1.5 py-0.5 font-noontree text-[12px] font-semibold leading-none text-[#0F61FF]'
              : 'inline-flex items-center font-noontree text-[12px] font-medium leading-none tracking-[-0.1px] text-[#666D85]'
          }
        >
          <Typed text={showCombo ? 'Combo' : count} />
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
