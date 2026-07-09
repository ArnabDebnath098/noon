// PDPBody — the full product-details page for the combo-animation experiment.
// Composes every section from the noon PDP (hero, main info, offers, delivery,
// payment, details, seller, sponsored rail, combos, reviews). The combos rail
// keeps the live combo-tag animation driven by `comboAnim` (variation 1 =
// chiptop by default), so the floating switcher still works.
//
// Every DOM element carries a namespaced `data-id` (derived from each section's
// base id) so the whole page is addressable for testing / analytics.
import { useState, useEffect } from 'react'
import { Squircle } from 'corner-smoothing'
import { SectionCard, Accordion, ProductCard } from '../../components/common'
import BundleSheet from './BundleSheet'
import BundleContainer from './BundleContainer'
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

// Bundle combo animation — a GIF authored to loop infinitely (27 frames ≈ 4.81s).
const COMBO_GIF = 'https://f.nooncdn.com/s/app/com/noon/images/combo-animated.gif'
const COMBO_GIF_MS = 4810

/**
 * LoopingGif — renders an animated GIF and guarantees it keeps looping. The GIF
 * loops on its own in normal browsers; some webviews stop it after the first
 * pass, so we remount it once per loop via an incrementing `key`. The src is
 * unchanged (served from cache — no refetch) and the remount is timed to the
 * loop boundary, so the restart is seamless.
 */
function LoopingGif({ src, durationMs, dataId, className, alt = '' }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), durationMs)
    return () => clearInterval(t)
  }, [durationMs])
  return (
    <img
      key={tick}
      data-id={dataId}
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={className}
    />
  )
}

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

