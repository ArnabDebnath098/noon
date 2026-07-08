// Marketplace switcher — VARIATION 5 ("scroll rail + sticky hint").
//
// Two containers side by side (20px apart): a horizontally-scrollable rail
// filling the width that shows exactly the first 4 marketplaces (inter-tile gap
// computed from the measured width so none overflow/peek), and a sticky 40px
// black hint block on the right (left corners rounded 8px) holding a white
// double-chevron that drifts continuously. Tapping the hint pages the rail; it
// fades away at the rail's far end.
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import MarketplaceMark from './MarketplaceMark'
import NewBadge from './NewBadge'

const TILE = 72
const VISIBLE = 4 // marketplaces shown before scrolling

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

export default function MarketplaceSwitcherV8({ items, activeId, onChange }) {
  const railRef = useRef(null)
  // the hint hides once the rail is scrolled to its far end
  const [atEnd, setAtEnd] = useState(false)
  // inter-tile gap computed so exactly VISIBLE tiles fill the rail width
  const [gap, setGap] = useState(8)

  useEffect(() => {
    const el = railRef.current
    if (!el) return undefined
    const check = () => {
      setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1)
      setGap(Math.max(6, (el.clientWidth - VISIBLE * TILE) / (VISIBLE - 1)))
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
    <div data-id="mp-switcher" className="flex items-center gap-5 pl-5">
      {/* left container: the rail fills the remaining width, showing 4 tiles.
          py-2 gives the scroll box vertical room so NEW badges / shadows that
          overhang the tiles aren't clipped by overflow-x-auto. */}
      <div
        ref={railRef}
        data-id="mp-switcher-rail"
        style={{ gap }}
        className="scrollbar-hide flex min-w-0 flex-1 items-center overflow-x-auto py-2"
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
              style={{ width: TILE, height: TILE, borderRadius: 20, background: active ? m.accent : m.bg ?? '#FFFFFF' }}
              className="relative flex shrink-0 items-center justify-center border border-[#EFEFEF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform active:scale-95"
            >
              <MarketplaceMark m={m} white={active && !m.lightAccent} active={active} size={64} />
              {m.isNew && <NewBadge dataId={`mp-tile-${m.id}-new`} />}
            </button>
          )
        })}
      </div>

      {/* right container: sticky black hint block — tap to page forward;
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
        className="flex h-[72px] w-[40px] shrink-0 items-center justify-center rounded-l-[20px] bg-[#0E0E12]"
      >
        <motion.span
          data-id="mp-scroll-hint-motion"
          className="flex items-center justify-center"
          animate={{ x: [0, 3, 0] }}
          transition={HINT_NUDGE}
        >
          <Chevrons />
        </motion.span>
      </motion.button>
    </div>
  )
}
