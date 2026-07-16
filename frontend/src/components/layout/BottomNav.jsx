// BottomNav — sticky primary tab bar with a sliding active marker (Framer
// Motion layoutId). Self-contained (internal active state); safe-area aware —
// the bottom strip is left empty for the device's own home indicator.
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import { curvedPath, easings } from '../../utils/motion'

// leading-panel icon choreography — same App-Library flight as the
// marketplace folder grid, but directional: icons POP out with a lively
// spring (slight overshoot, cascading from the chip) and pour back in fast
// and decisively (no bounce, tighter reverse stagger) so the close never
// feels like a slow rewind.
const EX_CONTAINER = {
  open: { transition: { staggerChildren: 0.025, delayChildren: 0.05 } },
  closed: { transition: { staggerChildren: 0.016, staggerDirection: -1 } },
}
const EX_FLIGHT = {
  open: {
    offsetDistance: '100%',
    scale: 1,
    opacity: 1,
    transition: {
      offsetDistance: { type: 'spring', duration: 0.55, bounce: 0.22 },
      scale: { type: 'spring', duration: 0.55, bounce: 0.22 },
      opacity: { duration: 0.16 },
    },
  },
  closed: {
    offsetDistance: '0%',
    scale: 0.25,
    opacity: 0,
    transition: {
      offsetDistance: { type: 'spring', duration: 0.34, bounce: 0 },
      scale: { type: 'spring', duration: 0.34, bounce: 0 },
      opacity: { duration: 0.14, delay: 0.1 },
    },
  },
}
// surface + chip morph — soft overshoot opening, pure decisive settle closing
// (size changes never bounce on the way out)
const EX_SURFACE_OPEN = { type: 'spring', duration: 0.5, bounce: 0.14 }
const EX_SURFACE_CLOSE = { type: 'spring', duration: 0.4, bounce: 0 }
import homeIcon from '../../assets/icons/nav/home.svg?raw'
import categoryIcon from '../../assets/icons/nav/category.svg?raw'
import dealsIcon from '../../assets/icons/nav/deals.svg?raw'
import cartIcon from '../../assets/icons/nav/cart.svg?raw'
import profileIcon from '../../assets/icons/nav/profile.svg?raw'
import allIcon from '../../assets/icons/nav/all.svg?raw'

const ACTIVE = '#0F61FF'
const INACTIVE = '#5C667E'

const TABS = [
  { key: 'home', label: 'Home', raw: homeIcon },
  { key: 'categories', label: 'Categories', raw: categoryIcon },
  { key: 'offers', label: 'Offers', raw: dealsIcon },
  { key: 'cart', label: 'Cart', raw: cartIcon },
  { key: 'account', label: 'Account', raw: profileIcon },
]

