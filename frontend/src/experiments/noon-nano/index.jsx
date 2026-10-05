import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from '../../components/layout/AppShell'
import FrameBackButton from '../../components/layout/FrameBackButton'
import useElementWidth from '../../hooks/useElementWidth'
import { marketplaces } from '../../data/marketplace'
import MarketplaceSwitcherV8 from '../marketplace-switcher/sections/MarketplaceSwitcherV8'
import nanoMark from '../../assets/nano/home/sw-nano-mark.svg'
import NanoBot from './NanoBot'
import NanoBottomNav, { NAV_SAFE_BOTTOM } from './NanoBottomNav'
import NanoHomeArt, { NANO_HOME_ART } from './NanoHomeArt'
import UpdatesOverlay, { preloadUpdates } from './updates/UpdatesOverlay'
import { SAMPLE_UPDATES } from './updates/updatesData'

/**
 * noon nano — Kids experiment.
 *
 * The Kids-Side home (Figma 492:26324) with the 3D-coin bottom nav (52:5472).
 * Home is the default screen, so no tab is active there (Figma Active = None);
 * each tab opens its own screen (/noon-nano/tasks · /wallet · /account) where
 * that tab is active. The tab screens are shells (header back to home) until
 * their Figma screens are mapped. Scrolling down compacts the nav: labels fade
 * and the coins settle into their space; scrolling up brings them back.
 * Home also has the draggable 3D noon bot (./NanoBot) above the nav: it shows
 * up for task / approval notifications (the demo plays each once), pops their
 * message bubble, reacts, then leaves.
 */

const BASE = '/noon-nano'
const TABS = { tasks: 'Tasks', wallet: 'Wallet', account: 'Account' }
const INK = '#1D2539'
// nav height above the safe-area inset: 24 top + 80 item + 6 bottom (Figma)
const NAV_H = 110
const NAV_PAD = `calc(${NAV_H}px + ${NAV_SAFE_BOTTOM})`
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

// the search experiment's marketplace switcher, with noon nano first. The nano
// tile keeps its Figma purple with the pre-coloured mark (selected or not), so
// the white invert never applies to it.
const NANO_MARKETPLACE = { id: 'nano', label: 'noon\nnano', logo: nanoMark, logoW: 58, fg: '#7924FF', bg: '#7924FF', accent: '#7924FF', lightAccent: true }
const SWITCHER_ITEMS = [NANO_MARKETPLACE, ...marketplaces]

/** home: the 375px Figma artwork, scaled to the screen width */
function HomeScreen() {
  // tiles only highlight for now; the home stays the nano home
  const [marketplace, setMarketplace] = useState('nano')
  const [ref, width] = useElementWidth(NANO_HOME_ART.width)
  const scale = width / NANO_HOME_ART.width
  return (
    <div ref={ref} data-id="nano-home" className="relative w-full overflow-hidden" style={{ height: NANO_HOME_ART.height * scale }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
        <NanoHomeArt
          switcher={
            <div data-id="nano-marketplace-switcher" className="w-full">
              <MarketplaceSwitcherV8 items={SWITCHER_ITEMS} activeId={marketplace} onChange={setMarketplace} showHint={false} />
            </div>
          }
        />
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
  // the bot is the bell: it opens "Updates today" while there are unread updates
  const [updatesOpen, setUpdatesOpen] = useState(false)
  const [unread, setUnread] = useState(SAMPLE_UPDATES.length)
  // the bell's art is ~1 MB of images: fetch it while the browser is idle, before the first tap
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((fn) => window.setTimeout(fn, 1200))
    const cancel = window.cancelIdleCallback ?? window.clearTimeout
    const id = idle(preloadUpdates)
    return () => cancel(id)
  }, [])
  const closeUpdates = useCallback((readIds) => {
    setUpdatesOpen(false)
    setUnread((n) => Math.max(0, n - readIds.length))
  }, [])
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined
    window.nanoUpdates = { reset: () => setUnread(SAMPLE_UPDATES.length), open: () => setUpdatesOpen(true) }
    return () => {
      delete window.nanoUpdates
    }
  }, [])

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

      {/* back to experiments: outside the phone on the web, floating above the nav on a phone */}
      <FrameBackButton dataId="nano-back" onClick={() => navigate('/')} mobile={{ bottom: `calc(${NAV_PAD} + 16px)` }} />

      {/* the 3D noon bot floats on home only; drag it anywhere above the nav. The 3D scenes
          pause while the Updates overlay covers them (its backdrop blur would re-blur every frame) */}
      {!tab && (
        <NanoBot
          top="calc(var(--sat, 0px) + 8px)"
          bottom={NAV_PAD}
          demo
          onlyOnNotify
          paused={updatesOpen}
          onOpen={unread > 0 ? () => setUpdatesOpen(true) : null}
        />
      )}
      <UpdatesOverlay
        open={updatesOpen}
        onClose={closeUpdates}
        onGo={(u) => {
          if (u.go) navigate(`${BASE}/${u.go}`)
        }}
      />

      <NanoBottomNav activeId={tab} compact={compact} paused={updatesOpen} onChange={(id) => navigate(`${BASE}/${id}`)} />
    </AppShell>
  )
}
