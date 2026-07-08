// BottomNav — sticky primary tab bar with a sliding active marker (Framer
// Motion layoutId). Self-contained (internal active state); safe-area aware —
// the bottom strip is left empty for the device's own home indicator.
import { useState } from 'react'
import { motion } from 'framer-motion'
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
}) {
  const [active, setActive] = useState('home')

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
            <motion.span
              data-id={`${dataId}-${tab.key}-marker`}
              layoutId={`${dataId}-marker`}
              className="absolute inset-1 rounded-full bg-[#0F61FF]/[0.12]"
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
            />
          )}
          <span data-id={`${dataId}-${tab.key}-icon`} className="relative">
            <NavIcon raw={tab.raw} active={isActive} dataId={`${dataId}-${tab.key}-glyph`} />
          </span>
        </button>
      )
    }

    return (
      <nav
        data-id={dataId}
        className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center gap-3 px-4"
        style={{ paddingTop: 10, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}
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

        {/* left: floating circle — the selected marketplace, or the first tab */}
        {leading ? (
          <button
            type="button"
            data-id={`${dataId}-leading`}
            aria-label="Switch marketplace"
            onClick={onLeading}
            style={{ background: leadingBg }}
            className="flex h-[62px] w-[62px] shrink-0 items-center justify-center overflow-hidden rounded-full shadow-[0_6px_24px_rgba(16,24,40,0.16)] transition-transform active:scale-95"
          >
            <span data-id={`${dataId}-leading-inner`} className="flex items-center justify-center">
              {leading}
            </span>
          </button>
        ) : (
          <div data-id={`${dataId}-leading-circle`} className="h-[62px] w-[62px] shrink-0 rounded-full bg-white shadow-[0_6px_24px_rgba(16,24,40,0.16)]">
            {navCircle(first, 'h-full w-full')}
          </div>
        )}

        {/* right: the tabs, in a floating pill — each fills an equal share, no
            gap/padding */}
        <div data-id={`${dataId}-pill`} className="flex h-[62px] flex-1 items-center overflow-hidden rounded-full bg-white shadow-[0_6px_24px_rgba(16,24,40,0.16)]">
          {pillTabs.map((tab) => navCircle(tab, 'h-full flex-1'))}
        </div>
      </nav>
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
