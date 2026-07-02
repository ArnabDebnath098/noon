// Marketplace switcher — VARIATION 4 ("vertical rotary dial").
// Grid tile → flyout with a vertical circular dial (wheel centre off-screen
// right, arc bulges left, scroll up/down). See MarketplaceCircularDial.
import MarketplaceCircularDial from './MarketplaceCircularDial'

export default function MarketplaceSwitcherV4(props) {
  return <MarketplaceCircularDial {...props} orientation="vertical" />
}
