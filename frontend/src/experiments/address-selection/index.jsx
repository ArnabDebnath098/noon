import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import BottomNav from '../../components/layout/BottomNav'
// The switcher is the one constant across marketplaces (variation 1); the rest
// of the header is themed per marketplace (MarketHeader + marketplaceViews).
import MarketplaceSwitcher from '../marketplace-switcher/sections/MarketplaceSwitcher'
import PromoBanner from '../marketplace-switcher/sections/PromoBanner'
import CategoryGrid from '../marketplace-switcher/sections/CategoryGrid'
import CombosSection from '../marketplace-switcher/sections/CombosSection'
import MarketHeader from './sections/MarketHeader'
import AddressSheet from './sections/AddressSheet'
import RecentAddressSheet from './sections/RecentAddressSheet'
import HomeSkeleton from './sections/HomeSkeleton'
import { viewFor } from './marketplaceViews'
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
  const view = viewFor(activeId) // per-marketplace theme + header content

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
          {/* Theme background — a pinned, fixed-height layer anchored to the very
              top (covering the status-bar safe area). It crossfades when the
              marketplace changes and does not scroll or collapse with the
              header, so it reads as a fixed, themed backdrop from the top. */}
          <div
            aria-hidden="true"
            data-id="addr-header-theme"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden rounded-b-[12px]"
            style={{ height: 'calc(env(safe-area-inset-top, 47px) + 300px)' }}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={activeId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
                style={{ background: view.theme }}
              />
            </AnimatePresence>
          </div>

          <MarketplaceSwitcher items={marketplaces} activeId={activeId} onChange={switchMarketplace} progress={progress} />
          <MarketHeader
            view={view}
            label={current.type}
            line={current.line}
            revision={override ? 'recent' : addressId}
            closer={Boolean(override)}
            onLocation={() => setSheetOpen(true)}
          />
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
