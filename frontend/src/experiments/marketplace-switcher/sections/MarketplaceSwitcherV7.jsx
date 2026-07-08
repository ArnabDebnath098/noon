// Marketplace switcher — VARIATION 7 ("stories rail", Instagram style).
//
// Marketplaces render as a horizontal rail of story circles — an accent ring
// around the active one, label underneath. On mount the rail starts
// pre-scrolled and glides back to the start (staggered entrance + an iOS-eased
// slide) so the user sees the rail extends off-screen right. The scroll-linked
// collapse shrinks the circles and folds the labels away.
import { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform, useMotionValueEvent, animate } from 'framer-motion'
import { springs, easings, scrollSmoothing } from '../../../utils/motion'
import MarketplaceMark from './MarketplaceMark'

const PEEK = 96 // initial pre-scroll (px) — how far the intro slide travels
const INTRO_SLIDE = { delay: 0.55, duration: 0.9, ease: easings.ios }
const STAGGER = 0.04 // per-story entrance delay

// Per-marketplace mark size (MarketplaceMark's 76-based scale) tuned so every
// mark reads at a similar visual width inside the 72px story tile — the raw
// marks have very different intrinsic widths (wordmark stacks vs single logos).
const MARK_SIZE = {
  noon: 74,
  supermall: 92,
  food: 88,
  minutes: 80,
  nownow: 78,
  home: 72,
  send: 88,
  pay: 88,
  out: 88,
  med: 88,
  global: 88,
}

// iOS app-icon squircle normalized to a 1×1 box — three cubics per corner
// (effective radius ≈ 22% of size) give continuous-curvature corner smoothing
// that plain border-radius can't. Referenced by every ring/gap/tile layer, so
// the shape scales with the element.
const SQUIRCLE = 'url(#mp-squircle)'

export function SquircleClipDef() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <clipPath id="mp-squircle" clipPathUnits="objectBoundingBox">
          <path d="M .5,0 C .633,0 .737,0 .82,.026 C .894,.05 .95,.106 .974,.18 C 1,.263 1,.367 1,.5 C 1,.633 1,.737 .974,.82 C .95,.894 .894,.95 .82,.974 C .737,1 .633,1 .5,1 C .367,1 .263,1 .18,.974 C .106,.95 .05,.894 .026,.82 C 0,.737 0,.633 0,.5 C 0,.367 0,.263 .026,.18 C .05,.106 .106,.05 .18,.026 C .263,0 .367,0 .5,0 Z" />
        </clipPath>
      </defs>
    </svg>
  )
}

function Story({ m, i, active, onChange, sp }) {
  const size = useTransform(sp, [0, 1], [72, 48])
  // ring (2px) + gap (3px) wrap the tile on every side
  const ringSize = useTransform(size, (s) => s + 10)
  const markScale = useTransform(sp, [0, 1], [1, 0.72])

  return (
    <motion.button
      type="button"
      data-id={`mp-tile-${m.id}`}
      aria-pressed={active}
      initial={{ opacity: 0, x: 28, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ ...springs.snappy, delay: 0.05 + i * STAGGER }}
      whileTap={{ scale: 0.92 }}
      onClick={() => onChange(m.id)}
      className="flex shrink-0 items-center"
    >
      {/* squircle story ring — accent when active, with a white gap to the
          tile. clip-path clips box-shadows, so the wrapper carries a
          drop-shadow filter instead. */}
      <motion.span
        style={{ width: ringSize, height: ringSize, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08))' }}
        className="relative block"
      >
        <span
          className="absolute inset-0 transition-colors duration-300"
          style={{ background: active ? m.accent : '#E2E5EC', clipPath: SQUIRCLE }}
        />
        <span className="absolute inset-[2px] bg-white" style={{ clipPath: SQUIRCLE }} />
        <span
          className="absolute inset-[5px] flex items-center justify-center overflow-hidden transition-colors duration-300"
          style={{ background: active ? m.accent : m.bg ?? '#FFFFFF', clipPath: SQUIRCLE }}
        >
          <motion.span style={{ scale: markScale }} className="flex items-center justify-center">
            <MarketplaceMark m={m} white={active && !m.lightAccent} active={active} size={MARK_SIZE[m.id] ?? 72} />
          </motion.span>
        </span>
      </motion.span>
    </motion.button>
  )
}

export default function MarketplaceSwitcherV7({ items, activeId, onChange, progress }) {
  const railRef = useRef(null)
  const introDone = useRef(false)
  // one shared smoothing spring drives every circle's collapse
  const sp = useSpring(progress, scrollSmoothing)

  // While the page scroll collapses/expands the rail, keep the selected tile
  // centred: tile widths change with the morph, and a user-scrolled rail would
  // otherwise leave the selection off-screen. Runs per frame only while the
  // collapse spring is moving — a rail at rest stays free to scroll.
  useMotionValueEvent(sp, 'change', () => {
    const el = railRef.current
    const tile = el?.querySelector(`[data-id="mp-tile-${activeId}"]`)
    if (!el || !tile) return
    const centre = tile.offsetLeft - (el.clientWidth - tile.offsetWidth) / 2
    el.scrollLeft = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, centre))
  })

  // Keep the selected marketplace in view: whenever the selection changes,
  // smooth-scroll the rail so its tile sits centred. Skipped on mount so it
  // doesn't fight the intro slide (which owns the initial scroll position).
  useEffect(() => {
    if (!introDone.current) {
      introDone.current = true
      return
    }
    const el = railRef.current
    const tile = el?.querySelector(`[data-id="mp-tile-${activeId}"]`)
    if (!el || !tile) return
    const target = tile.offsetLeft - (el.clientWidth - tile.offsetWidth) / 2
    el.scrollTo({
      left: Math.max(0, Math.min(el.scrollWidth - el.clientWidth, target)),
      behavior: 'smooth',
    })
  }, [activeId])

  // Intro slide: glide the rail to rest with the SELECTED marketplace in view.
  // Default selection (rail start) → start pre-scrolled by PEEK and glide back,
  // telegraphing that more marketplaces sit off-screen right. Selection deeper
  // in the rail → same directional glide, but settling with that tile centred.
  // Any touch/scroll from the user cancels the glide immediately.
  useEffect(() => {
    const el = railRef.current
    if (!el) return undefined
    const tile = el.querySelector(`[data-id="mp-tile-${activeId}"]`)
    const centre = tile ? tile.offsetLeft - (el.clientWidth - tile.offsetWidth) / 2 : 0
    const target = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, centre))
    const from = target > 0 ? Math.max(0, target - PEEK) : PEEK
    el.scrollLeft = from
    const c = animate(from, target, { ...INTRO_SLIDE, onUpdate: (v) => { el.scrollLeft = v } })
    const stop = () => c.stop()
    el.addEventListener('pointerdown', stop)
    el.addEventListener('wheel', stop, { passive: true })
    el.addEventListener('touchstart', stop, { passive: true })
    return () => {
      c.stop()
      el.removeEventListener('pointerdown', stop)
      el.removeEventListener('wheel', stop)
      el.removeEventListener('touchstart', stop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={railRef}
      data-id="mp-switcher"
      className="scrollbar-hide flex items-start gap-3 overflow-x-auto px-5 py-2"
    >
      <SquircleClipDef />
      {items.map((m, i) => (
        <Story key={m.id} m={m} i={i} active={m.id === activeId} onChange={onChange} sp={sp} />
      ))}
    </div>
  )
}
