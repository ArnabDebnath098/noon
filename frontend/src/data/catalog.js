// Shared product data scraped from noon.com (uae-en) product pages.
// Consumed by the Home and Categories routes.
import koreanGlassHero from '../assets/products/korean-glass-hero.png'

// "Product Details" accordion rows.
export const productDetails = [
  {
    id: 'overview',
    title: 'Overview',
    content:
      'A curated bundle that brings together complementary products at one combined price, so you save more than buying each item on its own.',
  },
  {
    id: 'highlights',
    title: 'Highlights',
    content:
      'Best-value pairing, fast express delivery, and an extra combo discount applied automatically at checkout.',
  },
  {
    id: 'specifications',
    title: 'Specifications',
    content:
      'Includes all listed items in the set. Colours, sizes and quantities are as shown on each product card.',
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
