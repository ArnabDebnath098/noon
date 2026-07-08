// Marketplace switcher — VARIATION 6 ("push-down reveal", iOS-Wallet style).
//
// Tapping the grid tile doesn't open a box — it slides the WHOLE home page down
// (like pulling down a cover sheet) and reveals every marketplace in the empty
// space that opens up at the top. Tapping a marketplace selects it and the page
// springs back up.
//
// To move the real page (not a fake clone) we reach up the DOM for the scroll
// container (`marketplace-main`) and translate it, then portal a dark
// marketplace panel into the app frame *behind* it. The panel fills the frame;
// only the revealed strip above the pushed-down page is visible.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { springs, easings } from '../../../utils/motion'
import MarketplaceMark from './MarketplaceMark'
import TriggerRow from './TriggerRow'

const STATUS_PAD = 47
const SLIDE_MS = 550 // page push-down duration; style resets wait for it
const SLIDE = `transform ${SLIDE_MS / 1000}s ${easings.iosCss}`

const gridContainer = { hidden: {}, show: { transition: { staggerChildren: 0.03, delayChildren: 0.14 } } }
const gridItem = {
  hidden: { opacity: 0, y: 14, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: springs.snappy },
}

export default function MarketplaceSwitcherV6({ items, activeId, onChange }) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [frame, setFrame] = useState({ w: 390, h: 780, el: null, main: null })
  // the trigger row's third tile holds the last marketplace picked from the
  // panel (slots 1 & 2 are fixed and select in place)
  const [thirdId, setThirdId] = useState(items[2]?.id)
  const rowItems = [items[0], items[1], items.find((m) => m.id === thirdId)].filter(Boolean)

  // grab the frame + scroll container we'll push down
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const frameEl = el.closest('[data-id="app-frame"]')
    const mainEl = el.closest('[data-id="marketplace-main"]')
    if (frameEl) setFrame({ w: frameEl.offsetWidth, h: frameEl.offsetHeight, el: frameEl, main: mainEl })
  }, [])

  const REVEAL = Math.min(frame.h * 0.58, 470)

  // push the real page down / restore it
  useEffect(() => {
    const main = frame.main
    if (!main) return undefined
    main.style.transition = SLIDE
    if (open) {
      main.style.transform = `translateY(${REVEAL}px)`
      main.style.zIndex = '30'
      main.style.borderTopLeftRadius = '22px'
      main.style.borderTopRightRadius = '22px'
      main.style.boxShadow = '0 -14px 44px rgba(0,0,0,0.30)'
      main.style.overflow = 'hidden'
      return undefined
    }
    main.style.transform = 'translateY(0px)'
    main.style.boxShadow = 'none'
    const t = setTimeout(() => {
      main.style.borderTopLeftRadius = ''
      main.style.borderTopRightRadius = ''
      main.style.overflow = ''
      main.style.zIndex = ''
    }, SLIDE_MS + 10)
    return () => clearTimeout(t)
  }, [open, frame.main, REVEAL])

  // hard reset if the variant is swapped away while open
  useEffect(
    () => () => {
      const main = frame.main
      if (!main) return
      Object.assign(main.style, {
        transform: '', transition: '', zIndex: '', boxShadow: '', overflow: '',
        borderTopLeftRadius: '', borderTopRightRadius: '',
      })
    },
    [frame.main],
  )

  // picking from the panel: fixed row marketplaces select in place; anything
  // else swaps into the third tile (variation-1 behaviour)
  const select = (id) => {
    onChange(id)
    if (id !== items[0]?.id && id !== items[1]?.id) setThirdId(id)
    setOpen(false)
  }

  return (
    <>
      {/* collapsed trigger row (rootRef anchors the DOM lookup above) */}
      <TriggerRow
        rootRef={rootRef}
        items={items}
        rowItems={rowItems}
        activeId={activeId}
        onChange={onChange}
        onOpen={() => setOpen(true)}
      />

      {/* revealed marketplace panel — sits behind the pushed-down page */}
      {frame.el &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                data-id="mp-reveal-panel"
                className="absolute inset-0"
                style={{ zIndex: 10, background: 'linear-gradient(180deg, #241C2E 0%, #14121A 100%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: easings.ios }}
              >
                <div className="absolute inset-x-0 top-0" style={{ height: REVEAL }}>
                  <div style={{ height: STATUS_PAD }} />
                  <div className="flex items-center px-5 pb-1">
                    <span className="font-noontree text-[19px] font-black lowercase text-white">marketplaces</span>
                  </div>

                  <motion.div
                    className="grid grid-cols-4 gap-x-2 gap-y-3 px-4 pt-3"
                    variants={gridContainer}
                    initial="hidden"
                    animate="show"
                  >
                    {items.map((m) => {
                      const active = m.id === activeId
                      return (
                        <motion.button
                          key={m.id}
                          type="button"
                          variants={gridItem}
                          data-id={`mp-reveal-${m.id}`}
                          aria-pressed={active}
                          onClick={() => select(m.id)}
                          className="flex flex-col items-center gap-1.5"
                        >
                          <span
                            style={{ background: active ? m.accent : m.bg ?? 'rgba(255,255,255,0.94)' }}
                            className="flex h-[62px] w-[62px] items-center justify-center rounded-[18px] shadow-[0_6px_18px_rgba(0,0,0,0.28)]"
                          >
                            <MarketplaceMark m={m} white={active && !m.lightAccent} active={active} size={44} />
                          </span>
                          <span className="max-w-[68px] truncate text-center font-noontree text-[11px] lowercase text-white/75">
                            {m.label.replace('\n', ' ')}
                          </span>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                </div>

                {/* chevron handle — tap to pull the page back up */}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center"
                  style={{ top: REVEAL - 34, width: 56, height: 26 }}
                >
                  <svg width="26" height="14" viewBox="0 0 26 14" fill="none" aria-hidden="true">
                    <path d="M3 10l10-7 10 7" stroke="rgba(255,255,255,0.5)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          frame.el,
        )}
    </>
  )
}
