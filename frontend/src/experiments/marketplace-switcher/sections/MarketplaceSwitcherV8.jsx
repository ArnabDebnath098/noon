// Marketplace switcher — VARIATION 4 ("scroll rail + sticky hint").
//
// Two containers side by side: a horizontally-scrollable rail of squircle
// tiles, and a sticky black hint block overlaying the right edge (tap to page
// forward; fades at the rail's far end).
//
// Scroll-linked collapse: as the page scrolls up, tiles morph 72×72 → 72×36
// pills (driven by the shared `progress` motion value, spring-smoothed) and
// the marks animate "smartly" rather than just shrinking:
//   • fadeStack (noon FOOD / 15 MINUTES / noon send / noon med / home) — the
//     top wordmark folds + fades away, leaving only the bottom one
//   • rowMorph (supermall) — "mall" slides from below "super" onto ONE line
//   • logo tiles (noon, nownow) — scale down proportionally
// Everything stays squircle-clipped (corner-smoothing), radius easing 20 → 12.
import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
} from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import { scrollSmoothing } from '../../../utils/motion'
import NewBadge from './NewBadge'

const TILE = 72 // expanded tile size
const TILE_MIN = 36 // collapsed pill height
const MARK = 64 // expanded mark size (MarketplaceMark reference is 76)
const K = MARK / 76 // scale from the 76px reference the mark assets are tuned to

// continuous gentle drift for the chevron — no pause between cycles
const HINT_NUDGE = {
  duration: 1.4,
  ease: 'easeInOut',
  repeat: Infinity,
}

function Chevrons() {
  return (
    <svg
      data-id="mp-scroll-hint-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <g fill="#FFFFFF">
        <path d="m12 19a1 1 0 0 1 -.71-1.71l5.3-5.29-5.3-5.29a1 1 0 0 1 1.41-1.41l6 6a1 1 0 0 1 0 1.41l-6 6a1 1 0 0 1 -.7.29z" />
        <path d="m6 19a1 1 0 0 1 -.71-1.71l5.3-5.29-5.3-5.29a1 1 0 0 1 1.42-1.42l6 6a1 1 0 0 1 0 1.41l-6 6a1 1 0 0 1 -.71.3z" />
      </g>
    </svg>
  )
}

/**
 * One rail tile. Height + mark morph are derived from the shared collapse
 * spring `sp`; the squircle radius comes stepped from the parent (Squircle's
 * cornerRadius is a render prop, so it can't ride a motion value directly).
 */
