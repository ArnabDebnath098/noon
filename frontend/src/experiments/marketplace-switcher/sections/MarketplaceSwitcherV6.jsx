// Marketplace switcher — VARIATION 6 (variation 2 layout + variation 4 collapse).
//
// Same "selected + rail" structure as variation 2 (a left selected tile, a right
// rail of the other marketplaces with an in-rail scroll-hint shell, a 2-line
// location and a separate search below). On scroll it does NOT dock/fade like
// variation 2 — every marketplace tile REDUCES ITS HEIGHT into a pill
// (scroll-linked, spring-smoothed) like variation 4, and the location + search
// slide up. The rail is exactly the same height as the selected tile in both
// states; tiles are square at rest with the rail's padding around them. The
// squircle radius is stepped proportionally so tiles stay squircles at any size.
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

// motion-wrapped Squircle so the scrolling rail can be a real squircle while
// still riding an animated height motion value and holding the scroll ref
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

const RADIUS_RATIO = 0.28 // squircle radius as a fraction of height
const LOC_H = 40
const SEARCH_H = 48
const BOTTOM = 16
const H0 = TOP + OUTER_MAX + GAP + LOC_H + GAP + SEARCH_H + BOTTOM
const H1 = TOP + OUTER_MIN + GAP + LOC_H + GAP + SEARCH_H + BOTTOM

const FLIP = { rotateY: springs.flip, opacity: { duration: 0.16 } }
const HINT_NUDGE = { duration: 1.4, ease: 'easeInOut', repeat: Infinity }

const MARK = 52
const MARK_SIZE = {
  noon: 52, supermall: 66, food: 62, minutes: 60, nownow: 60,
  pay: 66, send: 64, out: 66, med: 64, global: 66, home: 56,
}
const markSize = (id) => MARK_SIZE[id] ?? MARK

// per-marketplace logo shrink in the collapsed pill (1 = unchanged)
const COLLAPSED_LOGO_SCALE = { nownow: 0.58, pay: 0.7 }
const collapsedLogoScale = (id) => COLLAPSED_LOGO_SCALE[id] ?? 1

// grey-gradient double chevron (same mark as variation 4's hint)
function Chevrons() {
  return (
    <svg data-id="mp-scroll-hint-icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="mp6-hint-gray" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8A90A3" />
          <stop offset="1" stopColor="#4B5163" />
        </linearGradient>
      </defs>
      <g fill="url(#mp6-hint-gray)">
        <path d="m12 19a1 1 0 0 1 -.71-1.71l5.3-5.29-5.3-5.29a1 1 0 0 1 1.41-1.41l6 6a1 1 0 0 1 0 1.41l-6 6a1 1 0 0 1 -.7.29z" />
        <path d="m6 19a1 1 0 0 1 -.71-1.71l5.3-5.29-5.3-5.29a1 1 0 0 1 1.42-1.42l6 6a1 1 0 0 1 0 1.41l-6 6a1 1 0 0 1 -.71.3z" />
      </g>
    </svg>
  )
}

// One rail tile — square at rest, width fixed; height rides `sp`. The mark
// restructures (variation-4 style) via MarketplaceMark's `collapsed` form,
// crossfading between the full and compact wordmarks.
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
            <MarketplaceMark
              m={m}
              size={markSize(m.id)}
              collapsed={compact}
              collapsedStackH={9.5}
              collapsedStackGap={-1}
              collapsedLogoScale={collapsedLogoScale(m.id)}
              collapsedLabelPill
            />
          </motion.span>
        </AnimatePresence>
      </Squircle>
      {/* NEW badge only in the expanded state — hidden once tiles collapse */}
      {m.isNew && !compact && <NewBadge dataId={`mp-tile-${m.id}-new`} />}
    </motion.button>
  )
}

