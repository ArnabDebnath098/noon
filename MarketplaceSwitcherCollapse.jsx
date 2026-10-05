// MarketplaceSwitcherCollapse — a horizontal row of marketplace logo tiles that
// collapse from 76×76 squares to 76×36 pills as the page scrolls up.
//
// Pulled out of experiments/marketplace-switcher/sections/MarketplaceSwitcher.jsx
// (the "V1" scroll-collapse variant) and made self-contained:
//   • the two motion constants it used (springs.press, scrollSmoothing) are inlined
//   • the scroll→progress wiring that lived in the experiment's index.jsx is
//     included here as the `useScrollCollapse` hook
//
// The collapse is scroll-linked: each tile's height/radius AND its logo scale are
// driven by a `progress` motion value (0 = expanded → 1 = collapsed), lightly
// spring-smoothed. Logos scale down continuously rather than swapping renderings.
//
// Only framer-motion is required:  npm i framer-motion
import { useMotionValue, motion, useTransform, useSpring } from 'framer-motion'

/* ---- inlined motion constants (were in utils/motion.js) ------------------ */
// quick tactile press/release — critically damped, no overshoot
const PRESS_SPRING = { type: 'spring', duration: 0.25, bounce: 0 }
// useSpring smoothing filter for scroll-linked motion — tight + overdamped
const SCROLL_SMOOTHING = { stiffness: 480, damping: 48, mass: 0.45 }

/* ---- scroll driver ------------------------------------------------------- *
 * Attach `onScroll` to your scroll container and pass `progress` to the switcher.
 * `range` is the px of scroll over which the row collapses (44 in the original).
 *
 *   const { progress, onScroll } = useScrollCollapse()
 *   <main onScroll={onScroll}> ... <MarketplaceSwitcherCollapse progress={progress} .../> ...
 * -------------------------------------------------------------------------- */
export function useScrollCollapse(range = 44) {
  const progress = useMotionValue(0) // 0 = expanded, 1 = collapsed
  const onScroll = (e) => {
    const top = e.currentTarget.scrollTop
    progress.set(Math.min(1, Math.max(0, top / range)))
  }
  return { progress, onScroll }
}

/* ---- tile artwork (logo / stacked / text renderings) --------------------- */
function TileArt({ m }) {
  if (m.logoStack) {
    const useH = m.stackItemH != null
    const sz = useH ? m.stackItemH : m.stackItemW ?? 44
    return (
      <span className={`flex flex-col justify-center gap-0.5 ${m.align === 'left' ? 'items-start' : 'items-center'}`}>
        {m.logoStack.map((src, i) => (
          <img key={i} src={src} alt="" className={useH ? 'w-auto' : 'h-auto'} style={useH ? { height: sz } : { width: sz }} />
        ))}
      </span>
    )
  }
  if (m.logo) {
    return m.logoH ? (
      <img src={m.logo} alt={m.id} className="w-auto" style={{ height: m.logoH }} />
    ) : (
      <img src={m.logo} alt={m.id} className="h-auto" style={{ width: m.logoW ?? 56 }} />
    )
  }
  if (m.sub) {
    return (
      <span className="flex flex-col items-center leading-none">
        <span className="font-noontree text-[24px] font-black" style={{ color: m.fg }}>{m.label}</span>
        <span className="mt-0.5 font-noontree text-[8px] font-bold tracking-[1px]" style={{ color: m.fg }}>{m.sub}</span>
      </span>
    )
  }
  return (
    <span className="whitespace-pre-line text-center font-noontree text-[15px] font-black lowercase leading-[15px]" style={{ color: m.fg }}>
      {m.label}
    </span>
  )
}

