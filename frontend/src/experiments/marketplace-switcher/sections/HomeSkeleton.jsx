// Skeleton placeholder for the home content (below the search bar), shown
// briefly while a marketplace's home "loads". Mirrors the real layout:
// promo banner → offer strip → category rail → combos.
const BLOCK = 'bg-[#EDEFF2]'

export default function HomeSkeleton() {
  return (
    <div data-id="mp-home-skeleton" className="flex animate-pulse flex-col gap-5 bg-white pt-3">
      {/* promo banner */}
      <div data-id="mp-skeleton-promo" className="px-5">
        <div className={`h-40 w-full rounded-[20px] ${BLOCK}`} />
      </div>

      {/* offer strip */}
      <div data-id="mp-skeleton-strip" className="px-5">
        <div className={`h-[88px] w-full rounded-[12px] ${BLOCK}`} />
      </div>

      {/* shop by category rail */}
      <div data-id="mp-skeleton-categories" className="flex flex-col gap-3 overflow-hidden">
        <div className={`mx-5 h-4 w-40 rounded-full ${BLOCK}`} />
        <div className="flex gap-3 px-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex w-[104px] shrink-0 flex-col items-center gap-2">
              <div className={`h-[121px] w-full rounded-[26px] ${BLOCK}`} />
              <div className={`h-2.5 w-3/4 rounded-full ${BLOCK}`} />
            </div>
          ))}
        </div>
      </div>

      {/* combos */}
      <div data-id="mp-skeleton-combos" className="flex flex-col gap-3 px-5 pb-4">
        <div className={`h-4 w-44 rounded-full ${BLOCK}`} />
        <div className={`h-[150px] w-full rounded-2xl ${BLOCK}`} />
      </div>
    </div>
  )
}
