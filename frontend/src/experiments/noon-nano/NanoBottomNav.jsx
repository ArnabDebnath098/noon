import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { createCoinNav } from './coinNav'
import tasksWordmark from '../../assets/nano/nav/label-tasks-88.svg'
import walletWordmark from '../../assets/nano/nav/label-wallet-88.svg'
import accountWordmark from '../../assets/nano/nav/label-account-88.svg'

/**
 * NanoBottomNav — the noon nano (Kids) bottom nav with 3D coin icons.
 *
 * Mirrors the Figma Kids-Side "Bottom nav" (52:5472): three 88px items (Tasks ·
 * Wallet · Account) on a white fade so content scrolls underneath. Default
 * items show a 13px label; the active item shows its coloured wordmark, and its
 * coin grows 56 → 60.48, rises 1.76px and glows in the item colour. `activeId`
 * may be null (Figma Active = None) on screens outside the three tabs (home).
 *
 * The icons are a live three.js scene (./coinNav): lacquered coins with a
 * modelled book & pencil, an extruded glass nano card and the avatar. Tapping a
 * tab plays its flip (Wallet spins only the card), then calls onChange after a
 * beat so the flip reads before the screen changes. `compact` (while scrolling
 * down) fades the labels and settles the coins into their space; scrolling
 * tilts the coins by scroll speed (up going down, down going up) and they
 * spring back after. `paused` stops the 3D loop while the nav is covered.
 */

export const nanoBottomNavTabs = [
  { id: 'tasks', label: 'Tasks', wordmark: tasksWordmark },
  { id: 'wallet', label: 'Wallet', wordmark: walletWordmark },
  { id: 'account', label: 'Account', wordmark: accountWordmark },
]

const LABEL = 'rgba(29, 37, 57, 0.62)' // Figma default label colour
const FOCUS = '#7924FF'
// white fade on an eased (scrim) curve so there's no visible band where it
// turns solid: 0 at the top → opaque by 75%, solid through the safe area
const SCRIM = [0, 0.013, 0.049, 0.104, 0.175, 0.259, 0.352, 0.45, 0.55, 0.648, 0.741, 0.825, 0.896, 0.951, 0.987, 1]
const SCRIM_AT = [0, 8.1, 15.5, 22.5, 29, 35.3, 41.2, 47.1, 52.9, 58.8, 64.7, 71, 77.5, 84.5, 91.9, 100]
const FADE = `linear-gradient(to bottom, ${SCRIM.map((a, i) => `rgba(255,255,255,${a}) ${(SCRIM_AT[i] * 0.75).toFixed(1)}%`).join(', ')}, #FFFFFF)`
// space below the tab row: the home-indicator inset (web frame / real device),
// at least 16px so the labels never hug the edge, plus the mobile gap (--sbp)
export const NAV_SAFE_BOTTOM = 'calc(max(16px, var(--sab, 0px), env(safe-area-inset-bottom, 0px)) + var(--sbp, 0px))'
// ms between the tap (flip starts) and onChange, so the flip reads first
const FLIP_THEN_CHANGE = 420

