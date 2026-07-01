// Registry of experiments shown on the landing/selection page.
// Add a new experiment here + a route in AppRoutes pointing to its component.
export const experiments = [
  {
    id: 'combo-animation',
    title: 'Combo card animations',
    description:
      'Product page with a combos rail — switch between 7 combo-tag animation styles.',
    path: '/combo-animation',
    accent: '#0F61FF',
  },
  {
    id: 'marketplace-switcher',
    title: 'Marketplace switcher',
    description:
      'Switch between noon marketplaces — each with its own theme and products.',
    path: '/marketplace-switcher',
    accent: '#15806A',
  },
  {
    id: 'address-selection',
    title: 'Address 2.0 selection',
    description:
      'Pick your delivery address from a redesigned bottom-sheet — on the marketplace home.',
    path: '/address-selection',
    accent: '#0F61FF',
  },
  {
    id: 'marketplace-switcher-intro',
    title: 'Marketplace switcher intro',
    description:
      'A different take on the switcher, led by an animated intro screen. (WIP — empty screens.)',
    path: '/marketplace-switcher-intro',
    accent: '#7C3AED',
  },
]
