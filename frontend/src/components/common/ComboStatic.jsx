// ComboStatic — non-animated variant: just the product count (no "Combo" chip,
// since the static banner already shows a "Combos available" tag in its header).
export function ComboStatic({ count, dataId }) {
  return (
    <div data-id={dataId} className="flex h-[20px] items-center">
      <span className="font-noontree text-[12px] font-medium leading-none tracking-[-0.1px] text-[#666D85]">
        {count}
      </span>
    </div>
  )
}
