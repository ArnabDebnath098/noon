// ActionBar — sticky purchase bar layered directly above the bottom nav.
// White dock with a rounded top + soft top shadow, holding a QTY selector and
// the primary "Add to cart" CTA (M-PrimaryButton).
import { PrimaryButton } from '../common/PrimaryButton'

export default function ActionBar({ qty = 1, onAdd, onQty, state = 'default', addTextClassName }) {
  return (
    <div
      data-id="action-bar"
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 rounded-t-2xl bg-white shadow-[0px_-2px_8px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'var(--sab, 0px)' }}
    >
      {/* 72px action row */}
      <div data-id="action-bar-row" className="flex h-[72px] items-center gap-3 px-3">
        {/* QTY selector */}
        <button
          type="button"
          data-id="action-bar-qty"
          onClick={onQty}
          className="box-border flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[12px] border border-[#EAECF0] bg-white"
        >
          <span
            data-id="action-bar-qty-label"
            className="text-[12px] font-medium leading-[14px] tracking-[-0.12px] text-[#989FB3]"
          >
            QTY
          </span>
          <span
            data-id="action-bar-qty-value"
            className="text-[16px] font-bold leading-[20px] tracking-[-0.16px] text-[#343D54]"
          >
            {qty}
          </span>
        </button>

        {/* Add to cart — M-PrimaryButton (H48) */}
        <PrimaryButton
          dataId="action-bar-add"
          label="Add to cart"
          size="h48"
          state={state}
          onPress={onAdd}
          className="flex-1"
          textClassName={addTextClassName}
        />
      </div>
    </div>
  )
}
