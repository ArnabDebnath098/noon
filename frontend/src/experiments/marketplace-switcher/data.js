// Data for the Marketplace switcher experiment.
import koreanGlassHero from '../../assets/products/korean-glass-hero.png'
import categoryDeals from '../../assets/marketplace/category-deals.png'
import categoryGrocery from '../../assets/marketplace/category-grocery.png'
import categoryMobiles from '../../assets/marketplace/category-mobiles.png'
import categoryLaptops from '../../assets/marketplace/category-laptops.png'
import noonLogo from '../../assets/marketplace/noon.svg'
import superLogo from '../../assets/marketplace/super.svg'
import mallLogo from '../../assets/marketplace/mall.svg'
import foodLogo from '../../assets/marketplace/food.svg'
import nownowLogo from '../../assets/marketplace/nownow.svg'
import sendLogo from '../../assets/marketplace/send.svg'
import minutes15Logo from '../../assets/marketplace/minutes-15.svg'
import minutesWordLogo from '../../assets/marketplace/minutes-word.svg'
import hsHomeLogo from '../../assets/marketplace/hs-home.svg'
import hsServicesLogo from '../../assets/marketplace/hs-services.svg'
import medLogo from '../../assets/marketplace/med.svg'
import superYellowLogo from '../../assets/address/super-yellow.svg'
import mallYellowLogo from '../../assets/address/mall-yellow.svg'
import noonYellowLogo from '../../assets/marketplace/noon-yellow.svg'
import foodWhiteLogo from '../../assets/marketplace/food-white.svg'
import payLogo from '../../assets/marketplace/pay.svg'

const AIRPODS =
  'https://f.nooncdn.com/p/pzsku/Z00A3C6B2FA70477424D8Z/45/_/1773140636/6ad93409-c794-4938-93a1-3f94284436a7.jpg'
const TV =
  'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/_/1771404113/b33985fd-ff43-4915-9da6-8246275b41db.jpg'
const DIAPER =
  'https://f.nooncdn.com/p/pzsku/ZA7F951B633012647419AZ/45/_/1774358924/210d0574-b918-4fb4-a27d-ebec06bf4cf8.jpg'

// Marketplace switcher tiles (logos approximated with brand colours + labels).
// bg is white by default; `accent` is the brand colour used to fill the tile
// when it is selected (content turns white on selection).
export const marketplaces = [
  { id: 'noon', label: 'noon', logo: noonLogo, logoW: 56, logoWSmall: 47, collapseScale: 0.82, fg: '#1B282C', accent: '#FEEE00', lightAccent: true },
  // selected: dark-blue fill with pre-coloured yellow wordmarks (activeLogoStack)
  { id: 'supermall', label: 'super\nmall', pill: 'supermall', logoStack: [superLogo, mallLogo], activeLogoStack: [superYellowLogo, mallYellowLogo], rowMorph: true, fg: '#4659D9', accent: '#1F20B7' },
  // selected: pink fill, "noon" recolours to yellow and "FOOD" to white
  // (activeFadeStack — pre-coloured, so no white-invert)
  { id: 'food', label: 'noon\nFOOD', pill: 'FOOD', fadeStack: [noonLogo, foodLogo], activeFadeStack: [noonYellowLogo, foodWhiteLogo], fadeW: 50, fadeH: 13, keepW: 46, fg: '#E5004E', accent: '#E01858' },
  // selected: noon-yellow fill, logo keeps its own colours (lightAccent skips
  // the white-invert, which would reduce the 15/MINUTES marks to white blobs)
  { id: 'minutes', label: '15', sub: 'MINUTES', pill: 'MINUTES', fadeStack: [minutes15Logo, minutesWordLogo], fadeW: 50, fadeH: 36, keepW: 52, fg: '#E5293E', accent: '#FEEE00', lightAccent: true },
  // selected: orange fill, logo keeps its own colours (lightAccent skips the invert)
  { id: 'nownow', label: 'now\nnow', pill: 'now now', logo: nownowLogo, logoH: 46, logoHSmall: 26, fg: '#1B1B1B', accent: '#F33A01', lightAccent: true, isNew: true },
  // default: purple "pay" logo on white; selected: #542BDC fill, logo inverts to white
  { id: 'pay', label: 'noon\npay', pill: 'pay', logo: payLogo, logoW: 40, fg: '#542BDC', accent: '#542BDC' },
  { id: 'home', label: 'home\nservices', pill: 'home', fadeStack: [hsHomeLogo, hsServicesLogo], fadeW: 39, fadeH: 12, keepW: 58, fadeMatchH: true, mono: true, fg: '#1B282C', accent: '#FEEE00', lightAccent: true },
  // isNew → tiles show a "NEW" pill on their bottom edge (see NewBadge)
  { id: 'send', label: 'noon\nsend', pill: 'send', fadeStack: [noonLogo, sendLogo], fadeW: 50, fadeH: 13, keepW: 46, fg: '#1F20B7', accent: '#1F20B7', isNew: true },
  { id: 'out', label: 'noon\nout', pill: 'out', fg: '#FF6A00', accent: '#FF6A00', isNew: true },
  // same stacked style as noon FOOD: noon wordmark over the med logo
  { id: 'med', label: 'noon\nmed', pill: 'med', fadeStack: [noonLogo, medLogo], fadeW: 50, fadeH: 13, keepW: 46, fg: '#237B6A', accent: '#237B6A' },
  { id: 'global', label: 'noon\nglobal', pill: 'global', fg: '#231F20', accent: '#231F20' },
]

