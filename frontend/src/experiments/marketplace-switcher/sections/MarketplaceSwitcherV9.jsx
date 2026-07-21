// Marketplace switcher — VARIATION 7 (variation 6 layout, sliding carousel).
//
// Same "selected + rail" structure and variation-4 height-collapse as variation
// 6, but the rail has TWO modes:
//   • DEFAULT (expanded) — exactly 4 tiles, no scroll (no scroll-hint):
//       · tiles 1-3 → the next three marketplaces after the selected one
//       · tile 4    → a HORIZONTAL CAROUSEL: each remaining marketplace slides
//                     in from the right as its OWN tile (its own background) and
//                     the previous one slides out left, auto-advancing forever
//   • COLLAPSED (on scroll) — the rail becomes a horizontal scroll strip of ALL
//     the other marketplaces as pills.
// Tapping any tile — including the carousel's currently-shown face — switches
// selection; the layout recomputes. Everything is squircle-clipped and the
// marks restructure to their compact form on collapse, like variation 6.
//
// (Component is named V9 to avoid a filename clash — V7/V8 files are taken by
// other variants — but it is registered as the "7" tab.)
import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import { springs, scrollSmoothing, clamp01, lerp } from '../../../utils/motion'
import { address } from '../../../data/marketplace'
import homeIcon from '../../../assets/marketplace/home.svg'
import MarketplaceMark from './MarketplaceMark'
import NewBadge from './NewBadge'
import CameraIcon from './CameraIcon'

// motion-wrapped Squircle so the rail can be a real squircle while riding an
// animated height motion value
const MotionSquircle = motion.create(Squircle)

const SMOOTH = 1

const PAD = 16
const TOP = 8
const GAP = 12
// rail inner padding — tightens on collapse so the pills sit snug
const RAIL_PAD_MAX = 8
const RAIL_PAD_MIN = 4

// outer height shared by the rail container AND the selected tile
const OUTER_MAX = 72
const OUTER_MIN = 40 // collapsed rail/selected height
const SEL_W = 72 // selected tile width (square at rest: 72×72)
// rail tiles — square at rest (fill the rail minus its padding), width fixed
const TILE_MAX = OUTER_MAX - RAIL_PAD_MAX * 2 // 56
const TILE_MIN = OUTER_MIN - RAIL_PAD_MIN * 2 // 32

const FIXED_N = 3 // fixed rail tiles before the carousel
const CAROUSEL_MS = 2400 // dwell per carousel face

const RADIUS_RATIO = 0.28 // squircle radius as a fraction of height
const LOC_H = 40
const SEARCH_H = 48
const BOTTOM = 16
const H0 = TOP + OUTER_MAX + GAP + LOC_H + GAP + SEARCH_H + BOTTOM
const H1 = TOP + OUTER_MIN + GAP + LOC_H + GAP + SEARCH_H + BOTTOM

const FLIP = { rotateY: springs.flip, opacity: { duration: 0.16 } }
// carousel swap: each marketplace is its OWN squircle tile that slides in
// horizontally from the right while the previous slides out to the left
const SLIDE = { type: 'spring', stiffness: 300, damping: 32 }

const MARK = 52
const MARK_SIZE = {
  noon: 52, supermall: 66, food: 62, minutes: 60, nownow: 60,
  pay: 66, send: 64, out: 66, med: 64, global: 66, home: 56,
}
const markSize = (id) => MARK_SIZE[id] ?? MARK

// per-marketplace logo shrink in the collapsed pill (1 = unchanged)
const COLLAPSED_LOGO_SCALE = { nownow: 0.58, pay: 0.7 }
const collapsedLogoScale = (id) => COLLAPSED_LOGO_SCALE[id] ?? 1

// the compact-form props shared by every mark in this variant (V7-only)
const COMPACT_MARK_PROPS = { collapsedStackH: 9.5, collapsedStackGap: -1, collapsedLabelPill: true }

