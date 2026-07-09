// ComboProductCard — a combo/bundle product card used in the "Buy together and
// save" bottom sheet. Two visual variants via `bordered`:
//   • bordered  → 1px #F2F3F7 border, 12px radius, square-topped image
//   • borderless → no border, 16px radius, rounded image (default; used in sheet)
// Squircle corner-smoothing (smoothing 1) on the container and image.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import { springs } from '../../utils/motion'
import { Dirham, withDirham } from './Dirham'
import { WishlistButton } from './WishlistButton'
import deleteItem from '../../assets/icons/delete-item.svg'
import expressTodayTag from '../../assets/icons/express-today-tag.svg'

// Small stacked-cards "combo" mark, tinted to the banner blue.
function ComboMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.4" y="2.2" width="6.4" height="9" rx="1.8" transform="rotate(-10 5.6 6.7)" fill="#7FA3F0" />
      <rect x="5" y="3" width="6.4" height="9" rx="1.8" fill="#0A49B8" />
    </svg>
  )
}

// ComboAtc — squircle add-to-cart control. Collapsed it's a 40×40 white "+"
// button; on add it becomes a blue [delete · count · +] stepper that expands
// horizontally while its right edge stays pinned (the whole control is anchored
// right, so growth pushes leftward). Width animates via Framer Motion.
export function ComboAtc({ dataId, onAdd, onQtyChange }) {
  const [qty, setQty] = useState(0)
  const added = qty > 0
  const inc = () =>
    setQty((q) => {
      const next = q + 1
      onAdd?.()
      onQtyChange?.(next)
      return next
    })
  const dec = () =>
    setQty((q) => {
      const next = Math.max(0, q - 1)
      onQtyChange?.(next)
      return next
    })
  return (
    <Squircle
      as="div"
      cornerRadius={8}
      cornerSmoothing={1}
      data-id={dataId}
      className={`absolute bottom-2 right-2 flex h-10 items-center justify-center overflow-hidden ${
        added ? 'bg-[#0F61FF]' : 'w-10 border-[1.2px] border-[#F2F3F7] bg-white'
      }`}
    >
      <AnimatePresence initial={false}>
        {added && (
          <motion.div
            key="stepper-left"
            data-id={`${dataId}-left`}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={springs.snappy}
            className="flex items-center overflow-hidden"
          >
            <button type="button" data-id={`${dataId}-remove`} aria-label="Remove one" onClick={dec} className="flex h-10 w-10 shrink-0 items-center justify-center">
              <img src={deleteItem} alt="" aria-hidden="true" className="h-6 w-6" />
            </button>
            <span data-id={`${dataId}-count`} className="min-w-6 shrink-0 text-center font-noontree text-[16px] font-semibold leading-[22px] tracking-[-0.15px] text-white">
              {qty}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        data-id={`${dataId}-add`}
        aria-label="Add to cart"
        onClick={inc}
        className="flex h-10 w-10 shrink-0 items-center justify-center"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 6v12M6 12h12" stroke={added ? '#FFFFFF' : '#1D2539'} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </Squircle>
  )
}

export function ComboProductCard({
  image,
  title,
  productCount = '2 Products',
  price,
  comparePrice,
  coupon,
  bordered = false,
  showComboIcon = true,
  comboIcon, // optional image/gif url; falls back to the inline ComboMark
  express = false, // show the "express Today" delivery tag
  width = 170,
  onAdd,
  onQtyChange,
  onWishlist,
  dataId = 'combo-product-card',
}) {
  const did = (s) => `${dataId}-${s}`

  // Bordered variant uses a plain rounded border (a squircle clip-path would
  // clip the right/bottom border away); borderless keeps the smooth squircle.
  const Card = bordered ? 'div' : Squircle
  const cardExtra = bordered ? {} : { as: 'div', cornerRadius: 16, cornerSmoothing: 1 }
  const Media = bordered ? 'div' : Squircle
  const mediaExtra = bordered ? {} : { as: 'div', cornerRadius: 16, cornerSmoothing: 1 }

  return (
    <Card
      data-id={dataId}
      className={`flex shrink-0 flex-col ${bordered ? 'overflow-hidden rounded-xl border border-[#F2F3F7]' : ''}`}
      style={{ width }}
      {...cardExtra}
    >
      {/* Product image */}
      <div data-id={did('media-wrap')} className="relative">
        <Media
          data-id={did('media')}
          className="flex h-[227px] w-full items-center justify-center bg-[#F0F1F6]"
          {...mediaExtra}
        >
          <img data-id={did('image')} src={image} alt="" aria-hidden="true" className="h-[177px] w-auto object-contain" />
        </Media>

        {/* wishlist — shared animated heart (32×32) */}
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton dataId={did('wishlist')} size={32} onChange={onWishlist} />
        </div>

        {/* ATC — squircle stepper */}
        <ComboAtc dataId={did('atc')} onAdd={onAdd} onQtyChange={onQtyChange} />
      </div>

      {/* Detail */}
      <div data-id={did('detail')} className="flex flex-col gap-2 px-2 py-2.5">
        <div data-id={did('info')} className="flex flex-col gap-1">
          {/* banner — combo icon (optional) + "N Products" pill, with the
              Union connector shape behind, left-aligned */}
          <div data-id={did('banner')} className="relative flex w-fit items-center gap-1">
            {showComboIcon && (
              <>
                <svg
                  data-id={did('banner-union')}
                  width="39.6"
                  height="18"
                  viewBox="0 0 40 18"
                  fill="none"
                  aria-hidden="true"
                  className="absolute left-0 top-0 z-0"
                >
                  <path
                    d="M30.6 0C35.5706 0 39.6 4.02944 39.6 9C39.6 13.9706 35.5706 18 30.6 18C27.4749 18 24.7229 16.4068 23.1098 13.9885C22.3482 12.8469 21.1724 11.9399 19.8 11.9399C18.4276 11.9399 17.2518 12.8469 16.4902 13.9885C14.8771 16.4068 12.1251 18 9 18C4.02944 18 0 13.9706 0 9C0 4.02944 4.02944 0 9 0C12.1244 0 14.8755 1.59258 16.4886 4.00994C17.2507 5.15195 18.4271 6.05918 19.8 6.05918C21.1729 6.05918 22.3493 5.15195 23.1114 4.00994C24.7245 1.59258 27.4756 0 30.6 0Z"
                    fill="#E6EFFE"
                  />
                </svg>
                <span data-id={did('banner-icon')} className="relative z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#E6EFFE]">
                  {comboIcon ? (
                    <img src={comboIcon} alt="" aria-hidden="true" className="h-3 w-3 object-contain" />
                  ) : (
                    <ComboMark />
                  )}
                </span>
              </>
            )}
            <span
              data-id={did('banner-label')}
              className={`relative z-10 flex h-[18px] items-center bg-[#E6EFFE] px-2 font-noontree text-[11px] font-semibold leading-[14px] tracking-[-0.1px] text-[#0A49B8] ${
                showComboIcon ? 'rounded-full' : 'rounded'
              }`}
            >
              {productCount}
            </span>
          </div>

          <h3 data-id={did('title')} className="line-clamp-2 min-h-9 font-noontree text-[13px] font-medium leading-[18px] tracking-[-0.1px] text-[#212121]">
            {title}
          </h3>
        </div>

        {/* Pricing */}
        <div data-id={did('pricing')} className="flex flex-col gap-1">
          <div data-id={did('price-group')} className="flex flex-col gap-0">
            <span data-id={did('price')} className="inline-flex w-fit items-center gap-px font-noontree text-[16px] font-bold leading-[22px] tracking-[-0.15px] text-[#1D2539]">
              <Dirham />
              {price}
            </span>
            <div data-id={did('compare')} className="flex items-center gap-1 font-noontree text-[12px] leading-[18px] tracking-[-0.1px]">
              <span data-id={did('compare-vs')} className="text-[#989FB3]">v/s</span>
              <span data-id={did('compare-price')} className="inline-flex items-center gap-px text-[#666D85]">
                <Dirham />
                {comparePrice}
              </span>
              <span data-id={did('compare-label')} className="text-[#666D85]">separately</span>
            </div>
          </div>

          {coupon && (
            <span
              data-id={did('coupon')}
              className="flex h-5 w-fit items-center justify-center rounded bg-[#E3FCF2] px-1 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-[#0B623F]"
              style={{ border: '0.5px dashed #CBF6E5' }}
            >
              {withDirham(coupon)}
            </span>
          )}
        </div>

        {express && (
          <img data-id={did('express')} src={expressTodayTag} alt="express Today" className="h-[18px] w-auto self-start" />
        )}
      </div>
    </Card>
  )
}
