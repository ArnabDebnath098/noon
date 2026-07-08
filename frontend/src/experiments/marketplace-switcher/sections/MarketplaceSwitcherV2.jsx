// Marketplace switcher — VARIATION 2 ("deck → grid → stack").
//
// Choreography:
//   • Mount: icons sit in a tight deck next to "Services provided by noon".
//     The switcher height hugs the deck, then springs open as the deck unfolds
//     into a 4-per-row grid (staggered) and the text slides out left.
//   • Scroll: the grid collapses — the first 4 icons stay in a row and a 5th
//     "more" tile (styled like the others) appears, holding a 2×2 grid of
//     circular mini icons (marketplaces 5–8); the rest tuck away.
//
// Icon geometry is derived from the measured container width so 5 columns fill
// the row. Every icon's transform is a continuous lerp of two spring-smoothed
// drivers: reveal (deck → grid, per-icon staggered) and useSpring(progress)
// (grid → collapsed). Default tile bg is white; the selected tile fills with its
// brand accent and its mark turns white.
import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion'
import useElementWidth from '../../../hooks/useElementWidth'
import { scrollSmoothing, clamp01, lerp } from '../../../utils/motion'
import NewBadge from './NewBadge'

const COLLSCALE = 0.82
// intro deck→grid unfold — iOS-tuned: quick response, a touch of bounce
const INTRO_SPRING = { type: 'spring', duration: 0.7, bounce: 0.22, delay: 0.25 }

function metrics(W) {
  const PADX = 12
  const PADY = 16 // top/bottom gap around the grid
  const ICON = 64
  // 4 columns spread across the width, gap clamped to a sensible range
  const GAP = Math.min(28, Math.max(12, (W - 2 * PADX - 4 * ICON) / 3))
  const COLX = ICON + GAP
  const ROWY = ICON + 14
  // grid centred → equal left/right padding
  const GRID_OFFSET = Math.max(PADX, (W - (3 * COLX + ICON)) / 2)

  // collapsed cluster (4 tiles + a "more" tile), laid out by centre and
  // centred horizontally so left/right padding match
  const collIcon = ICON * COLLSCALE
  const ROW_S = collIcon + 8 // tile centre-to-centre
  const CLUSTER_W = 5 * collIcon + 4 * 8
  const COLL_OFFSET = Math.max(PADX, (W - CLUSTER_W) / 2)
  const COLLAPSED_H = ICON * COLLSCALE + 24
  const COLL_CY = COLLAPSED_H / 2
  // 2×2 preview grid inside the "more" tile: 4 circular minis
  const MINI = collIcon * 0.38
  const MINI_GAP = 4
  const MORE_C = COLL_OFFSET + collIcon / 2 + 4 * ROW_S // more-tile centre x

  return {
    PADX, PADY, ICON, COLX, ROWY, GRID_OFFSET,
    collIcon, ROW_S, COLL_OFFSET, COLL_CY,
    MINI, MINI_GAP, MORE_C,
    DECKX: Math.max(140, W * 0.4),
    GRID_H: PADY + 2 * ROWY + ICON + PADY,
    DECK_H: ICON + 20,
    COLLAPSED_H,
  }
}

// 4-per-row grid (centred)
function gridPos(i, M) {
  return {
    x: M.GRID_OFFSET + (i % 4) * M.COLX,
    y: M.PADY + Math.floor(i / 4) * M.ROWY,
  }
}

