import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import MobileLayout from '../components/layout/MobileLayout.jsx'
import PageTransition from '../components/layout/PageTransition.jsx'
import FloatingTabs from '../components/layout/FloatingTabs.jsx'
import Home from '../pages/Home.jsx'
import Profile from '../pages/Profile.jsx'
import Placeholder from '../pages/Placeholder.jsx'

// Combo card style options shown in the Home floating tabs.
const COMBO_STYLES = [
  // Gradient-green banner variants
  { value: 'chiptop', label: '1' },
  { value: 'mediatag', label: '2' },
  { value: 'static', label: '3' },
  // Plain white card variants
  { value: 'counter', label: '4' },
  { value: 'slide', label: '5' },
  { value: 'reveal', label: '6' },
  // Bento grid card
  { value: 'bento', label: '7' },
]

export default function AppRoutes() {
  const location = useLocation()
  const [comboStyle, setComboStyle] = useState('chiptop')
  const isHome = location.pathname === '/'

  return (
    <>
      <MobileLayout>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={<PageTransition><Home comboAnim={comboStyle} /></PageTransition>}
            />
            <Route
              path="/categories"
              element={<PageTransition><Placeholder title="Categories" /></PageTransition>}
            />
            <Route
              path="/deals"
              element={<PageTransition><Placeholder title="Deals" /></PageTransition>}
            />
            <Route
              path="/profile"
              element={<PageTransition><Profile /></PageTransition>}
            />
            <Route
              path="/cart"
              element={<PageTransition><Placeholder title="Cart" /></PageTransition>}
            />
          </Routes>
        </AnimatePresence>
      </MobileLayout>

      {/* Floating style switcher — Home only, kept outside the page transform. */}
      {isHome && (
        <FloatingTabs
          dataId="home-style-tabs"
          tabs={COMBO_STYLES}
          value={comboStyle}
          onChange={setComboStyle}
        />
      )}
    </>
  )
}
