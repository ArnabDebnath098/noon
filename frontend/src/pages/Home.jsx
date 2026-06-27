import CatalogBody from '../components/CatalogBody'

// Home — combo card style is controlled by the floating tabs (see AppRoutes),
// passed in as `comboAnim`.
export default function Home({ comboAnim = 'type' }) {
  // Stagger each combo card's animation so they don't all change in sync.
  return (
    <CatalogBody comboAnim={comboAnim} comboStagger={800} idPrefix="home" />
  )
}
