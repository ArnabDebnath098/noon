// BottomNav — sticky primary tab bar with a sliding active marker (Framer
// Motion layoutId). Self-contained (internal active state); safe-area aware —
// the bottom strip is left empty for the device's own home indicator.
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import { springs } from '../../utils/motion'
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
            transition={{ duration: 0.25 }}
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
            as drop-shadow (a box-shadow would be clipped away). */}
        {leading ? (
          <button
            type="button"
            data-id={`${dataId}-leading`}
            aria-label="Switch marketplace"
            onClick={leadingExpand ? () => setNavOpen(true) : onLeading}
            style={{ filter: 'drop-shadow(0 6px 24px rgba(16,24,40,0.16))' }}
            className="relative h-[62px] w-[62px] shrink-0 transition-transform active:scale-95"
          >
            <Squircle
              as="span"
              cornerRadius={18}
              cornerSmoothing={1}
              style={{ background: leadingBg }}
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
            >
              <span data-id={`${dataId}-leading-inner`} className="flex items-center justify-center">
                {leading}
              </span>
            </Squircle>
          </button>
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
            tab is a square; the rest split the remaining width equally. */}
        <div
          data-id={`${dataId}-pill-shadow`}
          className="min-w-0 flex-1"
          style={{ filter: 'drop-shadow(0 6px 24px rgba(16,24,40,0.16))' }}
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
        </div>

        {/* leading expansion — a squircle panel that morphs out of the chip's
            box (same left/bottom anchor) showing every marketplace icon */}
        {leadingExpand && (
          <motion.div
            data-id={`${dataId}-leading-panel`}
            initial={false}
            animate={
              navOpen
                ? { width: panelW, height: panelH, opacity: 1 }
                : { width: CHIP, height: CHIP, opacity: 0 }
            }
            transition={{ ...springs.snappy, opacity: { duration: navOpen ? 0.1 : 0.2, delay: navOpen ? 0 : 0.12 } }}
            style={{
              position: 'absolute',
              left: 16,
              bottom: 'env(safe-area-inset-bottom, 0px)',
              zIndex: 20,
              pointerEvents: navOpen ? 'auto' : 'none',
              // no drop-shadow: re-rasterising a blur every frame of the size
              // morph janks mobile Safari; the dim backdrop separates instead
            }}
          >
            <Squircle
              as="div"
              data-id={`${dataId}-leading-panel-surface`}
              cornerRadius={navOpen ? 24 : 18}
              cornerSmoothing={1}
              className="absolute inset-0 overflow-hidden bg-white"
            >
              <motion.div
                data-id={`${dataId}-leading-panel-grid`}
                initial={false}
                animate={navOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.22, delay: navOpen ? 0.12 : 0 }}
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${EX_COLS}, ${exTile}px)`,
                  gap: EX_GAP,
                  padding: EX_PAD,
                }}
              >
                {leadingExpand.items.map((m) => {
                  const isSel = m.id === leadingExpand.activeId
                  return (
                    <button
                      key={m.id}
                      type="button"
                      data-id={`${dataId}-leading-panel-${m.id}`}
                      onClick={() => pickItem(m.id)}
                      className="relative transition-transform active:scale-95"
                      style={{ width: exTile, height: exTile }}
                    >
                      <Squircle
                        as="span"
                        cornerRadius={Math.round(exTile * 0.26)}
                        cornerSmoothing={1}
                        style={{ background: isSel ? m.accent : m.bg ?? '#F4F6FA' }}
                        className="absolute inset-0 flex items-center justify-center overflow-hidden"
                      >
                        {leadingExpand.renderIcon(m, isSel, exTile)}
                      </Squircle>
                    </button>
                  )
                })}
              </motion.div>
            </Squircle>
          </motion.div>
        )}
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
