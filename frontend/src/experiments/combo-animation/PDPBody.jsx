// PDPBody — the full product-details page for the combo-animation experiment.
// Composes every section from the noon PDP (hero, main info, offers, delivery,
// payment, details, seller, sponsored rail, combos, reviews). The combos rail
// keeps the live combo-tag animation driven by `comboAnim` (variation 1 =
// chiptop by default), so the floating switcher still works.
//
// Every DOM element carries a namespaced `data-id` (derived from each section's
// base id) so the whole page is addressable for testing / analytics.
import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import { SectionCard, Accordion, ProductCard, ComboGif } from '../../components/common'
import BundleSheet from './BundleSheet'
import BundleContainer from './BundleContainer'
import BundleShowcase from './BundleShowcase'
import BundleShowcase5 from './BundleShowcase5'
import SearchPage from './SearchPage'
import { Dirham, withDirham } from '../../components/common/Dirham'
import ratingStar from '../../assets/icons/rating-star.svg'
import offerIcon from '../../assets/icons/offer.svg'
import bestsellerIcon from '../../assets/icons/bestseller.svg'
import highRatedIcon from '../../assets/icons/high-rated.svg'
import cardIcon from '../../assets/icons/card.svg'
import checkIcon from '../../assets/icons/check.svg'
import lowPriceIcon from '../../assets/icons/low-price.svg'
import expressLogo from '../../assets/icons/express.svg'
import oneMemberLogo from '../../assets/icons/onemember.svg'
import tagLeft from '../../assets/icons/tag-left.svg'
import tagRight from '../../assets/icons/tag-right.svg'
import prevOrderedIcon from '../../assets/icons/previously-ordered.svg'
import enbdIcon from '../../assets/icons/enbd.svg'
import tabbyIcon from '../../assets/icons/tabby.svg'

// Payment-offer icon registry (data references these by key).
const PAY_ICONS = { enbd: enbdIcon, tabby: tabbyIcon }

/* ---------------------------------------------------------------- icons -- */

function ChevronRight({ className = 'h-4 w-4', color = '#1D2539', dataId }) {
  return (
    <svg data-id={dataId} viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d="M6 3.5L10.5 8L6 12.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Medal({ color = '#0A4F4A', className = 'h-6 w-6', dataId }) {
  return (
    <svg data-id={dataId} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`shrink-0 ${className}`}>
      <circle cx="12" cy="9" r="5.2" stroke={color} strokeWidth="1.5" />
      <path d="M9 13.2L7.6 20l4.4-2.4L16.4 20L15 13.2" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 6.6l.8 1.5 1.7.2-1.25 1.2.3 1.7-1.55-.85-1.55.85.3-1.7L9 8.3l1.7-.2z" fill={color} />
    </svg>
  )
}

function StarRow({ value = 5, size = 22, dataId }) {
  const full = Math.round(value)
  return (
    <span data-id={dataId} className="flex items-center" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} data-id={dataId ? `${dataId}-star-${i}` : undefined} width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3.5l2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.8l-5.2 2.75 1-5.75-4.2-4.1 5.8-.85z"
            fill={i < full ? '#13645F' : '#EAECF0'}
          />
        </svg>
      ))}
    </span>
  )
}

/* --------------------------------------------------------------- pieces -- */

