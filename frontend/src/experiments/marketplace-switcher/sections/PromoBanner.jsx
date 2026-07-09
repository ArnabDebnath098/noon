// Section 4a — promo banner + offer strip (squircle-cropped images).
import { Squircle } from 'corner-smoothing'
import promoBanner from '../../../assets/marketplace/promo-grocery-saver.png'
import stripBanner from '../../../assets/marketplace/strip-honor-magic.png'

export default function PromoBanner() {
  return (
    <div data-id="mp-promo" className="flex flex-col gap-4 py-3">
      {/* Promo banner */}
      <div className="px-4">
        <Squircle as="div" cornerRadius={20} cornerSmoothing={1} data-id="mp-promo-banner">
          <img
            src={promoBanner}
            alt="Grocery Saver Week — up to 70% off"
            className="block w-full"
          />
        </Squircle>
      </div>

      {/* Offer strip */}
      <div className="px-4">
        <Squircle as="div" cornerRadius={12} cornerSmoothing={1} data-id="mp-cashback-strip">
          <img
            src={stripBanner}
            alt="HONOR Magic V6 — available now"
            className="block w-full"
          />
        </Squircle>
      </div>
    </div>
  )
}
