// Shared product data scraped from noon.com (uae-en) product pages.
// Consumed by the Home and Categories routes.
import koreanGlassHero from '../assets/products/korean-glass-hero.png'
import bareAnatomyShampoo from '../assets/products/bare-anatomy-shampoo.png'
import bundleShampooConditioner from '../assets/products/bundle-shampoo-conditioner.png'
import bundleShampooRicewater from '../assets/products/bundle-shampoo-ricewater.png'
import comboThumbConditioner from '../assets/products/combo-thumb-conditioner.png'
import comboThumbShampoo from '../assets/products/combo-thumb-shampoo.png'
import redmiWatch5Active from '../assets/products/redmi-watch-5-active.png'
import iphone17ProMaxOrange from '../assets/products/iphone-17-pro-max-orange.png'

// Per-combo product thumbnails (for the variation-4 horizontal row card).
const COMBO_THUMBS = [
  { image: comboThumbConditioner, qty: 1 },
  { image: comboThumbShampoo, qty: 1 },
]
const COMBO_THUMBS_3 = [
  { image: comboThumbConditioner, qty: 1 },
  { image: comboThumbShampoo, qty: 1 },
  { image: comboThumbShampoo, qty: 1 },
]
// 7-product combo — the row-card thumbs rail scrolls when they overflow
const COMBO_THUMBS_7 = [
  { image: comboThumbConditioner, qty: 1 },
  { image: comboThumbShampoo, qty: 1 },
  { image: comboThumbConditioner, qty: 2 },
  { image: comboThumbShampoo, qty: 1 },
  { image: comboThumbConditioner, qty: 1 },
  { image: comboThumbShampoo, qty: 2 },
  { image: comboThumbConditioner, qty: 1 },
]

// Main product for the full PDP — Bare Anatomy Expert Anti-Dandruff Shampoo.
// The hero image already carries the "Salicylic Acid & Biotin" key-visual text,
// so no separate `highlight` overlay is used.
export const product = {
  store: 'BARE ANATOMY',
  title:
    'Expert Anti-Dandruff Shampoo, Salicylic Acid & Biotin, Targets Oily Scalp and Sheds Dry Flakes, 250ml',
  images: [bareAnatomyShampoo],
  rating: '4.6',
  ratingCount: '34244',
  price: '34.99',
  originalPrice: '68',
  discountPercent: '50%',
  vat: '(incl. of VAT)',
  bestPriceWithOffers: '699',
  lowestPrice: 'Lowest Price in 30 days',
  bestsellerRankTop: { rank: '#3', category: 'Hair Care' },
  bestsellerRankBottom: { rank: '#1', category: 'Hair Care' },
}

// "Buy together and save" bundle sheet (opened from the Bundle row).
export const bundle = {
  savings: '20', // "upto AED20"
  off: '80', // variation-3 showcase: "upto AED80 off"
  viewAll: 6, // "View all 6 combos" tile at the end of the rail
  benefits: ['Pay less than buying separately', 'Curated for convenience'],
  items: [
    {
      id: 'bundle-1',
      image: bundleShampooConditioner,
      thumbs: COMBO_THUMBS,
      productCount: '2 Products',
      title: 'BARE ANATOMY Anti-Dandruff Shampoo + Conditioner Duo',
      price: '59.99',
      comparePrice: '79.99',
      coupon: 'AED20 cheaper with combo',
    },
    {
      id: 'bundle-2',
      image: bundleShampooRicewater,
      thumbs: COMBO_THUMBS_3,
      productCount: '3 Products',
      title: 'BARE ANATOMY Expert Shampoo + Hair Growth Serum',
      price: '74.99',
      comparePrice: '86.99',
      coupon: 'AED12 cheaper with combo',
      express: true,
    },
    {
      id: 'bundle-3',
      image: bundleShampooRicewater,
      thumbs: COMBO_THUMBS_7,
      productCount: '7 Products',
      title: 'BARE ANATOMY Complete Hair Care Combo Pack',
      price: '89.99',
      comparePrice: '104.99',
      coupon: 'AED15 cheaper with combo',
    },
  ],
}