export default function MarketplaceSwitcherV6({ items, activeId, onChange, progress }) {
  const selected = items.find((i) => i.id === activeId) ?? items[0]
  const rest = items.filter((i) => i.id !== selected.id)

  // scroll-linked collapse — spring-smoothed progress drives the height morph
  const fallback = useMotionValue(0)
  const sp = useSpring(progress ?? fallback, scrollSmoothing)

  // rail container + selected tile share the same outer height (always matched)
  const outerH = useTransform(sp, [0, 1], [OUTER_MAX, OUTER_MIN])
  const railPad = useTransform(sp, [0, 1], [RAIL_PAD_MAX, RAIL_PAD_MIN])
  const hintMargin = useTransform(sp, [0, 1], [-RAIL_PAD_MAX, -RAIL_PAD_MIN])
  const hintH = useTransform(sp, [0, 1], [TILE_MAX, TILE_MIN]) // shell = tile height
  const locTop = useTransform(sp, [0, 1], [TOP + OUTER_MAX + GAP, TOP + OUTER_MIN + GAP])
  const searchTop = useTransform(sp, [0, 1], [TOP + OUTER_MAX + GAP + LOC_H + GAP, TOP + OUTER_MIN + GAP + LOC_H + GAP])
  const switcherH = useTransform(sp, [0, 1], [H0, H1])

  // squircle radii stepped whole-px (render prop can't ride a motion value) so
  // they stay proportional to each shrinking height — squircle, never a circle
  const [selRadius, setSelRadius] = useState(Math.round(OUTER_MAX * RADIUS_RATIO))
  const [tileRadius, setTileRadius] = useState(Math.round(TILE_MAX * RADIUS_RATIO))
  // marks restructure to their compact form (variation-4 style) past a
  // threshold — hysteresis (0.55 in / 0.4 out) avoids flicker mid-morph
  const [compact, setCompact] = useState(false)
  useMotionValueEvent(sp, 'change', (v) => {
    const t = clamp01(v)
    const sr = Math.round(lerp(OUTER_MAX, OUTER_MIN, t) * RADIUS_RATIO)
    const tr = Math.round(lerp(TILE_MAX, TILE_MIN, t) * RADIUS_RATIO)
    setSelRadius((p) => (p === sr ? p : sr))
    setTileRadius((p) => (p === tr ? p : tr))
    setCompact((p) => (p ? t > 0.4 : t > 0.55))
  })

  // rail scroll state — the in-rail hint hides once the rail reaches its end
  const railRef = useRef(null)
  const [atEnd, setAtEnd] = useState(false)
  useEffect(() => {
    const el = railRef.current
    if (!el) return undefined
    const check = () => setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1)
    check()
    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [rest.length])

  const pageForward = () => {
    const el = railRef.current
    if (!el) return
    el.scrollTo({
      left: Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft + el.clientWidth - 72),
      behavior: 'smooth',
    })
  }

  return (
    <motion.div data-id="mp-switcher" className="relative" style={{ height: switcherH }}>
      {/* right rail — same outer height as the selected tile; keeps its padding
          around the square tiles, which shrink to pills on scroll */}
      <MotionSquircle
        ref={railRef}
        data-id="mp-rail"
        cornerRadius={tileRadius + RAIL_PAD_MIN}
        cornerSmoothing={SMOOTH}
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
          // border-radius kept so the backdrop-filter is clipped (clip-path
          // alone doesn't clip it); the squircle clip-path shapes the corners
          borderRadius: tileRadius + RAIL_PAD_MIN,
          perspective: 600,
        }}
        className="scrollbar-hide flex items-center gap-1 overflow-x-auto"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {rest.map((m) => (
            <RailTile key={m.id} m={m} onChange={onChange} sp={sp} radius={tileRadius} compact={compact} />
          ))}
        </AnimatePresence>

        {/* in-rail scroll hint — pinned to the rail's right edge */}
        <motion.button
          type="button"
          data-id="mp-scroll-hint"
          aria-label="Show more marketplaces"
          aria-hidden={atEnd}
          onClick={pageForward}
          initial={false}
          animate={{ opacity: atEnd ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          style={{ height: hintH, pointerEvents: atEnd ? 'none' : 'auto', marginRight: hintMargin }}
          className="sticky right-[-8px] z-10 flex w-[40px] shrink-0 items-center justify-center"
        >
          <Squircle
            as="span"
            cornerRadius={tileRadius}
            cornerSmoothing={SMOOTH}
            topRightCornerRadius={0}
            bottomRightCornerRadius={0}
            data-id="mp-scroll-hint-shell"
            style={{
              background: 'rgba(228, 230, 235, 0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderTopLeftRadius: tileRadius,
              borderBottomLeftRadius: tileRadius,
            }}
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
          >
            <motion.span
              data-id="mp-scroll-hint-motion"
              className="flex items-center justify-center"
              animate={{ x: [0, 3, 0] }}
              transition={HINT_NUDGE}
            >
              <Chevrons />
            </motion.span>
          </Squircle>
        </motion.button>
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
                  collapsedStackH={9.5}
                  collapsedStackGap={-1}
                  collapsedLogoScale={collapsedLogoScale(selected.id)}
                  collapsedLabelPill
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
