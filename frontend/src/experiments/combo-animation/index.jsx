import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Header from '../../components/layout/Header'
import ActionBar from '../../components/layout/ActionBar'
import FloatingTabs from '../../components/layout/FloatingTabs'
import CatalogBody from '../../components/CatalogBody'
import { combos, similar, productDetails } from './data'

// Combo-tag animation styles, shown in the floating switcher.
const COMBO_STYLES = [
  // Gradient-green banner variants
  { value: 'chiptop', label: '1' },
  { value: 'mediatag', label: '2' },
  // Plain white card variant
  { value: 'slide', label: '3' },
  // Stacked list of horizontal combo cards
  { value: 'list', label: '4' },
  // Bento grid card
  { value: 'bento', label: '5' },
]

/**
 * Combo animation experiment — a product details page whose combos rail can be
 * rendered with different combo-tag animation styles via the floating switcher.
 */
export default function ComboAnimationExperiment() {
  const navigate = useNavigate()
  const [comboStyle, setComboStyle] = useState('chiptop')

  return (
    <>
      <AppShell>
        <Header onBack={() => navigate('/')} />

        <main
          data-id="combo-experiment-main"
          className="flex-1 overflow-y-auto overflow-x-clip bg-[#F2F3F7]"
        >
          <CatalogBody
            comboAnim={comboStyle}
            comboStagger={800}
            idPrefix="combo"
            combos={combos}
            similar={similar}
            productDetails={productDetails}
          />
        </main>

        <ActionBar />
      </AppShell>

      {/* Floating style switcher — outside the shell so its fixed position is
          anchored to the viewport. */}
      <FloatingTabs
        dataId="combo-style-tabs"
        tabs={COMBO_STYLES}
        value={comboStyle}
        onChange={setComboStyle}
      />
    </>
  )
}
