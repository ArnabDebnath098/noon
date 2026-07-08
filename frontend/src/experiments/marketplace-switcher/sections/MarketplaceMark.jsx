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
const REF = 76

export default function MarketplaceMark({ m, white, active, size = 72 }) {
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
    return (
      <span className="flex flex-col items-center gap-0.5" style={{ filter }}>
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
