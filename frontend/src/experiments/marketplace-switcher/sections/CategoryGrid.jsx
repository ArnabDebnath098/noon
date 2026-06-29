// Section 4b — "Shop by category" with a 2-row horizontally scrolling grid.
export default function CategoryGrid({ categories }) {
  return (
    <div data-id="mp-categories" className="flex flex-col gap-4 bg-white py-4">
      <h2 className="px-4 font-figtree text-[17px] font-bold tracking-[-0.02em] text-[#262A33]">
        Shop by category
      </h2>

      <div
        data-id="mp-category-grid"
        className="grid grid-cols-4 gap-x-2 gap-y-4 px-3"
      >
        {categories.map((c) => (
          <div
            key={c.id}
            data-id={`mp-category-${c.id}`}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[16px] bg-gradient-to-b from-[#F2F1F4] to-white">
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-[72%] w-[72%] object-contain"
              />
            </div>
            <span className="text-center font-noontree text-[12px] font-semibold leading-[14px] text-[#262A33]">
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
