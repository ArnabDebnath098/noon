// Section 3 — search bar (search icon · placeholder · divider · camera).
export default function SearchBar() {
  return (
    <div data-id="mp-search" className="px-4 pb-5 pt-2">
      <div className="flex h-12 items-center gap-3 rounded-[12px] border border-[#D7DAE3] bg-white px-3">
        {/* search */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="9" cy="9" r="6" stroke="#1D2539" strokeWidth="1.6" />
          <path d="m14 14 3 3" stroke="#1D2539" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="flex-1 font-noontree text-[15px] font-medium text-[#1D2539]">
          Search noon
        </span>
        <span className="h-6 w-px bg-[#D9DADB]" />
        {/* camera */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
          <path
            d="M3 7.5A1.5 1.5 0 0 1 4.5 6h1.2l.9-1.5h6.8L15.3 6h.2A1.5 1.5 0 0 1 17 7.5V15A1.5 1.5 0 0 1 15.5 16.5h-11A1.5 1.5 0 0 1 3 15V7.5Z"
            stroke="#1F1D1D"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="11" r="2.6" stroke="#1F1D1D" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  )
}
