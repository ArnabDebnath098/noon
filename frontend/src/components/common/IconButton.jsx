// IconButton — circular 40×40 action button used in the header.
// Translucent white fill with a hairline border, per the noon design spec.

export function IconButton({ icon, label, onPress, dataId, className = '', ...rest }) {
  return (
    <button
      type="button"
      data-id={dataId}
      aria-label={label}
      onClick={onPress}
      className={[
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
        'border border-[#F2F3F7] bg-white/90',
        'transition-opacity hover:opacity-80 active:opacity-70',
        className,
      ].join(' ')}
      {...rest}
    >
      <img src={icon} alt="" aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}
