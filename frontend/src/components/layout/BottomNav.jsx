// BottomNav — sticky primary tab bar with a sliding active marker (Framer
// Motion layoutId). Self-contained (internal active state); safe-area aware —
// the white background extends into the home-bar inset (--sab padding) while
// the 64px tab row sits above it, like a native tab bar.
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import { easings } from '../../utils/motion'
import NewBadge from '../../experiments/marketplace-switcher/sections/NewBadge'

// light blue gradient panel background (tiles sit on it as white cards)
const SELECTED_BG = 'linear-gradient(180deg, #EAF2FF 0%, #D6E7FF 100%)'
// 3D flip when a slot's marketplace swaps (same feel as variation 2's rotateY)
const EX_TILE_FLIP = { rotateY: { type: 'spring', duration: 0.55, bounce: 0.3 }, opacity: { duration: 0.16 } }

// leading-panel icon choreography — icons POP out of the chip with a lively
// spring (slight overshoot, cascading), pouring back in fast and decisively on
// close. Each tile flies via a per-tile (dx,dy) offset toward the chip corner
// (from custom) so its resting left/top stays layout-animatable for swaps.
const EX_CONTAINER = {
  open: { transition: { staggerChildren: 0.025, delayChildren: 0.05 } },
  // close as ONE unified move (no reverse-stagger ripple — that read as bumpy)
  closed: { transition: { staggerChildren: 0 } },
}
// close on the iOS deceleration curve (smooth, never bouncing); open keeps its
// lively spring
const EX_TWEEN_CLOSE = { duration: 0.32, ease: easings.ios }
const EX_FLIGHT = {
  open: {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      x: { type: 'spring', duration: 0.55, bounce: 0.22 },
      y: { type: 'spring', duration: 0.55, bounce: 0.22 },
      scale: { type: 'spring', duration: 0.55, bounce: 0.22 },
      opacity: { duration: 0.16 },
    },
  },
  closed: ({ dx = 0, dy = 0 } = {}) => ({
    x: dx,
    y: dy,
    scale: 0.25,
    opacity: 0,
    transition: {
      x: EX_TWEEN_CLOSE,
      y: EX_TWEEN_CLOSE,
      scale: EX_TWEEN_CLOSE,
      opacity: { duration: 0.24, ease: easings.ios },
    },
  }),
}
// surface + chip morph — soft overshoot opening, smooth cubic-bezier close
const EX_SURFACE_OPEN = { type: 'spring', duration: 0.5, bounce: 0.14 }
const EX_SURFACE_CLOSE = { duration: 0.34, ease: easings.ios }
import homeIcon from '../../assets/icons/nav/home.svg?raw'
import categoryIcon from '../../assets/icons/nav/category.svg?raw'
import dealsIcon from '../../assets/icons/nav/deals.svg?raw'
import cartIcon from '../../assets/icons/nav/cart.svg?raw'
import profileIcon from '../../assets/icons/nav/profile.svg?raw'
import allIcon from '../../assets/icons/nav/all.svg?raw'

const ACTIVE = '#0F61FF'
const INACTIVE = '#5C667E'

// Selected-tab accent. `grad` fills the marker bar + tints the icon/label (a
// solid colour or a gradient); `from`/`to` are the SVG icon gradient stops;
// `tint` is the translucent pill behind the floating active icon. Overridable
// per experiment — defaults to noon blue.
const DEFAULT_ACCENT = {
  from: ACTIVE,
  to: ACTIVE,
  grad: ACTIVE,
  tint: 'rgba(15, 97, 255, 0.12)',
}

const TABS = [
  { key: 'home', label: 'Home', raw: homeIcon },
  { key: 'categories', label: 'Categories', raw: categoryIcon },
  { key: 'offers', label: 'Offers', raw: dealsIcon },
  { key: 'cart', label: 'Cart', raw: cartIcon },
  { key: 'account', label: 'Account', raw: profileIcon },
]

