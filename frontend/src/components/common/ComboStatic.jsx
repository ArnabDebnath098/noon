// ComboStatic — non-animated variant: the "Combo" chip and the product count
// shown side by side on one line (chip left, count right, 4px gap).
export function ComboStatic({ count, dataId }) {
  return (
    <div data-id={dataId} className="flex h-[20px] items-center gap-1">
      <span className="inline-flex h-[20px] items-center rounded-md bg-[#F5FAFF] px-1.5 font-noontree text-[12px] font-semibold leading-none text-[#0F61FF]">
        Combo
      </span>
      <span className="font-noontree text-[12px] font-medium leading-none tracking-[-0.1px] text-[#666D85]">
        {count}
      </span>
    </div>
  )
}
