// BundleContainer — the "Buy together and save" card: a squircle (smoothing 1)
// white container with a gradient header (combo gif + title + savings pill) and
// a horizontal rail of ComboProductCards. Used both inline as a PDP section and
// inside the BundleSheet (which adds the overlay, slide-up and a Done footer via
// the `footer` slot).
import { Squircle } from 'corner-smoothing'
import { ComboProductCard } from '../../components/common'
import { Dirham } from '../../components/common/Dirham'

export const COMBO_GIF = 'https://f.nooncdn.com/s/app/com/noon/images/combo-animated.gif'

export default function BundleContainer({
  items = [],
  savings = '20',
  viewAll,
  onViewAll,
  onQtyChange,
  showComboIcon = true,
  footer,
  className = '',
  dataId = 'bundle',
}) {
  const did = (s) => `${dataId}-${s}`
  return (
    <Squircle
      as="div"
      cornerRadius={16}
      cornerSmoothing={1}
      data-id={did('sheet')}
      className={`flex flex-col bg-white p-0.5 ${className}`}
    >
      {/* Header */}
      <div
        data-id={did('header')}
        className="flex h-14 items-center gap-3 rounded-t-[14px] px-3"
        style={{ background: 'linear-gradient(0deg, #EAF4FE 0%, #FFFFFF 100%)' }}
      >
        <img data-id={did('header-icon')} src={COMBO_GIF} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
        <div data-id={did('header-text')} className="flex items-center gap-1">
          <span data-id={did('header-title')} className="font-noontree text-[16px] font-semibold leading-5 tracking-[-0.1px] text-[#0A49B8]">
            Buy together and save
          </span>
          <span data-id={did('header-pill')} className="flex items-center gap-1 rounded bg-[#082F8C] px-1.5 py-0.5 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-white">
            <span className="inline-flex items-center gap-0.5">
              <span>upto</span>
              <span className="inline-flex items-center gap-px">
                <Dirham />
                {savings}
              </span>
            </span>
            <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-white/70" />
          </span>
        </div>
      </div>

      {/* Product card rail */}
      <div data-id={did('list')} className="scrollbar-hide flex gap-4 overflow-x-auto px-3 py-4">
        {items.map((it) => (
          <ComboProductCard
            key={it.id}
            dataId={did(`card-${it.id}`)}
            showComboIcon={showComboIcon}
            comboIcon={showComboIcon ? COMBO_GIF : undefined}
            onQtyChange={onQtyChange ? (q) => onQtyChange(it.id, q) : undefined}
            {...it}
          />
        ))}

        {viewAll > 0 && (
          <button
            type="button"
            data-id={did('view-all')}
            onClick={onViewAll}
            className="flex h-[227px] w-[169px] shrink-0 flex-col items-center justify-center self-start rounded-2xl border border-dashed border-[#0F61FF] bg-[#EBF4FF]"
          >
            <span data-id={did('view-all-label')} className="font-noontree text-[14px] font-semibold leading-5 text-[#0F61FF]">
              View all {viewAll} combos
            </span>
          </button>
        )}
      </div>

      {footer}
    </Squircle>
  )
}
