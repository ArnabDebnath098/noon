// ProductCard — single reusable card used by BOTH the combos rail and the
// Similar Products rail. Every element is optional and rendered via props, so
// the same component covers both layouts:
//   - combos:  productCount (animated "Combo" chip) + savings badge
//   - similar: rating, lowest-price nudge, Best Seller / Ad / dots / express
// Every element carries a data-id namespaced under the card's `dataId`.
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dirham, withDirham } from './Dirham'
import { AddToCartButton } from './AddToCartButton'
import expressTodayTag from '../../assets/icons/express-today.svg'
import ratingStar from '../../assets/icons/rating-star.svg'
import wishlistHeartRaw from '../../assets/icons/wishlist.svg?raw'

// Heart markup recoloured to inherit currentColor.
const HEART_HTML = wishlistHeartRaw.replace(/fill="black"/gi, 'fill="currentColor"')
import { ComboType } from './ComboType'
import { ComboSlide } from './ComboSlide'
import { ComboReveal } from './ComboReveal'

const TONE = {
  red: 'text-[#D92626]',
  green: 'text-[#15806A]',
}

const BADGE_TONE = {
  red: 'bg-red-50 text-[#E5293E]',
  green: 'bg-green-50 text-[#15806A]',
}

export function ProductCard({
  image,
  images = [],
  title,
  // combos: animated "Combo" <-> count chip
  productCount,
  comboAnim = 'type',
  comboDelay = 0,
  // similar: rating row
  rating,
  ratingCount,
  // pricing
  price,
  originalPrice,
  discount,
  discountTone = 'red',
  // combos: savings badge
  badge,
  badgeTone = 'red',
  // similar: nudge + flags
  nudge,
  bestSeller = false,
  ad = false,
  express = false,
  dots = 0,
  // layout / handlers
  width = 160,
  onAdd,
  onWishlist,
  dataId = 'product-card',
}) {
  const did = (s) => `${dataId}-${s}`
  const hero = image ?? images[0]

  const [liked, setLiked] = useState(false)
  const [burst, setBurst] = useState(0) // bumps on each "like" to retrigger fx

  const toggleWishlist = () => {
    const next = !liked
    setLiked(next)
    if (next) setBurst((b) => b + 1)
    onWishlist?.(next)
  }

  const ComboCount =
    comboAnim === 'slide'
      ? ComboSlide
      : comboAnim === 'reveal'
        ? ComboReveal
        : ComboType

  return (
    <div
      data-id={dataId}
      className="relative flex shrink-0 flex-col gap-2"
      style={{ width }}
    >
      {/* Media header with overlays */}
      <div
        data-id={did('media')}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F2F3F7]"
      >
        {hero && (
          <img
            data-id={did('image')}
            src={hero}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}

        {bestSeller && (
          <span
            data-id={did('best-seller')}
            className="absolute left-0 top-0 rounded-br-[10px] bg-[#0A4F4A] px-1.5 py-0.5 font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-white shadow-[0px_0px_0px_1px_#EFF7FF]"
          >
            Best Seller
          </span>
        )}

        {/* Ripple over the image, clipped to the media box. */}
        {burst > 0 && (
          <motion.span
            key={burst}
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-2 z-10 h-7 w-7 rounded-full bg-[#D92626]"
            initial={{ scale: 0.3, opacity: 0.4 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}

        <button
          type="button"
          data-id={did('wishlist')}
          aria-label="Add to wishlist"
          aria-pressed={liked}
          onClick={toggleWishlist}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#F9F9FB] p-1"
          style={{ color: liked ? '#D92626' : '#666D85' }}
        >
          <motion.span
            aria-hidden="true"
            className="h-5 w-5 [&>svg]:h-full [&>svg]:w-full"
            animate={{ scale: liked ? [1, 1.35, 0.85, 1.15, 1] : 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            dangerouslySetInnerHTML={{ __html: HEART_HTML }}
          />
        </button>

        {ad && (
          <span
            data-id={did('ad')}
            className="absolute bottom-2 left-2 rounded bg-white/80 px-1.5 py-0.5 font-noontree text-[11px] leading-none text-[#666D85]"
          >
            Ad
          </span>
        )}

        {dots > 1 && (
          <div
            data-id={did('dots')}
            className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1"
          >
            {Array.from({ length: dots }).map((_, i) => (
              <span
                key={i}
                data-id={did(`dot-${i}`)}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === 0 ? 'bg-[#404553]' : 'bg-[#C9CDD8]'
                }`}
              />
            ))}
          </div>
        )}

        <AddToCartButton onPress={onAdd} dataId={did('atc')} />
      </div>

      {/* Content */}
      <div data-id={did('content')} className="flex flex-col gap-1">
        {/* Title + count grouped together, no gap */}
        <div data-id={did('title-group')} className="flex flex-col gap-0">
          <h3
            data-id={did('title')}
            className="line-clamp-2 font-noontree text-[14px] font-medium leading-[20px] tracking-[-0.1px] text-[#1D2539]"
          >
            {title}
          </h3>

          {/* combos: animated "Combo" chip / count */}
          {productCount && (
            <ComboCount
              count={productCount}
              delay={comboDelay}
              dataId={did('count')}
            />
          )}
        </div>

        {/* similar: rating */}
        {rating && (
          <div
            data-id={did('rating')}
            className="flex w-fit items-center gap-0.5 rounded-[4px] bg-[#F7F8FA] px-1 py-0.5"
          >
            <img
              data-id={did('rating-star')}
              src={ratingStar}
              alt=""
              aria-hidden="true"
              className="h-3 w-3"
            />
            <span
              data-id={did('rating-value')}
              className="font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-[#101628]"
            >
              {rating} ({ratingCount})
            </span>
          </div>
        )}

        {/* Price line */}
        <div
          data-id={did('price')}
          className="flex flex-wrap items-baseline gap-0.5 font-noontree tracking-[-0.1px]"
        >
          {price && (
            <span
              data-id={did('price-now')}
              className="inline-flex items-center gap-px text-[14px] font-bold leading-[20px] text-[#1D2539]"
            >
              <Dirham />
              {price}
            </span>
          )}
          {originalPrice && (
            <span
              data-id={did('price-was')}
              className="text-[12px] font-normal leading-[18px] text-[#989FB3] line-through"
            >
              {originalPrice}
            </span>
          )}
          {discount && (
            <span
              data-id={did('price-discount')}
              className={`text-[12px] font-semibold leading-[18px] ${TONE[discountTone]}`}
            >
              {discount}
            </span>
          )}
        </div>

        {/* combos: savings badge */}
        {badge && (
          <div data-id={did('coupons')} className="flex items-start gap-1">
            <span
              data-id={did('badge')}
              className={`rounded-md px-2 py-0.5 font-noontree text-[12px] font-medium leading-[18px] ${BADGE_TONE[badgeTone]}`}
            >
              {withDirham(badge)}
            </span>
          </div>
        )}

        {/* similar: lowest-price nudge */}
        {nudge && (
          <div
            data-id={did('nudge')}
            className="flex items-center gap-1 font-noontree text-[12px] leading-[18px] text-[#1D2539]"
          >
            <span
              data-id={did('nudge-icon')}
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#D92626] text-[9px] leading-none text-white"
            >
              ↓
            </span>
            <span data-id={did('nudge-text')} className="truncate">
              {nudge}
            </span>
          </div>
        )}

        {/* similar: express Today badge */}
        {express && (
          <img
            data-id={did('express')}
            src={expressTodayTag}
            alt="express Today"
            className="h-[18px] w-[122px]"
          />
        )}
      </div>

      {/* Emitted hearts — float up from the wishlist button (not clipped). */}
      {burst > 0 && (
        <div
          key={burst}
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center"
        >
          {[-1, 0, 1].map((dx, i) => (
            <motion.span
              key={i}
              className="absolute text-[14px] leading-none text-[#D92626]"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
              animate={{ x: dx * 16, y: -32 - i * 6, opacity: [0, 1, 0], scale: 1 }}
              transition={{ duration: 0.9, delay: i * 0.05, ease: 'easeOut' }}
            >
              ♥
            </motion.span>
          ))}
        </div>
      )}
    </div>
  )
}
