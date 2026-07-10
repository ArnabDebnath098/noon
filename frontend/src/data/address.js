// Data for the Address 2.0 selection experiment. The home screen reuses the
// marketplace-switcher home (variation 1), so we borrow its marketplaces +
// categories and add the saved-address list the selection sheet works over.
import { marketplaces as baseMarketplaces, categories } from './marketplace'
import superYellow from '../assets/address/super-yellow.svg'
import mallYellow from '../assets/address/mall-yellow.svg'

export { categories }

// Address-experiment tile overrides:
//  • minutes  → selecting it fills yellow like noon and keeps its logo
//    (lightAccent skips the white-invert), not the red used in marketplace.
//  • supermall → selected fill is #2122B8 with the wordmark in yellow
//    (activeLogoStack swaps to pre-coloured yellow logos when selected).
export const marketplaces = baseMarketplaces.map((m) => {
  if (m.id === 'minutes') return { ...m, accent: '#FEEE00', lightAccent: true }
  if (m.id === 'supermall') return { ...m, accent: '#2122B8', activeLogoStack: [superYellow, mallYellow] }
  return m
})

// icon: 'home' | 'work' | 'other' — maps to an inline glyph in AddressSheet.
export const addresses = [
  {
    id: 'home',
    type: 'Home',
    icon: 'home',
    line: 'BDA Complex, 100 Feet Rd 3rd Block, Koramangala',
    city: 'Bengaluru, Karnataka 560034',
  },
  {
    id: 'work',
    type: 'Work',
    icon: 'work',
    line: 'WeWork Galaxy, 43 Residency Road',
    city: 'Bengaluru, Karnataka 560025',
  },
  {
    id: 'parents',
    type: "Parents' home",
    icon: 'other',
    line: 'Plot 12, Jubilee Hills Road No. 10',
    city: 'Hyderabad, Telangana 500033',
  },
]

// The address last used in the "minutes" marketplace — surfaced when the user
// switches from minutes to supermall (see RecentAddressSheet). Labelled
// "Office" so switching to it visibly changes the location bar (Home → Office).
export const recentMinutesAddress = {
  type: 'Office',
  line: 'Al Barsha Residential Area, Villa 12, Near Al Barsha Pond Park, Dubai, United Arab Emirates',
}