function Hero({ images = [], dataId }) {
  const [index, setIndex] = useState(0)
  const d = (s) => `${dataId}-${s}`
  return (
    <div
      data-id={dataId}
      className="relative -mx-3 bg-white"
      // White extends up behind the fixed header (real safe area + 56px header)
      // so the header's white→transparent gradient never exposes the grey page
      // background in the unscrolled state.
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}
    >
      <div data-id={d('media')} className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          data-id={d('image')}
          src={images[index]}
          alt=""
          className="h-full w-full object-contain"
        />

        {/* 360 view button */}
        <button
          type="button"
          data-id={d('360')}
          aria-label="360 view"
          className="absolute bottom-5 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(2,6,12,0.15)] bg-white"
        >
          <svg data-id={d('360-icon')} width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path d="M11 5.5a5.5 5.5 0 103.9 1.6" stroke="#101628" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 4.5l1.5 2-2.4.9" stroke="#101628" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
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

function MainInfo({ product, dataId }) {
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
  paymentOffer,
  deliveryInfo,
  seller,
  reviewSummary,
  bundle,
  plp,
  variant = 1,
  comboAnim = 'chiptop',
  comboStagger = 800,
  idPrefix = 'combo',
}) {
  const id = (s) => (idPrefix ? `${idPrefix}-${s}` : s)
  const [bundleOpen, setBundleOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

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
      className="flex flex-col gap-3 px-3"
      style={{
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)',
      }}
    >
      <Hero images={product.images} dataId={id('hero')} />

      <MainInfo product={product} dataId={id('main-info')} />

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
              <LoopingGif dataId={id('bundle-gif')} src={COMBO_GIF} durationMs={COMBO_GIF_MS} className="h-6 w-6" />
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
      ) : (
        /* Variation 1 — Figma Frame 2147238531 */
        <button
          type="button"
          data-id={id('bundle')}
          onClick={() => setBundleOpen(true)}
          className="flex h-10 w-full items-center gap-3 self-stretch rounded-lg bg-white pl-2.5 pr-2"
        >
          <span data-id={id('bundle-icon')} className="flex h-[22px] w-5 shrink-0 items-center justify-center">
            <LoopingGif
              dataId={id('bundle-gif')}
              src={COMBO_GIF}
              durationMs={COMBO_GIF_MS}
              className="h-5 w-5"
            />
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

      {/* Sponsored ad strip — Figma Frame 1261154665 */}
      <div data-id={id('ad-strip')} className="flex h-[35px] items-stretch overflow-hidden rounded-md border border-[#F5F5F5] bg-white">
        {/* thumb — full-height #FCFCFD tile, flush left */}
        <div data-id={id('ad-strip-thumb')} className="flex w-[30px] shrink-0 items-center justify-center bg-[#FCFCFD]">
          <img
            data-id={id('ad-strip-image')}
            src="https://f.nooncdn.com/p/pzsku/ZD3E2C2095909F7BE8042Z/45/1764762084/8e224320-48af-4928-ba84-5f31fc781aa9.jpg?width=480"
            alt=""
            aria-hidden="true"
            className="h-[30px] w-auto object-contain"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>
        <span data-id={id('ad-strip-title')} className="ml-2 min-w-0 flex-1 self-center truncate font-figtree text-[12px] font-normal italic leading-[14px] tracking-[-0.12px] text-[#404553]">
          Garnier Ultra Doux Rice Water
        </span>
        {/* price + express */}
        <div data-id={id('ad-strip-right')} className="flex shrink-0 items-center gap-2 px-2">
          <span data-id={id('ad-strip-price')} className="inline-flex items-center gap-px font-noontree text-[16px] font-bold leading-5 tracking-[-0.16px] text-[#404553]">
            <Dirham />125
          </span>
          <img data-id={id('ad-strip-express')} src={expressLogo} alt="express" className="h-4 w-auto shrink-0" />
        </div>
        {/* Ad corner tab — bottom-right, rounded top-left */}
        <div data-id={id('ad-strip-ad-col')} className="flex shrink-0 flex-col justify-end">
          <span data-id={id('ad-strip-tag')} className="rounded-tl-[4px] bg-[#F0F2F7] px-1 text-center font-figtree text-[11px] italic leading-[12px] tracking-[-0.12px] text-[#7E859B]">
            Ad
          </span>
        </div>
      </div>

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
        <Squircle as="div" cornerRadius={12} cornerSmoothing={1} data-id={id('delivery-express')} className="border border-[#F2F3F7] p-3">
          <div data-id={id('delivery-express-row')} className="flex items-center gap-2">
            <img data-id={id('delivery-express-logo')} src={expressLogo} alt="express" className="h-4 w-auto shrink-0" />
            <span data-id={id('delivery-express-text')} className="font-noontree text-[14px] font-normal leading-[17px] text-[#1D2539]">
              {deliveryInfo.express}
            </span>
          </div>
        </Squircle>
        <Squircle as="button" type="button" cornerRadius={12} cornerSmoothing={1} data-id={id('delivery-options')} className="flex items-center justify-between bg-[#F9F9FB] px-3 py-3">
          <span data-id={id('delivery-options-label')} className="font-noontree text-[14px] font-semibold leading-[17px] text-[#475067]">
            Other Delivery Options
          </span>
          <svg data-id={id('delivery-options-chevron')} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M6 8l4 4 4-4" stroke="#5D5D5D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Squircle>
      </Squircle>

      {/* Payment offers */}
      <div data-id={id('payment')} className="flex flex-col gap-3 rounded-2xl bg-white p-3">
        <h2 data-id={id('payment-title')} className="font-noontree text-[15px] font-bold leading-[17px] tracking-[-0.28px] text-[#101628]">
          Payment offers
        </h2>
        <div data-id={id('payment-card')} className="flex items-center justify-between rounded-[10px] border border-[#F2F3F7] p-2">
          <div data-id={id('payment-left')} className="flex items-center gap-2">
            <div data-id={id('payment-logo')} className="flex h-10 w-[60px] items-center justify-center rounded bg-white">
              <svg data-id={id('payment-logo-icon')} width="34" height="26" viewBox="0 0 40 30" fill="none" aria-hidden="true">
                <rect x="2" y="6" width="36" height="20" rx="3" stroke="#343D54" strokeWidth="1.6" />
                <path d="M2 12h36" stroke="#343D54" strokeWidth="1.6" />
              </svg>
            </div>
            <div data-id={id('payment-copy')} className="flex flex-col">
              <span data-id={id('payment-title-text')} className="font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#666D85]">
                {paymentOffer.title}
              </span>
              <span data-id={id('payment-subtitle')} className="font-noontree text-[12px] font-bold leading-[16px] tracking-[-0.12px] text-[#0E0E0E]">
                {paymentOffer.subtitle}{' '}
                <span data-id={id('payment-cta')} className="font-semibold text-[#0057FF]">{paymentOffer.cta}</span>
              </span>
            </div>
          </div>
          <span data-id={id('payment-provider')} className="rounded-lg bg-[#5AFEAE] px-3 py-2 font-noontree text-[13px] font-bold text-[#292929]">
            tabby
          </span>
        </div>
      </div>

      {/* Product details accordion */}
      <SectionCard dataId={id('section-details')} title="Product Details">
        <Accordion items={productDetails} dataId={id('accordion')} />
      </SectionCard>

      {/* Buy together and save — inline section (same container as the sheet,
          without the Done footer) */}
      {bundle?.items?.length > 0 && (
        <BundleContainer
          dataId={id('section-bundle')}
          items={bundle.items}
          savings={bundle.savings}
          viewAll={bundle.viewAll}
          onViewAll={() => setSearchOpen(true)}
          showComboIcon={variant !== 2}
        />
      )}

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
        dataId={id('bundle-sheet')}
      />

      {/* Search / PLP — slides in from the right */}
      {plp && <SearchPage open={searchOpen} onClose={() => setSearchOpen(false)} plp={plp} />}
    </div>
  )
}