// Price history (price-history experiment bottom sheet). Each range is a
// series of price points plus `labels` — period markers spread equally along
// the x-axis (days for 1 Month, months otherwise; the last reads "Today").
// Prices track the shampoo PDP (now 34.99).
export const priceHistory = {
  subtitle: ['BARE ANATOMY', 'Shampoo', '250ml'],
  stats: { lowest: '29.99', highest: '68', today: '34.99' },
  // quantity variants for the "better deal" accordion (shampoo → sizes, not
  // colors; `current` marks the size being viewed). Nothing selected by default.
  // how a variant is called for THIS product (shampoo → bottle; a phone would
  // use 'color') — drives all the deal-row / insight wording
  variantNoun: 'bottle',
  // `image` feeds the sheet-header swap when a size is selected
  variants: [
    { id: '200ml', label: '200ml', ml: 200, price: 29.99, image: comboThumbShampoo },
    { id: '250ml', label: '250ml', ml: 250, price: 34.99, image: bareAnatomyShampoo, current: true },
    { id: '400ml', label: '400ml', ml: 400, price: 49.99, image: comboThumbConditioner },
  ],
  ranges: {
    // The trend note (higher/lower vs the period average) is computed from the
    // points at render time, so it always matches the chart.
    '1m': {
      label: '1 M',
      days: 30, // span — scrub labels interpolate dates across it
      labels: ['Jun 15', 'Jun 22', 'Jun 29', 'Jul 6', 'Today'],
      // daily prices — real listings hold a price for days, then step on a
      // sale/repricing, so the 1M view reads as discrete plateaus and drops
      points: [
        33.99, 33.99, 33.99, 33.99, 33.99,
        32.99, 32.99, 32.99, 32.99,
        34.99, 34.99, 34.99, 34.99, 34.99,
        31.99, 31.99, 31.99,
        29.99, 29.99, 29.99, 29.99,
        33.49, 33.49, 33.49, 33.49,
        34.99, 34.99, 34.99, 34.99, 34.99,
      ],
    },
    '3m': {
      label: '3 M',
      days: 90,
      labels: ['Apr', 'May', 'Jun', 'Today'],
      // ~5-day repricing cadence: high spring plateaus, a flash-sale dip to the
      // all-time low, then settling at today's price
      points: [
        42.99, 42.99, 42.99, 39.99, 39.99, 39.99, 41.99, 41.99,
        37.99, 37.99, 37.99, 34.99, 34.99, 34.99, 29.99, 29.99,
        34.99, 34.99,
      ],
    },
    '1y': {
      label: '1 Y',
      days: 365,
      labels: ['Jul', 'Oct', 'Jan', 'Apr', 'Jul', 'Today'],
      // ~10-day cadence over the year: launch-era pricing, a November sale, a
      // festive-season hike to the all-time high (68, matches the Highest
      // stat), then markdowns to a June mega-sale low and today's price
      points: [
        49.99, 49.99, 49.99, 54.99, 54.99, 54.99, 47.99, 47.99, 47.99,
        39.99, 39.99, 34.99, 34.99, 44.99, 44.99, 59.99, 59.99, 68, 68,
        61.99, 61.99, 49.99, 49.99, 42.99, 42.99, 36.99, 36.99,
        29.99, 29.99, 32.99, 32.99, 34.99, 34.99, 34.99,
      ],
    },
  },
}

// ---- price-history variation 1: Redmi Watch 5 Active PDP -----------------
export const watchProduct = {
  store: 'XIAOMI',
  title:
    'Redmi Watch 5 Active - Budget-Friendly Smartwatch with 2" LCD Display, Fitness Tracking And 18 Days Battery Life Midnight Black',
  images: [redmiWatch5Active],
  rating: '4.4',
  ratingCount: '6987',
  price: '129.99',
  originalPrice: '149.00',
  discountPercent: '13%',
  vat: '(incl. of VAT)',
  bestPriceWithOffers: '124',
  lowestPrice: 'Lowest Price in 30 days',
  bestsellerRankTop: { rank: '#1', category: 'Smartwatches' },
  bestsellerRankBottom: { rank: '#1', category: 'Smartwatches' },
}

