// Dirham (AED) symbol — inherits the surrounding text colour via currentColor
// and scales with font-size (em-based) so it matches whatever it precedes.
import { Fragment } from 'react'

export function Dirham({ className = '' }) {
  return (
    <svg
      viewBox="0 0 9 9"
      role="img"
      aria-label="AED"
      className={`h-[0.7em] w-[0.7em] ${className}`}
      fill="none"
    >
      <path
        d="M0.984 8.4V5.58H0.18L0 4.668H0.984V3.78H0.18L0.012 2.88H0.984V0H3.624C5.628 0 7.164 1.14 7.68 2.88H8.544L8.736 3.78H7.848C7.86 3.912 7.86 4.056 7.86 4.2C7.86 4.356 7.848 4.512 7.836 4.668H8.544L8.724 5.58H7.656C7.128 7.284 5.604 8.4 3.624 8.4H0.984ZM2.268 7.188H3.624C4.788 7.188 5.772 6.576 6.24 5.58H2.268V7.188ZM2.268 4.668H6.492C6.516 4.512 6.528 4.356 6.528 4.2C6.528 4.056 6.516 3.912 6.504 3.78H2.268V4.668ZM2.268 2.88H6.252C5.796 1.872 4.812 1.224 3.624 1.224H2.268V2.88Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Renders free text, swapping any "AED" token for the dirham glyph. The space
// that follows the token is trimmed so the symbol sits tight against the amount.
export function withDirham(text) {
  return text.split('AED').map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <Dirham className="ml-1 inline-block align-[-0.04em]" />}
      {i > 0 ? part.replace(/^\s+/, '') : part}
    </Fragment>
  ))
}
