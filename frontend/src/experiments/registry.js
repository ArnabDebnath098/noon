// Registry of experiments shown on the landing/selection page.
// Add a new experiment here + a route in AppRoutes pointing to its component.
// `icon` maps to an entry in the landing page's icon set; `iconColor`/`iconBg`
// style the circular icon badge on the experiment card.
export const experiments = [
  {
    id: 'combo-animation',
    title: 'Combo card animations',
    description: 'Product page with a combos rail and 7 combo-tag animation styles.',
    path: '/combo-animation',
    icon: 'sparkle',
    iconColor: '#2563EB',
    iconBg: '#E9EFFD',
  },
  {
    id: 'marketplace-switcher',
    title: 'Marketplace switcher',
    description: 'Switch between noon marketplaces, each with its own theme.',
    path: '/marketplace-switcher',
    icon: 'grid',
    iconColor: '#E8930C',
    iconBg: '#FCF1DE',
  },
  {
    id: 'address-selection',
    title: 'Address 2.0 selection',
    description: 'Redesigned bottom-sheet address picker on the marketplace home.',
    path: '/address-selection',
    icon: 'pin',
    iconColor: '#7C3AED',
    iconBg: '#F2ECFC',
  },
  {
    id: 'price-history',
    title: 'Price history',
    description: 'Product page with price-history explorations.',
    path: '/price-history',
    icon: 'chart',
    iconColor: '#0E9F6E',
    iconBg: '#E4F7EF',
  },
  {
    id: 'search',
    title: 'Search — no results',
    description: 'Search landing with the empty "no results" state and Magic List.',
    path: '/search',
    icon: 'search',
    iconColor: '#F91A47',
    iconBg: '#FDE7EC',
  },
]