// ---- price-history variation 1: an UPWARD price story --------------------
// Same underlying series as the iPhone (variation 2) but time-REVERSED — so a
// year of decline reads as a year of climbing — then scaled into the watch's
// realistic ~100–130 AED band. Net result: the price RISES across every window
// (1M, 3M, 1Y), ending at today's 130 all-time high. The real daily ASP wobble
// is preserved, so the curve still looks organic rather than hand-drawn.
export const watchPriceHistory = {
  subtitle: ['XIAOMI', 'Redmi Watch 5 Active', 'Midnight Black'],
  stats: { lowest: '100', highest: '130', today: '130' },
  mrp: 149, // list price (matches watchProduct.originalPrice) — for the banner
  // smooth spline (dense daily series) + fixed export date for scrub markers
  curve: 'natural',
  asOf: '2026-07-20',
  variantNoun: 'color',
  // colorways — Black is today's PDP price (130, the current peak), Silver a
  // touch cheaper; selecting one rescales the whole series proportionally
  variants: [
    { id: 'black', label: 'Midnight Black', price: 130, image: redmiWatch5Active, current: true },
    { id: 'silver', label: 'Matte Silver', price: 125.99, image: redmiWatch5Active },
  ],
  ranges: {
    '1m': {
      label: '1 M',
      days: 30, // 20 Jun → 20 Jul 2026
      labels: ['Jun 20', 'Jun 28', 'Jul 5', 'Jul 13', 'Today'],
      barCount: 31,
      // the recent leg of the climb — rises from ~108 to today's 130 high
      points: [
        108.22, 108.2, 107.78, 107.78, 108.98, 110, 121.11, 112, 121.11, 121.11,
        119.91, 113.2, 111.02, 110.02, 113.64, 119.78, 120, 121.11, 122.13, 121.69,
        122.04, 122.22, 120.36, 122.22, 123.11, 125.56, 127.78, 124.58, 127.71, 127.78,
        130,
      ],
    },
    '3m': {
      label: '3 M',
      days: 91, // 20 Apr → 20 Jul 2026
      labels: ['Apr', 'May', 'Jun', 'Today'],
      barCount: 3,
      // holds a ~103 floor through spring, then lifts steadily to 130 → net UP
      points: [
        106.67, 106.67, 106.67, 103.33, 104.44, 103.33, 103.33, 103.33, 104.44, 103.33,
        103.33, 103.33, 103.33, 103.33, 103.33, 103.33, 103.33, 103.33, 103.33, 103.33,
        103.33, 103.33, 103.33, 103.33, 103.33, 101.11, 101.11, 101.11, 101.11, 101.11,
        101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11,
        101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 102.29, 103.33, 103.33, 103.33,
        103.33, 103.33, 105.56, 107.78, 107.78, 105.56, 105.56, 105.62, 107.78, 107.78,
        106.73, 108.22, 108.2, 107.78, 107.78, 108.98, 110, 121.11, 112, 121.11,
        121.11, 119.91, 113.2, 111.02, 110.02, 113.64, 119.78, 120, 121.11, 122.13,
        121.69, 122.04, 122.22, 120.36, 122.22, 123.11, 125.56, 127.78, 124.58, 127.71,
        127.78, 130,
      ],
    },
    '1y': {
      label: '1 Y',
      days: 365,
      labels: ['Jul', 'Oct', 'Jan', 'Apr', 'Jul', 'Today'],
      barCount: 12,
      // full year — climbs off the ~100 low a year ago, through a long ~107
      // mid-band, then accelerates over the final months to today's 130 high
      points: [
        102.22, 102.22, 102.22, 102.22, 102.22, 104.44, 104.44, 104.44, 104.44, 104.44,
        104.44, 104.44, 104.44, 104.44, 104.44, 104.44, 104.44, 104.44, 104.44, 100,
        100, 100, 100, 100, 100, 100, 100, 100, 100, 104.44,
        104.44, 104.44, 104.44, 104.44, 104.44, 104.44, 100, 100, 100, 100,
        104.44, 104.44, 104.44, 104.44, 104.44, 104.44, 104.44, 104.44, 104.44, 107.78,
        107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.87, 107.87, 107.78,
        107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 108.22, 107.78, 108.67, 107.78,
        107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78,
        107.87, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78,
        107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.69, 107.69, 107.84, 108.67,
        108.89, 108.89, 108.89, 108.8, 108.89, 108.89, 108.8, 108.8, 108.89, 108.89,
        108.67, 108.44, 108.89, 108.8, 108.89, 108.89, 108.8, 108.89, 111.11, 111.11,
        111.24, 111.24, 111.24, 111.24, 113.38, 111.11, 111.11, 111.11, 111.11, 111.11,
        110, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78, 107.78,
        107.78, 107.78, 107.78, 106.67, 106.67, 106.67, 107.78, 107.78, 107.78, 106.67,
        106.58, 107.78, 106.58, 106.58, 106.58, 106.58, 106.58, 106.58, 106.58, 106.58,
        106.58, 107.78, 106.76, 106.58, 106.58, 106.58, 106.58, 106.58, 106.58, 106.58,
        106.67, 106.67, 106.67, 106.67, 106.67, 106.67, 106.67, 106.67, 106.67, 106.67,
        106.67, 106.67, 106.67, 106.67, 106.67, 106.67, 106.67, 103.33, 104.44, 103.33,
        103.33, 103.33, 104.44, 103.33, 103.33, 103.33, 103.33, 103.33, 103.33, 103.33,
        103.33, 103.33, 103.33, 103.33, 103.33, 103.33, 103.33, 103.33, 103.33, 101.11,
        101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11,
        101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11, 101.11,
        102.29, 103.33, 103.33, 103.33, 103.33, 103.33, 105.56, 107.78, 107.78, 105.56,
        105.56, 105.62, 107.78, 107.78, 106.73, 108.22, 108.2, 107.78, 107.78, 108.98,
        110, 121.11, 112, 121.11, 121.11, 119.91, 113.2, 111.02, 110.02, 113.64,
        119.78, 120, 121.11, 122.13, 121.69, 122.04, 122.22, 120.36, 122.22, 123.11,
        125.56, 127.78, 124.58, 127.71, 127.78, 130,
      ],
    },
  },
}

