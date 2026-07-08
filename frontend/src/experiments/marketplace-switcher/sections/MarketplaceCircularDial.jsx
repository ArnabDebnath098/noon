// Marketplace switcher — circular DIAL flyout (shared by V4 & V5).
//
// Collapsed: a short row of quick tiles + a "grid" tile. Tapping the grid tile
// opens a full-frame flyout that slides up from the bottom and reveals every
// marketplace laid out along a big circular arc (a rotary dial, à la a physical
// jog-wheel). The marks ride the arc; a faint stroke traces the wheel edge
// behind them and a dark handle marks the selection point.
//
//   • orientation="vertical"   → wheel centre off-screen right; the arc bulges
//     left, items scroll up/down, selection sits at the vertical middle, labels
//     to the left, handle on the right (matches the reference).
//   • orientation="horizontal" → wheel centre off-screen below; the arc bulges
//     up, items scroll left↔right, selection sits at top-centre, labels above,
//     handle on top.
//
// One motion value `rot` (radians) drives the whole ring; each mark's x/y/scale/
// opacity is a `useTransform` of it, so drag, snap and the intro sweep are all
// just animations of that single value. On open `rot` springs in from an offset
// so every mark glides along the arc into place ("moving along a circular path").
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useMotionValue, useMotionValueEvent, useTransform, animate } from 'framer-motion'
import { springs, easings, clamp } from '../../../utils/motion'
import MarketplaceMark from './MarketplaceMark'
import TriggerRow from './TriggerRow'

const STEP = 0.19 // angular gap between marks (rad) — tight so many marks show at once
const CHIP = 58 // mark chip size (px)
const FOCUS_BAND = 0.14 // |phi| under which a mark counts as "centred"
const SWEEP = 1.0 // intro rotation offset — how far the ring sweeps in on open
// intro: long decelerating sweep of the whole ring into place
const SWEEP_SPRING = { type: 'spring', duration: 0.75, bounce: 0.18 }
const nameOf = (m) => m.label.replace('\n', ' ')

// Wheel geometry from the measured panel size.
function geometry(w, h, orientation) {
  if (orientation === 'vertical') {
    const R = Math.max(h * 0.9, 560)
    return { R, cx: w * 0.6 + R, cy: h / 2 } // centre off right; bulge at x=0.6w
  }
  const R = Math.max(w * 1.35, 520)
  return { R, cx: w / 2, cy: h * 0.58 + R } // centre off below; bulge (selection) low on screen
}

// One mark riding the arc. All visual state is derived from `rot`.
function DialItem({ m, i, rot, geom, orientation, active, onSelect }) {
  const { R, cx, cy } = geom
  const phi = (r) => i * STEP - r

  const x = useTransform(rot, (r) => {
    const p = phi(r)
    const c = orientation === 'vertical' ? cx - R * Math.cos(p) : cx + R * Math.sin(p)
    return c - CHIP / 2
  })
  const y = useTransform(rot, (r) => {
    const p = phi(r)
    const c = orientation === 'vertical' ? cy + R * Math.sin(p) : cy - R * Math.cos(p)
    return c - CHIP / 2
  })
  // proximity to the selection point (1 = centred, 0 = a step away)
  const focus = useTransform(rot, (r) => clamp(1 - Math.abs(phi(r)) / FOCUS_BAND, 0, 1))
  // slow fade + high floor so the whole ring stays readable (max marks visible)
  const opacity = useTransform(rot, (r) => clamp(1.2 - Math.abs(phi(r)) / 2.6, 0.35, 1))
  const scale = useTransform(focus, (f) => 0.82 + 0.32 * f)
  // centred chip fills with the marketplace's accent (mark inverts to white);
  // the rest stay light so the coloured marks read on the dark flyout
  const chipBg = useTransform(focus, (f) => (f > 0.6 ? m.accent : 'rgba(255,255,255,0.9)'))
  const labelBg = useTransform(focus, (f) => (f > 0.6 ? '#FFFFFF' : 'rgba(0,0,0,0)'))
  const labelColor = useTransform(focus, (f) => (f > 0.6 ? '#1B282C' : 'rgba(255,255,255,0.6)'))
  const labelWeight = useTransform(focus, (f) => (f > 0.6 ? 700 : 500))

  // discrete flip for the mark's white-invert as it reaches the centre
  const [centred, setCentred] = useState(false)
  useMotionValueEvent(rot, 'change', (r) => setCentred(Math.abs(phi(r)) < FOCUS_BAND * 0.6))

  const labelPos =
    orientation === 'vertical'
      ? 'right-full top-1/2 mr-3 -translate-y-1/2 text-right'
      : 'bottom-full left-1/2 mb-3 -translate-x-1/2 text-center'

  return (
    <motion.div style={{ x, y, opacity }} className="absolute left-0 top-0 z-10" data-id={`mp-dial-${m.id}`}>
      <motion.button
        type="button"
        aria-pressed={active}
        onClick={() => onSelect(i, m.id)}
        style={{ width: CHIP, height: CHIP, scale, background: chipBg, boxShadow: '0 6px 18px rgba(0,0,0,0.28)' }}
        className="flex items-center justify-center rounded-[13px]"
      >
        <MarketplaceMark m={m} white={centred && !m.lightAccent} size={CHIP - 18} />
      </motion.button>
      <motion.span
        style={{ backgroundColor: labelBg, color: labelColor, fontWeight: labelWeight }}
        className={`pointer-events-none absolute whitespace-nowrap rounded-full px-3 py-1 font-noontree text-[15px] lowercase leading-none ${labelPos}`}
      >
        {nameOf(m)}
      </motion.span>
    </motion.div>
  )
}

