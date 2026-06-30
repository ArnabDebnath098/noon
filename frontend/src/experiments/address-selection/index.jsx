import { useState, useRef, useEffect } from 'react'
import { useMotionValue } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import BottomNav from '../../components/layout/BottomNav'
// Home screen reuses the marketplace-switcher home, locked to variation 1.
import MarketplaceSwitcher from '../marketplace-switcher/sections/MarketplaceSwitcher'
import LocationBar from '../marketplace-switcher/sections/LocationBar'
import SearchBar from '../marketplace-switcher/sections/SearchBar'
import PromoBanner from '../marketplace-switcher/sections/PromoBanner'
import CategoryGrid from '../marketplace-switcher/sections/CategoryGrid'
import CombosSection from '../marketplace-switcher/sections/CombosSection'
import AddressSheet from './sections/AddressSheet'
import RecentAddressSheet from './sections/RecentAddressSheet'
import HomeSkeleton from './sections/HomeSkeleton'
import { marketplaces, categories, addresses, recentMinutesAddress } from './data'

/**
 * Address 2.0 selection experiment. The home screen is the marketplace-switcher
 * home (variation 1 — scroll-collapse row); tapping the location bar opens the
 * address-selection sheet. Switching from minutes → supermall surfaces the
 * "recently used a different address" island.
 */
export default function AddressExperiment() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState('minutes') // minutes is selected by default
  const [sheetOpen, setSheetOpen] = useState(false)
  const [recentOpen, setRecentOpen] = useState(false)
  const [loading, setLoading] = useState(false) // brief skeleton while a marketplace home "loads"
  const [addressId, setAddressId] = useState(addresses[0].id)
  const [override, setOverride] = useState(null) // address chosen from the recent-address island
  const current = override ?? addresses.find((a) => a.id === addressId) ?? addresses[0]

  const timers = useRef([])
  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  // Switching FROM minutes TO supermall: the supermall home "loads" behind a
  // skeleton (3s); the recent-address island slides up after 1s.
  const switchMarketplace = (id) => {
    if (activeId === 'minutes' && id === 'supermall') {
      clearTimers()
      setRecentOpen(false)
      setLoading(true)
      timers.current = [
        setTimeout(() => setRecentOpen(true), 1000),
        setTimeout(() => setLoading(false), 3000),
      ]
    }
    setActiveId(id)
  }

  // 0 = expanded → 1 = collapsed; drives the switcher tile morph (variation 1).
  const progress = useMotionValue(0)
  const COLLAPSE_RANGE = 44

  const onScroll = (e) => {
    const top = e.currentTarget.scrollTop
    progress.set(Math.min(1, Math.max(0, top / COLLAPSE_RANGE)))
  }

  return (
    <AppShell>
      <main
        data-id="addr-main"
        onScroll={onScroll}
        className="scrollbar-hide relative flex-1 overflow-y-auto bg-white"
        style={{ paddingBottom: 'calc(85px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div
          data-id="addr-sticky-header"
          className="sticky top-0 z-20"
          style={{ paddingTop: 'env(safe-area-inset-top, 47px)' }}
        >
          {/* Gradient is a pinned, fixed-height layer anchored to the very top
              (covering the status-bar safe area). It sits behind the controls
              and does NOT scroll or collapse with the header, so it reads as a
              fixed backdrop flowing continuously from the top. */}
          <div
            aria-hidden="true"
            data-id="addr-header-gradient"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 rounded-b-[12px]"
            style={{
              height: 'calc(env(safe-area-inset-top, 47px) + 209px)',
              background:
                'radial-gradient(187.5% 187.5% at 50% -79%, #D4EFF6 10%, #DBE1F9 50%, #EBF3F9 70%, rgba(235,243,249,0) 100%)',
            }}
          />
          <MarketplaceSwitcher items={marketplaces} activeId={activeId} onChange={switchMarketplace} progress={progress} />
          <LocationBar
            label={current.type}
            line={current.line}
            revision={override ? 'recent' : addressId}
            onClick={() => setSheetOpen(true)}
          />
          <SearchBar />
        </div>

        <div data-id="addr-content" className="relative z-10">
          {loading ? (
            <HomeSkeleton />
          ) : (
            <>
              <PromoBanner />
              <CategoryGrid categories={categories} />
              <CombosSection />
            </>
          )}
        </div>
      </main>

      {/* Back to experiments */}
      <div
        className="pointer-events-none fixed left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 justify-end px-4"
        style={{ bottom: 'calc(85px + env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <button
          type="button"
          data-id="addr-back"
          aria-label="Back to experiments"
          onClick={() => navigate('/')}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1D2539] text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:scale-95"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <AddressSheet
        open={sheetOpen}
        addresses={addresses}
        selectedId={addressId}
        onSelect={(id) => {
          setOverride(null)
          setAddressId(id)
          setSheetOpen(false)
        }}
        onClose={() => setSheetOpen(false)}
      />

      <RecentAddressSheet
        open={recentOpen}
        addressLabel={recentMinutesAddress.type}
        addressLine={recentMinutesAddress.line}
        onUse={() => {
          // close first, then swap the address ~250ms later so the user sees
          // the sheet dismiss before the location bar animates to the new one
          setRecentOpen(false)
          timers.current.push(setTimeout(() => setOverride(recentMinutesAddress), 250))
        }}
        onClose={() => setRecentOpen(false)}
      />

      <BottomNav dataId="addr-bottom-nav" />
    </AppShell>
  )
}