// ---- price-history variation 2: a phone PDP (iPhone 17 Pro Max) ----------
const PHONE_IMAGE = iphone17ProMaxOrange

export const phoneProduct = {
  store: 'Apple',
  title:
    'iPhone 17 Pro Max 256 GB (eSIM only) Cosmic Orange 5G With FaceTime - International Version',
  images: [PHONE_IMAGE],
  rating: '4.5',
  ratingCount: '27948',
  price: '4709',
  originalPrice: '5099',
  discountPercent: '7%',
  vat: '(incl. of VAT)',
  bestPriceWithOffers: '4549',
  lowestPrice: 'Lowest price in a year',
  bestsellerRankTop: { rank: '#2', category: 'Smartphones' },
  bestsellerRankBottom: { rank: '#2', category: 'Smartphones' },
}

// Phone price history — colour variants (Black / Orange / Pink / White; not
// sizes); prices in the thousands so the nice-tick y-axis and the whole sheet
// exercise a very different scale from the shampoo.
export const phonePriceHistory = {
  subtitle: ['Apple', 'iPhone 17 Pro Max', 'Cosmic Orange'],
  mrp: 5099, // list price (matches phoneProduct.originalPrice) — for the banner
  stats: { lowest: '4749', highest: '6099', today: '4849' }, // real offer-price series
  // the phone's data is a smooth climb-peak-decline trend, so the line renders
  // as a spline (default is the plateau-style stepAfter staircase)
  curve: 'natural',
  // key specs the "similar products" below are matched on
  specs: ['256GB', 'eSIM', '5G'],
  // Similar phones with the same headline features but a lower price — shown as
  // the "better value" action when this phone is priced above its usual level.
  similar: [
    {
      id: 'honor-magic7',
      title: 'HONOR Magic7 Lite 5G Dual SIM 12GB RAM 256GB - Titanium Black',
      image: PHONE_IMAGE,
      price: 2699,
      comparePrice: 3199,
      rating: '4.4',
      express: true,
    },
    {
      id: 'samsung-a56',
      title: 'Samsung Galaxy A56 5G Dual SIM 12GB RAM 256GB - Awesome Graphite',
      image: PHONE_IMAGE,
      price: 2499,
      comparePrice: 2999,
      rating: '4.5',
      express: true,
    },
    {
      id: 'xiaomi-14t',
      title: 'Xiaomi 14T 5G Dual SIM 12GB RAM 256GB - Titan Black',
      image: PHONE_IMAGE,
      price: 2849,
      comparePrice: 3299,
      rating: '4.3',
    },
  ],
  ranges: {
    // A coherent nested story across the three windows (same "today" = 3199):
    //   • 1Y  — net INCREASE: launched cheaper (2999) → climbed to the 3599
    //           peak ~4 months ago → declined since.
    //   • 3M  — net DROP: that post-peak decline, from ~3399 down to a trough,
    //           with a recovery in the final weeks.
    //   • 1M  — net INCREASE: the recent rebound, rising to today.
    '1m': {
      label: '1 M',
      days: 30, // 20 Jun → 20 Jul 2026
      asOf: '2026-07-20',
      labels: ['Jun 20', 'Jun 28', 'Jul 5', 'Jul 13', 'Today'],
      barCount: 31, // bar chart (v3): one bar per day
      // REAL offer prices, 20 Jun → 20 Jul 2026: dips to the 4,749 low mid-month,
      // recovers to 4,949, then eases to 4,849 today → broadly flat, slight dip.
      points: [
        4949, 4949, 4749, 4749, 4749, 4749, 4749, 4749, 4749, 4749,
        4749, 4749, 4949, 4949, 4949, 4949, 4949, 4949, 4949, 4949,
        4949, 4949, 4949, 4949, 4949, 4949, 4849, 4849, 4849, 4849,
        4849,
      ],
    },
    '3m': {
      label: '3 M',
      days: 91, // 20 Apr → 20 Jul 2026
      asOf: '2026-07-20',
      labels: ['Apr', 'May', 'Jun', 'Today'],
      barCount: 3, // bar chart (v3): one bar per month
      // REAL offer prices, 20 Apr → 20 Jul 2026: holds the ~5,099 spring plateau,
      // then eases through the June 4,749 dips down to 4,849 today → net DROP.
      points: [
        5099, 5099, 5099, 5099, 5099, 5099, 5099, 5099, 5099, 5099,
        5099, 5103, 5099, 5099, 5099, 5099, 5099, 5099, 5099, 5099,
        5099, 5099, 5099, 5139, 5099, 5119, 5099, 5099, 5099, 5099,
        5099, 5099, 5099, 5103, 5103, 5099, 5099, 5099, 5099, 5099,
        5099, 5099, 5099, 4949, 4949, 4949, 4949, 4949, 4949, 4949,
        4949, 4949, 4749, 4749, 4749, 4749, 4949, 4949, 4949, 4949,
        4949, 4949, 4949, 4749, 4749, 4749, 4749, 4749, 4749, 4749,
        4749, 4749, 4749, 4949, 4949, 4949, 4949, 4949, 4949, 4949,
        4949, 4949, 4949, 4949, 4949, 4949, 4949, 4849, 4849, 4849,
        4849, 4849,
      ],
    },
    '1y': {
      label: '1 Y',
      days: 301, // 22 Sep 2025 → 20 Jul 2026 (the real export window)
      asOf: '2026-07-20', // series ends on the dataset's last date, not "today"
      labels: ['Sep', 'Nov', 'Jan', 'Mar', 'May', 'Today'],
      barCount: 12, // bar chart (v3): one bar per month
      // REAL daily offer prices (N70211464V-1, AE), 22 Sep 2025 → 20 Jul 2026:
      // opens near the 6,099 high, slides through White Friday to the 4,799
      // winter plateau, drifts back up to ~5,100 in spring, then eases to the
      // 4,749 summer low and sits at 4,849 today → net DOWN over the year.
      points: [
        6099, 5999, 5996, 5855, 5999, 5899, 5789, 5749, 5665, 5749,
        5741, 5725, 5745, 5699, 5649, 5639, 5363, 5200, 5245, 5343,
        5645, 5699, 5699, 5289, 5699, 5199, 5153, 5099, 5099, 5118,
        5119, 5052, 5099, 5099, 5002, 4999, 4999, 5099, 5099, 4999,
        4899, 4899, 4899, 4899, 4899, 4852, 4799, 4799, 4799, 4799,
        4799, 4799, 4799, 4799, 4799, 4799, 4799, 4799, 4799, 4799,
        4799, 4799, 4799, 4799, 4799, 4799, 4799, 4899, 4899, 4899,
        4899, 4899, 4899, 4899, 4899, 4899, 4899, 4899, 4899, 4899,
        4899, 4899, 4899, 4949, 4899, 4899, 4899, 4949, 4899, 5049,
        5049, 5049, 5049, 5049, 5049, 5049, 5049, 5049, 5049, 5049,
        5049, 5049, 5049, 5049, 5049, 5049, 5045, 5045, 5045, 5045,
        5045, 5045, 5045, 5053, 5099, 5045, 5045, 5045, 5045, 5045,
        5045, 5045, 5045, 5045, 5099, 5045, 5049, 5099, 5099, 5099,
        5049, 5049, 5049, 5099, 5099, 5099, 5099, 5099, 5099, 5099,
        5099, 5099, 5099, 5099, 5099, 5199, 5249, 5249, 5249, 5249,
        5249, 5351, 5255, 5255, 5255, 5255, 5249, 5249, 5149, 5145,
        5149, 5149, 5145, 5149, 5129, 5139, 5149, 5149, 5145, 5145,
        5149, 5149, 5145, 5149, 5149, 5149, 5139, 5102, 5095, 5095,
        5099, 5099, 5099, 5099, 5099, 5099, 5099, 5099, 5099, 5099,
        5099, 5099, 5099, 5099, 5099, 5103, 5099, 5099, 5099, 5099,
        5099, 5099, 5099, 5099, 5099, 5099, 5099, 5139, 5099, 5119,
        5099, 5099, 5099, 5099, 5099, 5099, 5099, 5103, 5103, 5099,
        5099, 5099, 5099, 5099, 5099, 5099, 5099, 4949, 4949, 4949,
        4949, 4949, 4949, 4949, 4949, 4949, 4749, 4749, 4749, 4749,
        4949, 4949, 4949, 4949, 4949, 4949, 4949, 4749, 4749, 4749,
        4749, 4749, 4749, 4749, 4749, 4749, 4749, 4949, 4949, 4949,
        4949, 4949, 4949, 4949, 4949, 4949, 4949, 4949, 4949, 4949,
        4949, 4849, 4849, 4849, 4849, 4849,
      ],
    },
  },
}

