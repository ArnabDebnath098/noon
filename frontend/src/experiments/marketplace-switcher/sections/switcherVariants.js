// Switcher variations available in the marketplace experiment. The floating tab
// switches between them.
import MarketplaceSwitcher from './MarketplaceSwitcher'
import MarketplaceSwitcherV2 from './MarketplaceSwitcherV2'
import MarketplaceSwitcherV3 from './MarketplaceSwitcherV3'
import MarketplaceSwitcherV4 from './MarketplaceSwitcherV4'
import MarketplaceSwitcherV5 from './MarketplaceSwitcherV5'
import MarketplaceSwitcherV6 from './MarketplaceSwitcherV6'

export const switcherVariants = [
  { value: 1, label: '1', Component: MarketplaceSwitcherV3 },
  { value: 2, label: '2', Component: MarketplaceSwitcherV2 },
  { value: 3, label: '3', Component: MarketplaceSwitcher },
  { value: 4, label: '4', Component: MarketplaceSwitcherV4 },
  { value: 5, label: '5', Component: MarketplaceSwitcherV5 },
  { value: 6, label: '6', Component: MarketplaceSwitcherV6 },
]
