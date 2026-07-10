// BundleShowcase5 — variation-5 combo section (Figma "Main Container", the
// "Get more for less" treatment). A left info panel washed with a soft ellipse
// gradient ("Get more for less" + subtitle + a serrated navy "Save upto" ticket
// + View all), followed by a horizontal rail of compact combo cards: corner
// "N Products" banner, wishlist heart, ATC stepper, single-line price + coupon.
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { WishlistButton } from '../../components/common/WishlistButton'
import { ComboAtc } from '../../components/common/ComboProductCard'
import { ComboGif } from '../../components/common'
import { Dirham, withDirham } from '../../components/common/Dirham'

// Serrated ticket edges (reused from the variation-3 bundle banner), tinted navy.
function TicketLeft() {
  return (
    <svg width="4" height="22" viewBox="0 0 4 20" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M3.14258 20H0V18.5713C0.86787 18.5713 1.57129 17.9316 1.57129 17.1426C1.57116 16.3537 0.867791 15.7139 0 15.7139V14.2852C0.867721 14.2851 1.57105 13.6462 1.57129 12.8574C1.57129 12.1179 0.953321 11.5089 0.161133 11.4355L0 11.4287V9.28516C0.867721 9.28515 1.57105 8.64621 1.57129 7.85742C1.57129 7.11789 0.953321 6.50889 0.161133 6.43555L0 6.42871V4.28516C0.867721 4.28515 1.57105 3.64621 1.57129 2.85742C1.57129 2.11789 0.953321 1.50889 0.161133 1.43555L0 1.42871V0H3.14258V20Z" fill="#082F8C" />
    </svg>
  )
}
function TicketRight() {
  return (
    <svg width="4" height="22" viewBox="0 0 4 20" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M3.14258 1.42871C2.27482 1.42884 1.57129 2.06852 1.57129 2.85742C1.57153 3.64613 2.27497 4.28503 3.14258 4.28516V6.42871C2.27482 6.42884 1.57129 7.06852 1.57129 7.85742C1.57153 8.64613 2.27497 9.28503 3.14258 9.28516V11.4287C2.27482 11.4288 1.57129 12.0685 1.57129 12.8574C1.57153 13.6461 2.27497 14.285 3.14258 14.2852V15.7139C2.2749 15.714 1.57142 16.3538 1.57129 17.1426C1.57129 17.9315 2.27482 18.5712 3.14258 18.5713V20H0V0H3.14258V1.42871Z" fill="#082F8C" />
    </svg>
  )
}

