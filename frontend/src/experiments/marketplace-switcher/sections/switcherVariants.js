// Switcher variations available in the marketplace experiment. The floating tab
// switches between them. Add variant 3 here when we build it.
import MarketplaceSwitcher from './MarketplaceSwitcher'
import MarketplaceSwitcherV2 from './MarketplaceSwitcherV2'
import MarketplaceSwitcherV3 from './MarketplaceSwitcherV3'

export const switcherVariants = [
  { value: 1, label: '1', Component: MarketplaceSwitcher },
  { value: 2, label: '2', Component: MarketplaceSwitcherV2 },
  { value: 3, label: '3', Component: MarketplaceSwitcherV3 },
]
