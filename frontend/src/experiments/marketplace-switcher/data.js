// Data for the Marketplace switcher experiment.
import koreanGlassHero from '../../assets/products/korean-glass-hero.png'
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
  { id: 'noon', label: 'noon', logo: noonLogo, logoW: 56, logoWSmall: 47, collapseScale: 0.82, bg: '#FFFFFF', fg: '#1B282C', accent: '#FEEE00', lightAccent: true },
  { id: 'supermall', label: 'super\nmall', pill: 'supermall', logoStack: [superLogo, mallLogo], rowMorph: true, bg: '#FFFFFF', fg: '#4659D9', accent: '#4659D9' },
  { id: 'food', label: 'noon\nFOOD', pill: 'FOOD', fadeStack: [noonLogo, foodLogo], fadeW: 50, fadeH: 13, keepW: 46, bg: '#FFFFFF', fg: '#E5004E', accent: '#E5004E' },
  { id: 'minutes', label: '15', sub: 'MINUTES', pill: 'MINUTES', fadeStack: [minutes15Logo, minutesWordLogo], fadeW: 50, fadeH: 36, keepW: 52, bg: '#FFFFFF', fg: '#E5293E', accent: '#E5293E' },
  { id: 'nownow', label: 'now\nnow', pill: 'now now', logo: nownowLogo, logoH: 46, logoHSmall: 26, bg: '#FFFFFF', fg: '#1B1B1B', accent: '#1B1B1B' },
  { id: 'pay', label: 'noon\npay', pill: 'pay', bg: '#FFFFFF', fg: '#5523DD', accent: '#5523DD' },
  { id: 'home', label: 'home\nservices', pill: 'home', fadeStack: [hsHomeLogo, hsServicesLogo], fadeW: 39, fadeH: 12, keepW: 58, fadeMatchH: true, mono: true, bg: '#FFFFFF', fg: '#1B282C', accent: '#FEEE00', lightAccent: true },
  { id: 'send', label: 'noon\nsend', pill: 'send', fadeStack: [noonLogo, sendLogo], fadeW: 50, fadeH: 13, keepW: 46, bg: '#FFFFFF', fg: '#1F20B7', accent: '#1F20B7' },
  { id: 'out', label: 'noon\nout', pill: 'out', bg: '#FFFFFF', fg: '#FF6A00', accent: '#FF6A00' },
  { id: 'med', label: 'noon\nmed', pill: 'med', bg: '#FFFFFF', fg: '#00A98F', accent: '#00A98F' },
  { id: 'global', label: 'noon\nglobal', pill: 'global', bg: '#FFFFFF', fg: '#231F20', accent: '#231F20' },
]

export const address = {
  label: 'Home',
  line: 'BDA Complex, 100 Feet Rd 3rd Block, Kora...',
}

// "Shop by category" grid.
export const categories = [
  { id: 'beauty', name: 'Beauty & Skin Care', image: koreanGlassHero },
  { id: 'grocery', name: 'Grocery & Kitchen', image: DIAPER },
  { id: 'home', name: 'Home Appliances', image: TV },
  { id: 'toys', name: 'Toys & Games', image: AIRPODS },
  { id: 'electronics', name: 'Electronics & Tools', image: AIRPODS },
  { id: 'hair', name: 'Hair Care', image: koreanGlassHero },
  { id: 'shoes', name: 'Shoes & Clothes', image: DIAPER },
  { id: 'grocery2', name: 'Fresh & Frozen', image: TV },
]
