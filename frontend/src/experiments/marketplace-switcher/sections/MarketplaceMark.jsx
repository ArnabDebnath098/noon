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
const REF = 76

export default function MarketplaceMark({ m, white, size = 72 }) {
  const k = size / REF
  const filter = white ? 'brightness(0) invert(1)' : undefined

  if (m.fadeStack) {
    const w = (m.keepW ?? 46) * k
    return (
      <span className="flex flex-col items-center gap-0.5" style={{ filter }}>
        <img src={m.fadeStack[0]} alt="" className="h-auto" style={{ width: w }} />
        <img src={m.fadeStack[1]} alt="" className="h-auto" style={{ width: w }} />
      </span>
    )
  }

  if (m.logoStack)
    return (
      <span className="flex flex-col items-start gap-0.5" style={{ filter }}>
        <img src={m.logoStack[0]} alt="" className="w-auto" style={{ height: 13 * k }} />
        <img src={m.logoStack[1]} alt="" className="w-auto" style={{ height: 13 * k }} />
      </span>
    )

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