function NavIcon({ raw, active, dataId }) {
  const html = raw
    .replace(/fill="#[0-9a-f]{3,8}"/gi, 'fill="currentColor"')
    .replace(/stroke="#[0-9a-f]{3,8}"/gi, 'stroke="currentColor"')
  return (
    <motion.span
      data-id={dataId}
      aria-hidden="true"
      className="block h-7 w-7 [&>svg]:h-full [&>svg]:w-full"
      animate={{ color: active ? ACTIVE : INACTIVE }}
      transition={{ duration: 0.25 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default function BottomNav({
  dataId = 'bottom-nav',
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
  // the nav is always w-full max-w-md, so its width is min(viewport, 448) —
  // measured from the window (a ref-based measure goes stale when the docked
  // branch mounts first without the floating nav element)
  const [navW, setNavW] = useState(() =>
    Math.min(typeof window !== 'undefined' ? window.innerWidth : 448, 448),
  )
  useEffect(() => {
    const onResize = () => setNavW(Math.min(window.innerWidth, 448))
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
              className="absolute inset-0 m-auto aspect-square h-[calc(100%-8px)] bg-[#0F61FF]/[0.12]"
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
            />
          )}
          <span data-id={`${dataId}-${tab.key}-icon`} className="relative">
            <NavIcon raw={tab.raw} active={isActive} dataId={`${dataId}-${tab.key}-glyph`} />
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
    const exRows = Math.ceil((leadingExpand?.items.length ?? 0) / EX_COLS)
    const panelH = exRows * exTile + (exRows - 1) * EX_GAP + 2 * EX_PAD
    const pickItem = (id) => {
      leadingExpand.onSelect(id)
      setNavOpen(false)
    }
    // flight geometry (panel coordinates): the chip itself becomes the
    // bottom-left grid tile, so it stays INSIDE the expanding surface; the
    // OTHER marketplaces fly between the chip's centre and their cell centres,
    // staggered nearest-travel-first so the cascade radiates from the chip
    const chipCenter = { x: CHIP / 2, y: panelH - CHIP / 2 }
    const cellCenter = (slot) => ({
      x: EX_PAD + exTile / 2 + (slot % EX_COLS) * (exTile + EX_GAP),
      y: EX_PAD + exTile / 2 + Math.floor(slot / EX_COLS) * (exTile + EX_GAP),
    })
    const chipSlot = (exRows - 1) * EX_COLS // bottom-left cell
    const flightItems = (leadingExpand?.items ?? []).filter(
      (m) => m.id !== leadingExpand?.activeId,
    )
    const exOrder = flightItems
      .map((m, k) => ({ m, slot: k >= chipSlot ? k + 1 : k }))
      .sort(
        (a, b) =>
          Math.hypot(cellCenter(a.slot).x - chipCenter.x, cellCenter(a.slot).y - chipCenter.y) -
          Math.hypot(cellCenter(b.slot).x - chipCenter.x, cellCenter(b.slot).y - chipCenter.y),
      )

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
        data-id={dataId}
        className={`fixed bottom-0 left-1/2 ${navOpen ? 'z-50' : 'z-30'} flex w-full max-w-md -translate-x-1/2 items-center gap-3 px-4`}
        style={{ paddingTop: 10, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
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
                  className="absolute inset-0 overflow-hidden bg-white"
                />
              </motion.div>
            )}

            {/* the other marketplaces — fixed open-size overlay so the flight
                geometry stays stable while the surface morphs beneath */}
            {leadingExpand && (
              <motion.div
                data-id={`${dataId}-leading-panel-grid`}
                variants={EX_CONTAINER}
                initial={false}
                animate={navOpen ? 'open' : 'closed'}
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: panelW,
                  height: panelH,
                  pointerEvents: navOpen ? 'auto' : 'none',
                }}
              >
                {exOrder.map(({ m, slot }) => (
                  <motion.button
                    key={m.id}
                    type="button"
                    data-id={`${dataId}-leading-panel-${m.id}`}
                    variants={EX_FLIGHT}
                    onClick={() => pickItem(m.id)}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: exTile,
                      height: exTile,
                      offsetPath: curvedPath(chipCenter, cellCenter(slot)),
                      offsetRotate: '0deg',
                      offsetAnchor: '50% 50%',
                    }}
                    className="relative"
                  >
                    <Squircle
                      as="span"
                      cornerRadius={Math.round(exTile * 0.26)}
                      cornerSmoothing={1}
                      style={{ background: m.bg ?? '#F4F6FA' }}
                      className="absolute inset-0 flex items-center justify-center overflow-hidden"
                    >
                      {leadingExpand.renderIcon(m, false, exTile)}
                    </Squircle>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* the chip — morphs from the corner chip into its grid slot */}
            <motion.button
              type="button"
              data-id={`${dataId}-leading`}
              aria-label={navOpen ? 'Close marketplaces' : 'Switch marketplace'}
              onClick={leadingExpand ? () => setNavOpen((o) => !o) : onLeading}
              initial={false}
              animate={
                navOpen && leadingExpand
                  ? { left: EX_PAD, bottom: EX_PAD, width: exTile, height: exTile }
                  : { left: 0, bottom: 0, width: CHIP, height: CHIP }
              }
              transition={navOpen ? EX_SURFACE_OPEN : EX_SURFACE_CLOSE}
              whileTap={{ scale: 0.94 }}
              style={{
                position: 'absolute',
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
      className="fixed bottom-0 left-1/2 z-30 flex h-[85px] w-full max-w-md -translate-x-1/2 flex-col border-t border-[#F2F3F7] bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="relative flex flex-1">
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
                  className="absolute inset-x-0 top-0 mx-auto h-1 w-9 rounded-b-full bg-[#0F61FF]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <NavIcon raw={tab.raw} active={isActive} />
              <motion.span
                className="text-xs leading-none"
                animate={{
                  color: isActive ? ACTIVE : INACTIVE,
                  fontWeight: isActive ? 600 : 400,
                }}
                transition={{ duration: 0.25 }}
              >
                {tab.label}
              </motion.span>
            </button>
          )
        })}
      </div>

      {/* bottom strip stays empty — the device draws its own home indicator */}
      <div className="h-[21px]" />
    </nav>
  )
}