export default function NanoBottomNav({ activeId, onChange, compact = false, paused = false }) {
  const reduceMotion = useReducedMotion() ?? false
  const canvasRef = useRef(null)
  const slotRefs = useRef({})
  const engineRef = useRef(null)
  const timerRef = useRef(0)
  // a tapped tab shows selected at once (label, wordmark, glow) while its coin
  // flips; the route catches up after FLIP_THEN_CHANGE
  const [pending, setPending] = useState(null)
  const shownId = pending ?? activeId
  const engineId = useRef(activeId) // what the 3D scene has selected

  // the scene mounts once; the initial tab shows settled (no flip)
  const initialActive = useRef(activeId)
  useEffect(() => {
    const canvas = canvasRef.current
    const { tasks, wallet, account } = slotRefs.current
    if (!canvas || !tasks || !wallet || !account) return undefined
    const engine = createCoinNav({
      canvas,
      slots: { tasks, wallet, account },
      active: initialActive.current,
      reduceMotion,
    })
    engineRef.current = engine
    return () => {
      window.clearTimeout(timerRef.current)
      engine.dispose()
      engineRef.current = null
    }
  }, [reduceMotion])

  // follow an externally changed tab (back button, link) without replaying the flip.
  // When the route catches up with a tap, the scene already has it: re-selecting
  // would cut the flip short mid-spin.
  useEffect(() => {
    setPending(null)
    if (engineId.current === activeId) return
    engineId.current = activeId
    engineRef.current?.select(activeId, { animate: false })
  }, [activeId])

  useEffect(() => {
    engineRef.current?.setCompact(compact)
  }, [compact])

  // covered (e.g. by the Updates overlay): stop rendering, so the GPU and the
  // overlay's backdrop blur aren't redoing the coins every frame for nothing
  useEffect(() => {
    engineRef.current?.setPaused(paused)
  }, [paused])

  // any scroll on the page tilts the coins a touch (scroll doesn't bubble, so listen in capture)
  useEffect(() => {
    const last = new WeakMap()
    const onScroll = (e) => {
      const el = e.target === document ? document.scrollingElement : e.target
      if (!el || typeof el.scrollTop !== 'number') return
      const prev = last.get(el) ?? el.scrollTop
      last.set(el, el.scrollTop)
      engineRef.current?.scroll(el.scrollTop - prev)
    }
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => window.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  const handleTap = (id) => {
    engineId.current = id
    engineRef.current?.select(id) // plays the flip
    window.clearTimeout(timerRef.current)
    if (id === activeId) {
      setPending(null) // already here (or tapped back before the route changed): just the flip
      return
    }
    setPending(id)
    timerRef.current = window.setTimeout(() => onChange?.(id), reduceMotion ? 0 : FLIP_THEN_CHANGE)
  }

  const press = (id, down) => engineRef.current?.setPressed(id, down)

  return (
    <nav
      data-id="nano-bottom-nav"
      data-state={compact ? 'compact' : 'expanded'}
      aria-label="Main"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2"
      style={{ paddingBottom: NAV_SAFE_BOTTOM }}
    >
      {/* the fade starts 32px above the bar so it eases in over a longer run */}
      <div
        data-id="nano-bottom-nav-fade"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-8 bottom-0"
        style={{ background: FADE }}
      />
      {/* the 3D canvas reaches above the bar so flipping coins don't clip */}
      <canvas
        ref={canvasRef}
        data-id="nano-bottom-nav-scene"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[240px] w-full"
      />
      <div className="relative flex items-end justify-center gap-5 pb-1.5 pt-6">
        {nanoBottomNavTabs.map((item) => {
          const active = item.id === shownId
          return (
            <button
              key={item.id}
              type="button"
              data-id={`nano-bottomnav-tab-${item.id}`}
              data-active={active || undefined}
              aria-current={item.id === activeId ? 'page' : undefined}
              aria-label={item.label}
              onClick={() => handleTap(item.id)}
              onPointerDown={() => press(item.id, true)}
              onPointerUp={() => press(item.id, false)}
              onPointerLeave={() => press(item.id, false)}
              onPointerCancel={() => press(item.id, false)}
              className="flex h-20 w-[88px] touch-manipulation select-none flex-col items-center gap-1 rounded-[16px] pt-1 outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2"
              style={{ '--tw-ring-color': FOCUS }}
            >
              {/* 56px icon box — the coin is drawn here in 3D; the box never moves so labels don't shift */}
              <span
                ref={(el) => {
                  if (el) slotRefs.current[item.id] = el
                }}
                data-id={`nano-bottomnav-icon-${item.id}`}
                className="block h-14 w-14 shrink-0"
              />
              <motion.span
                data-id={`nano-bottomnav-label-${item.id}`}
                animate={compact ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="relative flex h-6 w-[88px] items-center justify-center"
              >
                {/* both stay mounted and cross-fade in place: nothing pops in or doubles up,
                    and the wordmark is already decoded when its tab is picked */}
                <motion.span
                  className="whitespace-nowrap font-noontree text-[13px] font-medium"
                  style={{ color: LABEL }}
                  initial={false}
                  animate={{ opacity: active ? 0 : 1, scale: active ? 0.85 : 1 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
                >
                  {item.label}
                </motion.span>
                <motion.img
                  src={item.wordmark}
                  width={88}
                  height={24}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-6 w-[88px]"
                  initial={false}
                  animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : active
                        ? { type: 'spring', stiffness: 520, damping: 24, delay: 0.04 }
                        : { duration: 0.1, ease: [0.4, 0, 1, 1] }
                  }
                />
              </motion.span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
