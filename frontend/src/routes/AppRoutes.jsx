import { Routes, Route, Navigate } from 'react-router-dom'
import ExperimentsLanding from '../pages/ExperimentsLanding.jsx'
import ComboAnimationExperiment from '../experiments/combo-animation/index.jsx'
import MarketplaceExperiment from '../experiments/marketplace-switcher/index.jsx'
import AddressExperiment from '../experiments/address-selection/index.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ExperimentsLanding />} />
      <Route path="/combo-animation" element={<ComboAnimationExperiment />} />
      <Route
        path="/marketplace-switcher"
        element={<MarketplaceExperiment />}
      />
      <Route path="/address-selection" element={<AddressExperiment />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
