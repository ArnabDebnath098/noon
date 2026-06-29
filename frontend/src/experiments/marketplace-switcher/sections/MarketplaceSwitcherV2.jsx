// Marketplace switcher — VARIATION 2 ("deck → grid → stack").
//
// Choreography:
//   • Mount: icons sit in a tight deck next to "Services provided by noon".
//     The switcher height hugs the deck, then springs open as the deck unfolds
//     into a 5 / 5 / 1 grid (staggered) and the text slides out left.
//   • Scroll: the grid collapses — the first 4 icons stay in a row and icons
//     5–11 morph into a layered stack right after the 4th. All collapsed icons
//     are the SAME size on the SAME line; the stack just overlaps horizontally.
//
// Icon geometry is derived from the measured container width so 5 columns fill
// the row. Every icon's transform is a continuous lerp of two spring-smoothed
// drivers: reveal (deck → grid, per-icon staggered) and useSpring(progress)
// (grid → collapsed). Default tile bg is white; the selected tile fills with its
// brand accent and its mark turns white.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion'

const COLLSCALE = 0.82

function metrics(W) {
  const PADX = 12
  const PADY = 10
  const GAP = 12
  const ICON = Math.max(52, Math.min(82, (W - 2 * PADX - 4 * GAP) / 5))
  const COLX = ICON + GAP
  const ROWY = ICON + 14
  // grid centred → equal left/right padding
  const GRID_OFFSET = Math.max(PADX, (W - (4 * COLX + ICON)) / 2)

  // collapsed cluster (4 icons + overlapping stack), laid out by centre and
  // centred horizontally so left/right padding match
  const collIcon = ICON * COLLSCALE
  const ROW_S = collIcon + 8 // row icon centre-to-centre
  const GAP_S = 12 // gap before the stack
  const STEP = collIcon * 0.18 // stack overlap step
  const STACK_SPREAD = 6 * STEP
  const CLUSTER_W = 2 * collIcon + 3 * ROW_S + GAP_S + STACK_SPREAD
  const COLL_OFFSET = Math.max(PADX, (W - CLUSTER_W) / 2)
  const COLLAPSED_H = ICON * COLLSCALE + 24
  const COLL_CY = COLLAPSED_H / 2

  return {
    PADX, PADY, ICON, COLX, ROWY, GRID_OFFSET,
    collIcon, ROW_S, GAP_S, STEP, COLL_OFFSET, COLL_CY,
    DECKX: Math.max(140, W * 0.4),
    GRID_H: PADY + 2 * ROWY + ICON + PADY,
    DECK_H: ICON + 20,
    COLLAPSED_H,
  }
}

// 5 / 5 / 1 grid (centred)
function gridPos(i, M) {
  if (i < 5) return { x: M.GRID_OFFSET + i * M.COLX, y: M.PADY }
  if (i < 10) return { x: M.GRID_OFFSET + (i - 5) * M.COLX, y: M.PADY + M.ROWY }
  return { x: M.GRID_OFFSET, y: M.PADY + M.ROWY * 2 }
}

// collapsed: 0–3 in a row; 4–10 overlap into a stack — all same size, same line.
// positioned by visual centre (x is the element's top-left), centred in the row.
function collapsedPos(i, M) {
  const y = M.COLL_CY - M.ICON / 2
  if (i < 4) {
    const cx = M.COLL_OFFSET + M.collIcon / 2 + i * M.ROW_S
    return { x: cx - M.ICON / 2, y, scale: COLLSCALE, opacity: 1 }
  }
  const k = i - 4 // 0 = front of the stack
  const cf = M.COLL_OFFSET + 1.5 * M.collIcon + 3 * M.ROW_S + M.GAP_S
  const cx = cf + k * M.STEP
  return { x: cx - M.ICON / 2, y, scale: COLLSCALE, opacity: 1 }
}

// intro deck — a tight pile next to the "Services provided by noon" text
function deckPos(i, M) {
  return { x: M.DECKX + i * 2.4, y: M.PADY + i * 1.4, scale: 1 - i * 0.012, opacity: 1 }
}

