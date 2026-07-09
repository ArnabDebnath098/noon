// PlpProductCard — the full noon search/PLP product card. Image tile (Best
// Seller tag, wishlist, colour-variant indicator, page dots, Ad, ATC "+"),
// an optional deal bar, then name, rating, price row, quantity, lowest-price
// nudge, coupon chips and a red "Get in 15 Mins" delivery button.
import { Dirham, withDirham } from './Dirham'
import { WishlistButton } from './WishlistButton'
import { ComboAtc } from './ComboProductCard'
import { NudgeFlipper } from './NudgeFlipper'
import badgeMinutes from '../../assets/icons/badge-minutes.svg'
import badgeSupermall from '../../assets/icons/badge-supermall.svg'
import badgeExpress from '../../assets/icons/badge-express.svg'
import nudgeLowest from '../../assets/icons/nudge-lowest.svg'
import nudgeFast from '../../assets/icons/nudge-fast.svg'
import nudgeDelivery from '../../assets/icons/nudge-delivery.svg'
import nudgeStock from '../../assets/icons/nudge-stock.svg'
import nudgeBestseller from '../../assets/icons/bestseller.svg'

// Nudge registry — data references these by key.
const NUDGES = {
  lowest: { icon: nudgeLowest, text: 'Lowest Price in 30 days' },
  fast: { icon: nudgeFast, text: 'Selling out fast' },
  bestseller: { icon: nudgeBestseller, text: '#3 bestseller' },
  delivery: { icon: nudgeDelivery, text: 'Free Delivery' },
  stock: { icon: nudgeStock, text: '5 left in stock' },
}

const BADGES = {
  minutes: badgeMinutes,
  supermall: badgeSupermall,
  express: badgeExpress,
}

export function PlpProductCard({
  image,
  title,
  rating,
  ratingCount,
  price,
  originalPrice,
  discount,
  quantity,
  nudge,
  nudges,
  bestSeller = false,
  ad = false,
  variants = [],
  variantCount,
  dots = 0,
  dealBar,
  coupons = [],
  badge,
  dataId = 'plp-card',
}) {
  const did = (s) => `${dataId}-${s}`
  return (
    <div data-id={dataId} className="flex flex-col overflow-hidden rounded-xl border-[0.5px] border-[#F2F3F7] bg-white">
      {/* Image */}
      <div data-id={did('media')} className="relative h-[227px] w-full shrink-0 bg-[rgba(0,40,136,0.03)]">
        <img data-id={did('image')} src={image} alt={title} loading="lazy" className="h-full w-full object-cover" />

        {bestSeller && (
          <span data-id={did('best-seller')} className="absolute left-0 top-0 rounded-br-[10px] bg-[#0A4F4A] px-1.5 py-0.5 font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-white shadow-[0px_0px_0px_1px_#EFF7FF]">
            Best Seller
          </span>
        )}

        {/* wishlist — same animated heart as the combo card (32×32) */}
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton dataId={did('wishlist')} size={32} />
        </div>

        {/* variant indicator — stacked colour dots + count */}
        {variants.length > 0 && (
          <div data-id={did('variants')} className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col items-center rounded bg-white/70 px-0.5 py-1 backdrop-blur-[2px]">
            <div className="flex flex-col items-center">
              {variants.map((c, i) => (
                <span key={i} className="h-3 w-3 rounded-full border-[0.5px] border-white" style={{ background: c, marginBottom: i < variants.length - 1 ? -5 : 0 }} />
              ))}
            </div>
            {variantCount != null && (
              <span data-id={did('variant-count')} className="mt-0.5 font-figtree text-[11px] font-semibold leading-none text-[#343D54]">
                {variantCount}
              </span>
            )}
          </div>
        )}

        {dots > 1 && (
          <div data-id={did('dots')} className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-1">
            {Array.from({ length: dots }).map((_, i) => (
              <span key={i} className="rounded-full" style={{ width: i === 0 ? 6 : i === 1 ? 6 : i === 2 ? 4 : 2, height: i === 0 ? 6 : i === 1 ? 6 : i === 2 ? 4 : 2, background: i === 0 ? '#0E0E0E' : 'rgba(14,14,14,0.25)' }} />
            ))}
          </div>
        )}

        {ad && (
          <span data-id={did('ad')} className="absolute bottom-2 left-2 rounded bg-[#F2F3F7] px-1 py-0.5 font-noontree text-[10px] leading-none text-[#475067]">
            Ad
          </span>
        )}

        {/* ATC — same squircle stepper as the combo card */}
        <ComboAtc dataId={did('atc')} />
      </div>

      {/* deal bar */}
      {dealBar && (
        <div data-id={did('deal-bar')} className="flex h-5 items-center px-2" style={{ background: dealBar.bg }}>
          <span className="font-figtree text-[12px] font-normal leading-[14px] tracking-[-0.12px]" style={{ color: dealBar.color }}>
            {dealBar.label}
          </span>
        </div>
      )}

      {/* Bottom */}
      <div data-id={did('bottom')} className="flex flex-col gap-2 px-2 pb-2.5 pt-2">
        <div data-id={did('rating-group')} className="flex flex-col gap-0.5">
          <h3 data-id={did('title')} className="line-clamp-2 min-h-9 font-noontree text-[14px] font-medium leading-[18px] tracking-[-0.14px] text-[#1D2539]">
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
            <span data-id={did('price-now')} className="inline-flex items-center gap-px font-noontree text-[15px] font-bold leading-4 tracking-[0.07px] text-[#1D2539]">
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

          {quantity && (
            <div data-id={did('quantity')} className="flex w-fit items-center gap-1.5 rounded bg-[#F9F9FB] px-1 py-0.5 font-noontree text-[12px] font-medium leading-[14px] tracking-[-0.12px] text-[#343D54]">
              {quantity.split('|').map((q, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="h-3 w-px bg-[#D0D4DD]" />}
                  <span className="inline-flex items-center">{withDirham(q.trim())}</span>
                </span>
              ))}
            </div>
          )}

          {nudges?.length ? (
            <NudgeFlipper
              dataId={did('nudge')}
              nudges={nudges.map((k) => NUDGES[k]).filter(Boolean)}
            />
          ) : (
            nudge && (
              <div data-id={did('nudge')} className="flex items-center gap-1 font-figtree text-[12px] leading-4 tracking-[-0.12px] text-[#475067]">
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#DE1C1C] text-[9px] leading-none text-white">↓</span>
                <span className="truncate">{nudge}</span>
              </div>
            )
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

        {badge && BADGES[badge] && (
          <img data-id={did('badge')} src={BADGES[badge]} alt="" aria-hidden="true" className="mt-0.5 h-[26px] w-auto self-start" />
        )}
      </div>
    </div>
  )
}
