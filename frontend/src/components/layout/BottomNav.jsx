// BottomNav — sticky primary tab bar with a sliding active marker (Framer
// Motion layoutId) and the iOS home indicator. Self-contained (internal active
// state); safe-area aware.
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

function NavIcon({ raw, active }) {
  const html = raw
    .replace(/fill="#[0-9a-f]{3,8}"/gi, 'fill="currentColor"')
    .replace(/stroke="#[0-9a-f]{3,8}"/gi, 'stroke="currentColor"')
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

export default function BottomNav({ dataId = 'bottom-nav', onAll }) {
  const [active, setActive] = useState('home')

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

      {/* iOS home indicator */}
      <div className="flex h-[21px] items-center justify-center">
        <span className="h-[5px] w-[134px] rounded-full bg-[#0E0E12]" />
      </div>
    </nav>
  )
}
