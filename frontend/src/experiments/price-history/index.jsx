import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Header from '../../components/layout/Header'
import ActionBar from '../../components/layout/ActionBar'
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
} from '../../data/combo'

/**
 * Price history experiment — the full Bare Anatomy PDP (shared with the
 * combo-animation experiment), as the base for price-history explorations
 * (price trend charts, lowest-price nudges, drop alerts).
 */
export default function PriceHistoryExperiment() {
  const navigate = useNavigate()
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <AppShell>
      <Header onBack={() => navigate('/')} />

      <main
        data-id="price-history-main"
        className="flex-1 overflow-y-auto overflow-x-clip bg-[#F7F8FA]"
      >
        <PDPBody
          comboAnim="chiptop"
          idPrefix="ph"
          variant={1}
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
          onPriceHistory={() => setHistoryOpen(true)}
        />
      </main>

      {/* 16px semibold CTA label (h48 preset is 14px) */}
      <ActionBar addTextClassName="text-[16px] leading-[24px]" />

      {/* Price history bottom sheet */}
      <PriceHistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        image={product.images[0]}
        data={priceHistory}
      />
    </AppShell>
  )
}