// Payment offers — a 2-card carousel of cashback / BNPL offers.
export const paymentOffers = [
  {
    id: 'enbd',
    icon: 'enbd',
    title: 'Get extra 5% cashback',
    titleRest: 'using',
    subtitle: 'ENBD noon VISA credit card',
    cta: 'Apply Now',
  },
  {
    id: 'tabby',
    icon: 'tabby',
    title: 'Get extra 5% cashback',
    subtitle: 'on using ENBD noon VISA credit card',
  },
]

// Delivery information card.
export const deliveryInfo = {
  member: 'one member',
  express: 'Get it Tomorrow before 12 PM',
}

// Seller widget.
export const seller = {
  name: 'ONESTO LABS FZ-LLC',
  rating: '4.3',
  ratingCount: '128',
  positive: '74% Positive Seller Ratings',
  tags: [
    'Low Return Seller',
    'Great Recent Ratings',
    'Partner Since 5+ Years',
    'Item as Described 100%',
  ],
  subtitle: 'This is a placeholder for brands to place subtitle',
  otherOffers: { count: '5', from: '649' },
}

// noon-AI review summary.
export const reviewSummary = {
  rating: '4.8',
  reviewCount: '64',
  bullets: [
    'The portrait mode includes a fantastic wide-angle',
    'Users appreciate the overall performance of phone.',
    'Enjoy the wide-angle capability while using portrait a fantastic wide-angle',
    'Users appreciate the overall performance of this phone.',
  ],
}

