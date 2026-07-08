// Renders a marketplace's logo / wordmark at an arbitrary size. Internal
// dimensions scale from the 76px reference so the same mark works in the row
// tiles, the 2×2 folder preview, and the expanded grid.
//
// `m` shapes (see data.js):
//   • fadeStack — two stacked wordmarks (e.g. noon FOOD)
//   • logoStack — two stacked logos (e.g. super / mall)
//   • logo (+ optional logoH/logoW) — a single image mark
//   • otherwise — a coloured text label (m.label, m.fg)
//
// `white` inverts the mark to white for selected (accent-filled) tiles.
// `active` swaps to `m.activeLogoStack` / `m.activeFadeStack` when the
// marketplace provides one (pre-coloured selected-state wordmarks, e.g.
// supermall's yellow-on-blue) — those skip the white-invert.
// `collapsed` shows only the "keep" wordmark of a fadeStack (e.g. noon FOOD →
// FOOD, 15 MINUTES → MINUTES) — the compact form used when a tile shrinks.
const REF = 76

export default function MarketplaceMark({ m, white, active, collapsed, size = 72 }) {
  const k = size / REF
  // pre-coloured active stacks carry their own colours — never filter them;
  // otherwise: white → invert to white (dark accent fill); mono → force black
  // (a coloured wordmark that should read as neutral in default & selected).
  const usingActiveStack = active && (m.activeFadeStack || m.activeLogoStack)
  const filter = usingActiveStack
    ? undefined
    : white ? 'brightness(0) invert(1)' : m.mono ? 'brightness(0)' : undefined

  if (m.fadeStack) {
    const stack = active && m.activeFadeStack ? m.activeFadeStack : m.fadeStack
    // collapsed → only the keep (bottom) wordmark
    if (collapsed) {
      return m.fadeMatchH ? (
        <img src={stack[1]} alt="" className="w-auto" style={{ filter, height: (m.fadeH ?? 12) * k }} />
      ) : (
        <img src={stack[1]} alt="" className="h-auto" style={{ filter, width: (m.keepW ?? 46) * k }} />
      )
    }
    // fadeMatchH: both marks share one cap height (natural widths) — use when the
    // two wordmarks have the same intrinsic height and equal-width would distort.
    if (m.fadeMatchH) {
      const h = (m.fadeH ?? 12) * k
      return (
        <span className="flex flex-col items-start gap-0.5" style={{ filter }}>
          <img src={stack[0]} alt="" className="w-auto" style={{ height: h }} />
          <img src={stack[1]} alt="" className="w-auto" style={{ height: h }} />
        </span>
      )
    }
    const w = (m.keepW ?? 46) * k
    return (
      <span className="flex flex-col items-center gap-0.5" style={{ filter }}>
        <img src={stack[0]} alt="" className="h-auto" style={{ width: w }} />
        <img src={stack[1]} alt="" className="h-auto" style={{ width: w }} />
      </span>
    )
  }

  if (m.logoStack) {
    const stack = active && m.activeLogoStack ? m.activeLogoStack : m.logoStack
    // collapsed → the two words sit on ONE line, tight, reading "supermall".
    // "super" is drawn larger than "mall" in these assets, so bump mall up to
    // match its cap height.
    if (collapsed) {
      const h = 11.5 * k
      // same scale (matched weight); super has a 'p' descender so drop it a
      // touch to sit "super" and "mall" on the same baseline
      return (
        <span className="flex flex-row items-end gap-px" style={{ filter }}>
          <img src={stack[0]} alt="" className="w-auto" style={{ height: h, marginBottom: -0.22 * h }} />
          <img src={stack[1]} alt="" className="w-auto" style={{ height: h }} />
        </span>
      )
    }
    return (
      <span className="flex flex-col items-start gap-0.5" style={{ filter }}>
        <img src={stack[0]} alt="" className="w-auto" style={{ height: 13 * k }} />
        <img src={stack[1]} alt="" className="w-auto" style={{ height: 13 * k }} />
      </span>
    )
  }

  if (m.logo)
    return m.logoH ? (
      <img src={m.logo} alt="" style={{ filter, height: m.logoH * k }} className="w-auto" />
    ) : (
      <img src={m.logo} alt="" style={{ filter, width: (m.logoW ?? 56) * k }} className="h-auto" />
    )

  return (
    <span
      className="whitespace-pre-line text-center font-noontree font-black lowercase"
      style={{ color: white ? '#fff' : m.fg, fontSize: 15 * k, lineHeight: `${15 * k}px` }}
    >
      {m.label}
    </span>
  )
}
