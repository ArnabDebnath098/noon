import CatalogBody from '../components/CatalogBody'

// Profile — 4th variant: same reveal animation, but each card's combo toggles
// at a different time (staggered by 700ms per card) instead of all in sync.
export default function Profile() {
  return (
    <CatalogBody comboAnim="reveal" comboStagger={700} idPrefix="profile" />
  )
}
