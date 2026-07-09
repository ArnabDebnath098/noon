// A titled horizontal rail of product cards (reuses the combos/similar
// ProductCard). Optional "View all" link on the right.
import { ProductCard } from '../../../components/common'

export default function ProductRail({ dataId, title, viewAll = false, products }) {
  return (
    <div data-id={dataId} className="flex flex-col gap-3 bg-white py-4">
      <div className="flex items-start justify-between gap-3 px-4">
        <h2 className="font-figtree text-[17px] font-bold leading-[22px] tracking-[-0.02em] text-[#262A33]">
          {title}
        </h2>
        {viewAll && (
          <button type="button" className="shrink-0 whitespace-nowrap pt-0.5 font-figtree text-[14px] font-semibold text-[#3866DF]">
            View all ›
          </button>
        )}
      </div>

      <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-1">
        {products.map((p) => (
          <ProductCard key={p.id} dataId={`${dataId}-${p.id}`} width={150} {...p} />
        ))}
      </div>
    </div>
  )
}