function RailTile({ m, active, onChange, sp, radius }) {
  const height = useTransform(sp, [0, 1], [TILE, TILE_MIN])

  // fadeStack tiles: the top wordmark folds (height → 0) and fades away early
  const topH = useTransform(sp, [0, 1], [(m.fadeH ?? 13) * K, 0])
  const topOpacity = useTransform(sp, [0, 0.55], [1, 0])
  const topGap = useTransform(sp, [0, 1], [2, 0])

  // rowMorph tile (supermall): expanded = super over mall; collapsed = one
  // line. "mall" position-morphs from below to the right (no crossfade).
  const rmItemH = useTransform(sp, [0, 1], [13 * K, 11.5 * K])
  const rmSuperNudge = useTransform(sp, [0, 1], [0, 2.1]) // p-descender baseline drop
  const rmMallX = useTransform(sp, [0, 1], [0, 31])
  const rmMallY = useTransform(sp, [0, 1], [13 * K + 2, -0.5]) // slight lift so mall's cap aligns with super
  const rmWrapW = useTransform(sp, [0, 1], [35, 53])
  const rmWrapH = useTransform(sp, [0, 1], [2 * 13 * K + 2, 11.5 * K])

  // plain logo / label tiles: proportional shrink
  const collapsedScale =
    m.collapseScale ??
    (m.logoHSmall && m.logoH
      ? m.logoHSmall / (m.logoH * K)
      : m.logo || m.logoStack
        ? 0.6
        : 0.85)
  const scale = useTransform(sp, [0, 1], [1, collapsedScale])

  // active art: pre-coloured stacks skip the white-invert; mono forces black
  const usingActiveArt = active && (m.activeFadeStack || m.activeLogoStack)
  const filter = usingActiveArt
    ? undefined
    : active && !m.lightAccent
      ? 'brightness(0) invert(1)'
      : m.mono
        ? 'brightness(0)'
        : undefined

  let content
  if (m.rowMorph && m.logoStack) {
    const stack = active && m.activeLogoStack ? m.activeLogoStack : m.logoStack
    content = (
      <motion.span style={{ width: rmWrapW, height: rmWrapH }} className="relative block">
        <motion.img
          src={stack[0]}
          alt=""
          style={{ height: rmItemH, y: rmSuperNudge }}
          className="absolute left-0 top-0 w-auto"
        />
        <motion.img
          src={stack[1]}
          alt=""
          style={{ height: rmItemH, x: rmMallX, y: rmMallY }}
          className="absolute left-0 top-0 w-auto"
        />
      </motion.span>
    )
  } else if (m.fadeStack) {
    const stack = active && m.activeFadeStack ? m.activeFadeStack : m.fadeStack
    // fadeMatchH: both marks share one cap height; otherwise equal width
    const img = m.fadeMatchH
      ? { className: 'w-auto', style: { height: (m.fadeH ?? 12) * K } }
      : { className: 'h-auto', style: { width: (m.keepW ?? 46) * K } }
    content = (
      <span className="flex flex-col items-center">
        <motion.span
          style={{ height: topH, opacity: topOpacity, marginBottom: topGap }}
          className="flex items-end justify-center overflow-hidden"
        >
          <img src={stack[0]} alt="" className={img.className} style={img.style} />
        </motion.span>
        <img src={stack[1]} alt="" className={img.className} style={img.style} />
      </span>
    )
  } else if (m.logo) {
    content = (
      <motion.span style={{ scale }} className="flex items-center justify-center">
        {m.logoH ? (
          <img src={m.logo} alt="" className="w-auto" style={{ height: m.logoH * K }} />
        ) : (
          <img src={m.logo} alt="" className="h-auto" style={{ width: (m.logoW ?? 56) * K }} />
        )}
      </motion.span>
    )
  } else {
    content = (
      <motion.span style={{ scale }} className="flex items-center justify-center">
        <span
          className="whitespace-pre-line text-center font-noontree font-black lowercase"
          style={{ color: active && !m.lightAccent ? '#fff' : m.fg, fontSize: 15 * K, lineHeight: `${15 * K}px` }}
        >
          {m.label}
        </span>
      </motion.span>
    )
  }

  return (
    <motion.button
      type="button"
      data-id={`mp-tile-${m.id}`}
      aria-pressed={active}
      onClick={() => onChange(m.id)}
      style={{ width: TILE, height, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
      className="relative flex shrink-0 items-center justify-center transition-transform active:scale-95"
    >
      <Squircle
        as="span"
        cornerRadius={radius}
        cornerSmoothing={1}
        style={{ background: active ? m.accent : m.bg ?? '#FFFFFF' }}
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <span style={{ filter }} className="flex items-center justify-center">
          {content}
        </span>
      </Squircle>
      {m.isNew && <NewBadge dataId={`mp-tile-${m.id}-new`} />}
    </motion.button>
  )
}

export default function MarketplaceSwitcherV8({ items, activeId, onChange, progress }) {
  const railRef = useRef(null)
  // the hint hides once the rail is scrolled to its far end
  const [atEnd, setAtEnd] = useState(false)

  // one shared smoothing spring drives every tile's collapse morph
  const fallback = useMotionValue(0)
  const sp = useSpring(progress ?? fallback, scrollSmoothing)

  // squircle radius can't ride a motion value (it's a render prop), so step it
  // through state — re-renders only on whole-px changes (20 → 12 over the morph)
  const [radius, setRadius] = useState(20)
  useMotionValueEvent(sp, 'change', (v) => {
    const r = Math.round(20 - 8 * Math.min(1, Math.max(0, v)))
    setRadius((p) => (p === r ? p : r))
  })

  // hint block follows the tiles' height morph
  const hintH = useTransform(sp, [0, 1], [TILE, TILE_MIN])

  useEffect(() => {
    const el = railRef.current
    if (!el) return undefined
    const check = () => {
      setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1)
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', check)
      ro.disconnect()
    }
  }, [])

  // tapping the hint pages the rail forward to the next set of tiles
  const pageForward = () => {
    const el = railRef.current
    if (!el) return
    el.scrollTo({
      left: Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft + el.clientWidth - 88),
      behavior: 'smooth',
    })
  }

  // keep the selected marketplace in view: whenever the selection changes,
  // smooth-scroll the rail so its tile sits centred
  useEffect(() => {
    const el = railRef.current
    const tile = el?.querySelector(`[data-id="mp-tile-${activeId}"]`)
    if (!el || !tile) return
    const target = tile.offsetLeft - (el.clientWidth - tile.offsetWidth) / 2
    el.scrollTo({
      left: Math.max(0, Math.min(el.scrollWidth - el.clientWidth, target)),
      behavior: 'smooth',
    })
  }, [activeId])

  return (
    <div data-id="mp-switcher" className="relative flex items-center pl-4">
      {/* left container: the rail fills the remaining width, showing 4 tiles.
          py-2 gives the scroll box vertical room so NEW badges / shadows that
          overhang the tiles aren't clipped by overflow-x-auto. -ml-4/pl-4
          bleeds the scrollport to the screen edge on the left; pr-12 lets the
          last tile scroll clear of the hint block, which OVERLAYS the rail
          (absolute) so tiles slide under it instead of clipping at its edge. */}
      <div
        ref={railRef}
        data-id="mp-switcher-rail"
        className="scrollbar-hide -ml-4 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-2 pl-4 pr-12"
      >
        {items.map((m) => (
          <RailTile
            key={m.id}
            m={m}
            active={m.id === activeId}
            onChange={onChange}
            sp={sp}
            radius={radius}
          />
        ))}
      </div>

      {/* right container: sticky black hint block — tap to page forward;
          fades away at the rail's far end. Overlays the rail's right edge and
          follows the tiles' collapse morph. */}
      <motion.button
        type="button"
        data-id="mp-scroll-hint"
        aria-label="Show more marketplaces"
        aria-hidden={atEnd}
        onClick={pageForward}
        animate={{ opacity: atEnd ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: atEnd ? 'none' : 'auto', height: hintH }}
        className="absolute right-0 z-10 flex w-[40px] items-center justify-center"
      >
        {/* squircle shell — smooth left corners, square right edge (flush to screen) */}
        <Squircle
          as="span"
          cornerRadius={radius}
          cornerSmoothing={1}
          topRightCornerRadius={0}
          bottomRightCornerRadius={0}
          data-id="mp-scroll-hint-shell"
          className="absolute inset-0 flex items-center justify-center bg-[#0E0E12]"
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
    </div>
  )
}
