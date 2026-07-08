// Marketplace switcher — VARIATION 5 ("scroll rail + sticky hint").
//
// A plain horizontally-scrollable rail of 72px marketplace tiles. Pinned to
// the right edge sits a 24×72 hint: a white gradient (transparent on the left,
// solid white on the right) with a small double-chevron that nudges gently on
// a spring loop, telegraphing that the rail scrolls.
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import MarketplaceMark from './MarketplaceMark'
import NewBadge from './NewBadge'

// subtle repeating spring nudge for the chevron — a few px, springy settle
const HINT_NUDGE = {
  type: 'spring',
  stiffness: 140,
  damping: 5,
  mass: 0.6,
  repeat: Infinity,
  repeatType: 'mirror',
  repeatDelay: 0.8,
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
      <defs>
        <linearGradient id="mp-scroll-hint-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEEE00" />
          <stop offset="100%" stopColor="#F0B400" />
        </linearGradient>
      </defs>
      <g fill="url(#mp-scroll-hint-gradient)">
        <path d="m12 19a1 1 0 0 1 -.71-1.71l5.3-5.29-5.3-5.29a1 1 0 0 1 1.41-1.41l6 6a1 1 0 0 1 0 1.41l-6 6a1 1 0 0 1 -.7.29z" />
        <path d="m6 19a1 1 0 0 1 -.71-1.71l5.3-5.29-5.3-5.29a1 1 0 0 1 1.42-1.42l6 6a1 1 0 0 1 0 1.41l-6 6a1 1 0 0 1 -.71.3z" />
      </g>
    </svg>
  )
}

export default function MarketplaceSwitcherV8({ items, activeId, onChange }) {
  const railRef = useRef(null)
  // the hint hides once the rail is scrolled to its far end
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
    <div data-id="mp-switcher" className="relative">
      <div
        ref={railRef}
        data-id="mp-switcher-rail"
        className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-5 py-2"
      >
        {items.map((m) => {
          const active = m.id === activeId
          return (
            <button
              key={m.id}
              type="button"
              data-id={`mp-tile-${m.id}`}
              aria-pressed={active}
              onClick={() => onChange(m.id)}
              style={{ width: 72, height: 72, borderRadius: 20, background: active ? m.accent : m.bg ?? '#FFFFFF' }}
              className="relative flex shrink-0 items-center justify-center border border-[#EFEFEF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform active:scale-95"
            >
              <MarketplaceMark m={m} white={active && !m.lightAccent} active={active} size={64} />
              {m.isNew && <NewBadge dataId={`mp-tile-${m.id}-new`} />}
            </button>
          )
        })}
      </div>

      {/* sticky scroll hint pinned to the right edge — tap to page forward;
          fades away at the rail's far end */}
      <motion.button
        type="button"
        data-id="mp-scroll-hint"
        aria-label="Show more marketplaces"
        aria-hidden={atEnd}
        onClick={pageForward}
        animate={{ opacity: atEnd ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: atEnd ? 'none' : 'auto' }}
        className="absolute right-0 top-1/2 flex h-[72px] w-[40px] -translate-y-1/2 items-center justify-center"
        style={{
          // radial (not linear) so the white fades out toward the top/bottom
          // too and doesn't cut a hard edge against the header background.
          // Kept soft so the tile underneath stays visible through it.
          background:
            'radial-gradient(ellipse 85% 60% at 100% 50%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.2) 100%)',
        }}
      >
        <motion.span
          data-id="mp-scroll-hint-motion"
          className="flex items-center justify-center"
          animate={{ x: 3 }}
          transition={HINT_NUDGE}
        >
          <Chevrons />
        </motion.span>
      </motion.button>
    </div>
  )
}
