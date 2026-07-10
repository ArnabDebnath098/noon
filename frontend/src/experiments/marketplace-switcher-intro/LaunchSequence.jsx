// Noon launch → home. A continuous choreography that reveals the active
// marketplace, then resolves into the real (scrollable) noon home:
//
//   P1 hold      : only Noon Minutes (selected, yellow) centred
//   P2 assemble  : the rest slide in — before Minutes from the left, after from
//                  the right (staggered from the centre out); Minutes stays
//   P3 dock-up   : the strip travels straight up to the nav slot AND the noon
//                  home starts loading behind it — theme bg, then the top section
//                  (delivery / location / search), then a skeleton below
//   P4 carousel  : the strip scrolls horizontally with momentum (a human flick)
//                  until Noon reaches the selected slot
//   P5 select    : active state interpolates from Minutes → Noon
//   P6 confirm   : Noon gives one restrained horizontal breath
// The strip stays put once docked (it is the switcher — no swap/replacement).
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { marketplaces } from '../../data/marketplace'
import MarketplaceMark from '../marketplace-switcher/sections/MarketplaceMark'
import MarketHeader from '../address-selection/sections/MarketHeader'
import HomeSkeleton from '../marketplace-switcher/sections/HomeSkeleton'
import { viewFor } from '../address-selection/marketplaceViews'

const W = 76
const GAP = 8
const RADIUS = 20
const YELLOW = '#FEEE00'
const TILE_CLASS =
  'flex items-center justify-center rounded-[20px] border border-[#EFEFEF] px-2 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'

const MINUTES_INDEX = marketplaces.findIndex((m) => m.id === 'minutes')
const NOON_INDEX = marketplaces.findIndex((m) => m.id === 'noon')
const NOON_VIEW = viewFor('noon')

const SETTLE = [0.22, 0.61, 0.36, 1] // slide-in settle
const DOCK = [0.32, 0.72, 0, 1] // vertical dock-up
const FLICK = { type: 'spring', stiffness: 90, damping: 20, mass: 1 } // human momentum scroll

const TOP_PAD = 47 // status-bar space (matches the home)
const SLOT_PY = 8 // switcher row vertical padding (matches the home)
const DOCK_TOP = TOP_PAD + SLOT_PY // strip rests exactly where the home switcher sits
const DOCK_LEFT = 12 // switcher px-3

