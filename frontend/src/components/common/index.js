// Barrel — enables `import { ProductCard } from '@/components/common'`,
// mirroring the named-export ergonomics of @field-ds/components.
//
// Product cards (reusable across experiments):
//   ProductCard      — generic rail card (combos rail + similar-products rail)
//   ComboProductCard — combo/bundle card (bottom sheet, showcases, PLP grid)
//   ComboRowCard     — full-width horizontal combo card (variation-4 sheet)
//   PlpProductCard   — full noon PLP/search grid card
export { PrimaryButton } from './PrimaryButton';
export { IconButton } from './IconButton';
export { AddToCartButton } from './AddToCartButton';
export { SectionCard } from './SectionCard';
export { Accordion } from './Accordion';
export { ProductCard } from './ProductCard';
export { ComboProductCard, ComboAtc } from './ComboProductCard';
export { ComboRowCard } from './ComboRowCard';
export { PlpProductCard } from './PlpProductCard';
export { WishlistButton } from './WishlistButton';
export { NudgeFlipper } from './NudgeFlipper';
export { ComboGif, COMBO_GIF } from './ComboGif';
export { Dirham, withDirham } from './Dirham';