// z-order prioritises the collapsed stack (front of stack on top)
function zFor(i) {
  if (i < 4) return 6 + i
  return 100 - (i - 4)
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp = (a, b, t) => a + (b - a) * t

function Mark({ m }) {
  if (m.logo) return <img src={m.logo} alt="" className="max-h-[26px] max-w-[42px] object-contain" />
  if (m.fadeStack) return <img src={m.fadeStack[1]} alt="" className="max-h-[22px] max-w-[42px] object-contain" />
  if (m.logoStack)
    return (
      <span className="flex flex-col items-center gap-px">
        <img src={m.logoStack[0]} alt="" className="max-w-[34px]" />
        <img src={m.logoStack[1]} alt="" className="max-w-[28px]" />
      </span>
    )
  return (
    <span
      className="whitespace-pre-line text-center font-noontree text-[11px] font-black lowercase leading-[11px]"
      style={{ color: m.fg }}
    >
      {m.label}
    </span>
  )
}

function Icon({ m, i, M, activeId, onChange, reveal, progress }) {
  const t0 = Math.min(0.45, i * 0.045)
  const intro = useTransform(reveal, [t0, Math.min(1, t0 + 0.55)], [0, 1], { clamp: true })
  const sp = useSpring(progress, { stiffness: 420, damping: 46, mass: 0.5 })

  const g = gridPos(i, M)
  const c = collapsedPos(i, M)
  const d = deckPos(i, M)

  const x = useTransform([intro, sp], ([t, p]) => lerp(lerp(d.x, g.x, t), c.x, p))
  const y = useTransform([intro, sp], ([t, p]) => lerp(lerp(d.y, g.y, t), c.y, p))
  const scale = useTransform([intro, sp], ([t, p]) => lerp(lerp(d.scale, 1, t), c.scale, p))
  const opacity = useTransform([intro, sp], ([t, p]) => clamp01(lerp(lerp(0, 1, t), c.opacity, p)))
  // marks on the buried stack icons fade out so only clean colour edges peek
  const buriedMark = useTransform(sp, [0, 0.5], [1, 0])

  const active = m.id === activeId

  return (
    <motion.button
      type="button"
      data-id={`mp-tile-${m.id}`}
      aria-pressed={active}
      onClick={() => onChange(m.id)}
      style={{ x, y, scale, opacity, zIndex: zFor(i), width: M.ICON, height: M.ICON, borderRadius: M.ICON * 0.3, background: active ? m.accent : '#FFFFFF' }}
      className="absolute left-0 top-0 flex items-center justify-center shadow-[0_4px_12px_rgba(16,24,40,0.18)]"
    >
      <motion.span
        style={{
          opacity: i >= 5 ? buriedMark : 1,
          filter: active && !m.lightAccent ? 'brightness(0) invert(1)' : undefined,
        }}
        className="flex items-center justify-center"
      >
        <Mark m={m} />
      </motion.span>
    </motion.button>
  )
}

export default function MarketplaceSwitcherV2({ items, activeId, onChange, progress }) {
  const ref = useRef(null)
  const [W, setW] = useState(360)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setW(el.offsetWidth || 360)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const M = metrics(W)
  const reveal = useMotionValue(0)
  const hp = useSpring(progress, { stiffness: 420, damping: 46, mass: 0.5 })

  const height = useTransform([reveal, hp], ([r, p]) =>
    lerp(lerp(M.DECK_H, M.GRID_H, r), M.COLLAPSED_H, p),
  )
  const textOpacity = useTransform(reveal, [0.05, 0.4], [1, 0])
  const textX = useTransform(reveal, [0.05, 0.4], [0, -44])

  useEffect(() => {
    const controls = animate(reveal, 1, { type: 'spring', stiffness: 90, damping: 18, delay: 0.25 })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div ref={ref} data-id="mp-switcher" style={{ height }} className="relative w-full overflow-visible">
      <motion.div
        data-id="mp-services-label"
        style={{ opacity: textOpacity, x: textX }}
        className="absolute left-3 top-3 z-0 max-w-[120px] font-noontree text-[14px] font-semibold leading-[17px] text-[#404553]"
      >
        Services provided by noon
      </motion.div>

      {items.map((m, i) => (
        <Icon key={m.id} m={m} i={i} M={M} activeId={activeId} onChange={onChange} reveal={reveal} progress={progress} />
      ))}
    </motion.div>
  )
}
