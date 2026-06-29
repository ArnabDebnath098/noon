// Section 2 — location (left) + wishlist heart (right).
import homeIcon from '../../../assets/marketplace/home.svg'

export default function LocationBar({ label, line, onWishlist }) {
  return (
    <div data-id="mp-location" className="flex items-center gap-2 px-4 py-1.5">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div data-id="mp-location-label" className="flex items-center gap-1.5">
          <img src={homeIcon} alt="" className="h-[18px] w-auto" aria-hidden="true" />
          <span className="font-noontree text-[16px] font-semibold text-black">
            {label} -
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span
            data-id="mp-location-line"
            className="truncate font-noontree text-[14px] text-[#343D54]"
          >
            {line}
          </span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
            <path d="M6 8l4 4 4-4" stroke="#101628" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <button
        type="button"
        data-id="mp-wishlist"
        aria-label="Wishlist"
        onClick={onWishlist}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 17.5S2.5 13 2.5 7.8A4.3 4.3 0 0 1 10 5a4.3 4.3 0 0 1 7.5 2.8C17.5 13 10 17.5 10 17.5Z"
            fill="#035794"
          />
        </svg>
      </button>
    </div>
  )
}
