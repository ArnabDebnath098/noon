// Section 3 — search bar (search icon · placeholder · divider · camera).
// `onClick` (optional) makes the whole field tappable — used by the search
// experiment to open its SLP overlay; the marketplace home leaves it inert.
import CameraIcon from './CameraIcon'

export default function SearchBar({ onClick }) {
  return (
    <div data-id="mp-search" className="px-4 pb-5 pt-2">
      <div
        role={onClick ? 'button' : undefined}
        onClick={onClick}
        className="flex h-12 items-center gap-2 rounded-[12px] border border-[#D7DAE3] bg-white px-3"
      >
        {/* search */}
        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="9" cy="9" r="6" stroke="#1D2539" strokeWidth="1.6" />
          <path d="m14 14 3 3" stroke="#1D2539" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="flex-1 font-noontree text-[15px] font-medium text-[#1D2539]">
          Search iphone
        </span>
        <span className="h-6 w-px bg-[#D9DADB]" />
        <CameraIcon />
      </div>
    </div>
  )
}