export default function MarketplaceCircularDial({ items, activeId, onChange, orientation = 'vertical' }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const [size, setSize] = useState({ w: 390, h: 780 })
  const rot = useMotionValue(0)

  const activeIndex = Math.max(0, items.findIndex((m) => m.id === activeId))
  const maxRot = (items.length - 1) * STEP

  useLayoutEffect(() => {
    if (!open) return undefined
    const el = panelRef.current
    if (!el) return undefined
    const measure = () => setSize({ w: el.offsetWidth || 390, h: el.offsetHeight || 780 })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [open])

  // intro sweep: start rotated away, spring the active mark to the centre
  useEffect(() => {
    if (!open) return undefined
    const target = activeIndex * STEP
    rot.set(target - SWEEP)
    const c = animate(rot, target, SWEEP_SPRING)
    return () => c.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const geom = geometry(size.w, size.h, orientation)

  const onPan = (_, info) => {
    const d = orientation === 'vertical' ? info.delta.y : info.delta.x
    rot.set(clamp(rot.get() - d / geom.R, 0, maxRot))
  }
  const onPanEnd = () => {
    const idx = clamp(Math.round(rot.get() / STEP), 0, items.length - 1)
    animate(rot, idx * STEP, springs.settle) // physics spring keeps pan velocity
  }
  const select = (i, id) => {
    onChange(id)
    animate(rot, i * STEP, springs.settle)
    setTimeout(() => setOpen(false), 200)
  }

  // dark selection handle
  const handle =
    orientation === 'vertical'
      ? { right: 14, top: geom.cy - 18, width: 6, height: 36 }
      : { left: geom.cx - 18, top: geom.cy - geom.R - 30, width: 36, height: 6 }

  // backdrop fades toward the side/edge the dial occupies; close control sits
  // out of the way (top-left for the vertical dial, centre-bottom for horizontal)
  const backdropGradient =
    orientation === 'vertical'
      ? 'linear-gradient(90deg, rgba(17,17,23,0) 0%, rgba(17,17,23,0.99) 100%)'
      : 'linear-gradient(180deg, rgba(17,17,23,0) 0%, rgba(17,17,23,0.99) 100%)'
  // vertical close sits bottom-left over the light side (dark icon); horizontal
  // close sits centre-bottom over the dark side (white icon)
  const closeStyle =
    orientation === 'vertical'
      ? { pos: 'bottom-6 left-4', bg: 'bg-black/10', stroke: '#111117' }
      : { pos: 'bottom-8 left-1/2 -translate-x-1/2', bg: 'bg-white/15', stroke: '#FFFFFF' }

  return (
    <>
      {/* collapsed trigger row — the grid tile opens the dial */}
      <TriggerRow items={items} activeId={activeId} onChange={onChange} onOpen={() => setOpen(true)} />

      {/* dial flyout — portalled to <body> so it escapes the sticky header's
          stacking context and can layer above the bottom nav */}
      {createPortal(
        <AnimatePresence>
          {open && (
          <motion.div
            key="dial"
            data-id="mp-dial-overlay"
            className="fixed inset-0 z-[60] flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: easings.ios }}
          >
            {/* frosted backdrop (covers the bottom nav) — transparent at the top,
                fading to solid dark at the bottom. Tap to dismiss. */}
            <div
              className="absolute inset-0 backdrop-blur-xl"
              style={{ background: backdropGradient }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              ref={panelRef}
              className="relative h-full w-full max-w-md overflow-hidden"
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              transition={springs.sheet}
            >
              {/* the wheel edge traced behind the marks */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <circle cx={geom.cx} cy={geom.cy} r={geom.R} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
              </svg>

              {/* selection handle */}
              <div className="pointer-events-none absolute z-20 rounded-full bg-white/90" style={handle} />

              {/* pan surface + the marks riding the arc */}
              <motion.div className="absolute inset-0" onPan={onPan} onPanEnd={onPanEnd} style={{ touchAction: 'none' }}>
                {items.map((m, i) => (
                  <DialItem
                    key={m.id}
                    m={m}
                    i={i}
                    rot={rot}
                    geom={geom}
                    orientation={orientation}
                    active={m.id === activeId}
                    onSelect={select}
                  />
                ))}
              </motion.div>

              {/* close — circular icon button */}
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className={`absolute z-30 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur active:scale-95 ${closeStyle.bg} ${closeStyle.pos}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke={closeStyle.stroke} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
