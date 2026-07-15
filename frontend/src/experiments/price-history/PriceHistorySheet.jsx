// PriceHistorySheet — "Price history" bottom sheet (Figma M-BottomSheet).
// Scrim + grabber + white sheet: product header, 1M/3M/1Y switch, a recharts
// gradient area chart (blue line, soft violet fill, endpoint dot, dashed
// today-price reference) inside an amber-gradient shell with a trend note,
// lowest/highest/today stat cards, a "better deal" row and an Add-to-cart CTA.
import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { springs } from '../../utils/motion'
import { Dirham, withDirham } from '../../components/common/Dirham'
import { PrimaryButton } from '../../components/common/PrimaryButton'

const LINE = '#3536DA'

// Regular-weight dirham glyph (Downloads/dirham-regular.svg, viewBox 0 0 8 8).
// Drawn inside a viewBox'd nested <svg> so it never distorts at any size.
const DIRHAM_PATH =
  'M0.88 7.7V5.038H0.143L0 4.323H0.88V3.421H0.143L0.011 2.706H0.88V0H3.223C4.994 0 6.347 1.067 6.765 2.706H7.579L7.733 3.421H6.886C6.897 3.564 6.908 3.707 6.908 3.85C6.908 4.015 6.897 4.169 6.886 4.323H7.579L7.733 5.038H6.754C6.314 6.644 4.972 7.7 3.223 7.7H0.88ZM1.771 6.875H3.223C4.389 6.875 5.379 6.138 5.797 5.038H1.771V6.875ZM1.771 4.323H5.973C5.995 4.169 6.006 4.015 6.006 3.85C6.006 3.707 5.995 3.564 5.984 3.421H1.771V4.323ZM1.771 2.706H5.808C5.401 1.584 4.4 0.825001 3.223 0.825001H1.771V2.706Z'

// small inline dirham for the HTML price labels
function DirhamGlyph() {
  return (
    <svg width="7.5" height="7.5" viewBox="0 0 8 8" fill="none" aria-hidden="true" className="shrink-0">
      <path d={DIRHAM_PATH} fill="currentColor" />
    </svg>
  )
}

// Nice y-axis ticks — the price span varies a lot by range (1M spans a few
// dirhams, 1Y spans the whole 30–68 swing), so pick the smallest "nice" step
// that covers [min, max] in ≤5 rounded ticks. Returned descending (top first).
const NICE_STEPS = [1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 500, 1000]
function niceTicks(min, max) {
  for (const step of NICE_STEPS) {
    const lo = Math.floor(min / step) * step
    const hi = Math.ceil(max / step) * step
    const count = Math.round((hi - lo) / step) + 1
    if (count <= 5) {
      const ticks = Array.from({ length: count }, (_, k) => lo + k * step)
      return { lo, hi, step, ticks: ticks.reverse() }
    }
  }
  return { lo: min, hi: max, step: max - min, ticks: [max, min] }
}

// endpoint dot — only on the "Today" point (the series carries flat synthetic
// extension points past it, so match on the point's x value, not the index)
function EndDot({ cx, cy, payload, todayI }) {
  if (payload?.i !== todayI) return null
  return <circle cx={cx} cy={cy} r={4} fill={LINE} stroke="#FFFFFF" strokeWidth={1} />
}