// One rail tile — square at rest, width fixed; height rides `sp`. The mark
// restructures (variation-4 style) via MarketplaceMark's `collapsed` form.
function RailTile({ m, onChange, sp, radius, compact }) {
  const height = useTransform(sp, [0, 1], [TILE_MAX, TILE_MIN])
  return (
    <motion.button
      type="button"
      layout
      data-id={`mp-tile-${m.id}`}
      aria-label={`Switch to ${m.pill ?? m.id}`}
      onClick={() => onChange(m.id)}
      initial={{ rotateY: -90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: 90, opacity: 0 }}
      transition={{ ...FLIP, layout: springs.snappy }}
      whileTap={{ scale: 0.95 }}
      style={{ width: TILE_MAX, height, backfaceVisibility: 'hidden', filter: 'drop-shadow(0 1px 3px rgba(16,24,40,0.08))' }}
      className="relative flex shrink-0 items-center justify-center"
    >
      <Squircle
        as="span"
        cornerRadius={radius}
        cornerSmoothing={SMOOTH}
        style={{ background: m.bg ?? '#FFFFFF' }}
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={compact ? 'c' : 'e'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex items-center justify-center"
          >
            <MarketplaceMark m={m} size={markSize(m.id)} collapsed={compact} collapsedLogoScale={collapsedLogoScale(m.id)} {...COMPACT_MARK_PROPS} />
          </motion.span>
        </AnimatePresence>
      </Squircle>
      {m.isNew && !compact && <NewBadge dataId={`mp-tile-${m.id}-new`} />}
    </motion.button>
  )
}

// Horizontal carousel — the 4th rail slot (default/expanded mode only). Each
// marketplace is its OWN squircle tile (its own background); on advance the new
// tile slides in horizontally from the right ON TOP while the old one recedes
// below it (scales down + fades), auto-advancing. Tapping selects the shown one.
function HCarousel({ pool, onChange, sp, radius, compact }) {
  const height = useTransform(sp, [0, 1], [TILE_MAX, TILE_MIN])
  const [idx, setIdx] = useState(0)

  // restart cleanly whenever the pool changes (selection changed)
  const ids = pool.map((p) => p.id).join(',')
  useEffect(() => {
    setIdx(0)
    if (pool.length <= 1) return undefined
    const t = setInterval(() => setIdx((p) => p + 1), CAROUSEL_MS) // monotonic (drives z-order)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids])

  if (pool.length === 0) return null
  const cur = pool[idx % pool.length]

  return (
    <motion.div
      layout
      data-id="mp-tile-carousel"
      style={{ width: TILE_MAX, height, filter: 'drop-shadow(0 1px 3px rgba(16,24,40,0.08))' }}
      className="relative shrink-0"
    >
      {/* window contains the horizontal slide (clip-path insets left/right) but
          lets the bottom NEW badge overhang; each marketplace is its OWN squircle
          tile — and carries its OWN NEW badge — that slides through it */}
      <div className="absolute inset-0" style={{ clipPath: 'inset(0px 0px -28px 0px)' }}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.button
            type="button"
            key={cur.id}
            aria-label={`More marketplaces — ${cur.pill ?? cur.id}`}
            onClick={() => onChange(cur.id)}
            // new tile slides in horizontally ON TOP; the old one stays put and
            // recedes below it (scales down + fades) — its NEW badge goes with it
            initial={{ x: '108%', scale: 1, opacity: 1 }}
            animate={{ x: '0%', scale: 1, opacity: 1 }}
            exit={{ x: '0%', scale: 0.78, opacity: 0, y: 4 }}
            transition={{ x: SLIDE, scale: { duration: 0.3 }, opacity: { duration: 0.3 }, y: { duration: 0.3 } }}
            style={{ position: 'absolute', inset: 0, zIndex: idx }}
            className="flex items-center justify-center"
          >
            <Squircle
              as="span"
              cornerRadius={radius}
              cornerSmoothing={SMOOTH}
              style={{ background: cur.bg ?? '#FFFFFF' }}
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
            >
              <MarketplaceMark m={cur} size={markSize(cur.id)} collapsed={compact} collapsedLogoScale={collapsedLogoScale(cur.id)} {...COMPACT_MARK_PROPS} />
            </Squircle>
            {/* NEW badge belongs to THIS tile — arrives with it, recedes with it */}
            {cur.isNew && !compact && <NewBadge dataId="mp-tile-carousel-new" />}
          </motion.button>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function MarketplaceSwitcherV9({ items, activeId, onChange, progress }) {
  const selected = items.find((i) => i.id === activeId) ?? items[0]
  const rest = items.filter((i) => i.id !== selected.id)
  const fixed = rest.slice(0, FIXED_N) // the three static rail tiles
  const pool = rest.slice(FIXED_N) // everything the carousel cycles

  // scroll-linked collapse — spring-smoothed progress drives the height morph
  const fallback = useMotionValue(0)
  const sp = useSpring(progress ?? fallback, scrollSmoothing)

  // rail container + selected tile share the same outer height (always matched)
  const outerH = useTransform(sp, [0, 1], [OUTER_MAX, OUTER_MIN])
  const railPad = useTransform(sp, [0, 1], [RAIL_PAD_MAX, RAIL_PAD_MIN])
  const locTop = useTransform(sp, [0, 1], [TOP + OUTER_MAX + GAP, TOP + OUTER_MIN + GAP])
  const searchTop = useTransform(sp, [0, 1], [TOP + OUTER_MAX + GAP + LOC_H + GAP, TOP + OUTER_MIN + GAP + LOC_H + GAP])
  const switcherH = useTransform(sp, [0, 1], [H0, H1])

  // squircle radii stepped whole-px so they stay proportional to each height
  const [selRadius, setSelRadius] = useState(Math.round(OUTER_MAX * RADIUS_RATIO))
  const [tileRadius, setTileRadius] = useState(Math.round(TILE_MAX * RADIUS_RATIO))
  // marks restructure to their compact form past a threshold (hysteresis)
  const [compact, setCompact] = useState(false)
  useMotionValueEvent(sp, 'change', (v) => {
    const t = clamp01(v)
    const sr = Math.round(lerp(OUTER_MAX, OUTER_MIN, t) * RADIUS_RATIO)
    const tr = Math.round(lerp(TILE_MAX, TILE_MIN, t) * RADIUS_RATIO)
    setSelRadius((p) => (p === sr ? p : sr))
    setTileRadius((p) => (p === tr ? p : tr))
    setCompact((p) => (p ? t > 0.4 : t > 0.55))
  })

  // The user can also open the full scrollable list by swiping the rail
  // horizontally while expanded (there's no overflow in carousel mode, so we
  // detect the intent from wheel/touch). Reset to the carousel on selection.
  const [engaged, setEngaged] = useState(false)
  useEffect(() => setEngaged(false), [activeId])
  const touchStart = useRef(null)
  const listMode = compact || engaged // scroll strip of all marketplaces
  const onRailWheel = (e) => {
    if (!listMode && Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) setEngaged(true)
  }
  const onRailTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const onRailTouchMove = (e) => {
    if (listMode || !touchStart.current) return
    const dx = e.touches[0].clientX - touchStart.current.x
    const dy = e.touches[0].clientY - touchStart.current.y
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) setEngaged(true)
  }

  return (
    <motion.div data-id="mp-switcher" className="relative" style={{ height: switcherH }}>
      {/* right rail — DEFAULT: 4 tiles (3 fixed + sliding carousel), no scroll.
          COLLAPSED: a horizontal scroll strip of ALL the other marketplaces.
          Same outer height as the selected tile; padding tightens on collapse. */}
      <MotionSquircle
        data-id="mp-rail"
        cornerRadius={tileRadius + RAIL_PAD_MIN}
        cornerSmoothing={SMOOTH}
        onWheel={onRailWheel}
        onTouchStart={onRailTouchStart}
        onTouchMove={onRailTouchMove}
        style={{
          position: 'absolute',
          top: TOP,
          left: PAD + SEL_W + GAP,
          right: PAD,
          height: outerH,
          padding: railPad,
          background: 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: tileRadius + RAIL_PAD_MIN,
          perspective: 600,
        }}
        className={
          listMode
            ? 'scrollbar-hide flex items-center gap-2 overflow-x-auto'
            : 'flex items-center justify-between'
        }
      >
        {listMode ? (
          // collapsed OR user-swiped → scroll strip of every other marketplace
          <AnimatePresence initial={false} mode="popLayout">
            {rest.map((m) => (
              <RailTile key={m.id} m={m} onChange={onChange} sp={sp} radius={tileRadius} compact={compact} />
            ))}
          </AnimatePresence>
        ) : (
          // default → 3 fixed tiles + the sliding carousel
          <>
            <AnimatePresence initial={false} mode="popLayout">
              {fixed.map((m) => (
                <RailTile key={m.id} m={m} onChange={onChange} sp={sp} radius={tileRadius} compact={compact} />
              ))}
            </AnimatePresence>
            <HCarousel pool={pool} onChange={onChange} sp={sp} radius={tileRadius} compact={compact} />
          </>
        )}
      </MotionSquircle>

      {/* selected marketplace — square at rest, same outer height as the rail;
          reduces height in place on scroll (no dock); flips on swap */}
      <motion.div
        data-id="mp-selected"
        style={{
          position: 'absolute',
          left: PAD,
          top: TOP,
          width: SEL_W,
          height: outerH,
          perspective: 600,
          zIndex: 10,
          filter: 'drop-shadow(0 2px 8px rgba(16,24,40,0.12))',
        }}
      >
        <Squircle
          key={selRadius}
          as="div"
          cornerRadius={selRadius}
          cornerSmoothing={SMOOTH}
          style={{ background: selected.accent }}
          className="absolute inset-0 overflow-hidden"
        />
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={selected.id}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={FLIP}
            style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}
            className="flex items-center justify-center"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={compact ? 'c' : 'e'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex items-center justify-center"
              >
                <MarketplaceMark
                  m={selected}
                  white={!selected.lightAccent}
                  active
                  collapsed={compact}
                  collapsedLogoScale={collapsedLogoScale(selected.id)}
                  {...COMPACT_MARK_PROPS}
                  size={Math.round(markSize(selected.id) * 1.18)}
                />
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* 2-line location — slides up as the row shrinks */}
      <motion.div
        data-id="mp-location"
        style={{ position: 'absolute', left: PAD, right: PAD, top: locTop, height: LOC_H }}
        className="flex min-w-0 flex-col justify-center"
      >
        <div className="flex items-center gap-1.5">
          <img src={homeIcon} alt="" aria-hidden="true" className="h-[18px] w-auto shrink-0" />
          <span className="whitespace-nowrap font-noontree text-[16px] font-semibold text-black">{address.label} -</span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
            <path d="M6 8l4 4 4-4" stroke="#101628" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="truncate font-noontree text-[13px] text-[#343D54]">{address.line}</span>
      </motion.div>

      {/* separate search row — slides up with the location */}
      <motion.div
        data-id="mp-search"
        style={{ position: 'absolute', left: PAD, right: PAD, top: searchTop }}
        className="flex h-12 items-center gap-2 rounded-[12px] border border-[#D7DAE3] bg-white px-3"
      >
        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="9" cy="9" r="6" stroke="#1D2539" strokeWidth="1.6" />
          <path d="m14 14 3 3" stroke="#1D2539" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="min-w-0 flex-1 truncate font-noontree text-[15px] font-medium text-[#1D2539]">Search iphone</span>
        <span className="h-6 w-px shrink-0 bg-[#D9DADB]" />
        <CameraIcon />
      </motion.div>
    </motion.div>
  )
}
