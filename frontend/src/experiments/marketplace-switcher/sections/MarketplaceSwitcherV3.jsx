// Marketplace switcher — VARIATION 3 (row + grid tile → App-Library expansion).
//
// Collapsed: a row of 3 marketplace tiles (76px squircles, white, #C5E7FB
// border) followed by a "grid" tile at the end showing a 2×2 preview of more
// marketplaces. Tapping the grid tile runs an Apple App-Library-style open:
//   • press feedback (compress ~0.97, ~70ms) then expansion
//   • the grid tile's surface morphs into a full panel (spring physics)
//   • OBJECT CONTINUITY: the 3 row tiles and the 4 preview icons are the same
//     elements that travel to their slots in the full grid (no crossfade)
//   • the remaining hidden icons emerge from the grid-tile centre
//   • every icon follows a curved path (offset-path), staggered, with overshoot
// Closing reverses along the same paths.
import { useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ICON = 76
const GAP = 8
const ROW_TOP = 8
const RADIUS = 20

const BIG_N = 3 // row marketplace tiles
const PREVIEW_N = 4 // icons shown in the 2×2 grid tile
const MINI = 31
const MINI_SCALE = MINI / ICON

// expanded panel (4 columns) — tighter gap between circular icons
const PADP = 14
const EXP_GAP = 8
const COLS = 4

function Mark({ m, white, size = 72 }) {
  const k = size / 76
  const filter = white ? 'brightness(0) invert(1)' : undefined
  if (m.fadeStack) {
    const w = (m.keepW ?? 46) * k
    return (
      <span className="flex flex-col items-center gap-0.5" style={{ filter }}>
        <img src={m.fadeStack[0]} alt="" className="h-auto" style={{ width: w }} />
        <img src={m.fadeStack[1]} alt="" className="h-auto" style={{ width: w }} />
      </span>
    )
  }
  if (m.logoStack)
    return (
      <span className="flex flex-col items-start gap-0.5" style={{ filter }}>
        <img src={m.logoStack[0]} alt="" className="w-auto" style={{ height: 13 * k }} />
        <img src={m.logoStack[1]} alt="" className="w-auto" style={{ height: 13 * k }} />
      </span>
    )
  if (m.logo)
    return m.logoH ? (
      <img src={m.logo} alt="" style={{ filter, height: m.logoH * k }} className="w-auto" />
    ) : (
      <img src={m.logo} alt="" style={{ filter, width: (m.logoW ?? 56) * k }} className="h-auto" />
    )
  return (
    <span
      className="whitespace-pre-line text-center font-noontree font-black lowercase"
      style={{ color: white ? '#fff' : m.fg, fontSize: 15 * k, lineHeight: `${15 * k}px` }}
    >
      {m.label}
    </span>
  )
}

export default function MarketplaceSwitcherV3({ items, activeId, onChange }) {
  const ref = useRef(null)
  const [W, setW] = useState(375)
  const [expanded, setExpanded] = useState(false)
  const [pressed, setPressed] = useState(false)
  // which marketplace sits in each slot (slot 2 is the swappable "row" tile)
  const [slotOrder, setSlotOrder] = useState(() => items.map((m) => m.id))
  const byId = (id) => items.find((m) => m.id === id)
  const SWAP_SLOT = 2 // the "noon food" row slot

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setW(el.offsetWidth || 375)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ---- collapsed row geometry ----
  const ROW_N = BIG_N + 1 // + grid tile
  const rowTotal = ROW_N * ICON + (ROW_N - 1) * GAP
  const RL = (W - rowTotal) / 2
  const slotCx = (i) => RL + ICON / 2 + i * (ICON + GAP)
  const gtLeft = RL + BIG_N * (ICON + GAP)
  const gtCx = gtLeft + ICON / 2
  const gtCy = ROW_TOP + ICON / 2

  // 2×2 preview cells inside the grid tile
  const MP = 5
  const MG = (ICON - 2 * MP - 2 * MINI) // gap between the two mini columns (tight)
  const miniCenter = (k) => {
    const r = Math.floor(k / 2)
    const c = k % 2
    return { x: gtLeft + MP + MINI / 2 + c * (MINI + MG), y: ROW_TOP + MP + MINI / 2 + r * (MINI + MG) }
  }

  // ---- expanded grid geometry ----
  const panelW = COLS * ICON + (COLS - 1) * EXP_GAP + 2 * PADP
  const EL = (W - panelW) / 2
  const ET = ROW_TOP
  const ROWS = Math.ceil(items.length / COLS)
  const panelH = ROWS * ICON + (ROWS - 1) * EXP_GAP + 2 * PADP
  const expCenter = (i) => {
    const r = Math.floor(i / COLS)
    const c = i % COLS
    return { x: EL + PADP + ICON / 2 + c * (ICON + EXP_GAP), y: ET + PADP + ICON / 2 + r * (ICON + EXP_GAP) }
  }

  // collapsed state per icon: big tiles in the row, preview icons in the grid
  // tile (mini), the rest hidden at the grid-tile centre
  const collCenter = (i) => {
    if (i < BIG_N) return { x: slotCx(i), y: ROW_TOP + ICON / 2 }
    if (i < BIG_N + PREVIEW_N) return miniCenter(i - BIG_N)
    return { x: gtCx, y: gtCy }
  }
  const collScale = (i) => (i < BIG_N ? 1 : MINI_SCALE)
  const collOpacity = (i) => (i < BIG_N + PREVIEW_N ? 1 : 0)

  const pathFor = (i) => {
    const a = collCenter(i)
    const b = expCenter(i)
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dist = Math.hypot(dx, dy) || 1
    const arc = dist * 0.18
    const mx = (a.x + b.x) / 2 + (-dy / dist) * arc
    const my = (a.y + b.y) / 2 + (dx / dist) * arc
    return `path("M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}")`
  }

  // stagger: nearest-to-destination first
  const dists = items.map((_, i) => {
    const a = collCenter(i)
    const b = expCenter(i)
    return Math.hypot(b.x - a.x, b.y - a.y)
  })
  const order = [...dists.keys()].sort((p, q) => dists[p] - dists[q])
  const delayOf = {}
  order.forEach((idx, rank) => {
    delayOf[idx] = rank * 0.014 // tighter stagger → snappier
  })

  const open = () => {
    setPressed(true)
    setTimeout(() => {
      setPressed(false)
      setExpanded(true)
    }, 45)
  }
  const close = () => setExpanded(false)

  // pick a marketplace from the grid → swap it into the row slot, then close
  const handleSelect = (slot) => {
    onChange(slotOrder[slot])
    if (slot !== SWAP_SLOT) {
      setSlotOrder((prev) => {
        const next = [...prev]
        ;[next[SWAP_SLOT], next[slot]] = [next[slot], next[SWAP_SLOT]]
        return next
      })
    }
    setTimeout(() => setExpanded(false), 420) // let the swap flip play, then close
  }

  return (
    <div ref={ref} data-id="mp-switcher" className="relative w-full" style={{ height: ROW_TOP + ICON + 8 }}>
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="backdrop"
            data-id="mp-grid-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-20 bg-black/25"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: `${gtCx}px ${gtCy}px`, zIndex: 25 }}
        animate={{ scale: pressed ? 0.97 : 1 }}
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      >
        {/* grid tile surface → full panel */}
        <motion.div
          data-id="mp-grid-panel"
          onClick={() => !expanded && open()}
          initial={false}
          animate={
            expanded
              ? { left: EL, top: ET, width: panelW, height: panelH, borderRadius: 26, backgroundColor: '#FFFFFF' }
              : { left: gtLeft, top: ROW_TOP, width: ICON, height: ICON, borderRadius: RADIUS, backgroundColor: '#E8F2FB' }
          }
          transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.9 }}
          style={{ position: 'absolute' }}
          className={expanded ? 'shadow-[0_18px_50px_rgba(16,24,40,0.22)] backdrop-blur-xl' : ''}
        />

        {/* every slot is positioned by index; its marketplace can swap (flip) */}
        {slotOrder.map((id, i) => {
          const m = byId(id)
          const isGridPart = i >= BIG_N
          const active = m.id === activeId
          const radius = i < BIG_N || expanded ? ICON * 0.28 : ICON / 2
          return (
            <motion.div
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                if (!expanded) {
                  if (isGridPart) return open()
                  return onChange(id)
                }
                handleSelect(i)
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: ICON,
                height: ICON,
                zIndex: 30,
                perspective: 700,
                offsetPath: pathFor(i),
                offsetRotate: '0deg',
                offsetAnchor: '50% 50%',
              }}
              initial={false}
              animate={{
                offsetDistance: expanded ? '100%' : '0%',
                scale: expanded ? 1 : collScale(i),
                opacity: expanded ? 1 : collOpacity(i),
                filter: !expanded && collOpacity(i) === 0 ? 'blur(4px)' : 'blur(0px)',
              }}
              transition={{
                offsetDistance: { type: 'spring', stiffness: 300, damping: 30, mass: 0.7, delay: delayOf[i] },
                scale: { type: 'spring', stiffness: 320, damping: 26, mass: 0.7, delay: delayOf[i] },
                opacity: { duration: 0.16, delay: delayOf[i] },
                filter: { duration: 0.16, delay: delayOf[i] },
              }}
            >
              {/* marketplace content — flips when this slot's marketplace swaps */}
              <AnimatePresence initial={false}>
                <motion.div
                  key={m.id}
                  initial={{ rotateY: -110, opacity: 0, borderRadius: radius }}
                  animate={{ rotateY: 0, opacity: 1, borderRadius: radius }}
                  exit={{ rotateY: 110, opacity: 0 }}
                  transition={{
                    rotateY: { type: 'spring', stiffness: 260, damping: 22 },
                    opacity: { duration: 0.18 },
                    borderRadius: { type: 'spring', stiffness: 260, damping: 28 },
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: active ? m.accent : '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    backfaceVisibility: 'hidden',
                  }}
                  className="flex items-center justify-center"
                >
                  <Mark m={m} white={active && !m.lightAccent} size={ICON} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
