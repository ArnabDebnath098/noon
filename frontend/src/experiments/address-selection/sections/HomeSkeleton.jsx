// Skeleton placeholder for the home content (below the search bar), shown
// briefly while a marketplace's home "loads". Mirrors the real layout:
// promo banner → category grid → combos.
const BLOCK = 'bg-[#EDEFF2]'

export default function HomeSkeleton() {
  return (
    <div data-id="addr-home-skeleton" className="flex animate-pulse flex-col gap-5 bg-white pt-3">
      {/* promo banner */}
      <div data-id="addr-skeleton-promo" className="px-3">
        <div className={`h-[150px] w-full rounded-2xl ${BLOCK}`} />
      </div>

      {/* shop by category */}
      <div data-id="addr-skeleton-categories" className="flex flex-col gap-4">
        <div className={`mx-4 h-4 w-40 rounded-full ${BLOCK}`} />
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 px-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={`aspect-square w-full rounded-[16px] ${BLOCK}`} />
              <div className={`h-2.5 w-3/4 rounded-full ${BLOCK}`} />
            </div>
          ))}
        </div>
      </div>

      {/* combos */}
      <div data-id="addr-skeleton-combos" className="flex flex-col gap-3 px-3 pb-4">
        <div className={`h-4 w-44 rounded-full ${BLOCK}`} />
        <div className={`h-[136px] w-full rounded-2xl ${BLOCK}`} />
      </div>
    </div>
  )
}