// "Product Details" accordion rows — Bare Anatomy Expert Anti-Dandruff Shampoo.
export const productDetails = [
  {
    id: 'overview',
    title: 'Overview',
    content:
      'Bare Anatomy Expert Anti-Dandruff Shampoo is clinically proven to deliver up to 100% dandruff reduction. Powered by Salicylic Acid and Biotin in a sulphate-free base, it targets an oily scalp, sheds dry flakes and strengthens hair from the roots — gentle enough for everyday use on all hair types.',
  },
  {
    id: 'highlights',
    title: 'Highlights',
    content:
      'Up to 100% dandruff reduction. Salicylic Acid (BHA) exfoliates dead skin and unclogs scalp pores; Piroctone Olamine fights dandruff at the source; Biotin strengthens hair and supports a healthier scalp barrier. Sulphate-free, non-drying formula suitable for all hair types.',
  },
  {
    id: 'specifications',
    title: 'Specifications',
    content:
      'Brand: Bare Anatomy Expert · Size: 250 ml (8.45 fl oz) · Form: Shampoo · Key actives: Salicylic Acid, Piroctone Olamine, Biotin · Concern: Dandruff, oily scalp, dry flakes · Suitable for: All hair types.',
  },
]

export const combos = [
  {
    id: 'korean-glass',
    title: 'SKIN1004 Korean Glass Skin Routine',
    productCount: '2 products',
    images: [
      // Hero: shared SKIN1004 tray image.
      koreanGlassHero,
      'https://f.nooncdn.com/p/pzsku/ZE235423724D80411872FZ/45/1763105113/121a0854-bfcd-4696-b0b5-79a9c4205389.jpg',
      'https://f.nooncdn.com/p/pzsku/ZE235423724D80411872FZ/45/1763105113/3b200dfd-2380-4b33-9e89-e92eb2b4ba3e.jpg',
      'https://f.nooncdn.com/p/pzsku/ZE235423724D80411872FZ/45/1763105113/6109f2f6-a48e-4e1d-b1d7-1a1c7f7cf220.jpg',
      'https://f.nooncdn.com/p/pzsku/ZE235423724D80411872FZ/45/1763105113/d12f4ac4-aba8-446b-8923-22ab314332ba.jpg',
      'https://f.nooncdn.com/p/pzsku/ZE235423724D80411872FZ/45/1763105113/f9f7b2b2-a7f7-4591-b21e-7466895f17f6.jpg',
    ],
    price: '181',
    originalPrice: '444.44',
    discount: '59% OFF',
    badge: 'Save AED 263 extra',
    delivery: { label: 'Get in', time: '42 Min' },
  },
  {
    id: 'youli-diapers',
    title: 'Youli Baby Diapers Size 4 (9-14 kg), 126 Pack',
    productCount: '3 products',
    images: [
      // Hero: gift-bow pack shot (126 diapers) — set as first slide.
      'https://f.nooncdn.com/p/pzsku/ZA7F951B633012647419AZ/45/_/1774358924/210d0574-b918-4fb4-a27d-ebec06bf4cf8.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA7F951B633012647419AZ/45/_/1774358924/06faf927-4ab1-4bc0-a72e-a99a6bdd81a3.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA7F951B633012647419AZ/45/_/1774358924/196c0d71-69f0-4737-a031-b0d679319e2f.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA7F951B633012647419AZ/45/_/1774358924/53e71c31-ab2c-42e8-b739-8bb07977b29a.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA7F951B633012647419AZ/45/_/1774358924/ad813087-4299-45d7-98f2-156faf29290f.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA7F951B633012647419AZ/45/_/1774358924/cf5c82f0-ee93-424b-8b1c-22bd877f0fe2.jpg',
    ],
    price: '90',
    originalPrice: '297',
    discount: '69% OFF',
    badge: 'Save AED 207 extra',
  },
  {
    id: 'molto-tv-bundle',
    title: 'Impex 50" Full HD QLED Smart TV + Bluetooth Speaker',
    productCount: '5 products',
    images: [
      // Hero: TV + speaker "BUNDLE OFFER" key visual — set as first slide.
      'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/_/1771404113/b33985fd-ff43-4915-9da6-8246275b41db.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/1764050741/06876790-8d4b-4e17-8656-860b6cb4af28.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/1764050741/24898b13-e19f-44e3-ba40-05e88e5b3ec4.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/1764050741/49aaaa37-12c0-418e-bf80-117d68d5ec05.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/1764050741/7b9a6b4d-dcb0-4cf6-891a-64cac3f1219c.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/1764050741/8728192e-5a55-4461-82a5-5a69da26c54c.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/1764050741/9ae3d137-fc6e-4782-91ca-040cbdb97b8b.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/1764050741/ad9376d4-119a-490f-9fd7-aa66f42090bf.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/1764050741/cf389ce0-f8de-40dc-ae69-23aa675df4a0.jpg',
      'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/1764050741/d56e5e62-57d4-4662-b24d-b521f84a61b7.jpg',
    ],
    price: '739',
    originalPrice: '1639',
    discount: '54% OFF',
    badge: 'Save AED 900 extra',
    delivery: { label: 'Get in', time: '55 Min' },
  },
  {
    id: 'centella-duo',
    title: 'SKIN1004 Centella Hydration Duo',
    productCount: '4 products',
    images: [koreanGlassHero],
    price: '129',
    originalPrice: '299',
    discount: '57% OFF',
    badge: 'Save AED 170 extra',
    delivery: { label: 'Get in', time: '38 Min' },
  },
  {
    id: 'impex-tv-soundbar',
    title: 'Impex 50" QLED TV + Soundbar Combo',
    productCount: '8 products',
    images: [
      'https://f.nooncdn.com/p/pzsku/ZA5110FCBA70068D0481FZ/45/1764050741/06876790-8d4b-4e17-8656-860b6cb4af28.jpg',
    ],
    price: '849',
    originalPrice: '1799',
    discount: '53% OFF',
    badge: 'Save AED 950 extra',
    delivery: { label: 'Get in', time: '60 Min' },
  },
]

