// Section 4b — "Shop by category" rail: compact squircle tiles with 3D imagery
// and a bold label underneath, scrolling horizontally.
import { Squircle } from 'corner-smoothing'

export default function CategoryGrid({ categories }) {
  return (
    <div data-id="mp-categories" className="flex flex-col gap-3 bg-white py-4">
      <h2 className="px-4 font-figtree text-[17px] font-bold tracking-[-0.02em] text-[#262A33]">
        Shop by category
      </h2>

      <div
        data-id="mp-category-grid"
        className="scrollbar-hide flex gap-3 overflow-x-auto px-4"
      >
        {categories.map((c) => (
          <div
            key={c.id}
            data-id={`mp-category-${c.id}`}
            className="flex w-[92px] shrink-0 flex-col items-center gap-1.5"
          >
            <Squircle
              as="div"
              cornerRadius={22}
              cornerSmoothing={1}
              className="h-[92px] w-full bg-gradient-to-b from-[#F2F1F4] to-[#FAFAFC]"
            >
              {/* cover: full-bleed artwork (own background baked in);
                  otherwise: plain product shot centred on the tile gradient */}
              {c.cover ? (
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-2.5">
                  <img src={c.image} alt={c.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </Squircle>
            <span className="text-center font-noontree text-[12px] font-bold leading-[15px] text-[#1D2539]">
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
