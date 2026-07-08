import { useEffect, useState } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { easings } from '../../utils/motion'
import AppShell from '../../components/layout/AppShell'
import HomeSkeleton from './sections/HomeSkeleton'
import MarketplaceSheet from './sections/MarketplaceSheet'
import LocationBar from './sections/LocationBar'
import SearchBar from './sections/SearchBar'
import PromoBanner from './sections/PromoBanner'
import CategoryGrid from './sections/CategoryGrid'
import CombosSection from './sections/CombosSection'
import { switcherVariants } from './sections/switcherVariants'
import BottomNav from '../../components/layout/BottomNav'
import FloatingTabs from '../../components/layout/FloatingTabs'
import { marketplaces, address, categories } from './data'

/**
 * Marketplace switcher experiment — a noon-style home. The switcher is sticky
 * and collapses to a compact pill row as the content (mp-content) scrolls up.
 */
export default function MarketplaceExperiment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // marketplace selection is per-variant so trying one variation never
  // carries its selection into another
  const [selections, setSelections] = useState({})
  const [collapsed, setCollapsed] = useState(false)
  // variant is deep-linkable: /marketplace-switcher?v=4
  const [variant, setVariant] = useState(() => {
    const v = Number(searchParams.get('v'))
    return switcherVariants.some((s) => s.value === v) ? v : switcherVariants[0].value
  })
  const ActiveSwitcher =
    switcherVariants.find((v) => v.value === variant)?.Component ?? switcherVariants[0].Component
  const activeId = selections[variant] ?? marketplaces[0].id
  // switching marketplace shows a skeleton while the new home "loads"
  const [loading, setLoading] = useState(false)
  const setActiveId = (id) => {
    if (id === activeId) return
    setSelections((s) => ({ ...s, [variant]: id }))
    setLoading(true)
  }
  useEffect(() => {
    if (!loading) return undefined
    const t = setTimeout(() => setLoading(false), 750)
    return () => clearTimeout(t)
  }, [loading, activeId])

  // variant 7 has no top switcher — the bottom nav's "All" tab opens the
  // marketplaces sheet, and the location bar leads with the selected chip
  const isNavVariant = variant === 7
  const [allOpen, setAllOpen] = useState(false)
  const activeMarketplace = marketplaces.find((m) => m.id === activeId)
  const selectFromSheet = (id) => {
    setActiveId(id)
    setTimeout(() => setAllOpen(false), 180)
  }
  // 0 = fully expanded, 1 = fully collapsed; drives the tile size morph.
  const progress = useMotionValue(0)
  const COLLAPSE_RANGE = 44 // px of scroll over which the switcher collapses

  const onScroll = (e) => {
    const top = e.currentTarget.scrollTop
    progress.set(Math.min(1, Math.max(0, top / COLLAPSE_RANGE)))
    setCollapsed((c) => (c ? top > 16 : top > 28)) // content-swap threshold (hysteresis)
  }

  return (
    <AppShell>
      <main
        data-id="marketplace-main"
        onScroll={onScroll}
        className="scrollbar-hide relative flex-1 overflow-y-auto bg-white"
        style={{
          paddingBottom: 'calc(85px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Sticky header — switcher + location + search pin together and the
            switcher collapses to a pill row as the body scrolls up. The gradient
            is painted on the header itself so it stays pinned (instead of
            scrolling away) when the header collapses. */}
        <div
          data-id="mp-sticky-header"
          className="sticky top-0 z-20 rounded-b-[12px] transition-shadow"
          style={{
            paddingTop: 'env(safe-area-inset-top, 47px)',
            background:
              'radial-gradient(187.5% 187.5% at 50% -79%, #D4EFF6 10%, #DBE1F9 50%, #EBF3F9 70%, rgba(128,213,234,0) 100%), #FFFFFF',
            backgroundSize: '100% 256px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top',
            boxShadow: collapsed ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          <ActiveSwitcher
            items={marketplaces}
            activeId={activeId}
            onChange={setActiveId}
            progress={progress}
          />
          <LocationBar
            label={address.label}
            line={address.line}
            marketplace={isNavVariant ? activeMarketplace : undefined}
          />
          <SearchBar />
        </div>

        {/* Scrollable body — skeleton while the selected marketplace "loads",
            then the content fades in */}
        <div data-id="mp-content" className="relative z-10">
          {loading ? (
            <HomeSkeleton />
          ) : (
            <motion.div
              key={`home-${activeId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: easings.ios }}
            >
              <PromoBanner />
              <CategoryGrid categories={categories} />
              <CombosSection />
            </motion.div>
          )}
        </div>
      </main>

      {/* Floating back-to-experiments button (above the bottom nav) */}
      <div
        className="pointer-events-none fixed left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 justify-end px-4"
        style={{
          bottom: 'calc(85px + env(safe-area-inset-bottom, 0px) + 16px)',
        }}
      >
        <button
          type="button"
          data-id="mp-back"
          aria-label="Back to experiments"
          onClick={() => navigate('/')}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1D2539] text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:scale-95"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Floating variation switcher (1 / 2 …) */}
      <FloatingTabs
        dataId="mp-variant-tabs"
        tabs={switcherVariants}
        value={variant}
        onChange={setVariant}
        accent="#15806A"
        offset="calc(85px + env(safe-area-inset-bottom, 0px) + 16px)"
      />

      <BottomNav dataId="mp-bottom-nav" onAll={isNavVariant ? () => setAllOpen(true) : undefined} />

      {isNavVariant && (
        <MarketplaceSheet
          open={allOpen}
          onClose={() => setAllOpen(false)}
          items={marketplaces}
          activeId={activeId}
          onSelect={selectFromSheet}
        />
      )}
    </AppShell>
  )
}
