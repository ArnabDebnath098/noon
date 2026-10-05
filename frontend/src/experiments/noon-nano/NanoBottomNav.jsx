import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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
 * down) fades the labels and settles the coins into their space.
 */

export const nanoBottomNavTabs = [
  { id: 'tasks', label: 'Tasks', wordmark: tasksWordmark },
  { id: 'wallet', label: 'Wallet', wordmark: walletWordmark },
  { id: 'account', label: 'Account', wordmark: accountWordmark },
]

const LABEL = 'rgba(29, 37, 57, 0.62)' // Figma default label colour
const FOCUS = '#7924FF'
// Figma: white fade, 0 → 92% at 35% → 100%
const FADE = 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.92) 35%, #FFFFFF)'
// ms between the tap (flip starts) and onChange, so the flip reads first
const FLIP_THEN_CHANGE = 420

export default function NanoBottomNav({ activeId, onChange, compact = false }) {
  const reduceMotion = useReducedMotion() ?? false
  const canvasRef = useRef(null)
  const slotRefs = useRef({})
  const engineRef = useRef(null)
  const timerRef = useRef(0)

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

  // follow an externally changed tab (route change, back button) without replaying the flip
  useEffect(() => {
    engineRef.current?.select(activeId, { animate: false })
  }, [activeId])

  useEffect(() => {
    engineRef.current?.setCompact(compact)
  }, [compact])

  const handleTap = (id) => {
    engineRef.current?.select(id) // plays the flip
    if (id === activeId) return // already here: just the flip
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => onChange?.(id), reduceMotion ? 0 : FLIP_THEN_CHANGE)
  }

  const press = (id, down) => engineRef.current?.setPressed(id, down)

  return (
    <nav
      data-id="nano-bottom-nav"
      data-state={compact ? 'compact' : 'expanded'}
      aria-label="Main"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2"
      style={{ background: FADE, paddingBottom: 'calc(var(--sab, 0px) + var(--sbp, 0px))' }}
    >
      {/* the 3D canvas reaches above the bar so flipping coins don't clip */}
      <canvas
        ref={canvasRef}
        data-id="nano-bottom-nav-scene"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[240px] w-full"
      />
      <div className="relative flex items-end justify-center gap-5 pb-1.5 pt-6">
        {nanoBottomNavTabs.map((item) => {
          const active = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              data-id={`nano-bottomnav-tab-${item.id}`}
              data-active={active || undefined}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              onClick={() => handleTap(item.id)}
              onPointerDown={() => press(item.id, true)}
              onPointerUp={() => press(item.id, false)}
              onPointerLeave={() => press(item.id, false)}
              onPointerCancel={() => press(item.id, false)}
              className="flex h-20 w-[88px] flex-col items-center gap-1 rounded-[16px] pt-1 outline-none focus-visible:ring-2"
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
                className={`relative flex h-6 w-[88px] items-center justify-center ${active ? '' : 'overflow-hidden'}`}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {active ? (
                    <motion.img
                      key="wordmark"
                      src={item.wordmark}
                      width={88}
                      height={24}
                      alt=""
                      className="absolute inset-0 h-6 w-[88px]"
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                    />
                  ) : (
                    <motion.span
                      key="text"
                      className="whitespace-nowrap font-noontree text-[13px] font-medium"
                      style={{ color: LABEL }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