// "Similar Products" rail — sponsored AirPods (real noon listing image).
const AIRPODS_IMG =
  'https://f.nooncdn.com/p/pzsku/Z00A3C6B2FA70477424D8Z/45/_/1773140636/6ad93409-c794-4938-93a1-3f94284436a7.jpg'

export const similar = [
  {
    id: 'airpods-1',
    title: 'Apple Airpods Pro 2 Wireless Earbuds',
    image: AIRPODS_IMG,
    rating: '4.3',
    ratingCount: 128,
    price: '899',
    originalPrice: '1399',
    discount: '33%',
    nudge: 'Lowest price in 30 days',
    bestSeller: true,
    ad: true,
    express: true,
    dots: 4,
  },
  {
    id: 'airpods-2',
    title: 'Apple Airpods Pro 2 Wireless Earbuds',
    image: AIRPODS_IMG,
    rating: '4.3',
    ratingCount: 128,
    price: '899',
    originalPrice: '1399',
    discount: '33%',
    nudge: 'Lowest price in 30 days',
    ad: true,
    express: true,
    dots: 4,
  },
  {
    id: 'airpods-3',
    title: 'Apple Airpods Pro 2 Wireless Earbuds',
    image: AIRPODS_IMG,
    rating: '4.3',
    ratingCount: 128,
    price: '899',
    originalPrice: '1399',
    discount: '33%',
    nudge: 'Lowest price in 30 days',
    ad: true,
    express: true,
    dots: 4,
  },
]

// Sponsored "Top products in ..." rail — brand storefront (TECV).
export const topProducts = {
  brand: 'TECV',
  items: [
    {
      id: 'tecv-1',
      title: 'Charging Brick For Apple Devices 25W USB-C Fast Charger',
      image: AIRPODS_IMG,
      price: '89',
      express: true,
      ad: true,
    },
    {
      id: 'tecv-2',
      title: 'Charging Cable Samsung Type-C Braided 2m',
      image: AIRPODS_IMG,
      price: '69',
      express: true,
      ad: true,
    },
  ],
}

