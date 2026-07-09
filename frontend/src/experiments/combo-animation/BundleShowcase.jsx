// BundleShowcase — variation-3 combo section (Figma "Main Container"). A left
// gradient info panel ("Bundle & Save" + savings + benefit bullets + View all)
// followed by a horizontal rail of ComboProductCards (variation-2 style: plain
// "2 Products" tag, no combo-icon). The whole strip scrolls horizontally.
import { ComboProductCard, ComboGif } from '../../components/common'
import { Dirham } from '../../components/common/Dirham'
import pointerIcon from '../../assets/icons/pointer.svg'

export default function BundleShowcase({
  items = [],
  off = '80',
  viewAll,
  benefits = [],
  onViewAll,
  onQtyChange,
  bleed = true,
  dataId = 'bundle-showcase',
}) {
  const did = (s) => `${dataId}-${s}`
  return (
    <div data-id={did('root')} className={`scrollbar-hide flex items-stretch overflow-x-auto bg-white ${bleed ? '-mx-3' : ''}`}>
      {/* Info panel */}
      <div
        data-id={did('info')}
        className="flex w-[180px] min-w-[180px] shrink-0 flex-col px-5 py-8"
        style={{ background: 'linear-gradient(270deg, #FFFFFF 5.45%, #E7EFFD 194.76%)' }}
      >
        <div className="flex flex-col gap-4">
          <ComboGif dataId={did('icon')} className="h-8 w-8" />

          <div data-id={did('header')} className="flex flex-col gap-1">
            <span data-id={did('title')} className="font-noontree text-[18px] font-bold leading-[22px] tracking-[-0.15px] text-[#0A49B8]">
              Bundle &amp; Save
            </span>
            <span
              data-id={did('off')}
              className="flex w-fit items-center rounded px-1.5 py-1 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-[#0A49B8]"
              style={{ background: 'linear-gradient(90deg, #E6EFFE 0%, #F9FBFE 100%)' }}
            >
              <span className="inline-flex items-center gap-0.5">
                <span>upto</span>
                <span className="inline-flex items-center gap-px">
                  <Dirham />
                  {off}
                </span>
                <span>off</span>
              </span>
            </span>
            <span data-id={did('divider')} className="mt-1 h-0.5 w-10 bg-[#BDDBFF]" />
          </div>
        </div>

        {/* benefits — fill available height, 20px top/bottom */}
        <div data-id={did('benefits')} className="flex flex-1 flex-col justify-center gap-6 py-5">
          {benefits.map((b, i) => (
            <div key={i} data-id={did(`benefit-${i}`)} className="flex items-start gap-1.5">
              <span className="flex h-[18px] shrink-0 items-center">
                <img src={pointerIcon} alt="" aria-hidden="true" className="h-2 w-2" />
              </span>
              <span className="font-noontree text-[14px] font-medium leading-[18px] tracking-[-0.1px] text-[#0A49B8]">
                {b}
              </span>
            </div>
          ))}
        </div>

        {viewAll > 0 && (
          <button
            type="button"
            data-id={did('view-all')}
            onClick={onViewAll}
            className="mt-4 flex h-9 w-fit items-center justify-center rounded-lg border border-[#D6E9FF] bg-white px-3 font-noontree text-[12px] font-semibold leading-4 text-[#0F61FF]"
          >
            View all {viewAll}
          </button>
        )}
      </div>

      {/* Product rail */}
      <div data-id={did('cards')} className="flex shrink-0 items-start gap-3 px-5 py-3">
        {items.map((it) => (
          <ComboProductCard
            key={it.id}
            dataId={did(`card-${it.id}`)}
            showComboIcon={false}
            onQtyChange={onQtyChange ? (q) => onQtyChange(it.id, q) : undefined}
            {...it}
          />
        ))}
      </div>
    </div>
  )
}
