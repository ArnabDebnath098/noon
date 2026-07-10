// Shared product data scraped from noon.com (uae-en) product pages.
// Consumed by the Home and Categories routes.
import koreanGlassHero from '../../assets/products/korean-glass-hero.png'
import bareAnatomyShampoo from '../../assets/products/bare-anatomy-shampoo.png'
import bundleShampooConditioner from '../../assets/products/bundle-shampoo-conditioner.png'
import bundleShampooRicewater from '../../assets/products/bundle-shampoo-ricewater.png'
import comboThumbConditioner from '../../assets/products/combo-thumb-conditioner.png'
import comboThumbShampoo from '../../assets/products/combo-thumb-shampoo.png'

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
      title: 'The Derma Co Pore Minimizing Skincare Combo Pack',
      price: '59.98',
      comparePrice: '64.98',
      coupon: 'AED5 cheaper with combo',
    },
    {
      id: 'bundle-2',
      image: bundleShampooRicewater,
      thumbs: COMBO_THUMBS_3,
      extra: 4,
      productCount: '2 Products',
      title: 'The Derma Co Pore Minimizing Skincare Combo Pack',
      price: '59.98',
      comparePrice: '64.98',
      coupon: 'AED5 cheaper with combo',
      express: true,
    },
    {
      id: 'bundle-3',
      image: bundleShampooRicewater,
      thumbs: COMBO_THUMBS,
      productCount: '2 Products',
      title: 'The Derma Co Pore Minimizing Skincare Combo Pack',
      price: '59.98',
      comparePrice: '64.98',
      coupon: 'AED5 cheaper with combo',
    },
  ],
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
