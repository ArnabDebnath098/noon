import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ExperimentsLanding from '../pages/ExperimentsLanding.jsx'

// Experiments are lazy-loaded — each becomes its own chunk, so the landing
// page loads instantly and an experiment's code is only fetched on navigation.
const ComboAnimationExperiment = lazy(() => import('../experiments/combo-animation/index.jsx'))
const MarketplaceExperiment = lazy(() => import('../experiments/marketplace-switcher/index.jsx'))
const PriceHistoryExperiment = lazy(() => import('../experiments/price-history/index.jsx'))
const SearchExperiment = lazy(() => import('../experiments/search/index.jsx'))
const CartExperiment = lazy(() => import('../experiments/cart/index.jsx'))

// Minimal route fallback — matches the app background so the swap is invisible.
function RouteFallback() {
  return <div className="min-h-dvh w-full bg-[#F7F8FA]" aria-busy="true" />
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<ExperimentsLanding />} />
        <Route path="/combo-animation" element={<ComboAnimationExperiment />} />
        <Route path="/marketplace-switcher" element={<MarketplaceExperiment />} />
        <Route path="/price-history" element={<PriceHistoryExperiment />} />
        <Route path="/search" element={<SearchExperiment />} />
        <Route path="/cart" element={<CartExperiment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
