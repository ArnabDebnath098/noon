// ComboRowCard — a full-width horizontal combo card (Figma Frame 2147241812).
// A row of product thumbnails (each with an "x{qty}" badge, optional "+N" tile),
// a dashed divider, then the combo title, price + strikethrough, coupon and an
// "Add to cart" button.
import { Dirham, withDirham } from './Dirham'

export function ComboRowCard({
  thumbs = [],
  extra, // count for a trailing "+N more" tile
  title,
  price,
  comparePrice,
  coupon,
  onAdd,
  dataId = 'combo-row-card',
}) {
  const did = (s) => `${dataId}-${s}`
  return (
    <div data-id={dataId} className="flex flex-col gap-2 rounded-2xl bg-white p-3">
      {/* thumbnails */}
      <div data-id={did('thumbs')} className="flex items-center gap-2">
        {thumbs.map((t, i) => (
          <div key={i} data-id={did(`thumb-${i}`)} className="relative h-24 w-[72px] shrink-0 rounded-xl bg-[#F9F9FB]">
            <img src={t.image} alt="" aria-hidden="true" className="absolute inset-0 m-auto h-[78px] w-auto object-contain" />
            <span data-id={did(`thumb-${i}-qty`)} className="absolute bottom-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-md border border-[rgba(14,14,14,0.04)] bg-white px-1 font-noontree text-[10px] font-semibold leading-none text-[#343D54]">
              x{t.qty ?? 1}
            </span>
          </div>
        ))}
        {extra > 0 && (
          <div data-id={did('extra')} className="flex h-24 flex-1 flex-col items-center justify-center rounded-xl bg-[#F9F9FB] px-2 text-center">
            <span className="font-noontree text-[14px] font-semibold leading-[18px] tracking-[-0.14px] text-[#101628]">+{extra}</span>
            <span className="font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#475067]">more</span>
          </div>
        )}
      </div>

      {/* divider */}
      <span data-id={did('divider')} className="h-px w-full border-t border-dashed border-[#F2F3F7]" />

      {/* info */}
      <div data-id={did('info')} className="flex flex-col gap-2">
        <h3 data-id={did('title')} className="truncate font-noontree text-[13px] font-medium leading-[18px] tracking-[-0.1px] text-[#212121]">
          {title}
        </h3>
        <div data-id={did('row')} className="flex items-end gap-2.5">
          <div data-id={did('pricing')} className="flex flex-1 flex-col gap-1">
            <div data-id={did('price')} className="flex items-end gap-1.5">
              <span data-id={did('price-now')} className="inline-flex items-center gap-px font-noontree text-[16px] font-bold leading-[22px] tracking-[-0.15px] text-[#1D2539]">
                <Dirham />
                {price}
              </span>
              {comparePrice && (
                <span data-id={did('price-was')} className="inline-flex items-center gap-px font-noontree text-[12px] font-normal leading-[18px] tracking-[-0.1px] text-[#666D85] line-through">
                  <Dirham />
                  {comparePrice}
                </span>
              )}
            </div>
            {coupon && (
              <span data-id={did('coupon')} className="flex h-5 w-fit items-center rounded border-[0.5px] border-dashed border-[#CBF6E5] bg-[#E3FCF2] px-1 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-[#0B623F]">
                {withDirham(coupon)}
              </span>
            )}
          </div>
          <button
            type="button"
            data-id={did('add')}
            onClick={onAdd}
            className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-[#0F7EFF] px-3 font-noontree text-[12px] font-semibold leading-4 text-white"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}
