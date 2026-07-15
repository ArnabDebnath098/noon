// PrimaryButton (M-PrimaryButton) — high-emphasis filled CTA.
// Variants: size (h56/h52/h48/h40/h36) × state (default/pressed/loading/disabled),
// with optional left/right icons. Pressed is handled via :active so the button
// darkens on touch; loading keeps the same size to avoid layout shift.

const SIZES = {
  h56: { box: 'h-[56px] px-6 py-4 gap-2 rounded-[12px]', text: 'text-[17px] leading-[24px] tracking-[-0.25px]', spinner: 20 },
  h52: { box: 'h-[52px] px-5 py-[14px] gap-2 rounded-[12px]', text: 'text-[16px] leading-[24px]', spinner: 20 },
  h48: { box: 'h-[48px] px-4 py-[14px] gap-1.5 rounded-[10px]', text: 'text-[14px] leading-[20px]', spinner: 20 },
  h40: { box: 'h-[40px] p-3 gap-1 rounded-[8px]', text: 'text-[12px] leading-[16px]', spinner: 16 },
  h36: { box: 'h-[36px] px-3 py-2.5 gap-1 rounded-[8px]', text: 'text-[12px] leading-[16px]', spinner: 16 },
}

const STATES = {
  default: 'bg-[#0F7EFF] text-white active:bg-[#0F61FF]',
  loading: 'bg-[#0F7EFF] text-white cursor-progress',
  disabled: 'bg-[#EAECF0] text-[#989FB3] cursor-not-allowed',
}

export function PrimaryButton({
  label,
  size = 'h56',
  state = 'default',
  iconLeft,
  iconRight,
  onPress,
  type = 'button',
  dataId,
  className = '',
  textClassName = '', // optional typography override (wins over the size preset)
}) {
  const s = SIZES[size] ?? SIZES.h56
  const isLoading = state === 'loading'
  const isDisabled = state === 'disabled'

  return (
    <button
      type={type}
      data-id={dataId}
      onClick={onPress}
      disabled={isDisabled || isLoading}
      aria-busy={isLoading || undefined}
      className={[
        'relative inline-flex items-center justify-center font-noontree font-semibold transition-colors',
        s.box,
        s.text,
        STATES[state] ?? STATES.default,
        className,
        textClassName,
      ].join(' ')}
    >
      {isLoading ? (
        <span
          data-id={dataId ? `${dataId}-spinner` : undefined}
          aria-hidden="true"
          className="animate-spin rounded-full border-2 border-white/40 border-t-white"
          style={{ width: s.spinner, height: s.spinner }}
        />
      ) : (
        <>
          {iconLeft && (
            <span data-id={dataId ? `${dataId}-icon-left` : undefined} className="shrink-0">
              {iconLeft}
            </span>
          )}
          {label && (
            <span data-id={dataId ? `${dataId}-label` : undefined}>{label}</span>
          )}
          {iconRight && (
            <span data-id={dataId ? `${dataId}-icon-right` : undefined} className="shrink-0">
              {iconRight}
            </span>
          )}
        </>
      )}
    </button>
  )
}
