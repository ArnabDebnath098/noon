// AddToCartButton (ATC) — default "add to cart" affordance per the noon spec.
// 48×48 touch target (8px padding) anchored bottom-right, wrapping a 32×32
// white box (1.2px #F2F3F7 border, 8px radius) with the 24px plus glyph.
import plusIcon from '../../assets/icons/plus.svg'

export function AddToCartButton({ onPress, dataId, className = '' }) {
  return (
    <div
      className={`absolute bottom-0 right-0 z-[5] flex h-12 w-12 items-center justify-center p-2 ${className}`}
    >
      <button
        type="button"
        data-id={dataId}
        aria-label="Add to cart"
        onClick={onPress}
        className="box-border flex h-8 w-8 items-center justify-center rounded-lg border-[1.2px] border-[#F2F3F7] bg-white p-1"
      >
        <img src={plusIcon} alt="" aria-hidden="true" className="h-[15px] w-[15px]" />
      </button>
    </div>
  )
}
