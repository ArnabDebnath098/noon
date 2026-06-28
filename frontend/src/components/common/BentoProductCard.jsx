// BentoProductCard — combo card with a bento image grid.
//   - 2 items  : two equal halves
//   - 3 items  : big image left + two images stacked right
//   - 4+ items : big image left + image right-top + "+N" right-bottom
// Then title, "view all N items", pricing + coupon ("Save … extra"), and a
// bottom action row (wishlist icon button + secondary "Add to cart").
import { Dirham, withDirham } from './Dirham'
import wishlistHeart from '../../assets/icons/wishlist.svg'

const CELL = 'flex items-center justify-center overflow-hidden bg-[#F9F9FB]'
const PIC = 'w-full h-auto'

export function BentoProductCard({
  images = [],
  title,
  itemCount,
  price,
  originalPrice,
  discount,
  badge,
  onAddToCart,
  onWishlist,
  onViewAll,
  dataId = 'bento-card',
}) {
  const did = (s) => `${dataId}-${s}`
  const n = itemCount ?? images.length
  const img = (i) => images[i % Math.max(images.length, 1)]

  return (
    <div
      data-id={dataId}
      className="flex h-[346px] w-[193px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white"
    >
      {/* Bento image grid */}
      <div data-id={did('media')} className="flex h-[172px] w-full overflow-hidden rounded-2xl">
        {/* big left — equal half for 2 items, else the wider cell */}
        <div
          className={`h-full border-r-2 border-white ${
            n <= 2 ? 'w-1/2' : 'w-[129px]'
          } ${CELL}`}
        >
          <img src={img(0)} alt="" className={PIC} />
        </div>

        {/* right stack */}
        <div data-id={did('stack')} className="flex h-full flex-1 flex-col">
          {n <= 2 ? (
            <div className={`h-full ${CELL}`}>
              <img src={img(1)} alt="" className={PIC} />
            </div>
          ) : (
            <>
              <div className={`h-1/2 border-b-2 border-white ${CELL}`}>
                <img src={img(1)} alt="" className={PIC} />
              </div>
              <div className={`h-1/2 ${CELL}`}>
                {n === 3 ? (
                  <img src={img(2)} alt="" className={PIC} />
                ) : (
                  <span className="font-noontree text-[18px] font-bold leading-[24px] tracking-[-0.15px] text-[#1D2539]">
                    +{n - 2}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-2">
        <div className="flex flex-col gap-1">
          <h3
            data-id={did('title')}
            className="line-clamp-2 font-noontree text-[14px] font-medium leading-[18px] text-[#101628]"
          >
            {title}
          </h3>
          <button
            type="button"
            data-id={did('view-all')}
            onClick={onViewAll}
            className="w-fit font-noontree text-[12px] font-medium leading-[18px] tracking-[-0.1px] text-[#666D85]"
          >
            {n} products
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <div
            data-id={did('price')}
            className="flex flex-wrap items-end gap-0.5 font-noontree"
          >
            <span className="inline-flex items-center gap-px text-[15px] font-bold leading-[16px] text-[#1D2539]">
              <Dirham />
              {price}
            </span>
            {originalPrice && (
              <span className="text-[12px] font-normal leading-[14px] text-[#989FB3] line-through">
                {originalPrice}
              </span>
            )}
            {discount && (
              <span className="text-[12px] font-semibold leading-[14px] text-[#D92626]">
                {discount}
              </span>
            )}
          </div>
          {badge && (
            <span
              data-id={did('coupon')}
              className="flex h-5 w-fit items-center justify-center rounded-[4px] bg-[#FFF0F0] px-1 font-noontree text-[12px] font-medium leading-[18px] text-[#E5293E]"
            >
              {withDirham(badge)}
            </span>
          )}
        </div>

        {/* Bottom action: wishlist icon button + secondary CTA */}
        <div className="mt-auto flex items-stretch gap-2">
          <button
            type="button"
            data-id={did('wishlist')}
            aria-label="Add to wishlist"
            onClick={onWishlist}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#EAECF0] bg-white"
          >
            <img src={wishlistHeart} alt="" aria-hidden="true" className="h-5 w-5" />
          </button>
          <button
            type="button"
            data-id={did('add')}
            onClick={onAddToCart}
            className="flex h-9 flex-1 items-center justify-center rounded-lg border border-[#D6E9FF] bg-white font-noontree text-[12px] font-semibold text-[#0F61FF]"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}
