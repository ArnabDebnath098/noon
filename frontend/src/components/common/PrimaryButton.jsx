// PrimaryButton — web adaptation of @field-ds/components PrimaryButton.
// API mirrors the design system: `label` + `onPress`, plus web-friendly extras.

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  return (
    <button
      data-id="primary-button"
      type={type}
      onClick={onPress}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-xl px-5 py-3',
        'font-noontree font-semibold text-noon-dark',
        'bg-noon-yellow transition-opacity',
        'hover:opacity-90 active:opacity-80',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      ].join(' ')}
      {...rest}
    >
      {label}
    </button>
  );
}