function ShowcaseCard({ item, onQtyChange, onWishlist, dataId }) {
  const did = (s) => `${dataId}-${s}`
  return (
    <div data-id={dataId} className="flex w-[159px] min-w-[159px] shrink-0 flex-col rounded-2xl bg-white">
      {/* Product image */}
      <div data-id={did('media')} className="relative flex h-[190px] items-center justify-center overflow-hidden rounded-[14px] bg-[#F2F3F7]">
        <img data-id={did('image')} src={item.image} alt="" aria-hidden="true" className="h-[157px] w-auto object-contain" />

        {/* corner "N Products" banner */}
        <span
          data-id={did('banner')}
          className="absolute left-0 top-0 flex h-6 items-center rounded-br-[12px] bg-[#D6E9FF] pl-3 pr-2 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-[#082F8C]"
        >
          {item.productCount ?? '2 Products'}
        </span>

        {/* wishlist */}
        <div className="absolute right-1 top-1 z-10">
          <WishlistButton dataId={did('wishlist')} size={28} onChange={onWishlist} />
        </div>

        {/* ATC stepper */}
        <ComboAtc dataId={did('atc')} onQtyChange={onQtyChange} />
      </div>

      {/* Detail */}
      <div data-id={did('detail')} className="flex flex-col gap-2 px-2 py-2.5">
        <h3 data-id={did('title')} className="line-clamp-2 min-h-9 font-noontree text-[13px] font-medium leading-[18px] tracking-[-0.1px] text-[#212121]">
          {item.title}
        </h3>
        <div data-id={did('pricing')} className="flex flex-col gap-2">
          <span data-id={did('price')} className="inline-flex w-fit items-center gap-px font-noontree text-[16px] font-bold leading-[22px] tracking-[-0.15px] text-[#1D2539]">
            <Dirham />
            {item.price}
          </span>
          {item.coupon && (
            <span
              data-id={did('coupon')}
              className="flex h-5 w-fit items-center justify-center rounded px-1 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-[#0B623F]"
              style={{ background: '#E3FCF2', border: '0.5px dashed #CBF6E5' }}
            >
              {withDirham(item.coupon)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BundleShowcase5({
  items = [],
  savings = '20',
  viewAll,
  subtitle = 'Lower prices when bought as a combo',
  onViewAll,
  onQtyChange,
  bleed = true,
  dataId = 'bundle-showcase-5',
}) {
  const did = (s) => `${dataId}-${s}`

  // Horizontal-scroll driven fade/scale for the info panel: it stays pinned to
  // the left (sticky) while the first card slides in from the right, and fades +
  // scales out across roughly its own width of scroll.
  const rootRef = useRef(null)
  const progress = useMotionValue(0)
  const infoOpacity = useTransform(progress, [0, 0.35], [1, 0])
  const infoScale = useTransform(progress, [0, 1], [1, 0.85])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onScroll = () => {
      const span = 164 // panel width — fade across the first card's slide-in
      progress.set(Math.min(1, Math.max(0, el.scrollLeft / span)))
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [progress])

  return (
    <div
      ref={rootRef}
      data-id={did('root')}
      className={`scrollbar-hide flex items-stretch overflow-x-auto bg-white ${bleed ? '-mx-3' : ''}`}
    >
      {/* Info panel — soft ellipse wash; sticky-left, fades/scales on scroll */}
      <motion.div
        data-id={did('info')}
        style={{ background: 'radial-gradient(130% 135% at 8% 58%, #F1F4FE 0%, #FFFFFF 62%)', opacity: infoOpacity, scale: infoScale, transformOrigin: 'left center' }}
        className="sticky left-0 z-0 flex w-[164px] min-w-[164px] shrink-0 flex-col gap-4 overflow-hidden py-8 pl-5 pr-5"
      >
        <div data-id={did('listings')} className="flex flex-1 flex-col gap-1">
          <ComboGif dataId={did('icon')} className="mb-3 h-8 w-8" />

          <span data-id={did('title')} className="font-noontree text-[20px] font-bold leading-[28px] tracking-[-0.25px] text-[#082F8C]">
            Get more for less
          </span>
          <span data-id={did('subtitle')} className="mt-1 font-noontree text-[12px] font-medium leading-[18px] tracking-[-0.1px] text-[#082F8C]">
            {subtitle}
          </span>

          {/* Save upto ₫X — serrated navy ticket */}
          <span data-id={did('save')} className="mt-3 flex w-fit items-center">
            <TicketLeft />
            <span className="-mx-px flex h-[22px] items-center bg-[#082F8C] px-1 pb-0.5 font-noontree text-[13px] font-semibold leading-[20px] tracking-[-0.1px] text-white">
              <span className="inline-flex items-center gap-1">
                <span>Save upto</span>
                <span className="inline-flex items-center gap-px">
                  <Dirham />
                  {savings}
                </span>
              </span>
            </span>
            <TicketRight />
          </span>
        </div>

        {viewAll > 0 && (
          <button
            type="button"
            data-id={did('view-all')}
            onClick={onViewAll}
            className="flex h-9 w-fit items-center justify-center rounded-lg border border-[#D6E9FF] bg-white px-3 font-noontree text-[12px] font-semibold leading-4 text-[#0F61FF]"
          >
            View all {viewAll}
          </button>
        )}
      </motion.div>

      {/* Product rail — sits above the (sticky) info panel */}
      <div data-id={did('cards')} className="relative z-10 flex shrink-0 items-start gap-3 px-2 py-3">
        {items.map((it) => (
          <ShowcaseCard
            key={it.id}
            dataId={did(`card-${it.id}`)}
            item={it}
            onQtyChange={onQtyChange ? (q) => onQtyChange(it.id, q) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
