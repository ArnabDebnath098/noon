// PlpProductCard — a search/PLP grid card (noon results page). Image tile with
// Best Seller tag, wishlist, a colour-variant indicator and an optional flash-
// deal countdown bar; below: name, rating pill, price row, lowest-price nudge
// and coupon chips.
import { Dirham } from './Dirham'
import { WishlistButton } from './WishlistButton'

export function PlpProductCard({
  image,
  title,
  rating,
  ratingCount,
  price,
  originalPrice,
  discount,
  nudge,
  bestSeller = false,
  ad = false,
  variants = [],
  variantCount,
  flashDeal,
  dealBar,
  coupons = [],
  dataId = 'plp-card',
}) {
  const did = (s) => `${dataId}-${s}`
  return (
    <div data-id={dataId} className="flex flex-col overflow-hidden rounded-xl border-[0.5px] border-[#F2F3F7] bg-white">
      {/* Image */}
      <div data-id={did('media')} className="relative aspect-[3/4] w-full bg-[rgba(0,40,136,0.03)]">
        <img data-id={did('image')} src={image} alt={title} loading="lazy" className="h-full w-full object-contain" />

        {bestSeller && (
          <span data-id={did('best-seller')} className="absolute left-0 top-0 rounded-br-[10px] bg-[#0A4F4A] px-1.5 py-0.5 font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-white shadow-[0px_0px_0px_1px_#EFF7FF]">
            Best Seller
          </span>
        )}

        <div className="absolute right-2 top-2">
          <WishlistButton dataId={did('wishlist')} size={24} bg="rgba(255,255,255,0.6)" />
        </div>

        {ad && (
          <span data-id={did('ad')} className="absolute bottom-2 left-2 rounded bg-[#F2F3F7] px-1 py-0.5 font-noontree text-[10px] leading-none text-[#475067]">
            Ad
          </span>
        )}

        {/* variant indicator */}
        {variants.length > 0 && (
          <div data-id={did('variants')} className="absolute bottom-[42px] right-2 flex flex-col items-center rounded bg-white/70 px-1 py-1 backdrop-blur-[2px]">
            <div className="flex flex-col items-center">
              {variants.map((c, i) => (
                <span key={i} data-id={did(`variant-${i}`)} className="h-3 w-3 rounded-full border-[0.5px] border-white" style={{ background: c, marginBottom: i < variants.length - 1 ? -5 : 0 }} />
              ))}
            </div>
            {variantCount != null && (
              <span data-id={did('variant-count')} className="mt-0.5 font-figtree text-[11px] font-semibold leading-none text-[#343D54]">
                {variantCount}
              </span>
            )}
          </div>
        )}

        {/* flash deal bar */}
        {flashDeal && (
          <div data-id={did('flash')} className="absolute inset-x-0 bottom-0 flex h-9 items-center justify-center gap-1 bg-[rgba(16,22,40,0.8)] backdrop-blur-[2px]">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="3.5" y="7" width="9" height="6" rx="1.2" fill="#FEEE00" />
              <path d="M5 7V5.5a3 3 0 016 0V7" stroke="#FEEE00" strokeWidth="1.4" />
            </svg>
            <span className="font-noontree text-[12px] font-medium text-white">Flash deal in</span>
            <span className="font-noontree text-[14px] font-bold tracking-[-0.18px] text-[#FEEE00]">{flashDeal}</span>
          </div>
        )}
      </div>

      {/* deal bar */}
      {dealBar && (
        <div data-id={did('deal-bar')} className="flex h-5 items-center px-2" style={{ background: dealBar.bg }}>
          <span className="font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px]" style={{ color: dealBar.color }}>
            {dealBar.label}
          </span>
        </div>
      )}

      {/* Bottom */}
      <div data-id={did('bottom')} className="flex flex-col gap-2 px-2 pb-2.5 pt-2">
        <div data-id={did('rating-group')} className="flex flex-col gap-0.5">
          <h3 data-id={did('title')} className="line-clamp-2 min-h-9 font-noontree text-[14px] font-medium leading-[18px] tracking-[-0.14px] text-[#212121]">
            {title}
          </h3>
          {rating && (
            <div data-id={did('rating')} className="flex w-fit items-center gap-0.5 rounded bg-[#F9F9FB] px-1 py-0.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.2L6 9.5 3 11l.6-3.2L1.2 4.5 4.5 4z" fill="#42BD4C" />
              </svg>
              <span data-id={did('rating-value')} className="font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-[#101628]">
                {rating} ({ratingCount})
              </span>
            </div>
          )}
        </div>

        <div data-id={did('pricing')} className="flex flex-col gap-1">
          <div data-id={did('price')} className="flex flex-wrap items-baseline gap-0.5">
            <span data-id={did('price-now')} className="inline-flex items-center gap-px font-noontree text-[15px] font-bold leading-4 tracking-[0.07px] text-[#0E0E0E]">
              <Dirham />
              {price}
            </span>
            {originalPrice && (
              <span data-id={did('price-was')} className="font-noontree text-[12px] font-normal leading-[14px] text-[#989FB3] line-through">
                {originalPrice}
              </span>
            )}
            {discount && (
              <span data-id={did('price-discount')} className="font-noontree text-[12px] font-semibold leading-[14px] text-[#13645F]">
                {discount}
              </span>
            )}
          </div>

          {nudge && (
            <div data-id={did('nudge')} className="flex items-center gap-1 font-figtree text-[12px] leading-4 tracking-[-0.12px] text-[#475067]">
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#DE1C1C] text-[9px] leading-none text-white">↓</span>
              <span className="truncate">{nudge}</span>
            </div>
          )}

          {coupons.length > 0 && (
            <div data-id={did('coupons')} className="flex items-start gap-1">
              {coupons.map((c, i) => (
                <span key={i} data-id={did(`coupon-${i}`)} className="flex h-[18px] items-center justify-center rounded-[4px] border-[0.5px] border-dashed border-[#BBE0DE] bg-[#E9FBF9] px-1 font-figtree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-[#0A4F4A]">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