// Search PLP (opened from "View all combos"). A 2-col product grid, marketplace
// tabs and filter chips — modelled on the noon search results page. The grid
// reuses the combo product card (bordered variant), so products are combo-shaped.
export const plp = {
  query: 'airpods',
  marketplaces: [
    { id: 'noon', label: 'noon', name: 'noon' },
    { id: 'minutes', label: 'MINUTES', name: 'minutes' },
    { id: 'supermall', label: 'supermall', name: 'supermall' },
    { id: 'express', label: 'express', name: 'express' },
  ],
  chips: ['Filter', 'Sort', 'Price', 'Cases & Covers', 'Applicable'],
  products: [
    {
      kind: 'product',
      id: 'plp-p1',
      image: 'https://f.nooncdn.com/p/pzsku/Z882BD8D9B447D09C4877Z/45/_/1779369459/62e3253c-1346-444e-9404-5b346c9449dd.jpg?width=800',
      title: 'Apple Airpods Pro 2 Wireless Earbuds',
      rating: '4.3',
      ratingCount: 128,
      price: '899',
      originalPrice: '1399',
      discount: '33%',
      quantity: '500ml | AED2.35/ml',
      nudges: ['lowest', 'fast', 'bestseller'],
      bestSeller: true,
      ad: true,
      dots: 4,
      variants: ['#F43333', '#05AF25', '#0076FF'],
      variantCount: 4,
      dealBar: { label: 'Mega Deal', bg: '#101628', color: '#FFFFFF' },
      coupons: ['Extra 10% Off', '+3'],
      badge: 'minutes',
    },
    { kind: 'combo', id: 'plp-1', image: bundleShampooConditioner, productCount: '2 Products', title: 'The Derma Co Pore Minimizing Skincare Combo Pack', price: '59.98', comparePrice: '64.98', coupon: 'AED5 cheaper with combo' },
    {
      kind: 'product',
      id: 'plp-p2',
      image: 'https://f.nooncdn.com/p/pzsku/Z69919C7312B4BDAACED3Z/45/1751545273/4c481c14-efa2-45b6-986c-2b1cffbff38d.jpg?width=800',
      title: 'Apple Airpods Pro 2 Wireless Earbuds',
      rating: '4.3',
      ratingCount: 128,
      price: '899',
      originalPrice: '1399',
      discount: '33%',
      quantity: '500ml | AED2.35/ml',
      nudges: ['fast', 'delivery', 'stock'],
      ad: true,
      dots: 4,
      variants: ['#F43333', '#05AF25', '#0076FF'],
      variantCount: 4,
      dealBar: { label: 'Mega Deal', bg: '#101628', color: '#FFFFFF' },
      coupons: ['Extra 10% Off', '+3'],
      badge: 'supermall',
    },
    { kind: 'combo', id: 'plp-2', image: bundleShampooRicewater, productCount: '2 Products', title: 'The Derma Co Pore Minimizing Skincare Combo Pack', price: '59.98', comparePrice: '64.98', coupon: 'AED5 cheaper with combo' },
    {
      kind: 'product',
      id: 'plp-p3',
      image: 'https://f.nooncdn.com/p/pzsku/ZA859CFCD2F23BC1140F2Z/45/1763647726/ad2c554f-6dd3-4238-9801-4cc94246254d.jpg?width=800',
      title: 'Apple Airpods Pro 2 Wireless Earbuds',
      rating: '4.3',
      ratingCount: 128,
      price: '899',
      originalPrice: '1399',
      discount: '33%',
      nudges: ['bestseller', 'lowest', 'delivery'],
      bestSeller: true,
      dots: 4,
      variants: ['#F43333', '#05AF25', '#0076FF'],
      variantCount: 4,
      coupons: ['Extra 10% Off', '+3'],
      badge: 'express',
    },
    {
      kind: 'product',
      id: 'plp-p4',
      image: 'https://f.nooncdn.com/p/pzsku/ZA859CFCD2F23BC1140F2Z/45/1763647726/ad2c554f-6dd3-4238-9801-4cc94246254d.jpg?width=800',
      title: 'Apple Airpods Pro 2 Wireless Earbuds',
      rating: '4.3',
      ratingCount: 128,
      price: '899',
      originalPrice: '1399',
      discount: '33%',
      nudges: ['stock', 'fast', 'lowest'],
      dots: 4,
      variants: ['#F43333', '#05AF25', '#0076FF'],
      variantCount: 4,
      coupons: ['Extra 10% Off', '+3'],
    },
    { kind: 'combo', id: 'plp-3', image: bundleShampooConditioner, productCount: '2 Products', title: 'The Derma Co Pore Minimizing Skincare Combo Pack', price: '59.98', comparePrice: '64.98', coupon: 'AED5 cheaper with combo' },
  ],
}
