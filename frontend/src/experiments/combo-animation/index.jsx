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
  paymentOffer,
  deliveryInfo,
  seller,
  reviewSummary,
  bundle,
  plp,
} from './data'

// Two PDP variations — they differ only in the "Bundle & save" entry row style.
const VARIANTS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
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
          className="flex-1 overflow-y-auto overflow-x-clip bg-[#F2F3F7]"
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
            paymentOffer={paymentOffer}
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