// A thin full-bleed row card with a leading icon, text and a trailing chevron.
function EntryRow({ dataId, icon, children, trailing, style, className = '' }) {
  return (
    <button
      type="button"
      data-id={dataId}
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left ${className}`}
      style={style}
    >
      <span data-id={dataId ? `${dataId}-icon` : undefined} className="flex shrink-0 items-center">
        {icon}
      </span>
      <span data-id={dataId ? `${dataId}-content` : undefined} className="min-w-0 flex-1">
        {children}
      </span>
      {trailing ?? <ChevronRight dataId={dataId ? `${dataId}-chevron` : undefined} />}
    </button>
  )
}

/* ----------------------------------------------------------------- hero -- */

function Hero({ images = [], dataId, controlsOpacity }) {
  const [index, setIndex] = useState(0)
  const d = (s) => `${dataId}-${s}`
  return (
    <div
      data-id={dataId}
      className="relative -mx-3 bg-white"
      // White extends up behind the fixed header (real safe area + 56px header).
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}
    >
      <div data-id={d('media')} className="relative z-10 flex h-[min(460px,46dvh)] w-full items-center justify-center overflow-hidden">
        <img
          data-id={d('image')}
          src={images[index]}
          alt=""
          className="h-4/5 w-auto object-contain"
          style={{ aspectRatio: '3 / 4' }}
        />

        {/* 24px transition strip — white → main bg, at the bottom of the media */}
        <div
          data-id={d('fade')}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
          style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)' }}
        />

        {/* 360 view button — hides on scroll */}
        <motion.button
          type="button"
          data-id={d('360')}
          aria-label="360 view"
          className="absolute bottom-5 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(2,6,12,0.15)] bg-white"
          style={{ opacity: controlsOpacity }}
        >
          <img data-id={d('360-icon')} src={prevOrderedIcon} alt="" aria-hidden="true" className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Carousel indicator — only when there is more than one image */}
      {images.length > 1 && (
        <div data-id={d('indicator')} className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              data-id={d(`dot-${i}`)}
              aria-label={`Image ${i + 1}`}
              onClick={() => setIndex(i)}
              className="transition-all"
              style={{
                width: i === index ? 14 : 6,
                height: 6,
                borderRadius: 999,
                background: i === index ? '#000' : 'rgba(0,0,0,0.15)',
              }}
            />
          ))}
        </div>
      )}

    </div>
  )
}

/* ------------------------------------------------------------- main info - */

function MainInfo({ product, dataId, bundleBanner, onPriceHistory }) {
  const {
    store, title, rating, ratingCount, price, originalPrice, discountPercent, vat,
    bestPriceWithOffers, bestsellerRankTop,
  } = product
  const d = (s) => `${dataId}-${s}`
  return (
    <Squircle as="div" cornerRadius={16} cornerSmoothing={1} data-id={dataId} className="overflow-hidden bg-[#E1EFFF]">
      {/* Store row */}
      <div data-id={d('store-row')} className="flex items-center justify-between px-3 pb-2 pt-2.5">
        <div data-id={d('store')} className="flex items-center gap-1">
          <img data-id={d('store-icon')} src={checkIcon} alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span data-id={d('store-name')} className="font-noontree text-[14px] font-bold leading-[18px] tracking-[-0.14px] text-[#0057FF]">
            {store}
          </span>
        </div>
        <button type="button" data-id={d('visit-store')} className="flex items-center gap-0.5">
          <span data-id={d('visit-store-label')} className="font-noontree text-[13px] font-semibold leading-[15px] tracking-[-0.12px] text-[#0057FF]">
            Visit Store
          </span>
          <ChevronRight dataId={d('visit-store-chevron')} className="h-3 w-3" color="#0057FF" />
        </button>
      </div>

      {/* White info card */}
      <Squircle
        as="div"
        cornerRadius={20}
        bottomLeftCornerRadius={0}
        bottomRightCornerRadius={0}
        cornerSmoothing={1}
        data-id={d('info-card')}
        className="flex flex-col gap-3 bg-white p-3"
      >
        {/* Title + badges group (gap 4px) */}
        <div data-id={d('title-badges')} className="flex flex-col gap-1">
        <h1 data-id={d('title')} className="line-clamp-2 min-h-10 font-noontree text-[16px] font-medium leading-5 tracking-[-0.16px] text-[#212121]">
          {title}
        </h1>

        {/* rating + prepaid — both 26px tall (Figma Frame 2147238522 / 2147238521) */}
        <div data-id={d('badges')} className="flex items-center gap-1">
          {/* Rating — #F9F9FB shell, #F7F8FA inner pill */}
          <Squircle as="div" cornerRadius={6} cornerSmoothing={1} data-id={d('rating')} className="flex h-[26px] flex-col items-center justify-center bg-[#F9F9FB] px-1">
            <Squircle as="div" cornerRadius={4} cornerSmoothing={1} data-id={d('rating-inner')} className="flex h-[18px] items-center gap-1 bg-[#F7F8FA] py-0.5">
              <img data-id={d('rating-icon')} src={highRatedIcon} alt="" aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span data-id={d('rating-value')} className="font-noontree text-[13px] font-semibold leading-[14px] tracking-[-0.12px] text-[#101628]">
                {rating}
              </span>
              <span data-id={d('rating-count')} className="font-noontree text-[13px] font-semibold leading-[14px] tracking-[-0.12px] text-[#343D54]">
                ({Number(ratingCount).toLocaleString()} reviews)
              </span>
            </Squircle>
          </Squircle>
          {/* Prepaid Only — #FFF7ED shell */}
          <Squircle as="div" cornerRadius={6} cornerSmoothing={1} data-id={d('prepaid')} className="flex h-[26px] flex-col items-center justify-center bg-[#FFF7ED] px-1">
            <Squircle as="div" cornerRadius={4} cornerSmoothing={1} data-id={d('prepaid-inner')} className="flex h-[18px] items-center gap-1 py-0.5">
              <img data-id={d('prepaid-icon')} src={cardIcon} alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span data-id={d('prepaid-label')} className="font-noontree text-[13px] font-medium leading-[14px] tracking-[-0.12px] text-[#101628]">
                Prepaid Only
              </span>
            </Squircle>
          </Squircle>
        </div>
        </div>

        {/* Price + deal-row group (gap 8px) */}
        <div data-id={d('price-deal')} className="flex flex-col gap-2">
        {/* price */}
        <div data-id={d('price')} className="flex items-end gap-1">
          <span data-id={d('price-now')} className="inline-flex items-center gap-px font-noontree text-[22px] font-bold leading-6 tracking-[-0.2px] text-[#101628]">
            <Dirham />
            {price}
          </span>
          <span data-id={d('price-was')} className="pb-0.5 font-noontree text-[16px] font-normal leading-5 text-[#666D85] line-through">
            {originalPrice}
          </span>
          <span data-id={d('price-discount')} className="pb-0.5 font-noontree text-[14px] font-semibold leading-[18px] text-[#02A31E]">
            {discountPercent}
          </span>
          <span data-id={d('price-vat')} className="pb-0.5 font-noontree text-[14px] font-normal leading-[18px] text-[#666D85]">
            {vat}
          </span>
          {/* tertiary "Price history" — text-only, primary colour, right-aligned */}
          {onPriceHistory && (
            <button
              type="button"
              data-id={d('price-history')}
              onClick={onPriceHistory}
              className="ml-auto pb-0.5 font-noontree text-[13px] font-semibold leading-[15px] tracking-[-0.12px] text-[#0F7EFF] active:text-[#0F61FF]"
            >
              Price history
            </button>
          )}
        </div>

        {/* mega deal + lowest price */}
        <div data-id={d('deal-row')} className="flex items-center gap-1.5">
          <Squircle as="span" cornerRadius={4} cornerSmoothing={1} data-id={d('mega-deal')} className="bg-[#2122B8] px-1.5 py-0.5 font-noontree text-[13px] font-semibold leading-[17px] text-white">
            Mega Deal
          </Squircle>
          <Squircle
            as="span"
            cornerRadius={4}
            cornerSmoothing={1}
            data-id={d('lowest-price')}
            className="flex items-center gap-1 px-1 py-0.5"
            style={{ background: 'linear-gradient(90deg, #F3F5FC 0%, #FFFFFF 107%)' }}
          >
            <img data-id={d('lowest-price-icon')} src={lowPriceIcon} alt="" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
            <span data-id={d('lowest-price-label')} className="font-noontree text-[14px] font-medium leading-[18px] tracking-[-0.14px] text-[#475067]">
              Lowest Price in 30 days
            </span>
          </Squircle>
        </div>
        </div>

        {/* Best Price with offers — Figma Frame 1437253043 (green dashed row) */}
        <Squircle
          as="button"
          type="button"
          cornerRadius={8}
          cornerSmoothing={1}
          data-id={d('best-price')}
          className="flex h-9 w-full items-center gap-2 self-stretch px-2"
          style={{ background: 'linear-gradient(90deg, #E6FFF3 0%, #FFFFFF 100%)' }}
        >
          <img data-id={d('best-price-icon')} src={offerIcon} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
          <span data-id={d('best-price-text')} className="flex flex-1 items-center gap-1 font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#0E0E0E]">
            Best Price
            <span data-id={d('best-price-amount')} className="inline-flex items-center gap-px text-[#0B623F]">
              <Dirham />
              {bestPriceWithOffers}
            </span>
            with offers
          </span>
          <ChevronRight dataId={d('best-price-chevron')} className="h-4 w-4" color="#1D2539" />
        </Squircle>

        {/* optional bundle banner slot (variation 3) — sits below Best Price */}
        {bundleBanner}

        {/* Bestseller rank — Figma Frame 2147238529 (grey #F9F9FB row) */}
        <Squircle
          as="button"
          type="button"
          cornerRadius={10}
          cornerSmoothing={1}
          data-id={d('bestseller')}
          className="flex h-9 w-full items-center justify-between gap-2.5 self-stretch bg-[#F9F9FB] px-2"
        >
          <div data-id={d('bestseller-content')} className="flex items-center gap-2">
            <img data-id={d('bestseller-icon')} src={bestsellerIcon} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
            <span data-id={d('bestseller-text')} className="flex items-center gap-1 font-noontree text-[14px] font-normal leading-[19px] tracking-[-0.14px] text-[#1D2539]">
              Bestseller
              <span data-id={d('bestseller-rank')} className="font-semibold">{bestsellerRankTop.rank}</span>
              in
              <span data-id={d('bestseller-category')} className="font-semibold text-[#0057FF]">{bestsellerRankTop.category}</span>
            </span>
          </div>
          <ChevronRight dataId={d('bestseller-chevron')} className="h-4 w-4" color="#1D2539" />
        </Squircle>
      </Squircle>
    </Squircle>
  )
}

/* ---------------------------------------------------------------- seller - */

function SellerWidget({ seller, dataId }) {
  const d = (s) => `${dataId}-${s}`
  return (
    <div data-id={dataId} className="flex flex-col gap-4 rounded-2xl bg-white p-3">
      <div data-id={d('header')} className="flex items-start gap-2">
        <div data-id={d('avatar')} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#F2F3F7]">
          <svg data-id={d('avatar-icon')} width="28" height="28" viewBox="0 0 30 30" fill="none" aria-hidden="true">
            <path d="M5 11l2-5h16l2 5v2a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0zM6 13v11h18V13" stroke="#343D54" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <div data-id={d('info')} className="flex flex-1 flex-col gap-1.5">
          <button type="button" data-id={d('name-row')} className="flex items-center gap-0.5">
            <span data-id={d('sold-by')} className="font-noontree text-[14px] font-normal leading-[18px] tracking-[-0.14px] text-[rgba(2,6,12,0.92)]">
              Sold by
            </span>
            <span data-id={d('name')} className="font-noontree text-[14px] font-bold leading-[18px] tracking-[-0.14px] text-[rgba(2,6,12,0.92)]">
              {seller.name}
            </span>
            <ChevronRight dataId={d('name-chevron')} className="h-4 w-4" />
          </button>
          <div data-id={d('rating-row')} className="flex items-center gap-1">
            <div data-id={d('rating')} className="flex items-center gap-1 rounded bg-[#F7F8FA] px-1.5 py-0.5">
              <img data-id={d('rating-star')} src={ratingStar} alt="" aria-hidden="true" className="h-3 w-3" />
              <span data-id={d('rating-value')} className="font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-[#101628]">
                {seller.rating} ({seller.ratingCount})
              </span>
            </div>
            <span data-id={d('positive')} className="rounded-full bg-[#F9F9FB] px-2 py-1 font-noontree text-[12px] font-bold leading-[14px] tracking-[-0.12px] text-[#13645F]">
              {seller.positive}
            </span>
          </div>
        </div>
      </div>

      {/* trust chips */}
      <div data-id={d('chips')} className="flex flex-wrap gap-2">
        {seller.tags.map((t, i) => (
          <span
            key={t}
            data-id={d(`chip-${i}`)}
            className="flex items-center gap-1 rounded-full border border-[#F5F5F5] px-2 py-1.5 font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#475067]"
          >
            <span data-id={d(`chip-${i}-dot`)} className="h-1.5 w-1.5 rounded-full bg-[#13645F]" />
            {t}
          </span>
        ))}
      </div>

      <div data-id={d('subtitle')} className="rounded-[10px] bg-[#F9F9FB] px-2 py-3 font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#475067]">
        {seller.subtitle}
      </div>

      <span data-id={d('divider')} className="h-px w-full border-t border-dashed border-[#F3F3F7]" />

      {/* other offers */}
      <EntryRow
        dataId={d('offers')}
        className="!px-3"
        style={{ background: '#EFF7FF' }}
        icon={
          <span data-id={d('offers-icon')} className="flex h-4 w-4 items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="#343D54" strokeWidth="1.3" />
            </svg>
          </span>
        }
      >
        <span data-id={d('offers-text')} className="font-noontree text-[14px] font-normal leading-[18px] tracking-[-0.14px] text-[#475067]">
          {withDirham(`${seller.otherOffers.count} offers from other sellers from AED${seller.otherOffers.from}`)}
        </span>
      </EntryRow>
    </div>
  )
}

/* -------------------------------------------------------------- reviews -- */

function ReviewSummary({ data, dataId }) {
  const d = (s) => `${dataId}-${s}`
  return (
    <div data-id={dataId} className="flex flex-col gap-3 rounded-2xl bg-white p-3">
      <h2 data-id={d('title')} className="font-noontree text-[15px] font-bold leading-[17px] tracking-[-0.28px] text-[#101628]">
        Ratings &amp; Reviews
      </h2>

      <div data-id={d('summary')} className="flex flex-col gap-1">
        <div data-id={d('score-row')} className="flex items-center gap-1">
          <span data-id={d('score')} className="font-figtree text-[22px] font-extrabold italic leading-6 tracking-[-0.2px] text-[#0E0E0E]">
            {data.rating}
          </span>
          <StarRow dataId={d('stars')} value={Math.round(Number(data.rating))} />
        </div>
        <span data-id={d('subtitle')} className="font-figtree text-[12px] font-normal italic leading-[18px] text-[#475067]">
          Avg. rating based on {data.reviewCount} reviews from trusted sources
        </span>
      </div>

      {/* noon AI summary */}
      <div
        data-id={d('ai')}
        className="flex flex-col gap-3 rounded-xl p-3"
        style={{ background: 'linear-gradient(90deg, rgba(65,70,206,0.04) 0%, rgba(191,61,235,0.04) 100%)' }}
      >
        <div data-id={d('ai-header')} className="flex items-center gap-1">
          <span
            data-id={d('ai-title')}
            className="font-noontree text-[14px] font-semibold leading-[18px] tracking-[-0.14px]"
            style={{
              background: 'linear-gradient(90deg, rgba(65,70,206,0.92) 0%, rgba(191,61,235,0.92) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {data.reviewCount} reviews, summary by noon AI
          </span>
          <span
            data-id={d('ai-sparkle')}
            className="h-3 w-3 rounded-full"
            style={{ background: 'radial-gradient(50% 50% at 50% 50%, #F4E1F7 0%, #EC88FC 100%)' }}
          />
        </div>
        <ul data-id={d('ai-bullets')} className="flex flex-col gap-2">
          {data.bullets.map((b, i) => (
            <li key={i} data-id={d(`ai-bullet-${i}`)} className="flex gap-2">
              <span data-id={d(`ai-bullet-${i}-dot`)} className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D2539]" />
              <span data-id={d(`ai-bullet-${i}-text`)} className="font-noontree text-[14px] font-normal leading-[18px] tracking-[-0.14px] text-[#1D2539]">
                {b}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- body -- */

export default function PDPBody({
  product,
  combos = [],
  similar = [],
  topProducts,
  productDetails = [],
  paymentOffers = [],
  deliveryInfo,
  seller,
  reviewSummary,
  bundle,
  plp,
  variant = 1,
  comboAnim = 'chiptop',
  comboStagger = 800,
  idPrefix = 'combo',
  onPriceHistory,
}) {
  const id = (s) => (idPrefix ? `${idPrefix}-${s}` : s)
  const [bundleOpen, setBundleOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Parallax hero: as the page scrolls, the pinned hero scales down and fades
  // out (reaching 0 by the time the content below reaches the top), while the
  // sections scroll up over it.
  const heroRef = useRef(null)
  const heroProgress = useMotionValue(0)
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.86])
  // 360 button hides as soon as the user starts scrolling
  const heroControlsOpacity = useTransform(heroProgress, [0, 0.06], [1, 0])
  useEffect(() => {
    const wrap = heroRef.current
    const scroller = wrap?.closest('[data-id="combo-experiment-main"]')
    if (!wrap || !scroller) return undefined
    const onScroll = () => {
      const h = wrap.offsetHeight || 1
      heroProgress.set(Math.min(1, Math.max(0, scroller.scrollTop / h)))
    }
    onScroll()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [heroProgress])

  const comboCards = combos.map((c, i) => (
    <ProductCard
      key={c.id}
      dataId={id(`combo-${c.id}`)}
      comboAnim={comboAnim}
      comboDelay={i * comboStagger}
      width={140}
      {...c}
    />
  ))

  return (
    <div
      data-id={id('page')}
      className="flex flex-col px-3"
      style={{
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)',
      }}
    >
      <motion.div
        ref={heroRef}
        data-id={id('hero-parallax')}
        className="sticky top-0 z-0"
        style={{ scale: heroScale, transformOrigin: 'center' }}
      >
        <Hero images={product.images} dataId={id('hero')} controlsOpacity={heroControlsOpacity} />
      </motion.div>

      {/* Content sheet — opaque, full-bleed surface that scrolls up over the
          pinned hero (so the hero only peeks at the top edge, never through the
          gaps between cards). */}
      <div data-id={id('content')} className="relative z-10 -mx-3 flex flex-col gap-3 bg-[#F7F8FA] px-3">
      <MainInfo
        product={product}
        dataId={id('main-info')}
        onPriceHistory={onPriceHistory}
        bundleBanner={
          variant === 3 || variant === 5 ? (
            /* Variation 3 — bundle banner below Best Price (same 36px height),
               left→right gradient, single line + serrated ticket */
            <Squircle
              as="button"
              type="button"
              cornerRadius={8}
              cornerSmoothing={1}
              data-id={id('bundle')}
              onClick={() => setBundleOpen(true)}
              className="flex h-9 w-full items-center gap-2 self-stretch pl-1 pr-2"
              style={{ background: 'linear-gradient(270deg, #FFFFFF 0%, #D6E9FF 100%)' }}
            >
              <span data-id={id('bundle-icon')} className="flex h-6 w-6 shrink-0 items-center justify-center">
                <ComboGif dataId={id('bundle-gif')} className="h-5 w-5" />
              </span>
              <span data-id={id('bundle-title-row')} className="flex flex-1 items-center gap-1.5">
                <span data-id={id('bundle-title')} className="font-noontree text-[14px] font-bold leading-[18px] tracking-[-0.14px] text-[#242A34]">
                  Bundle &amp; save
                </span>
                <span data-id={id('bundle-tag')} className="flex items-center">
                  <svg width="4" height="20" viewBox="0 0 4 20" fill="none" aria-hidden="true" className="shrink-0">
                    <path d="M3.14258 20H0V18.5713C0.86787 18.5713 1.57129 17.9316 1.57129 17.1426C1.57116 16.3537 0.867791 15.7139 0 15.7139V14.2852C0.867721 14.2851 1.57105 13.6462 1.57129 12.8574C1.57129 12.1179 0.953321 11.5089 0.161133 11.4355L0 11.4287V9.28516C0.867721 9.28515 1.57105 8.64621 1.57129 7.85742C1.57129 7.11789 0.953321 6.50889 0.161133 6.43555L0 6.42871V4.28516C0.867721 4.28515 1.57105 3.64621 1.57129 2.85742C1.57129 2.11789 0.953321 1.50889 0.161133 1.43555L0 1.42871V0H3.14258V20Z" fill="#2122B8" />
                  </svg>
                  <span data-id={id('bundle-tag-label')} className="-mx-px flex h-5 items-center bg-[#2122B8] px-1 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-white">
                    <span className="inline-flex items-center gap-1">
                      <span>upto</span>
                      <span className="inline-flex items-center gap-px">
                        <Dirham />
                        {bundle?.savings ?? '20'}
                      </span>
                    </span>
                  </span>
                  <svg width="4" height="20" viewBox="0 0 4 20" fill="none" aria-hidden="true" className="shrink-0">
                    <path d="M3.14258 1.42871C2.27482 1.42884 1.57129 2.06852 1.57129 2.85742C1.57153 3.64613 2.27497 4.28503 3.14258 4.28516V6.42871C2.27482 6.42884 1.57129 7.06852 1.57129 7.85742C1.57153 8.64613 2.27497 9.28503 3.14258 9.28516V11.4287C2.27482 11.4288 1.57129 12.0685 1.57129 12.8574C1.57153 13.6461 2.27497 14.285 3.14258 14.2852V15.7139C2.2749 15.714 1.57142 16.3538 1.57129 17.1426C1.57129 17.9315 2.27482 18.5712 3.14258 18.5713V20H0V0H3.14258V1.42871Z" fill="#2122B8" />
                  </svg>
                </span>
              </span>
              <ChevronRight dataId={id('bundle-chevron')} className="h-4 w-4" color="#0A4F4A" />
            </Squircle>
          ) : undefined
        }
      />

      {/* Bundle up & save (combo entry) */}
      {variant === 2 ? (
        /* Variation 2 — gradient "Bundle & save" card (Figma "Bestseller") */
        <button
          type="button"
          data-id={id('bundle')}
          onClick={() => setBundleOpen(true)}
          className="flex h-[62px] w-full items-center gap-2.5 self-stretch rounded-2xl border border-white py-1.5 pl-1 pr-3"
          style={{ background: 'linear-gradient(95.67deg, #FFFFFF -14.82%, #D6E9FF 141.32%)' }}
        >
          <span data-id={id('bundle-left')} className="flex min-w-0 flex-1 items-center gap-0.5">
            <span data-id={id('bundle-icon')} className="flex h-[42px] w-11 shrink-0 items-center justify-center">
              <ComboGif dataId={id('bundle-gif')} className="h-6 w-6" />
            </span>
            <span data-id={id('bundle-text')} className="flex min-w-0 flex-col gap-0.5 text-left">
              <span data-id={id('bundle-title-row')} className="flex items-center gap-1.5">
                <span data-id={id('bundle-title')} className="font-noontree text-[14px] font-bold leading-[18px] tracking-[-0.14px] text-[#242A34]">
                  Bundle &amp; save
                </span>
                {/* savings ribbon tag — Figma Frame 2147241800 */}
                <span data-id={id('bundle-tag')} className="flex h-[18px] items-center">
                  <img src={tagLeft} alt="" aria-hidden="true" className="h-[18px] w-auto" />
                  <span data-id={id('bundle-tag-label')} className="-mx-px flex h-[18px] items-center bg-[#082F8C] pr-1 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-white">
                    <span className="inline-flex items-center gap-1">
                      <span>upto</span>
                      <span className="inline-flex items-center gap-px">
                        <Dirham />5
                      </span>
                    </span>
                  </span>
                  <img src={tagRight} alt="" aria-hidden="true" className="h-[18px] w-auto" />
                </span>
              </span>
              <span data-id={id('bundle-subtitle')} className="font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#5D5D5D]">
                you save more when you buy together
              </span>
            </span>
          </span>
          <ChevronRight dataId={id('bundle-chevron')} className="h-5 w-5" color="#0A4F4A" />
        </button>
      ) : variant === 3 || variant === 5 ? null : (
        /* Variation 1 — Figma Frame 2147238531 */
        <button
          type="button"
          data-id={id('bundle')}
          onClick={() => setBundleOpen(true)}
          className="flex h-10 w-full items-center gap-3 self-stretch rounded-lg bg-white pl-2.5 pr-2"
        >
          <span data-id={id('bundle-icon')} className="flex h-[22px] w-5 shrink-0 items-center justify-center">
            <ComboGif dataId={id('bundle-gif')} className="h-5 w-5" />
          </span>
          <span data-id={id('bundle-text')} className="flex-1 text-left font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#1D2539]">
            {withDirham('Bundle up & save upto AED20')}
          </span>
          <span data-id={id('bundle-right')} className="flex items-center gap-1">
            <span data-id={id('bundle-combo-count')} className="flex h-5 items-center rounded-xl bg-[#EBF4FF] px-1.5 font-noontree text-[11px] font-semibold leading-[14px] tracking-[-0.1px] text-[#082F8C]">
              1 Combo
            </span>
            <ChevronRight dataId={id('bundle-chevron')} className="h-4 w-4" color="#1D2539" />
          </span>
        </button>
      )}

      {/* Everything below the bundle — grouped on the main background */}
      <div data-id={id('content-group')} className="-mx-3 flex flex-col gap-3 bg-[#F7F8FA] px-3">

      {/* Delivery information */}
      <Squircle as="div" cornerRadius={16} cornerSmoothing={1} data-id={id('delivery')} className="flex flex-col gap-3 bg-white p-3">
        <div data-id={id('delivery-header')} className="flex items-center justify-between">
          <h2 data-id={id('delivery-title')} className="font-noontree text-[15px] font-bold leading-[17px] tracking-[-0.28px] text-[#101628]">
            Delivery Information
          </h2>
          <span data-id={id('delivery-member')} className="flex items-center gap-1">
            <img data-id={id('delivery-member-logo')} src={oneMemberLogo} alt="" aria-hidden="true" className="h-5 w-auto shrink-0" />
            <span data-id={id('delivery-member-label')} className="text-right font-noontree text-[12px] font-normal leading-[18px] tracking-[-0.14px] text-[#666D85]">
              member
            </span>
          </span>
        </div>
        <div data-id={id('delivery-express')} className="rounded-xl border border-[#F2F3F7] p-3">
          <div data-id={id('delivery-express-row')} className="flex items-center gap-2">
            <img data-id={id('delivery-express-logo')} src={expressLogo} alt="express" className="h-4 w-auto shrink-0" />
            <span data-id={id('delivery-express-text')} className="font-noontree text-[14px] font-normal leading-[17px] text-[#1D2539]">
              {deliveryInfo.express}
            </span>
          </div>
        </div>
        <Squircle as="button" type="button" cornerRadius={12} cornerSmoothing={1} data-id={id('delivery-options')} className="flex items-center justify-between bg-[#F9F9FB] px-3 py-3">
          <span data-id={id('delivery-options-label')} className="font-noontree text-[14px] font-semibold leading-[17px] text-[#475067]">
            Other Delivery Options
          </span>
          <svg data-id={id('delivery-options-chevron')} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M6 8l4 4 4-4" stroke="#5D5D5D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Squircle>
      </Squircle>

      {/* Sponsored ad strip — Figma Frame 1261154679: bordered product card
          (thumb tile + title / rating chip / price row with express tag) */}
      <div data-id={id('ad-strip')} className="flex h-[88px] items-center gap-4 rounded-2xl bg-white py-1 pl-1 pr-3">
        <div data-id={id('ad-strip-body')} className="flex min-w-0 flex-1 items-center gap-2.5 p-1">
          {/* thumb — 53×72 rounded tile with a faint blue wash */}
          <div
            data-id={id('ad-strip-thumb')}
            className="relative h-[72px] w-[53px] shrink-0 overflow-hidden rounded-[9px]"
            style={{ background: 'rgba(0, 40, 136, 0.03)' }}
          >
            <img
              data-id={id('ad-strip-image')}
              src="https://f.nooncdn.com/p/pzsku/ZD3E2C2095909F7BE8042Z/45/1764762084/8e224320-48af-4928-ba84-5f31fc781aa9.jpg?width=480"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 m-auto h-[62px] w-auto rounded-[9px] object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>

          {/* info column */}
          <div data-id={id('ad-strip-info')} className="flex min-w-0 flex-1 flex-col gap-2">
            <div data-id={id('ad-strip-head')} className="flex flex-col gap-0.5">
              <span data-id={id('ad-strip-title')} className="truncate font-noontree text-[14px] font-medium leading-[18px] tracking-[-0.14px] text-[#212121]">
                TCF09 40W Dual USB-C / Type-C 2PD Mini
              </span>
              {/* rating chip — same star as combo-main-info-rating */}
              <span data-id={id('ad-strip-rating')} className="flex h-[18px] w-fit items-center gap-0.5 rounded bg-[#F9F9FB] px-[3px]">
                <img data-id={id('ad-strip-rating-star')} src={ratingStar} alt="" aria-hidden="true" className="h-3 w-3" />
                <span data-id={id('ad-strip-rating-value')} className="font-noontree text-[13px] font-semibold leading-[14px] tracking-[-0.12px] text-[#101628]">
                  4.3
                </span>
              </span>
            </div>

            {/* price row */}
            <div data-id={id('ad-strip-pricing')} className="flex items-end gap-1">
              <span data-id={id('ad-strip-price')} className="inline-flex items-center gap-px font-noontree text-[16px] font-bold leading-5 tracking-[-0.16px] text-[#1D2539]">
                <Dirham />125
              </span>
              <span data-id={id('ad-strip-price-was')} className="inline-flex items-center gap-px pb-0.5 font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#989FB3] line-through">
                <Dirham />209
              </span>
              <span data-id={id('ad-strip-off')} className="pb-0.5 font-noontree text-[12px] font-semibold leading-[14px] tracking-[-0.12px] text-[#02A31E]">
                47% OFF
              </span>
              <img data-id={id('ad-strip-express')} src={expressLogo} alt="express" className="mb-0.5 ml-1 h-[14px] w-auto shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment offers */}
      <div data-id={id('payment')} className="flex flex-col gap-3 rounded-2xl bg-white p-3">
        <h2 data-id={id('payment-title')} className="font-noontree text-[15px] font-bold leading-[17px] tracking-[-0.28px] text-[#101628]">
          Payment offers
        </h2>
        {/* coupon-content carousel (Figma Frame 2147225785) */}
        <div data-id={id('payment-rail')} className="scrollbar-hide -mx-3 flex gap-2 overflow-x-auto px-3">
          {paymentOffers.map((o) => (
            <div
              key={o.id}
              data-id={id(`payment-card-${o.id}`)}
              className="flex w-[300px] shrink-0 items-center gap-2 rounded-[10px] border border-[#F2F3F7] p-2"
            >
              <img data-id={id(`payment-${o.id}-icon`)} src={PAY_ICONS[o.icon]} alt="" aria-hidden="true" className="h-10 w-[60px] shrink-0" />
              <div data-id={id(`payment-${o.id}-copy`)} className="flex min-w-0 flex-col gap-0.5">
                <span className="font-noontree text-[13px] leading-[17px] tracking-[-0.12px] text-[#0E0E0E]">
                  <span className="font-bold">{o.title}</span>
                  {o.titleRest ? ` ${o.titleRest}` : ''}
                </span>
                <span className="font-noontree text-[13px] font-normal leading-[16px] tracking-[-0.12px] text-[#666D85]">
                  {o.subtitle}
                </span>
                {o.cta && (
                  <span data-id={id(`payment-${o.id}-cta`)} className="font-noontree text-[13px] font-semibold leading-[17px] text-[#0057FF]">
                    {o.cta}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product details accordion */}
      <SectionCard dataId={id('section-details')} title="Product Details">
        <Accordion items={productDetails} dataId={id('accordion')} />
      </SectionCard>

      {/* Buy together and save — inline section (same container as the sheet,
          without the Done footer) */}
      {bundle?.items?.length > 0 &&
        (variant === 3 ? (
          <BundleShowcase
            dataId={id('section-bundle')}
            items={bundle.items}
            off={bundle.off}
            viewAll={bundle.viewAll}
            benefits={bundle.benefits}
            onViewAll={() => setSearchOpen(true)}
          />
        ) : variant === 5 ? (
          <BundleShowcase5
            dataId={id('section-bundle')}
            items={bundle.items}
            savings={bundle.savings}
            viewAll={bundle.viewAll}
            bleed={false}
            onViewAll={() => setSearchOpen(true)}
          />
        ) : (
          <BundleContainer
            dataId={id('section-bundle')}
            items={bundle.items}
            savings={bundle.savings}
            viewAll={bundle.viewAll}
            onViewAll={() => setSearchOpen(true)}
            showComboIcon={variant !== 2}
          />
        ))}

      {/* Bestseller #1 card */}
      <div
        data-id={id('bestseller-bottom')}
        className="flex items-center gap-1.5 rounded-2xl border border-white p-3"
        style={{ background: 'linear-gradient(95deg, #FFFFFF -15%, #E8FCFA 141%)' }}
      >
        <Medal dataId={id('bestseller-bottom-icon')} className="h-10 w-10" color="#0A4F4A" />
        <div data-id={id('bestseller-bottom-copy')} className="flex flex-1 flex-col gap-0.5">
          <span data-id={id('bestseller-bottom-rank')} className="font-noontree text-[14px] leading-[18px] tracking-[-0.14px] text-[#242A34]">
            <span data-id={id('bestseller-bottom-rank-label')} className="font-bold">Ranked {product.bestsellerRankBottom.rank}</span>
            <span data-id={id('bestseller-bottom-in')} className="italic text-[#5D5D5D]"> in </span>
            <span data-id={id('bestseller-bottom-category')} className="font-semibold text-[#0A4F4A]">{product.bestsellerRankBottom.category}</span>
          </span>
          <span data-id={id('bestseller-bottom-cta')} className="font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#5D5D5D]">
            Explore other bestsellers
          </span>
        </div>
        <ChevronRight dataId={id('bestseller-bottom-chevron')} className="h-5 w-5" color="#0A4F4A" />
      </div>

      {/* Seller widget */}
      <SellerWidget seller={seller} dataId={id('seller')} />

      {/* Sponsored top products rail */}
      <SectionCard
        dataId={id('section-top-products')}
        title={`Top products in ${topProducts.brand}`}
        actionLabel={`Shop ${topProducts.brand}`}
        onAction={() => {}}
      >
        <div data-id={id('top-products-rail')} className="scrollbar-hide -mx-3 flex gap-3 overflow-x-auto px-3 pb-1">
          {topProducts.items.map((p) => (
            <ProductCard
              key={p.id}
              dataId={id(`top-${p.id}`)}
              width={160}
              discountTone="green"
              {...p}
            />
          ))}
        </div>
      </SectionCard>

      {/* Combos rail — the variation-1 combo animation (chiptop by default). */}
      <div
        data-id={id('section-combos')}
        className="-mx-3 flex flex-col gap-5 pb-4 pt-4"
        style={{ background: 'linear-gradient(360deg, #FFFFFF 0%, #F0F7FF 100%)' }}
      >
        <div data-id={id('combos-header')} className="flex flex-col gap-0.5 px-5">
          <span data-id={id('combos-title')} className="font-noontree text-[16px] font-semibold leading-5 tracking-[-0.1px] text-[rgba(2,6,12,0.92)]">
            Frequently bought together
          </span>
          <span data-id={id('combos-subtitle')} className="font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#666D85]">
            buy together and unlock extra savings
          </span>
        </div>
        <div data-id={id('combos-rail')} className="scrollbar-hide flex gap-3 overflow-x-auto px-5 pb-1">
          {comboCards}
        </div>
      </div>

      {/* Ratings & reviews */}
      <ReviewSummary data={reviewSummary} dataId={id('reviews')} />

      {/* Similar products */}
      <SectionCard dataId={id('section-similar')} title="Similar Products">
        <div data-id={id('similar-rail')} className="scrollbar-hide -mx-3 flex gap-3 overflow-x-auto px-3 pb-1">
          {similar.map((p) => (
            <ProductCard
              key={p.id}
              dataId={id(`similar-${p.id}`)}
              discountTone="green"
              {...p}
            />
          ))}
        </div>
      </SectionCard>
      </div>
      </div>

      {/* Buy together and save — bottom sheet */}
      <BundleSheet
        open={bundleOpen}
        onClose={() => setBundleOpen(false)}
        items={bundle?.items ?? []}
        savings={bundle?.savings}
        viewAll={bundle?.viewAll}
        onViewAll={() => {
          setBundleOpen(false)
          setSearchOpen(true)
        }}
        showComboIcon={variant !== 2}
        rowCards={variant === 4}
        dataId={id('bundle-sheet')}
      />

      {/* Search / PLP — slides in from the right */}
      {plp && (
        <SearchPage
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          plp={plp}
          bundle={bundle}
          variant={variant}
        />
      )}
    </div>
  )
}