/* stat-card icons — filled circles with white trend arrows */
function StatIcon({ bg, d }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill={bg} />
      <path d={d} stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
const STAT_ICONS = {
  lowest: <StatIcon bg="#7FCCC8" d="M5.5 5.5l5 5m0 0v-4m0 4h-4" />,
  highest: <StatIcon bg="#FFC567" d="M5.5 10.5l5-5m0 0h-4m4 0v4" />,
  today: <StatIcon bg="#89CBF9" d="M4.5 8h7m0 0l-3-3m3 3l-3 3" />,
}

// trend arrow — up for a higher price (amber), down for a lower price (green)
function TrendIcon({ lower, color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      {lower ? (
        <>
          <path d="M2 4.5l3.6 3.6 2.4-2.4L14 11.3" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M10.2 11.5H14V7.7" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      ) : (
        <>
          <path d="M2 11.5l3.6-3.6 2.4 2.4L14 4.7" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M10.2 4.5H14v3.8" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      )}
    </svg>
  )
}

// scrub tracking — stiff spring so the line trails the finger just slightly
const SCRUB_SPRING = { type: 'spring', stiffness: 550, damping: 45 }

// Trend colours by state — green = current price is a good deal, amber = higher.
const TREND = {
  lower: {
    color: '#0B623F',
    shell: 'linear-gradient(180deg, #F5F5F5 29.28%, #F6FEEC 67.02%, #DCFFCA 100%)',
  },
  higher: {
    color: '#A36200',
    shell: 'linear-gradient(180deg, #F5F5F5 29.28%, #FEF9EC 67.02%, #FFDAAA 100%)',
  },
}

export default function PriceHistorySheet({ open, onClose, onAdd, image, data, dataId = 'ph-sheet' }) {
  const did = (s) => `${dataId}-${s}`
  const [range, setRange] = useState('1y')
  const active = data.ranges[range]
  const points = active.points.map((price, i) => ({ i, price }))
  const todayPrice = active.points[active.points.length - 1]
  // average price over the SELECTED period — drives the dashed guide line
  const avgPrice = active.points.reduce((sum, p) => sum + p, 0) / active.points.length
  // trend is COMPUTED from the data (today vs the period average) so the note
  // always matches the chart — e.g. higher than the 1-month average but lower
  // than the 3-month / 1-year averages
  const diff = todayPrice - avgPrice
  const isLower = diff < 0
  const mag = Math.abs(diff)
  const trendAmount = mag >= 5 ? String(Math.round(mag)) : String(Math.round(mag * 2) / 2)
  const trendReference = `the ${active.label.toLowerCase()} average`
  const tone = isLower ? TREND.lower : TREND.higher
  // shared y-scale: nice rounded ticks covering the range's span. The labels
  // are equal-height cells (each tick centres at (k+0.5)/n of the column), so
  // the chart domain widens by half a step per side to keep the curve aligned.
  const { lo, hi, step, ticks } = niceTicks(Math.min(...active.points), Math.max(...active.points))
  const yLo = lo - step / 2
  const yHi = hi + step / 2
  // price column hugs the widest tick label (glyph + digits + padding)
  const axisWidth = Math.ceil(9 + Math.max(...ticks.map((t) => String(t).length)) * 6.4 + 8)
  // x-scale: land the data span on the label-cell CENTERS — the first point
  // over the first label's centre and the endpoint dot over "Today"'s centre.
  // Cells are equal-width, so cell k centres at (k + 0.5)/n of the track;
  // widen the domain so [0, N-1] maps onto [0.5/n, (n-0.5)/n] of the plot.
  const nLabels = active.labels.length
  const f0 = 0.5 / nLabels
  const f1 = (nLabels - 0.5) / nLabels
  const domainLo = -(f0 * (points.length - 1)) / (f1 - f0)
  const domainHi = domainLo + (points.length - 1) / (f1 - f0)
  // flat extension point at the LEFT edge only — history reads as continuing
  // into the past, but nothing exists after Today, so the line ends on its dot
  const series = [{ i: domainLo, price: active.points[0] }, ...points]

  // ---- scrubber: hover / press / slide reveals the price at that point ----
  const plotRef = useRef(null)
  const [scrub, setScrub] = useState(null) // { i, x, y, plotW } in plot px
  const [selectedStat, setSelectedStat] = useState(null) // stat card pinning the marker
  const markerAt = (i) => {
    const el = plotRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setScrub({
      i,
      x: ((i - domainLo) / (domainHi - domainLo)) * rect.width,
      y: ((yHi - active.points[i]) / (yHi - yLo)) * rect.height,
      plotW: rect.width,
    })
  }
  const updateScrub = (clientX) => {
    const el = plotRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const f = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const coord = domainLo + f * (domainHi - domainLo)
    setSelectedStat(null) // manual scrubbing releases a stat-pinned marker
    markerAt(Math.round(Math.min(points.length - 1, Math.max(0, coord)))) // snap to nearest point
  }

  // ---- stats: computed from the SELECTED range; tapping pins the marker ----
  const statValues = {
    lowest: Math.min(...active.points),
    highest: Math.max(...active.points),
    today: todayPrice,
  }
  const onStatClick = (key) => {
    if (selectedStat === key) {
      setSelectedStat(null)
      setScrub(null)
      return
    }
    setSelectedStat(key)
    markerAt(key === 'today' ? points.length - 1 : active.points.indexOf(statValues[key]))
  }
  // date for point i — the series ends today and spans `days` back
  const scrubDate = (i) => {
    const d = new Date()
    d.setDate(d.getDate() - Math.round(((points.length - 1 - i) * (active.days ?? 365)) / (points.length - 1)))
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  }
  const selectRange = (key) => {
    setRange(key)
    setScrub(null)
    setSelectedStat(null)
  }
  // pill flips right when there isn't ~120px of room on the left of the line
  const pillLeft = scrub ? scrub.x > 120 : true

  return (
    <AnimatePresence>
      {open && (
        <motion.div key={dataId} data-id={dataId} className="fixed inset-0 z-[60] flex justify-center">
          {/* frame-width column so the scrim + sheet track the phone frame */}
          <div className="relative w-full max-w-md">
            {/* Scrim — 80% #000 */}
            <motion.div
              data-id={did('scrim')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80"
            />

            {/* Grabber + sheet */}
            <motion.div
              data-id={did('wrap')}
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '110%' }}
              transition={springs.sheet}
              className="absolute inset-x-0 bottom-0 flex flex-col items-center"
            >
              <div data-id={did('grabber')} className="flex h-7 items-center justify-center">
                <span className="h-1 w-9 rounded-full bg-white/[0.64]" />
              </div>

              <div
                data-id={did('sheet')}
                className="mx-3 mb-3 flex w-[calc(100%-24px)] flex-col rounded-2xl bg-white shadow-[0px_-2px_16px_rgba(0,0,0,0.12)]"
              >
                {/* Header — product tile + title + dotted subtitle */}
                <div data-id={did('header')} className="flex h-[72px] items-center gap-3 border-b border-[#F9F9FB] p-4">
                  <span data-id={did('header-image')} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#EAECF0] bg-white">
                    <img src={image} alt="" aria-hidden="true" className="h-12 w-12 object-contain" />
                  </span>
                  <div data-id={did('header-copy')} className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span data-id={did('title')} className="font-noontree text-[16px] font-bold leading-5 tracking-[-0.15px] text-[#1D2539]">
                      Price history
                    </span>
                    <span data-id={did('subtitle')} className="flex items-center gap-2.5">
                      {data.subtitle.map((part, i) => (
                        <span key={i} className="flex items-center gap-2.5">
                          {i > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#D9D9D9]" />}
                          <span className="truncate font-noontree text-[12px] font-normal leading-[18px] tracking-[-0.1px] text-[#475067]">
                            {part}
                          </span>
                        </span>
                      ))}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div data-id={did('body')} className="flex flex-col gap-3 px-4 py-2">
                  {/* Range switch — sliding white pill */}
                  <div data-id={did('switch')} className="flex h-10 items-center rounded-full bg-[#F9F9FB] p-1 shadow-[inset_0px_1px_4px_rgba(36,36,36,0.04)]">
                    {Object.entries(data.ranges).map(([key, r]) => {
                      const isActive = key === range
                      return (
                        <button
                          key={key}
                          type="button"
                          data-id={did(`switch-${key}`)}
                          aria-pressed={isActive}
                          onClick={() => selectRange(key)}
                          className="relative flex h-8 flex-1 items-center justify-center rounded-full"
                        >
                          {isActive && (
                            <motion.span
                              layoutId={did('switch-pill')}
                              transition={springs.snappy}
                              className="absolute inset-0 rounded-full border border-white bg-white shadow-[0px_1px_6px_rgba(34,34,34,0.06)]"
                            />
                          )}
                          <span
                            className={`relative z-10 font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px] ${
                              isActive ? 'text-[#1D2539]' : 'text-[#666D85]'
                            }`}
                          >
                            {r.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Chart shell — gradient frame (green when the price is a good
                      deal now, amber when it's higher) with the trend note on it */}
                  <div
                    data-id={did('chart-shell')}
                    className="flex flex-col rounded-2xl p-px"
                    style={{ background: tone.shell }}
                  >
                    <div data-id={did('chart-card')} className="flex flex-col rounded-[14px] bg-white px-2 py-4">
                      {/* Section 1 — prices (left) | plot (right) */}
                      <div data-id={did('chart-plot-row')} className="flex h-[140px]">
                        {/* price labels — equal-height cells filling the column,
                            each amount right-aligned and centred in its cell */}
                        <div data-id={did('y-axis')} className="flex h-full shrink-0 flex-col" style={{ width: axisWidth }}>
                          {ticks.map((t) => (
                            <div
                              key={t}
                              data-id={did(`y-tick-${t}`)}
                              className="flex flex-1 items-center justify-end gap-[1.5px] pr-1.5 text-[#989FB3]"
                            >
                              <DirhamGlyph />
                              <span className="font-noontree text-[11px] leading-none">{t}</span>
                            </div>
                          ))}
                        </div>

                        {/* plot — axis hairlines drawn as borders on this box.
                            Pointer handlers drive the scrubber (hover / slide). */}
                        <div
                          ref={plotRef}
                          data-id={did('plot')}
                          onPointerMove={(e) => updateScrub(e.clientX)}
                          onPointerDown={(e) => {
                            e.currentTarget.setPointerCapture?.(e.pointerId)
                            updateScrub(e.clientX)
                          }}
                          onPointerUp={(e) => {
                            if (e.pointerType !== 'mouse') setScrub(null)
                          }}
                          onPointerLeave={() => setScrub(null)}
                          className="relative min-w-0 flex-1 touch-none border-b-[0.5px] border-l-[0.5px] border-[#E4E5EA]"
                        >
                          {/* average price guide — springs to the new level on
                              period change (recharts' ReferenceLine can't move) */}
                          <motion.div
                            data-id={did('avg-line')}
                            aria-hidden="true"
                            initial={false}
                            animate={{ top: `${((yHi - avgPrice) / (yHi - yLo)) * 100}%` }}
                            transition={springs.snappy}
                            className="pointer-events-none absolute inset-x-0 z-10 h-px"
                          >
                            <svg width="100%" height="1" preserveAspectRatio="none" className="block">
                              <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="#C0C2F6" strokeWidth="0.75" strokeDasharray="4 4" />
                            </svg>
                          </motion.div>

                          {/* scrubber — dashed line + dot + date/price pill */}
                          <AnimatePresence>
                            {scrub && (
                              <motion.div
                                key="scrub"
                                data-id={did('scrub')}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="pointer-events-none absolute inset-0 z-20"
                              >
                                {/* vertical dashed line */}
                                <motion.div
                                  data-id={did('scrub-line')}
                                  initial={false}
                                  animate={{ x: scrub.x }}
                                  transition={SCRUB_SPRING}
                                  className="absolute inset-y-0 left-0 w-px"
                                >
                                  <svg width="1" height="100%" preserveAspectRatio="none" className="block h-full">
                                    <line x1="0.5" y1="0" x2="0.5" y2="100%" stroke="#666D85" strokeWidth="0.75" strokeDasharray="4 4" />
                                  </svg>
                                </motion.div>

                                {/* dot on the curve */}
                                <motion.span
                                  data-id={did('scrub-dot')}
                                  initial={false}
                                  animate={{ x: scrub.x - 4, y: scrub.y - 4 }}
                                  transition={SCRUB_SPRING}
                                  className="absolute left-0 top-0 h-2 w-2 rounded-full bg-[#1D2539]"
                                />

                                {/* date + price pill — left of the line when there's
                                    room, flipped to the right near the left edge */}
                                <motion.div
                                  data-id={did('scrub-pill')}
                                  initial={false}
                                  animate={{ x: scrub.x, y: scrub.y }}
                                  transition={SCRUB_SPRING}
                                  className="absolute left-0 top-0"
                                  style={{ filter: 'drop-shadow(0px 0px 12px rgba(0,0,0,0.16))' }}
                                >
                                  <div
                                    data-id={did('scrub-pill-inner')}
                                    className={`flex h-[22px] w-max -translate-y-1/2 items-center gap-1 rounded-full border border-[#EAECF0] bg-white px-2 ${
                                      pillLeft ? '-translate-x-[calc(100%+10px)]' : 'translate-x-[10px]'
                                    }`}
                                  >
                                    <span className="font-noontree text-[11px] font-normal leading-3 tracking-[-0.12px] text-[#666D85]">
                                      {scrub.i === points.length - 1 ? 'Today:' : `${scrubDate(scrub.i)}:`}
                                    </span>
                                    <span className="inline-flex items-center gap-px font-noontree text-[11px] font-semibold leading-3 tracking-[-0.12px] text-[#1D2539]">
                                      <Dirham />
                                      {active.points[scrub.i]}
                                    </span>
                                  </div>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={series} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                              <defs>
                                <linearGradient id="ph-fill" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#E4E3FF" />
                                  <stop offset="100%" stopColor="#FFFFFF" />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="i" type="number" domain={[domainLo, domainHi]} hide />
                              <YAxis domain={[yLo, yHi]} hide />
                              <Area
                                type="stepAfter"
                                dataKey="price"
                                stroke={LINE}
                                strokeWidth={1.5}
                                fill="url(#ph-fill)"
                                isAnimationActive
                                animationDuration={600}
                                dot={<EndDot todayI={points.length - 1} />}
                                activeDot={false}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Section 2 — spacer (left) | period labels (right), same
                          column widths as section 1. Equal-width cells; labels
                          adapt to the range (days for 1M, months for 3M/1Y). */}
                      <div data-id={did('chart-label-row')} className="flex h-7">
                        <div className="shrink-0" style={{ width: axisWidth }} />
                        <div data-id={did('x-axis')} className="flex min-w-0 flex-1 items-end">
                          {active.labels.map((label, i) => (
                            <span
                              key={`${label}-${i}`}
                              data-id={did(`x-tick-${i}`)}
                              className={`flex-1 text-center font-noontree text-[11px] leading-[14px] tracking-[-0.1px] ${
                                label === 'Today' ? 'font-semibold text-[#1D2539]' : 'font-normal text-[#989FB3]'
                              }`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* trend note — sits on the coloured bottom of the shell.
                        Amount reads semibold, the rest medium. */}
                    <div data-id={did('trend')} className="flex h-9 items-center gap-2.5 px-4" style={{ color: tone.color }}>
                      <TrendIcon lower={isLower} color={tone.color} />
                      <span className="font-noontree text-[12px] font-medium leading-5 tracking-[-0.1px]">
                        <span className="inline-flex items-center gap-px font-semibold">
                          <Dirham />
                          {trendAmount}
                        </span>{' '}
                        {isLower ? 'lower' : 'higher'} than {trendReference}
                      </span>
                    </div>
                  </div>

                  {/* Lowest / Highest / Today stat cards — values follow the
                      selected range; tapping one pins the chart marker on that
                      point (tap again to release) */}
                  <div data-id={did('stats')} className="flex gap-2">
                    {[
                      { key: 'lowest', label: 'Lowest' },
                      { key: 'highest', label: 'Highest' },
                      { key: 'today', label: 'Today' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        data-id={did(`stat-${key}`)}
                        aria-pressed={selectedStat === key}
                        onClick={() => onStatClick(key)}
                        className={`flex flex-1 flex-col gap-2 rounded-lg border-2 px-3 py-2 text-left transition-colors ${
                          selectedStat === key ? 'border-[#BDDBFF] bg-white' : 'border-transparent bg-[#F9F9FB]'
                        }`}
                      >
                        {STAT_ICONS[key]}
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-px font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#1D2539]">
                            <Dirham />
                            {statValues[key]}
                          </span>
                          <span className="font-noontree text-[11px] font-medium leading-[14px] tracking-[-0.1px] text-[#666D85]">
                            {label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Better deal row — only when the price is higher now, to
                      steer the shopper to cheaper options (retention). Height
                      springs open (the bottom-anchored sheet expands upward)
                      while the row itself rises in from the bottom. */}
                  <AnimatePresence initial={false}>
                    {!isLower && (
                      <motion.div
                        key="deal"
                        data-id={did('deal')}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={springs.snappy}
                        className="overflow-hidden"
                      >
                        <motion.div
                          data-id={did('deal-inner')}
                          initial={{ y: 28 }}
                          animate={{ y: 0 }}
                          exit={{ y: 28 }}
                          transition={springs.snappy}
                          className="flex flex-col gap-3 pt-1"
                        >
                          <span aria-hidden="true" className="h-px w-full border-t border-dashed border-[#F2F3F7]" />
                          <button type="button" data-id={did('deal-row')} className="flex items-center justify-between">
                            <span className="flex flex-col items-start">
                              <span className="font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#1D2539]">
                                Looking for a better deal?
                              </span>
                              <span className="font-noontree text-[12px] font-normal leading-[18px] tracking-[-0.1px] text-[#666D85]">
                                select from other color options
                              </span>
                            </span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                              <path d="M6 9.5l6 6 6-6" stroke="#1D2539" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action bar */}
                <div data-id={did('footer')} className="p-3">
                  <PrimaryButton
                    dataId={did('add')}
                    label="Add to cart"
                    size="h52"
                    onPress={onAdd ?? onClose}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
