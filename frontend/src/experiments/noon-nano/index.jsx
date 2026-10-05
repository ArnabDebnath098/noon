import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from '../../components/layout/AppShell'
import useElementWidth from '../../hooks/useElementWidth'
import NanoBottomNav from './NanoBottomNav'
import NanoHomeArt, { NANO_HOME_ART } from './NanoHomeArt'

/**
 * noon nano — Kids experiment.
 *
 * The Kids-Side home (Figma 492:26324) with the 3D-coin bottom nav (52:5472).
 * Home is the default screen, so no tab is active there (Figma Active = None);
 * each tab opens its own screen (/noon-nano/tasks · /wallet · /account) where
 * that tab is active. The tab screens are shells (header back to home) until
 * their Figma screens are mapped. Scrolling down compacts the nav: labels fade
 * and the coins settle into their space; scrolling up brings them back.
 */

const BASE = '/noon-nano'
const TABS = { tasks: 'Tasks', wallet: 'Wallet', account: 'Account' }
const INK = '#1D2539'
// nav height above the safe-area inset: 24 top + 80 item + 6 bottom (Figma)
const NAV_H = 110
const NAV_PAD = `calc(${NAV_H}px + var(--sab, 0px) + var(--sbp, 0px))`
// compact needs a little travel in one direction so small jitters don't flicker
const TRAVEL = 12
const TOP = 16

/** scroll-direction → compact nav, with travel hysteresis */
function useScrollCompact() {
  const [compact, setCompact] = useState(false)
  const last = useRef(0)
  const travel = useRef(0)
  const onScroll = useCallback((e) => {
    const y = e.currentTarget.scrollTop
    const dy = y - last.current
    last.current = y
    if (y <= TOP) {
      travel.current = 0
      setCompact(false)
      return
    }
    if (Math.sign(dy) !== Math.sign(travel.current)) travel.current = 0
    travel.current += dy
    if (travel.current > TRAVEL) setCompact(true)
    else if (travel.current < -TRAVEL) setCompact(false)
  }, [])
  const reset = useCallback(() => {
    last.current = 0
    travel.current = 0
    setCompact(false)
  }, [])
  return { compact, onScroll, reset }
}

/** home: the 375px Figma artwork, scaled to the screen width */
function HomeScreen() {
  const [ref, width] = useElementWidth(NANO_HOME_ART.width)
  const scale = width / NANO_HOME_ART.width
  return (
    <div ref={ref} data-id="nano-home" className="relative w-full overflow-hidden" style={{ height: NANO_HOME_ART.height * scale }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
        <NanoHomeArt />
      </div>
    </div>
  )
}

/** a tab's screen — shell until its Figma screen is mapped */
function TabScreen({ id, onBack }) {
  return (
    <div data-id={`nano-screen-${id}`} className="flex min-h-full flex-col bg-white" style={{ paddingTop: 'var(--sat, 0px)' }}>
      <header data-id={`nano-screen-${id}-header`} className="grid h-14 shrink-0 grid-cols-[56px_1fr_56px] items-center">
        <button
          type="button"
          data-id={`nano-screen-${id}-back`}
          aria-label="Back to home"
          onClick={onBack}
          className="ml-1.5 flex h-11 w-11 items-center justify-center rounded-full active:scale-95"
          style={{ color: INK }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="m-0 text-center font-noontree text-[20px] font-bold leading-7 tracking-[-0.25px]" style={{ color: INK }}>
          {TABS[id]}
        </h1>
      </header>
    </div>
  )
}

export default function NoonNanoExperiment() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const segment = pathname.slice(BASE.length).split('/').filter(Boolean)[0]
  const tab = segment in TABS ? segment : null
  const { compact, onScroll, reset } = useScrollCompact()
  useEffect(reset, [tab, reset]) // each screen opens at the top with the labels showing

  return (
    <AppShell>
      {/* one scroll container per screen (keyed), so each opens at the top */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={tab ?? 'home'}
          data-id="nano-body"
          onScroll={onScroll}
          className="scrollbar-hide relative min-h-0 flex-1 overflow-y-auto"
          style={{ paddingBottom: NAV_PAD }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        >
          {tab ? <TabScreen id={tab} onBack={() => navigate(BASE)} /> : <HomeScreen />}
        </motion.main>
      </AnimatePresence>

      {/* Floating back-to-experiments button (above the bottom nav) */}
      <div
        className="pointer-events-none fixed left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 justify-end px-4"
        style={{ bottom: `calc(${NAV_PAD} + 16px)` }}
      >
        <button
          type="button"
          data-id="nano-back"
          aria-label="Back to experiments"
          onClick={() => navigate('/')}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1D2539] text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:scale-95"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <NanoBottomNav activeId={tab} compact={compact} onChange={(id) => navigate(`${BASE}/${id}`)} />
    </AppShell>
  )
}
