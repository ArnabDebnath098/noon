import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
// Raw SVG source so we can inline it and drive its colour with currentColor —
// more reliable on mobile Safari than CSS mask-image with data-URIs.
import homeIcon from '../../assets/icons/nav/home.svg?raw'
import categoryIcon from '../../assets/icons/nav/category.svg?raw'
import dealsIcon from '../../assets/icons/nav/deals.svg?raw'
import profileIcon from '../../assets/icons/nav/profile.svg?raw'
import cartIcon from '../../assets/icons/nav/cart.svg?raw'

const ACTIVE = '#0F61FF'
const INACTIVE = '#5C667E'

const TABS = [
  { key: 'home', label: 'Home', icon: homeIcon, path: '/' },
  { key: 'categories', label: 'Categories', icon: categoryIcon, path: '/categories' },
  { key: 'deals', label: 'Deals', icon: dealsIcon, path: '/deals' },
  { key: 'profile', label: 'Profile', icon: profileIcon, path: '/profile' },
  { key: 'cart', label: 'Cart', icon: cartIcon, path: '/cart' },
]

// Inline the SVG with its fills swapped to currentColor, so the icon colour
// follows the animated text colour (active blue / inactive grey).
function NavIcon({ src, active }) {
  const html = src.replace(/fill="#[0-9a-f]{3,8}"/gi, 'fill="currentColor"')
  return (
    <motion.span
      aria-hidden="true"
      className="block h-7 w-7 [&>svg]:h-full [&>svg]:w-full"
      animate={{ color: active ? ACTIVE : INACTIVE }}
      transition={{ duration: 0.25 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/**
 * BottomNav
 * Sticky primary tab bar (Home, Categories, Deals, Profile, Cart) plus the iOS
 * home indicator. The blue top marker slides to the active tab via Framer
 * Motion's shared-layout animation (layoutId).
 *
 * Active tab + navigation are driven by the current route.
 */
export default function BottomNav({ showDeals = true }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const tabs = showDeals ? TABS : TABS.filter((t) => t.key !== 'deals')

  const active =
    tabs.find((t) => t.path === pathname)?.key ?? 'home'

  const select = (tab) => navigate(tab.path)

  return (
    <nav
      data-id="bottom-nav"
      className="fixed bottom-0 left-1/2 z-30 flex h-[85px] w-full max-w-md -translate-x-1/2 flex-col border-t border-[#F2F3F7] bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Tab row */}
      <div data-id="bottom-nav-tabs" className="relative flex flex-1">
        {tabs.map((tab) => {
          const isActive = tab.key === active
          return (
            <button
              key={tab.key}
              type="button"
              data-id={`bottom-nav-tab-${tab.key}`}
              onClick={() => select(tab)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 pt-2"
            >
              {/* Sliding marker — rendered only in the active tab. */}
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-marker"
                  data-id="bottom-nav-marker"
                  className="absolute inset-x-0 top-0 mx-auto h-1 w-9 rounded-b-full bg-[#0F61FF]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <NavIcon src={tab.icon} active={isActive} />

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

      {/* iOS home indicator */}
      <div
        data-id="bottom-nav-home-indicator"
        className="flex h-[21px] items-center justify-center"
      >
        <span className="h-[5px] w-[134px] rounded-full bg-[#0E0E12]" />
      </div>
    </nav>
  )
}
