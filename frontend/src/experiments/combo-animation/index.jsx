import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Header from '../../components/layout/Header'
import ActionBar from '../../components/layout/ActionBar'
import FloatingTabs from '../../components/layout/FloatingTabs'
import PDPBody from './PDPBody'
import {
  combos,
  similar,
  productDetails,
  product,
  topProducts,
  paymentOffers,
  deliveryInfo,
  seller,
  reviewSummary,
  bundle,
  plp,
} from '../../data/combo'

// Two PDP variations — they differ only in the "Bundle & save" entry row style.
const VARIANTS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
]

/**
 * Combo animation experiment — the full Bare Anatomy PDP. The floating switcher
 * toggles between two variations of the combo-bundle entry row (variation 2
 * uses the gradient "Bundle & save" card).
 */
export default function ComboAnimationExperiment() {
  const navigate = useNavigate()
  const [variant, setVariant] = useState(1)

  return (
    <>
      <AppShell>
        <Header onBack={() => navigate('/')} />

        <main
          data-id="combo-experiment-main"
          className="flex-1 overflow-y-auto overflow-x-clip bg-[#F7F8FA]"
        >
          <PDPBody
            comboAnim="chiptop"
            comboStagger={800}
            idPrefix="combo"
            variant={variant}
            product={product}
            combos={combos}
            similar={similar}
            topProducts={topProducts}
            productDetails={productDetails}
            paymentOffers={paymentOffers}
            deliveryInfo={deliveryInfo}
            seller={seller}
            reviewSummary={reviewSummary}
            bundle={bundle}
            plp={plp}
          />
        </main>

        <ActionBar />
      </AppShell>

      {/* Floating variation switcher (1 / 2) */}
      <FloatingTabs
        dataId="combo-variant-tabs"
        tabs={VARIANTS}
        value={variant}
        onChange={setVariant}
      />
    </>
  )
}
