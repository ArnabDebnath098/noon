// Section 4a — promo banner + offer strip.
import promoBanner from '../../../assets/marketplace/promo-grocery-saver.png'
import stripBanner from '../../../assets/marketplace/strip-honor-magic.png'

export default function PromoBanner() {
  return (
    <div data-id="mp-promo" className="flex flex-col gap-4 py-3">
      {/* Promo banner */}
      <div className="px-5">
        <img
          data-id="mp-promo-banner"
          src={promoBanner}
          alt="Grocery Saver Week — up to 70% off"
          className="w-full rounded-[20px]"
        />
      </div>

      {/* Offer strip */}
      <div className="px-5">
        <img
          data-id="mp-cashback-strip"
          src={stripBanner}
          alt="HONOR Magic V6 — available now"
          className="w-full rounded-[12px]"
        />
      </div>
    </div>
  )
}