/* ---- a single collapsing tile -------------------------------------------- */
function Tile({ m, activeId, onChange, sp }) {
  const height = useTransform(sp, [0, 1], [76, 36])
  const radius = useTransform(sp, [0, 1], [20, 10])
  // text/logo tiles: shrink in proportion with the tile (per-tile override)
  const defScale = m.logo || m.logoStack ? 0.5 : 0.85
  const scale = useTransform(sp, [0, 1], [1, m.collapseScale ?? defScale])
  // fadeStack tiles (food, send, minutes): the top mark fades + collapses away
  const topH = useTransform(sp, [0, 1], [m.fadeH ?? 0, 0])
  const topOpacity = useTransform(sp, [0, 0.55], [1, 0])
  // rowMorph tile (supermall): expanded = super over mall (left-aligned);
  // collapsed = super left, mall right. "mall" slides from below to the right
  // (a position morph — no crossfade, so no double-image). super gets a small
  // baseline nudge in the collapsed one-line form.
  const rmItemH = useTransform(sp, [0, 1], [13, 10])
  const rmSuperNudge = useTransform(sp, [0, 1], [0, 2.6])
  const rmMallX = useTransform(sp, [0, 1], [0, 31.8])
  const rmMallY = useTransform(sp, [0, 1], [16, 0])
  const rmWrapW = useTransform(sp, [0, 1], [41, 55])
  const rmWrapH = useTransform(sp, [0, 1], [29, 10])

  const active = m.id === activeId
  // when active, a marketplace may swap to a pre-coloured logo set (e.g. yellow)
  // instead of the default white-invert
  const rowLogos = active && m.activeLogoStack ? m.activeLogoStack : m.logoStack

  let content
  if (m.rowMorph) {
    content = (
      <motion.span style={{ width: rmWrapW, height: rmWrapH }} className="relative block">
        <motion.img src={rowLogos[0]} alt="" style={{ height: rmItemH, y: rmSuperNudge }} className="absolute left-0 top-0 w-auto" />
        <motion.img src={rowLogos[1]} alt="" style={{ height: rmItemH, x: rmMallX, y: rmMallY }} className="absolute left-0 top-0 w-auto" />
      </motion.span>
    )
  } else if (m.fadeStack) {
    const fade = active && m.activeFadeStack ? m.activeFadeStack : m.fadeStack
    content = (
      <span className="flex flex-col items-center gap-0.5">
        <motion.span style={{ height: topH, opacity: topOpacity }} className="flex items-end overflow-hidden">
          <img src={fade[0]} alt="" className="h-auto" style={{ width: m.fadeW }} />
        </motion.span>
        <img src={fade[1]} alt={m.id} className="h-auto" style={{ width: m.keepW }} />
      </span>
    )
  } else {
    content = (
      <motion.span style={{ scale }} className="flex items-center justify-center">
        <TileArt m={m} />
      </motion.span>
    )
  }

  return (
    <motion.button
      type="button"
      data-id={`mp-tile-${m.id}`}
      aria-pressed={active}
      onClick={() => onChange(m.id)}
      whileTap={{ scale: 0.96 }}
      transition={PRESS_SPRING}
      style={{ height, borderRadius: radius, width: 76, background: active ? m.accent : m.bg ?? '#FFFFFF' }}
      className="relative flex shrink-0 items-center justify-center overflow-hidden px-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
    >
      {/* selected → content turns white via invert filter (kept dark on light
          accents like noon's yellow, or when a pre-coloured activeLogoStack is used) */}
      <span
        style={{ filter: active && !m.lightAccent && !m.activeLogoStack && !m.activeFadeStack ? 'brightness(0) invert(1)' : undefined }}
        className="flex items-center justify-center"
      >
        {content}
      </span>
    </motion.button>
  )
}

/**
 * MarketplaceSwitcherCollapse
 *
 * @param {object[]} items    marketplaces (see item shape below)
 * @param {string}   activeId currently-selected marketplace id
 * @param {(id:string)=>void} onChange
 * @param {import('framer-motion').MotionValue<number>} progress
 *        0 = expanded (76px), 1 = collapsed (36px). Use `useScrollCollapse()`.
 *
 * Item shape (all logo fields optional — pick ONE rendering per marketplace):
 *   { id, accent, bg?, lightAccent?, fg?,
 *     logo?, logoW?, logoH?,                       // single mark
 *     logoStack?, stackItemW?, stackItemH?, align?,// stacked marks
 *     activeLogoStack?,                            // pre-coloured marks when selected
 *     fadeStack?, activeFadeStack?, fadeW?, fadeH?, keepW?, // top mark fades on collapse
 *     rowMorph?,                                   // super-over-mall → super | mall
 *     label?, sub?, collapseScale? }               // text fallback + shrink override
 */
export default function MarketplaceSwitcherCollapse({ items, activeId, onChange, progress }) {
  // one shared smoothing spring; every tile derives its morph from it
  const sp = useSpring(progress, SCROLL_SMOOTHING)
  return (
    <div data-id="mp-switcher" className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-4 py-2">
      {items.map((m) => (
        <Tile key={m.id} m={m} activeId={activeId} onChange={onChange} sp={sp} />
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------------
USAGE

import MarketplaceSwitcherCollapse, { useScrollCollapse } from './MarketplaceSwitcherCollapse'

function Home() {
  const [activeId, setActiveId] = useState('noon')
  const { progress, onScroll } = useScrollCollapse(44) // 44px collapse range

  return (
    <main onScroll={onScroll} className="h-dvh overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white">
        <MarketplaceSwitcherCollapse
          items={marketplaces}
          activeId={activeId}
          onChange={setActiveId}
          progress={progress}
        />
      </div>
      ... rest of the scrolling page ...
    </main>
  )
}

NOTES
• Requires framer-motion. Tailwind classes are used for layout; `font-noontree`
  and `scrollbar-hide` are project utilities — swap or define them if absent.
• Logo/marketplace image assets come from your data (the `logo`/`logoStack`/…
  fields). The original data lives in the experiment's data.js.
--------------------------------------------------------------------------- */
