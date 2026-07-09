// BundleContainer — the "Buy together and save" card: a squircle (smoothing 1)
// white container with a gradient header (combo gif + title + savings pill) and
// a horizontal rail of ComboProductCards. Used both inline as a PDP section and
// inside the BundleSheet (which adds the overlay, slide-up and a Done footer via
// the `footer` slot).
import { Squircle } from 'corner-smoothing'
import { ComboProductCard, ComboRowCard } from '../../components/common'
import { Dirham } from '../../components/common/Dirham'

export const COMBO_GIF = 'https://f.nooncdn.com/s/app/com/noon/images/combo-animated.gif'

export default function BundleContainer({
  items = [],
  savings = '20',
  viewAll,
  onViewAll,
  onQtyChange,
  showComboIcon = true,
  rowCards = false,
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
      className={`flex flex-col p-0.5 ${rowCards ? 'bg-[#F9F9FB]' : 'bg-white'} ${className}`}
    >
      {rowCards ? (
        /* Variation 4 — plain title header */
        <div data-id={did('header')} className="rounded-t-[14px] px-4 pb-2 pt-4">
          <span data-id={did('header-title')} className="font-noontree text-[18px] font-bold leading-6 tracking-[-0.15px] text-black">
            Save more with combos
          </span>
        </div>
      ) : (
      /* Header */
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
          {/* savings ticket — serrated edges + flat center pill, overlapped 1px */}
          <div data-id={did('header-tag')} className="flex items-center">
            <svg width="4" height="20" viewBox="0 0 4 20" fill="none" aria-hidden="true" className="shrink-0">
              <path d="M3.14258 20H0V18.5713C0.86787 18.5713 1.57129 17.9316 1.57129 17.1426C1.57116 16.3537 0.867791 15.7139 0 15.7139V14.2852C0.867721 14.2851 1.57105 13.6462 1.57129 12.8574C1.57129 12.1179 0.953321 11.5089 0.161133 11.4355L0 11.4287V9.28516C0.867721 9.28515 1.57105 8.64621 1.57129 7.85742C1.57129 7.11789 0.953321 6.50889 0.161133 6.43555L0 6.42871V4.28516C0.867721 4.28515 1.57105 3.64621 1.57129 2.85742C1.57129 2.11789 0.953321 1.50889 0.161133 1.43555L0 1.42871V0H3.14258V20Z" fill="#2122B8" />
            </svg>
            <span data-id={did('header-pill')} className="-mx-px flex h-5 items-center bg-[#2122B8] px-1 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] text-white">
              <span className="inline-flex items-center gap-1">
                <span>upto</span>
                <span className="inline-flex items-center gap-px">
                  <Dirham />
                  {savings}
                </span>
              </span>
            </span>
            <svg width="4" height="20" viewBox="0 0 4 20" fill="none" aria-hidden="true" className="shrink-0">
              <path d="M3.14258 1.42871C2.27482 1.42884 1.57129 2.06852 1.57129 2.85742C1.57153 3.64613 2.27497 4.28503 3.14258 4.28516V6.42871C2.27482 6.42884 1.57129 7.06852 1.57129 7.85742C1.57153 8.64613 2.27497 9.28503 3.14258 9.28516V11.4287C2.27482 11.4288 1.57129 12.0685 1.57129 12.8574C1.57153 13.6461 2.27497 14.285 3.14258 14.2852V15.7139C2.2749 15.714 1.57142 16.3538 1.57129 17.1426C1.57129 17.9315 2.27482 18.5712 3.14258 18.5713V20H0V0H3.14258V1.42871Z" fill="#2122B8" />
            </svg>
          </div>
        </div>
      </div>
      )}

      {rowCards ? (
        /* Variation 4 — stacked horizontal row cards */
        <div data-id={did('list')} className="scrollbar-hide flex max-h-[520px] flex-col gap-2 overflow-y-auto px-3 py-1">
          {items.map((it) => (
            <ComboRowCard key={it.id} dataId={did(`card-${it.id}`)} {...it} />
          ))}
        </div>
      ) : (
        /* Horizontal rail of vertical combo cards */
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
      )}

      {footer}
    </Squircle>
  )
}