// collapsed: 0–3 in a row; 4–7 shrink into circular minis arranged 2×2 inside
// the "more" tile; 8+ tuck invisibly behind its centre. Positioned by visual
// centre (x is the element's top-left), centred in the row.
function collapsedPos(i, M) {
  const y = M.COLL_CY - M.ICON / 2
  if (i < 4) {
    const cx = M.COLL_OFFSET + M.collIcon / 2 + i * M.ROW_S
    return { x: cx - M.ICON / 2, y, scale: COLLSCALE, opacity: 1 }
  }
  if (i < 8) {
    const k = i - 4 // 0=TL, 1=TR, 2=BL, 3=BR
    const step = M.MINI + M.MINI_GAP
    const cx = M.MORE_C - step / 2 + (k % 2) * step
    const cy = M.COLL_CY - step / 2 + Math.floor(k / 2) * step
    return { x: cx - M.ICON / 2, y: cy - M.ICON / 2, scale: M.MINI / M.ICON, opacity: 1 }
  }
  return { x: M.MORE_C - M.ICON / 2, y, scale: M.MINI / M.ICON, opacity: 0 }
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

function Mark({ m, active }) {
  if (m.logo) return <img src={m.logo} alt="" className="max-h-[26px] max-w-[42px] object-contain" />
  if (m.fadeStack) {
    const fade = active && m.activeFadeStack ? m.activeFadeStack : m.fadeStack
    return <img src={fade[1]} alt="" className="max-h-[22px] max-w-[42px] object-contain" />
  }
  if (m.logoStack) {
    const stack = active && m.activeLogoStack ? m.activeLogoStack : m.logoStack
    return (
      <span className="flex flex-col items-start gap-px">
        <img src={stack[0]} alt="" className="max-w-[34px]" />
        <img src={stack[1]} alt="" className="max-w-[28px]" />
      </span>
    )
  }
  return (
    <span
      className="whitespace-pre-line text-center font-noontree text-[11px] font-black lowercase leading-[11px]"
      style={{ color: m.fg }}
    >
      {m.label}
    </span>
  )
}

function Icon({ m, i, M, activeId, onChange, reveal, sp }) {
  const t0 = Math.min(0.45, i * 0.045)
  const intro = useTransform(reveal, [t0, Math.min(1, t0 + 0.55)], [0, 1], { clamp: true })

  const g = gridPos(i, M)
  const c = collapsedPos(i, M)
  const d = deckPos(i, M)

  const x = useTransform([intro, sp], ([t, p]) => lerp(lerp(d.x, g.x, t), c.x, p))
  const y = useTransform([intro, sp], ([t, p]) => lerp(lerp(d.y, g.y, t), c.y, p))
  const scale = useTransform([intro, sp], ([t, p]) => lerp(lerp(d.scale, 1, t), c.scale, p))
  const opacity = useTransform([intro, sp], ([t, p]) => clamp01(lerp(lerp(0, 1, t), c.opacity, p)))
  // facepile icons round off into circles as they shrink into the more-tile
  const radius = useTransform(sp, (p) => lerp(M.ICON * 0.3, i >= 4 ? M.ICON / 2 : M.ICON * 0.3, p))

  const active = m.id === activeId

  return (
    <motion.button
      type="button"
      data-id={`mp-tile-${m.id}`}
      aria-pressed={active}
      onClick={() => onChange(m.id)}
      style={{ x, y, scale, opacity, zIndex: zFor(i), width: M.ICON, height: M.ICON, borderRadius: radius, background: active ? m.accent : m.bg ?? '#FFFFFF' }}
      className="absolute left-0 top-0 flex items-center justify-center shadow-[0_4px_12px_rgba(16,24,40,0.18)]"
    >
      <motion.span
        style={{
          // pre-coloured active stacks (supermall/food) carry their own colours
          filter:
            active && !m.lightAccent && !m.activeLogoStack && !m.activeFadeStack
              ? 'brightness(0) invert(1)'
              : undefined,
        }}
        className="flex items-center justify-center"
      >
        <Mark m={m} active={active} />
      </motion.span>
      {m.isNew && <NewBadge dataId={`mp-tile-${m.id}-new`} />}
    </motion.button>
  )
}

export default function MarketplaceSwitcherV2({ items, activeId, onChange, progress }) {
  const [ref, W] = useElementWidth(360)

  const M = metrics(W)
  const reveal = useMotionValue(0)
  // one shared smoothing spring drives the height AND every icon's collapse
  const sp = useSpring(progress, scrollSmoothing)

  const height = useTransform([reveal, sp], ([r, p]) =>
    lerp(lerp(M.DECK_H, M.GRID_H, r), M.COLLAPSED_H, p),
  )
  const moreOpacity = useTransform(sp, [0.55, 0.95], [0, 1])

  useEffect(() => {
    const controls = animate(reveal, 1, INTRO_SPRING)
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div ref={ref} data-id="mp-switcher" style={{ height }} className="relative w-full overflow-visible">
      {/* "more" tile — fades in behind the facepile as the grid collapses,
          styled like the row tiles */}
      <motion.div
        data-id="mp-more-tile"
        style={{
          x: M.MORE_C - M.collIcon / 2,
          y: M.COLL_CY - M.collIcon / 2,
          width: M.collIcon,
          height: M.collIcon,
          borderRadius: M.collIcon * 0.3,
          opacity: moreOpacity,
          zIndex: 5,
        }}
        className="absolute left-0 top-0 bg-[#F4F5F7] shadow-[0_4px_12px_rgba(16,24,40,0.18)]"
      />

      {items.map((m, i) => (
        <Icon key={m.id} m={m} i={i} M={M} activeId={activeId} onChange={onChange} reveal={reveal} sp={sp} />
      ))}
    </motion.div>
  )
}
