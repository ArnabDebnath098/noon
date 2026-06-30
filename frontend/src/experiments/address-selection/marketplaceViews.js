// Per-marketplace "home view". Each marketplace themes the header differently —
// background, delivery promise, location format, an optional banner, and the
// search bar. The marketplace switcher is the ONLY thing constant across them,
// so switching marketplaces animates everything else (see MarketHeader).
//
//  theme   : background painted behind the header (fades out at the bottom)
//  onTheme : primary text colour on that theme
//  muted   : secondary text colour
//  delivery: { mins, minsClose, unit, bolt } numeric — the time reel rolls from
//            `mins` (default address) down to `minsClose` (a nearer address);
//            or { text, bolt } for a non-numeric promise (e.g. "Express delivery")
//  sep     : separator between the address label and line ("-" or ",")
//  banner  : { text, action } | null — the contextual notice strip
//  search  : { placeholder, trailing: 'camera' | 'magic' }

export const DEFAULT_VIEW = {
  theme: 'radial-gradient(187.5% 187.5% at 50% -79%, #D4EFF6 10%, #DBE1F9 50%, #EBF3F9 70%, rgba(235,243,249,0) 100%)',
  onTheme: '#1B282C',
  muted: '#343D54',
  delivery: { text: 'Express delivery', bolt: '#0F61FF' },
  sep: '-',
  banner: null,
  search: { placeholder: 'Search noon', trailing: 'camera' },
}

const VIEWS = {
  noon: DEFAULT_VIEW,

  supermall: {
    theme: 'linear-gradient(180deg, #F3962F 0%, #ED8A28 48%, rgba(237,138,40,0) 100%)',
    onTheme: '#1B282C',
    muted: 'rgba(27,40,44,0.6)',
    delivery: { mins: 54, minsClose: 38, unit: 'Mins Delivery', bolt: '#1B282C' },
    sep: '-',
    banner: { text: 'You seem far away from this location.', action: 'Change' },
    search: { placeholder: 'What are you looking for?', trailing: 'camera' },
  },

  food: {
    theme: 'linear-gradient(180deg, #FBD7E2 0%, #FDEAF0 50%, rgba(253,234,240,0) 100%)',
    onTheme: '#1B282C',
    muted: '#8A5160',
    delivery: { mins: 30, minsClose: 21, unit: 'Mins Delivery', bolt: '#E5004E' },
    sep: '-',
    banner: null,
    search: { placeholder: 'Search restaurants & dishes', trailing: 'camera' },
  },

  minutes: {
    theme: 'linear-gradient(180deg, #BBE0F4 0%, #DCEFFA 48%, rgba(232,245,252,0) 100%)',
    onTheme: '#0E1726',
    muted: '#5C667E',
    delivery: { mins: 8, minsClose: 5, unit: 'minutes delivery', bolt: '#E5293E' },
    sep: ',',
    banner: null,
    wishlist: false, // minutes has no wishlist heart
    search: { placeholder: 'Search "desserts"', trailing: 'magic' },
  },
}

export const viewFor = (id) => VIEWS[id] ?? DEFAULT_VIEW
