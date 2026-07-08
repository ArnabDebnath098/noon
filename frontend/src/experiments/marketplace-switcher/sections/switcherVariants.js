// Switcher variations available in the marketplace experiment, numbered
// consecutively in the floating tab (?v= deep links use these values).
// The scroll-morph row (MarketplaceSwitcher) and the rotary dials (V4/V5)
// are currently hidden; re-add entries to bring them back.
import MarketplaceSwitcherV2 from './MarketplaceSwitcherV2'
import MarketplaceSwitcherV3 from './MarketplaceSwitcherV3'
import MarketplaceSwitcherV6 from './MarketplaceSwitcherV6'
import MarketplaceSwitcherV7 from './MarketplaceSwitcherV7'

export const switcherVariants = [
  { value: 1, label: '1', Component: MarketplaceSwitcherV3 },
  { value: 2, label: '2', Component: MarketplaceSwitcherV2 },
  { value: 3, label: '3', Component: MarketplaceSwitcherV6 },
  { value: 4, label: '4', Component: MarketplaceSwitcherV7 },
]