const ICON_GRAD_ID = 'nav-active-grad' // only ever one active icon at a time
function NavIcon({ raw, active, dataId, accent = DEFAULT_ACCENT }) {
  // Active: paint the glyph with a vertical gradient (a solid accent renders as
  // equal stops). Inactive: flat currentColor.
  const html = active
    ? raw
        .replace(/fill="#[0-9a-f]{3,8}"/gi, `fill="url(#${ICON_GRAD_ID})"`)
        .replace(/stroke="#[0-9a-f]{3,8}"/gi, `stroke="url(#${ICON_GRAD_ID})"`)
        .replace(
          /<svg([^>]*)>/i,
          `<svg$1><defs><linearGradient id="${ICON_GRAD_ID}" x1="0" y1="0" x2="0" y2="1"><stop offset="0.19" stop-color="${accent.from}"/><stop offset="1" stop-color="${accent.to}"/></linearGradient></defs>`,
        )
    : raw
        .replace(/fill="#[0-9a-f]{3,8}"/gi, 'fill="currentColor"')
        .replace(/stroke="#[0-9a-f]{3,8}"/gi, 'stroke="currentColor"')
  return (
    <span
      data-id={dataId}
      aria-hidden="true"
      className="block h-7 w-7 [&>svg]:h-full [&>svg]:w-full"
      style={{ color: INACTIVE }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default function BottomNav({
  dataId = 'bottom-nav',
  accent = DEFAULT_ACCENT,
  onAll,
  floating = false,
  leading, // node rendered in the floating left circle (e.g. the marketplace)
  leadingBg, // its circle background
  onLeading, // tap handler for the leading circle
  // in-place expansion: tapping the leading chip morphs it into a panel of all
  // items instead of calling onLeading. { items, activeId, onSelect, renderIcon }
  leadingExpand,
}) {
  const [active, setActive] = useState('home')
  const [navOpen, setNavOpen] = useState(false)
  // Measure the nav's ACTUAL width — inside the web device frame it's the frame
  // width (390), not the viewport, so the expansion panel (navW − 32) must be
  // sized from the element, not window.innerWidth (which overflowed the frame).
  const navRef = useRef(null)
  const [navW, setNavW] = useState(() =>
    Math.min(typeof window !== 'undefined' ? window.innerWidth : 448, 448),
  )
  useEffect(() => {
    const el = navRef.current
    if (!el) return undefined
    const measure = () => setNavW(el.offsetWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [floating])

  // V5 leading-expand grid — a stable slot order so selecting swaps the picked
  // tile with the bottom-left (selected) tile, rather than reshuffling the whole
  // grid. Kept in sync with the parent's activeId (which we set on pick), and
  // never clobbers an in-place swap the user just made.
  const [slotOrder, setSlotOrder] = useState([])
  const leadItems = leadingExpand?.items
  const leadActive = leadingExpand?.activeId
  useEffect(() => {
    if (!leadItems) return
    const ids = leadItems.map((m) => m.id)
    const chipSlot = (Math.ceil(ids.length / 4) - 1) * 4
    const ai = ids.indexOf(leadActive)
    if (ai !== -1 && ai !== chipSlot && chipSlot < ids.length) {
      ;[ids[ai], ids[chipSlot]] = [ids[chipSlot], ids[ai]]
    }
    setSlotOrder((prev) => {
      const sameSet = prev.length === ids.length && ids.every((id) => prev.includes(id))
      if (sameSet && prev[chipSlot] === leadActive) return prev // keep user's swap
      return ids
    })
  }, [leadItems, leadActive])

  // drag-to-cycle: index of the currently-selected marketplace (kept synced),
  // and the accumulated pan distance so each ~step advances one marketplace
  const selIndexRef = useRef(0)
  const panAccRef = useRef(0)
  useEffect(() => {
    if (!leadItems) return
    const i = leadItems.findIndex((m) => m.id === leadActive)
    if (i >= 0) selIndexRef.current = i
  }, [leadItems, leadActive])

  // Floating variant — two detached, fully-round surfaces: a left circle and a
  // right pill of nav tabs (icons only). Used by variation 2. When a `leading`
  // slot is given the left circle shows it (the selected marketplace) and ALL
  // tabs move into the pill; otherwise the first tab occupies the circle.
  if (floating) {
    const [first, ...rest] = TABS
    const pillTabs = leading ? TABS : rest
    // plain render helper (not a component) so the tabs never remount and the
    // framer layout marker animates across renders
    const navCircle = (tab, className) => {
      const isActive = tab.key === active
      return (
        <button
          key={tab.key}
          type="button"
          data-id={`${dataId}-${tab.key}`}
          onClick={() => setActive(tab.key)}
          aria-current={isActive ? 'page' : undefined}
          aria-label={tab.label}
          className={`relative flex items-center justify-center rounded-full transition-transform active:scale-95 ${className}`}
        >
          {isActive && (
            <Squircle
              as={motion.span}
              data-id={`${dataId}-${tab.key}-marker`}
              layoutId={`${dataId}-marker`}
              cornerRadius={15}
              cornerSmoothing={1}
              // aspect-square + height keeps the marker equal width & height
              // even when the tab is a wide flex-1 pill slot, so the layoutId
              // flight is pure translation (the squircle clip never distorts).
              // centered via inset-0 + m-auto (NOT translate) so it doesn't
              // fight framer's layoutId transform.
              className="absolute inset-0 m-auto aspect-square h-[calc(100%-8px)]"
              style={{ background: accent.tint }}
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
            />
          )}
          <span data-id={`${dataId}-${tab.key}-icon`} className="relative">
            <NavIcon raw={tab.raw} active={isActive} accent={accent} dataId={`${dataId}-${tab.key}-glyph`} />
          </span>
        </button>
      )
    }

    // leading-expansion panel geometry — anchored to the chip's box so the
    // panel morphs out of (and back into) the chip
    const CHIP = 62
    const EX_PAD = 14
    const EX_GAP = 12
    const EX_COLS = 4
    const panelW = navW - 32
    const exTile = Math.floor((panelW - 2 * EX_PAD - (EX_COLS - 1) * EX_GAP) / EX_COLS)
    const nItems = leadingExpand?.items.length ?? 0
    const exRows = Math.ceil(nItems / EX_COLS)
    const panelH = exRows * exTile + (exRows - 1) * EX_GAP + 2 * EX_PAD
    const chipSlot = (exRows - 1) * EX_COLS // bottom-left cell holds the selected
    const byId = Object.fromEntries((leadingExpand?.items ?? []).map((m) => [m.id, m]))
    // grid cell centres (panel coords); the chip sits at chipSlot's centre
    const cellCenter = (slot) => ({
      x: EX_PAD + exTile / 2 + (slot % EX_COLS) * (exTile + EX_GAP),
      y: EX_PAD + exTile / 2 + Math.floor(slot / EX_COLS) * (exTile + EX_GAP),
    })
    // tiles fly to/from the COLLAPSED chip's centre (the panel's bottom-left
    // corner), not the chip-slot cell — so on close they tuck cleanly into the
    // chip as it and the surface collapse to that corner.
    const chipCenter = { x: CHIP / 2, y: panelH - CHIP / 2 }
    // pick: tapping the selected tile closes; tapping another swaps it into the
    // bottom-left (selected) slot — the previous selection takes the vacated
    // cell — then commits the selection (layout animation crosses the two).
    // swap a marketplace into the bottom-left (selected) slot; `commit` also
    // reports the selection up (skipped mid-drag so it isn't reloaded per step)
    const swapToChip = (id, commit) => {
      setSlotOrder((prev) => {
        const cs = (Math.ceil(prev.length / EX_COLS) - 1) * EX_COLS
        const s = prev.indexOf(id)
        if (s === -1 || s === cs) return prev
        const n = [...prev]
        ;[n[cs], n[s]] = [n[s], n[cs]]
        return n
      })
      if (commit) leadingExpand.onSelect(id)
    }
    const pick = (id) => {
      if (id === leadActive) {
        setNavOpen(false)
        return
      }
      swapToChip(id, true)
      setTimeout(() => setNavOpen(false), 480) // let the flip play, then collapse
    }

    // drag up / down anywhere in the open panel to scrub the selection (like
    // swiping across an account switcher). Each ~step flips the next / previous
    // marketplace into the selected slot; the choice commits on release and the
    // panel stays open so you can keep scrubbing.
    const mpList = leadingExpand?.items ?? []
    const cycle = (dir) => {
      if (!mpList.length) return
      selIndexRef.current = (selIndexRef.current + dir + mpList.length) % mpList.length
      swapToChip(mpList[selIndexRef.current].id, false)
    }
    const onGridPan = (_e, info) => {
      panAccRef.current += info.delta.y
      const STEP = 42
      while (panAccRef.current <= -STEP) { cycle(1); panAccRef.current += STEP } // up → next
      while (panAccRef.current >= STEP) { cycle(-1); panAccRef.current -= STEP } // down → prev
    }
    const onGridPanEnd = () => {
      panAccRef.current = 0
      if (mpList.length) leadingExpand.onSelect(mpList[selIndexRef.current].id)
    }

    return (
      <>
      {/* dim backdrop while the leading panel is open (sibling of the nav —
          position:fixed inside the translated nav would trap to its box) */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            key="nav-expand-backdrop"
            data-id={`${dataId}-expand-backdrop`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: easings.ios }}
            onClick={() => setNavOpen(false)}
            className="fixed inset-0 z-[45] bg-black/60"
          />
        )}
      </AnimatePresence>
      {/* while the panel is open the nav rises above the floating variant
          tabs (z-40) and its backdrop (z-45) */}
      <nav
        ref={navRef}
        data-id={dataId}
        className={`fixed bottom-0 left-1/2 ${navOpen ? 'z-50' : 'z-30'} flex w-full max-w-md -translate-x-1/2 items-center gap-3 px-4`}
        // hug the bottom like a native tab bar: a small 10px gap on mobile,
        // and the frame's home-indicator inset (--sab) on web — whichever wins
        style={{ paddingTop: 10, paddingBottom: 'max(10px, var(--sab, 0px))' }}
      >
        {/* white fade behind the floating bar — spans up past the top and down
            through the safe area (transparent at top → white by 80%) */}
        <div
          data-id={`${dataId}-gradient`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10"
          style={{
            top: -28,
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFFFF 80%)',
          }}
        />

        {/* left: floating squircle — the selected marketplace, or the first
            tab. Squircles clip with clip-path, so shadows live on the wrapper
            as drop-shadow (a box-shadow would be clipped away).

            With leadingExpand, the chip lives INSIDE an expanding wrapper: the
            white surface + flying icons + the chip are all children of one
            in-flow 62px box, everything anchored to its bottom-left. The chip
            morphs into the panel's bottom-left grid tile, so the panel grows
            AROUND it rather than covering it. */}
        {leading ? (
          <div
            data-id={`${dataId}-leading-wrap`}
            className="relative h-[62px] w-[62px] shrink-0"
            style={{ zIndex: 20 }}
          >
            {/* expanding surface — exactly the chip's box when closed (hidden
                behind the chip), the full panel when open */}
            {leadingExpand && (
              <motion.div
                data-id={`${dataId}-leading-panel`}
                initial={false}
                animate={navOpen ? { width: panelW, height: panelH } : { width: CHIP, height: CHIP }}
                transition={navOpen ? EX_SURFACE_OPEN : EX_SURFACE_CLOSE}
                style={{ position: 'absolute', left: 0, bottom: 0 }}
              >
                <Squircle
                  as="div"
                  data-id={`${dataId}-leading-panel-surface`}
                  cornerRadius={navOpen ? 24 : 18}
                  cornerSmoothing={1}
                  className="absolute inset-0 overflow-hidden"
                  style={{ background: navOpen ? SELECTED_BG : '#FFFFFF' }}
                />
              </motion.div>
            )}

            {/* the marketplaces — every tile lives here (the selected one at the
                bottom-left chip slot). Tiles fly from the chip on open; picking
                another swaps it into the chip slot via a layout animation. */}
            {leadingExpand && (
              <motion.div
                data-id={`${dataId}-leading-panel-grid`}
                variants={EX_CONTAINER}
                initial={false}
                animate={navOpen ? 'open' : 'closed'}
                onPan={navOpen ? onGridPan : undefined}
                onPanEnd={navOpen ? onGridPanEnd : undefined}
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: panelW,
                  height: panelH,
                  pointerEvents: navOpen ? 'auto' : 'none',
                  touchAction: navOpen ? 'none' : undefined,
                }}
              >
                {/* fixed slots (keyed by position); the marketplace shown in a
                    slot swaps via a rotateY flip IN PLACE — no tile moves. The
                    bottom-left slot holds the selected marketplace. */}
                {Array.from({ length: nItems }).map((_, slot) => {
                  const id = slotOrder[slot]
                  const m = byId[id]
                  if (!m) return null
                  const c = cellCenter(slot)
                  const isSel = slot === chipSlot
                  return (
                    <motion.button
                      key={slot}
                      type="button"
                      data-id={`${dataId}-leading-panel-${slot}`}
                      variants={EX_FLIGHT}
                      custom={{ dx: chipCenter.x - c.x, dy: chipCenter.y - c.y }}
                      onClick={() => pick(id)}
                      style={{
                        position: 'absolute',
                        left: c.x - exTile / 2,
                        top: c.y - exTile / 2,
                        width: exTile,
                        height: exTile,
                        perspective: 700,
                      }}
                      className="relative"
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.span
                          key={id}
                          data-id={`${dataId}-leading-panel-${id}`}
                          initial={{ rotateY: -90, opacity: 0 }}
                          animate={{ rotateY: 0, opacity: 1 }}
                          exit={{ rotateY: 90, opacity: 0 }}
                          transition={EX_TILE_FLIP}
                          style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}
                          className="flex items-center justify-center"
                        >
                          <Squircle
                            as="span"
                            cornerRadius={Math.round(exTile * 0.26)}
                            cornerSmoothing={1}
                            style={{ background: isSel ? m.accent ?? '#FFFFFF' : '#FFFFFF' }}
                            className="absolute inset-0 flex items-center justify-center overflow-hidden"
                          >
                            {leadingExpand.renderIcon(m, isSel, exTile)}
                          </Squircle>
                          {m.isNew && <NewBadge dataId={`${dataId}-leading-panel-${id}-new`} />}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>
                  )
                })}
              </motion.div>
            )}

            {/* the chip — the collapsed selected marketplace. When the panel is
                open the selected GRID TILE covers the chip slot, so the chip
                fades out (and stops taking taps) to avoid a double image. */}
            <motion.button
              type="button"
              data-id={`${dataId}-leading`}
              aria-label={navOpen ? 'Close marketplaces' : 'Switch marketplace'}
              onClick={leadingExpand ? () => setNavOpen((o) => !o) : onLeading}
              initial={false}
              animate={
                navOpen && leadingExpand
                  ? { left: EX_PAD, bottom: EX_PAD, width: exTile, height: exTile, opacity: 0 }
                  : { left: 0, bottom: 0, width: CHIP, height: CHIP, opacity: 1 }
              }
              transition={navOpen ? EX_SURFACE_OPEN : EX_SURFACE_CLOSE}
              whileTap={{ scale: 0.94 }}
              style={{
                position: 'absolute',
                pointerEvents: navOpen ? 'none' : 'auto',
                filter: navOpen ? 'none' : 'drop-shadow(0 6px 24px rgba(16,24,40,0.16))',
              }}
            >
              <Squircle
                as="span"
                cornerRadius={navOpen && leadingExpand ? Math.round(exTile * 0.26) : 18}
                cornerSmoothing={1}
                style={{ background: leadingBg }}
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
              >
                <span data-id={`${dataId}-leading-inner`} className="flex items-center justify-center">
                  {leading}
                </span>
              </Squircle>
            </motion.button>
          </div>
        ) : (
          <div
            data-id={`${dataId}-leading-circle`}
            className="relative h-[62px] w-[62px] shrink-0"
            style={{ filter: 'drop-shadow(0 6px 24px rgba(16,24,40,0.16))' }}
          >
            <Squircle as="span" cornerRadius={18} cornerSmoothing={1} className="absolute inset-0 block bg-white">
              {navCircle(first, 'h-full w-full')}
            </Squircle>
          </div>
        )}

        {/* right: the tabs in a floating squircle bar (2px inset). The active
            tab is a square; the rest split the remaining width equally.
            Recedes (dim + slight shrink) while the marketplace panel is open
            so attention stays on the grid. */}
        <motion.div
          data-id={`${dataId}-pill-shadow`}
          className="min-w-0 flex-1"
          initial={false}
          animate={navOpen ? { opacity: 0.45, scale: 0.97 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: easings.ios }}
          style={{ filter: 'drop-shadow(0 6px 24px rgba(16,24,40,0.16))', transformOrigin: 'right center' }}
        >
          <Squircle
            as="div"
            data-id={`${dataId}-pill`}
            cornerRadius={18}
            cornerSmoothing={1}
            className="flex h-[62px] items-center overflow-hidden bg-white p-[2px]"
          >
            {pillTabs.map((tab) =>
              navCircle(tab, tab.key === active ? 'h-full aspect-square shrink-0' : 'h-full flex-1'),
            )}
          </Squircle>
        </motion.div>
      </nav>
      </>
    )
  }

  return (
    <nav
      data-id={dataId}
      className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 flex-col border-t border-[#F2F3F7] bg-white"
      style={{ paddingBottom: 'var(--sab, 0px)' }}
    >
      <div className="relative flex h-[64px]">
        {/* optional "All" entry — opens the marketplaces sheet */}
        {onAll && (
          <>
            <button
              type="button"
              data-id={`${dataId}-all`}
              onClick={onAll}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 pt-2"
            >
              <NavIcon raw={allIcon} active={false} />
              <span className="text-xs leading-none text-[#5C667E]">All</span>
            </button>
            <span aria-hidden="true" className="h-4 w-px self-center bg-[#E2E5EC]" />
          </>
        )}
        {TABS.map((tab) => {
          const isActive = tab.key === active
          return (
            <button
              key={tab.key}
              type="button"
              data-id={`${dataId}-${tab.key}`}
              onClick={() => setActive(tab.key)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 pt-2"
            >
              {isActive && (
                <motion.span
                  layoutId={`${dataId}-marker`}
                  className="absolute inset-x-0 top-0 mx-auto h-1 w-9 rounded-b-full"
                  style={{ background: accent.grad }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <NavIcon raw={tab.raw} active={isActive} accent={accent} />
              <motion.span
                className="text-xs leading-none"
                animate={{ fontWeight: isActive ? 600 : 400 }}
                transition={{ duration: 0.25 }}
                style={
                  isActive
                    ? { background: accent.grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
                    : { color: INACTIVE }
                }
              >
                {tab.label}
              </motion.span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