export const address = {
  label: 'Home',
  line: 'BDA Complex, 100 Feet Rd 3rd Block, Kora...',
}

// "Best picks for you" — similar-style product cards (see ProductCard).
export const bestPicks = [
  {
    id: 'iphone17',
    title: 'Apple iPhone 17 Pro 256 GB (eSIM)',
    image: AIRPODS,
    rating: '4.5',
    ratingCount: '27.1K',
    price: '4,399',
    originalPrice: '4,699',
    discount: '6%',
    delivery: 'Free Delivery',
    bestSeller: true,
  },
  {
    id: 'shampoo',
    title: 'BARE ANATOMY Anti Hair Fall Shampoo',
    image: koreanGlassHero,
    rating: '5',
    ratingCount: '2',
    price: '106',
    originalPrice: '145',
    discount: '26%',
  },
  {
    id: 'iphone16max',
    title: 'Apple iPhone 16 Pro Max 256 GB',
    image: TV,
    rating: '4.6',
    ratingCount: '35K',
    price: '4,199',
    originalPrice: '5,099',
    nudge: 'Selling out fast',
    bestSeller: true,
  },
]

// "Extra 10% off mobiles | Use code: SAVEBIG" — deal rail.
export const mobileDeals = [
  {
    id: 'galaxy-1',
    title: 'Samsung Galaxy S25 Ultra AI Dual SIM',
    image: TV,
    rating: '4.5',
    ratingCount: '16.4K',
    price: '2,799',
    originalPrice: '5,099',
    discount: '45%',
    nudge: 'Lowest price in 30 days',
    bestSeller: true,
    express: true,
  },
  {
    id: 'galaxy-2',
    title: 'Samsung Galaxy S25 Ultra AI Dual SIM',
    image: TV,
    rating: '4.5',
    ratingCount: '16.4K',
    price: '2,799',
    originalPrice: '5,099',
    discount: '45%',
    nudge: 'Lowest price in 30 days',
    bestSeller: true,
  },
  {
    id: 'iphone-max2',
    title: 'Apple iPhone 16 Pro Max 256 GB',
    image: TV,
    rating: '4.5',
    ratingCount: '27.1K',
    price: '4,949',
    nudge: 'Selling out fast',
    bestSeller: true,
  },
]

// "Shop by category" rail. `cover: true` = full-bleed artwork with its own
// background (fills the tile); otherwise a plain product shot on the tile bg.
export const categories = [
  { id: 'deals', name: 'Deals', image: categoryDeals, cover: true },
  { id: 'grocery', name: 'Grocery', image: categoryGrocery, cover: true },
  { id: 'mobiles', name: 'Mobiles', image: categoryMobiles, cover: true },
  { id: 'laptops', name: 'Laptops & Desktops', image: categoryLaptops, cover: true },
  { id: 'beauty', name: 'Beauty & Skin Care', image: koreanGlassHero },
  { id: 'fresh', name: 'Fresh & Frozen', image: DIAPER },
]
