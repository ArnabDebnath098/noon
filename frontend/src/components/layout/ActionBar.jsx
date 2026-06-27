// ActionBar — sticky purchase bar layered directly above the bottom nav.
// White dock with a rounded top + soft top shadow, holding a QTY selector and
// the primary "Add to cart" CTA.
export default function ActionBar({ qty = 1, onAdd, onQty, dataId }) {
  return (
    <div
      data-id={dataId}
      className="fixed left-1/2 z-30 w-full max-w-md -translate-x-1/2 rounded-t-2xl bg-white shadow-[0px_-2px_8px_rgba(0,0,0,0.05)]"
      style={{ bottom: 'calc(85px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Frame 2147238585 — 72px action row */}
      <div className="flex h-[72px] items-center gap-3 px-3">
        {/* QTY selector */}
        <button
          type="button"
          data-id="action-bar-qty"
          onClick={onQty}
          className="box-border flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[12px] border border-[#EAECF0] bg-white"
        >
          <span className="text-[12px] font-medium leading-[14px] tracking-[-0.12px] text-[#989FB3]">
            QTY
          </span>
          <span className="text-[16px] font-bold leading-[20px] tracking-[-0.16px] text-[#343D54]">
            {qty}
          </span>
        </button>

        {/* Add to cart — ATC */}
        <button
          type="button"
          data-id="action-bar-add"
          onClick={onAdd}
          className="box-border flex h-12 flex-1 items-center justify-center rounded-[10px] border border-[#3866DF] bg-[#3866DF] font-noontree text-[16px] font-bold text-white"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}
