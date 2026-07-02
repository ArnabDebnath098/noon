// Marketplace switcher — VARIATION 5 ("horizontal rotary dial").
// Grid tile → flyout with a horizontal circular dial (wheel centre off-screen
// below, arc bulges up, scroll left↔right). See MarketplaceCircularDial.
import MarketplaceCircularDial from './MarketplaceCircularDial'

export default function MarketplaceSwitcherV5(props) {
  return <MarketplaceCircularDial {...props} orientation="horizontal" />
}