export default function LaunchSequence() {
  const ref = useRef(null)
  const [size, setSize] = useState({ w: 390, h: 780 })
  const [phase, setPhase] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ w: el.offsetWidth || 390, h: el.offsetHeight || 780 })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 1000), // assemble
      setTimeout(() => setPhase(2), 1500), // dock up + home loads
      setTimeout(() => setPhase(3), 1950), // carousel
      setTimeout(() => setPhase(4), 2500), // select
      setTimeout(() => setPhase(5), 2780), // confirm
      setTimeout(() => setPhase(6), 3200), // settle → become the scrollable switcher
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  const assembled = phase >= 1
  const dockedUp = phase >= 2
  const scrolled = phase >= 3
  const activeIndex = phase >= 4 ? NOON_INDEX : MINUTES_INDEX
  const confirm = phase >= 5
  const handoff = phase >= 6 // strip fades over the real scrollable switcher

  const tileLeft = (i) => i * (W + GAP)
  const stripX = scrolled ? DOCK_LEFT : size.w / 2 - (tileLeft(MINUTES_INDEX) + W / 2)
  // hold/assemble sit a little above centre (not dead-centre) before docking
  const stripY = dockedUp ? DOCK_TOP : size.h * 0.4 - W / 2

  return (
    <div ref={ref} data-id="mp-intro-launch" className="scrollbar-hide relative h-full overflow-y-auto overflow-x-hidden bg-white">
      {/* noon theme background — fades in as the strip docks */}
      <motion.div
        aria-hidden="true"
        data-id="mp-intro-theme"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 rounded-b-[12px]"
        style={{ height: TOP_PAD + 300, background: NOON_VIEW.theme }}
        initial={{ opacity: 0 }}
        animate={{ opacity: dockedUp ? 1 : 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* home chrome (revealed once docking begins) */}
      <div className="relative z-10" style={{ paddingTop: TOP_PAD }}>
        {/* switcher slot — reserves the row height. Once settled, the real
            width-filling, horizontally-scrollable switcher lives here (the strip
            fades over it, so it's not a visible swap during the move-up). */}
        <div data-id="mp-intro-switcher-slot" style={{ height: W + SLOT_PY * 2 }}>
          {handoff && (
            <div
              data-id="mp-intro-switcher"
              className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-3"
              style={{ paddingTop: SLOT_PY, paddingBottom: SLOT_PY }}
            >
              {marketplaces.map((m) => (
                <div
                  key={m.id}
                  className={`shrink-0 ${TILE_CLASS}`}
                  style={{ width: W, height: W, backgroundColor: m.id === 'noon' ? YELLOW : '#FFFFFF' }}
                >
                  <MarketplaceMark m={m} size={68} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* top section — delivery / location / search */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: dockedUp ? 1 : 0, y: dockedUp ? 0 : 8 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: dockedUp ? 0.12 : 0 }}
        >
          <MarketHeader view={NOON_VIEW} label="Home" line="12, HSBC Tower Branch" revision="noon" onLocation={() => {}} />
        </motion.div>
      </div>

      {/* skeleton content below */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: dockedUp ? 1 : 0, y: dockedUp ? 0 : 12 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: dockedUp ? 0.28 : 0 }}
      >
        <HomeSkeleton />
      </motion.div>

      {/* animated strip — the switcher during the launch; once settled it fades
          over the identical real (scrollable) switcher in the slot, then unmounts */}
      {phase < 7 && (
        <motion.div
          data-id="mp-intro-strip"
          className="absolute left-0 top-0 z-20"
          style={{ height: W, pointerEvents: handoff ? 'none' : 'auto' }}
          initial={false}
          animate={{ x: stripX, y: stripY, opacity: handoff ? 0 : 1 }}
          transition={{ x: FLICK, y: { duration: 0.42, ease: DOCK }, opacity: { duration: 0.2, ease: 'easeInOut' } }}
          onAnimationComplete={() => handoff && setPhase(7)}
        >
          {marketplaces.map((m, i) => {
            const isMinutes = i === MINUTES_INDEX
            const active = i === activeIndex
            const dir = i < MINUTES_INDEX ? -1 : i > MINUTES_INDEX ? 1 : 0
            const slideDelay = isMinutes ? 0 : Math.abs(i - MINUTES_INDEX) * 0.04
            return (
              <motion.div
                key={m.id}
                data-id={`mp-intro-tile-${m.id}`}
                className="absolute top-0"
                style={{ left: tileLeft(i), width: W, height: W }}
                // Minutes fades in after the yellow splash has slid away
                initial={isMinutes ? { opacity: 0 } : false}
                animate={{
                  x: assembled ? 0 : dir * size.w * 0.9,
                  opacity: assembled || isMinutes ? 1 : 0,
                  scaleX: confirm && i === NOON_INDEX ? [1, (W + 4) / W, 1] : 1,
                }}
                transition={{
                  x: { duration: 0.45, ease: SETTLE, delay: slideDelay },
                  opacity: { duration: 0.4, ease: SETTLE, delay: isMinutes ? 0.42 : slideDelay },
                  scaleX: { duration: 0.2, ease: 'easeOut' },
                }}
              >
                <motion.div
                  className={`h-full w-full ${TILE_CLASS}`}
                  animate={{ backgroundColor: active ? YELLOW : '#FFFFFF' }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                >
                  <MarketplaceMark m={m} size={68} />
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
