// Horizontal combo card (Figma "Product card/Variant5"): image on the left,
// details on the right (name, N products, pricing, coupon). Used in the stacked
// "Save more with combos" list.
import { useState } from 'react'
import { Dirham, withDirham } from './Dirham'
import { ComboChipOnce } from './ComboChipOnce'

export function HorizontalComboCard({
  dataId,
  title,
  productCount,
  images = [],
  price,
  originalPrice,
  discount,
  badge,
  comboDelay = 2000,
}) {
  const [wished, setWished] = useState(false)
  const pct = (discount || '').replace(/\s*off/i, '').trim() // "59% OFF" → "59%"

  return (
    <div
      data-id={dataId}
      className="flex w-full items-stretch gap-2 rounded-2xl bg-white"
      style={{ minHeight: 136 }}
    >
      {/* Image */}
      <div
        data-id={`${dataId}-image`}
        className="relative h-[136px] w-[102px] shrink-0 overflow-hidden rounded-xl bg-[#F9F9FB]"
      >
        <img
          data-id={`${dataId}-image-photo`}
          src={images[0]}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-1"
        />

        {/* Wishlist */}
        <button
          type="button"
          data-id={`${dataId}-image-wishlist`}
          aria-label="Wishlist"
          onClick={() => setWished((v) => !v)}
          className="absolute right-1 top-1 flex h-[19px] w-[19px] items-center justify-center rounded-full bg-white/20 active:scale-90"
        >
          <svg
            data-id={`${dataId}-image-wishlist-icon`}
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              data-id={`${dataId}-image-wishlist-icon-path`}
              d="M7 12.1S1.4 8.3 1.4 4.6A2.9 2.9 0 0 1 7 3.2a2.9 2.9 0 0 1 5.6 1.4C12.6 8.3 7 12.1 7 12.1Z"
              fill={wished ? '#475067' : 'white'}
              stroke="#475067"
              strokeWidth="0.79"
            />
          </svg>
        </button>

        {/* Add to cart */}
        <button
          type="button"
          data-id={`${dataId}-image-atc`}
          aria-label="Add to cart"
          className="absolute bottom-2 right-2 flex h-[25px] w-[25px] items-center justify-center rounded-[7px] border border-[#F2F3F7] bg-white active:scale-90"
        >
          <svg
            data-id={`${dataId}-image-atc-icon`}
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              data-id={`${dataId}-image-atc-icon-path`}
              d="M7 2.6v8.8M2.6 7h8.8"
              stroke="#101628"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div
        data-id={`${dataId}-details`}
        className="flex min-w-0 flex-1 flex-col justify-center gap-3 px-1"
      >
        <div data-id={`${dataId}-name-group`} className="flex flex-col gap-0.5">
          <p
            data-id={`${dataId}-name`}
            className="line-clamp-2 font-noontree text-[14px] font-medium leading-5 tracking-[-0.1px] text-[#212121]"
          >
            {title}
          </p>
          {/* blue "Combo" reveals once into the product count (secondary colour),
              same animation as variation 1 */}
          <ComboChipOnce
            bare
            count={productCount}
            delay={comboDelay}
            countColor="#666D85"
            dataId={`${dataId}-count`}
          />
        </div>

        <div data-id={`${dataId}-pricing-group`} className="flex flex-col gap-1">
          {/* Pricing */}
          <div data-id={`${dataId}-pricing`} className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
            <span
              data-id={`${dataId}-price`}
              className="flex items-center font-noontree text-[15px] font-bold leading-4 text-[#0E0E0E]"
            >
              <Dirham className="mr-0.5" />
              {price}
            </span>
            {originalPrice && (
              <span
                data-id={`${dataId}-original-price`}
                className="font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#989FB3] line-through"
              >
                {originalPrice}
              </span>
            )}
            {pct && (
              <span
                data-id={`${dataId}-discount`}
                className="font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-[#13645F]"
              >
                {pct}
              </span>
            )}
          </div>

          {/* Coupon */}
          {badge && (
            <span
              data-id={`${dataId}-coupon`}
              className="flex h-5 w-fit items-center rounded border border-dashed border-[#CBF6E5] bg-[#E3FCF2] px-1 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-[#0B623F]"
            >
              {withDirham(badge)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
