import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Header from '../../components/layout/Header'
import ActionBar from '../../components/layout/ActionBar'
import FloatingTabs from '../../components/layout/FloatingTabs'
import PDPBody from '../combo-animation/PDPBody'
import PriceHistorySheet from './PriceHistorySheet'
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
  priceHistory,
  phoneProduct,
  phonePriceHistory,
} from '../../data/combo'

// Two PDPs share the same price-history sheet — variation 1 is the Bare Anatomy
// shampoo (size/bottle variants), variation 2 is the Pura90s Pro phone (colour
// variants, thousand-dirham scale). The floating switcher toggles the product.
const VARIANTS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
]
const PRODUCTS = {
  1: { product, priceHistory },
  2: { product: phoneProduct, priceHistory: phonePriceHistory },
  // variation 3 — same phone, but the price history renders as a bar chart
  3: { product: phoneProduct, priceHistory: { ...phonePriceHistory, chart: 'bars' } },
}

/**
 * Price history experiment — a full PDP that opens the interactive price-history
 * bottom sheet. Variation 2 swaps in a different product (phone) to prove the
 * sheet adapts to any price scale + variant type.
 */
export default function PriceHistoryExperiment() {
  const navigate = useNavigate()
  const [variant, setVariant] = useState(1)
  const [historyOpen, setHistoryOpen] = useState(false)
  const active = PRODUCTS[variant]

  return (
    <>
      <AppShell>
        <Header onBack={() => navigate('/')} />

        <main
          data-id="price-history-main"
          className="flex-1 overflow-y-auto overflow-x-clip bg-[#F7F8FA]"
        >
          <PDPBody
            key={variant} /* remount so the hero/scroll state resets per product */
            comboAnim="chiptop"
            idPrefix="ph"
            variant={1}
            product={active.product}
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
            onPriceHistory={() => setHistoryOpen(true)}
          />
        </main>

        {/* 16px semibold CTA label (h48 preset is 14px) */}
        <ActionBar addTextClassName="text-[16px] leading-[24px]" />
      </AppShell>

      {/* Product switcher */}
      <FloatingTabs
        dataId="ph-variant-tabs"
        tabs={VARIANTS}
        value={variant}
        onChange={(v) => {
          setHistoryOpen(false)
          setVariant(v)
        }}
      />

      {/* Price history bottom sheet — keyed so it re-inits per product */}
      <PriceHistorySheet
        key={variant}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        image={active.product.images[0]}
        data={active.priceHistory}
      />
    </>
  )
}
