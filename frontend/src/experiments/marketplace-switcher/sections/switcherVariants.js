// Switcher variations available in the marketplace experiment, numbered
// consecutively in the floating tab (?v= deep links use these values).
// Hidden: the scroll-morph row (MarketplaceSwitcher), rotary dials (V4/V5) and
// the push-down reveal (V6) — re-add entries to bring them back.
//
// Behaviour flags (so index.jsx never hardcodes variant numbers):
//   ownsHeader  — variant renders its own location + search
//   floatingNav — use the floating bottom nav with the selected marketplace chip
//   navSwitch   — no top switcher; the bottom nav's "All" tab opens the sheet
import MarketplaceSwitcherV2 from './MarketplaceSwitcherV2'
import MarketplaceSwitcherV3 from './MarketplaceSwitcherV3'
import MarketplaceSwitcherV6 from './MarketplaceSwitcherV6'
import MarketplaceSwitcherV7 from './MarketplaceSwitcherV7'
import MarketplaceSwitcherV8 from './MarketplaceSwitcherV8'
import MarketplaceSwitcherV9 from './MarketplaceSwitcherV9'

// Variation 5 — no switcher on top at all: variation 2's floating bottom nav
// (marketplace chip on the left, opens the sheet) is the only switch entry.
const NoSwitcher = () => null

export const switcherVariants = [
  { value: 1, label: '1', Component: MarketplaceSwitcherV3 },
  // the "selected + rail" family (2-4) kept together:
  { value: 2, label: '2', Component: MarketplaceSwitcherV2, ownsHeader: true },
  // variation 2's layout + the scroll-hint shell inside the rail
  { value: 3, label: '3', Component: MarketplaceSwitcherV6, ownsHeader: true },
  // same layout, no scroll-hint: 3 fixed tiles + a sliding carousel 4th tile
  { value: 4, label: '4', Component: MarketplaceSwitcherV9, ownsHeader: true },
  { value: 5, label: '5', Component: NoSwitcher, floatingNav: true },
  { value: 6, label: '6', Component: MarketplaceSwitcherV8 },
  { value: 7, label: '7', Component: MarketplaceSwitcherV7 },
]
