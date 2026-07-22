// PriceHistorySheet — "Price history" bottom sheet (Figma M-BottomSheet).
// Scrim + grabber + white sheet: product header, 1M/3M/1Y switch, a recharts
// gradient area chart (blue line, soft violet fill, endpoint dot, dashed
// today-price reference) inside an amber-gradient shell with a trend note,
// lowest/highest/today stat cards, a "better deal" row and an Add-to-cart CTA.
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { sheetMotion } from '../../utils/motion'
import { Dirham, withDirham } from '../../components/common/Dirham'
import { PrimaryButton } from '../../components/common/PrimaryButton'
import ratingStar from '../../assets/icons/rating-star.svg'

const LINE = '#6C6EE6' // softened indigo — subtler line + fill

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
function EndDot({ cx, cy, payload, todayI, color = LINE }) {
  if (payload?.i !== todayI) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill={color} opacity={0.12} />
      <circle cx={cx} cy={cy} r={4.5} fill={color} stroke="#FFFFFF" strokeWidth={1.5} />
    </g>
  )
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

// Filled disc-with-arrow icons for the stats row (amber up = highest, teal
// down = lowest) — the price-up / price-down marks from the design.
function HighestArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M1.9526 1.9526C4.55614 -0.650867 8.77723 -0.650867 11.3807 1.9526C13.9842 4.55613 13.9842 8.77723 11.3807 11.3807C8.93632 13.8251 5.06598 13.9745 2.44729 11.8289L8.6662 5.60995L8.66667 8.66666H10V3.33335H4.66667V4.66666L7.72392 4.6666L1.50448 10.886C-0.641146 8.26735 -0.491771 4.39698 1.9526 1.9526Z" fill="#FFC567" />
    </svg>
  )
}
function LowestArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M2.44732 1.50448C5.06604 -0.641146 8.93635 -0.491771 11.3807 1.9526C13.9842 4.55614 13.9842 8.77723 11.3807 11.3807C8.77723 13.9842 4.55614 13.9842 1.9526 11.3807C-0.491771 8.93635 -0.641146 5.06601 1.50448 2.44732L7.72342 8.6662L4.66667 8.66667V10H10V4.66667H8.66667L8.66673 7.72392L2.44732 1.50448Z" fill="#7FCCC8" />
    </svg>
  )
}

// trend arrow — up (price above usual), down (price improved) or flat (stable)
function TrendIcon({ dir, color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      {dir === 'down' ? (
        <>
          <path d="M2 4.5l3.6 3.6 2.4-2.4L14 11.3" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M10.2 11.5H14V7.7" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      ) : dir === 'flat' ? (
        <>
          <path d="M2 8h10.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" fill="none" />
          <path d="M9.8 4.8L13 8l-3.2 3.2" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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

// RollSwap — vertical-carousel swap for a single value: on `id` change the old
// content rolls up and out while the new rolls in from below, overlapping
// mid-flight (popLayout keeps both mounted → the "negative gap" feel).
function RollSwap({ id, className = '', transition = sheetMotion.roll, children }) {
  return (
    <span className={`relative inline-flex overflow-hidden ${className}`}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={id}
          initial={{ y: '80%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-80%', opacity: 0 }}
          transition={transition}
          className="inline-flex min-w-0 max-w-full items-center"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// Bar-chart column gradients (Figma "Data Visualization") — grey by default,
// with highest / lowest / today colour-coded.
const BAR_GRADIENTS = {
  general: 'linear-gradient(0deg, #EDEDED 0%, #BDBDBD 149.71%)',
  highest: 'linear-gradient(0deg, #FFF4D1 0%, #FFC567 149.71%)',
  lowest: 'linear-gradient(0deg, #E1F6EA 0%, #00C653 149.71%)',
  today: 'linear-gradient(0deg, #D6E1E9 0%, #89CBF9 149.71%)',
}
const BAR_STYLE = {
  border: '1px solid rgba(255,255,255,0.87)',
  borderBottom: 'none',
  boxShadow: 'inset 0px 4px 7px 2px rgba(255,255,255,0.46)',
}

// PriceBars — variation-3 chart: gradient columns bucketed from the series, one
// per period label, colour-coded (amber highest, green lowest, blue today) with
// a price pill floating over the special bars. Bar heights ride the same
// [yLo, yHi] scale as the y-ticks + average line, so everything stays aligned.
function PriceBars({ bars, yLo, yHi, selected, onSelect, dataId }) {
  const did = (s) => `${dataId}-${s}`
  // thinner bars + tighter gap as the count grows (daily 1M vs monthly 1Y/3M)
  const dense = bars.length > 14
  return (
    <div data-id={did('bars')} className={`flex h-full items-end ${dense ? 'gap-[2px]' : 'gap-1.5'}`}>
      {bars.map((b, i) => {
        const h = Math.max(3, ((b.value - yLo) / (yHi - yLo)) * 100)
        const show = selected === i
        return (
          <button
            key={i}
            type="button"
            data-id={did(`bar-${i}`)}
            aria-pressed={show}
            onClick={() => onSelect(show ? null : i)}
            className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end outline-none"
          >
            {/* price pill — only after the user taps the bar (absolute + nowrap
                so it can overflow a thin column without breaking the row) */}
            <AnimatePresence>
              {show && (
                <motion.span
                  key="pill"
                  data-id={did(`bar-${i}-pill`)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={sheetMotion.fade}
                  className="absolute left-1/2 z-10 flex h-[18px] -translate-x-1/2 items-center whitespace-nowrap rounded-full border border-[#F9F9FB] bg-white px-1.5 shadow-[0px_2px_6px_rgba(0,0,0,0.12)]"
                  style={{ bottom: `calc(${h}% + 4px)` }}
                >
                  <span className="inline-flex items-center gap-px font-noontree text-[11px] font-semibold leading-3 tracking-[-0.12px] text-[#1D2539]">
                    <Dirham />
                    {b.value}
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
            <motion.div
              initial={false}
              animate={{ height: `${h}%`, opacity: selected == null || show ? 1 : 0.55 }}
              transition={sheetMotion.guide}
              className={`w-full ${dense ? 'max-w-[10px] rounded-t-[3px]' : 'max-w-[28px] rounded-t-[4px]'}`}
              style={{ background: BAR_GRADIENTS[b.kind], ...BAR_STYLE }}
            />
          </button>
        )
      })}
    </div>
  )
}

// Trend colours by state. `up` = price rose (orange, a warning), `down` = price
// fell (green, a good deal), `stable` = flat (neutral grey). `color` tints the
// banner text, `accent` the delta chip + arrow, `chart` the graph line/dot,
// `bg` the banner fill.
const TREND = {
  up: { color: '#73260D', accent: '#E8590C', chart: '#FF7E0D', bg: '#FFFAF5' },
  down: { color: '#0B623F', accent: '#0F8A4C', chart: '#0F7EFF', bg: '#EEFBF2' },
  stable: { color: '#475067', accent: '#666D85', chart: '#0F7EFF', bg: '#F4F5F7' },
}

// Compact inline stat (Lowest / Highest / Today) sitting on top of the graph.
// Tapping pins the chart marker on that point; `primary` flexes to fill.
function StatChip({ statKey, label, value, selected, onClick, primary, did }) {
  return (
    <button
      type="button"
      data-id={did(`stat-${statKey}`)}
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-left outline-none transition-colors duration-200 ease-out ${
        primary ? 'flex-1' : ''
      } ${selected ? 'bg-[#EAF1FF]' : ''}`}
    >
      {STAT_ICONS[statKey]}
      <span className="flex flex-col items-start">
        <span className="inline-flex items-center gap-px font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#1D2539]">
          <Dirham />
          {value}
        </span>
        <span className="font-noontree text-[12px] font-medium leading-[18px] tracking-[-0.1px] text-[#666D85]">
          {label}
        </span>
      </span>
    </button>
  )
}

export default function PriceHistorySheet({ open, onClose, onAdd, image, data, dataId = 'ph-sheet', compact = false }) {
  const did = (s) => `${dataId}-${s}`
  const [range, setRange] = useState('1m')
  const active = data.ranges[range]

  // ---- variant selection (deal accordion) — rescales the whole sheet ----
  const [dealOpen, setDealOpen] = useState(false)
  const [variantId, setVariantId] = useState(null) // nothing selected by default
  const [barSel, setBarSel] = useState(null) // bar-chart: tapped bar (pill) index

  // Body scroll region — when the variants accordion expands past the sheet's
  // height cap, glide to the bottom so the newly revealed options are visible.
  const bodyRef = useRef(null)
  useEffect(() => {
    if (!dealOpen) return undefined
    const t = setTimeout(() => {
      bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
    }, 420) // after the container spring settles, so we scroll to the REAL bottom
    return () => clearTimeout(t)
  }, [dealOpen])
  const baseVariant = data.variants?.find((v) => v.current)
  const activeVariant = data.variants?.find((v) => v.id === variantId) ?? null
  // selected size scales the price series proportionally, so the graph, stats
  // and trend all follow the selection
  const priceScale = activeVariant && baseVariant ? activeVariant.price / baseVariant.price : 1
  const noun = data.variantNoun ?? 'option' // shampoo → "bottle"
  const cheapestVariant = Math.min(...(data.variants ?? [{ price: 0 }]).map((v) => v.price))
  const cheapestVariantObj = (data.variants ?? []).find((v) => v.price === cheapestVariant)
  // best-value variant: lowest price-per-unit if every variant has a unit (ml),
  // otherwise simply the cheapest (e.g. phone colours have no unit)
  const variantList = data.variants ?? []
  const hasUnit = variantList.length > 0 && variantList.every((v) => v.ml != null)
  const bestValueId = variantList.reduce(
    (best, v) =>
      (hasUnit ? v.price / v.ml : v.price) < (hasUnit ? best.price / best.ml : best.price) ? v : best,
    variantList[0] ?? {},
  )?.id
  const prices = active.points.map((p) => Math.round(p * priceScale * 100) / 100)

  const points = prices.map((price, i) => ({ i, price }))
  const todayPrice = prices[prices.length - 1]
  // average price over the SELECTED period — drives the dashed guide line
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length

  // variation 3 — bar chart: bucket the series into one bar per period label,
  // colour-coded highest / lowest / today (today wins ties)
  const isBars = data.chart === 'bars'
  const bars = (() => {
    if (!isBars) return []
    // granularity per range: every day (1M), every month (3M / 1Y)
    const n = active.barCount ?? active.labels.length
    const raw = Array.from({ length: n }, (_, i) => {
      const from = Math.round((i * prices.length) / n)
      const to = Math.max(Math.round(((i + 1) * prices.length) / n), from + 1)
      const isToday = i === n - 1
      const slice = prices.slice(from, to)
      const value = isToday
        ? todayPrice
        : Math.round((slice.reduce((a, b) => a + b, 0) / slice.length) * 100) / 100
      return { value, isToday }
    })
    // highlight only ONE highest and ONE lowest bar (most recent extreme) —
    // colouring every tied bar reads as noise
    let hiIdx = 0
    let loIdx = 0
    raw.forEach((b, i) => {
      if (b.value >= raw[hiIdx].value) hiIdx = i
      if (b.value <= raw[loIdx].value) loIdx = i
    })
    return raw.map((b, i) => ({
      ...b,
      kind: i === hiIdx ? 'highest' : i === loIdx ? 'lowest' : 'general',
    }))
  })()
  const barsDense = bars.length > 14
  // one x-label slot PER BAR so the axis aligns exactly; the range's sparse
  // labels are placed on their mapped bar indices ("Today" omitted), rest blank
  const barTicks = (() => {
    if (!isBars) return []
    const n = bars.length
    // drop "Today" first, then spread the remaining labels evenly across the
    // bars (endpoints included) so none collide — e.g. 3M → Apr/May/Jun on 3 bars
    const labels = active.labels.filter((l) => l !== 'Today')
    const arr = Array(n).fill('')
    labels.forEach((lab, j) => {
      arr[labels.length === 1 ? 0 : Math.round((j * (n - 1)) / (labels.length - 1))] = lab
    })
    return arr
  })()
  // similar-product mode (e.g. the phone) — the "better value" action shows
  // alternative products instead of this product's own variants
  const hasSimilar = (data.similar?.length ?? 0) > 0
  const cheapestSimilar = hasSimilar ? Math.min(...data.similar.map((s) => s.price)) : 0

  // ---- price-position banner (deterministic, spec-driven) ------------------
  // A HIGHLIGHT (bold superlative) + a SUMMARY line. Both are ABSOLUTE — they
  // read the 30d / 90d / 365d windows and the 30-day delta, so the banner is
  // the same regardless of which range tab is selected. Windows are scaled by
  // the active variant so the message tracks the selected colour/size.
  const scaleWin = (arr) => (arr ?? []).map((p) => Math.round(p * priceScale * 100) / 100)
  const win30 = scaleWin(data.ranges['1m']?.points)
  const win90 = scaleWin(data.ranges['3m']?.points)
  const win365 = scaleWin(data.ranges['1y']?.points)
  const current = todayPrice
  const mrp = data.mrp != null ? Math.round(data.mrp * priceScale * 100) / 100 : null
  const has12mo = win365.length > 0 && (data.ranges['1y']?.days ?? 0) >= 365
  // 30-day drop math — price_30d_ago is the window's first point; null (→ no
  // delta line) when the SKU has < 30 days of history
  const price30dAgo = win30.length ? win30[0] : null
  const delta30 = price30dAgo ? ((current - price30dAgo) / price30dAgo) * 100 : null
  const lo30 = win30.length ? Math.min(...win30) : current
  const hi30 = win30.length ? Math.max(...win30) : current
  const stable30 = hi30 - lo30 < current * 0.01 // essentially flat across 30d
  // 90-day interquartile band (linear-interpolated percentiles)
  const percentile = (arr, q) => {
    if (!arr.length) return current
    const s = [...arr].sort((a, b) => a - b)
    const idx = (s.length - 1) * q
    const lo = Math.floor(idx)
    const hi = Math.ceil(idx)
    return s[lo] + (s[hi] - s[lo]) * (idx - lo)
  }
  const p25 = percentile(win90, 0.25)
  const p75 = percentile(win90, 0.75)
  // formatting + reusable clauses
  const money = (x) => `AED${Math.round(x)}`
  const belowMrp = mrp != null && mrp > current ? Math.round(((mrp - current) / mrp) * 100) : 0
  const mrpClause = mrp != null && belowMrp > 0 ? ` This is ${belowMrp}% below the MRP of ${money(mrp)}.` : ''
  const rangeOrStable = stable30
    ? `In the last 30 days, price is stable at ${money(current)}.`
    : `In the last 30 days, price has ranged from ${money(lo30)} to ${money(hi30)}.`
  const dropPct = delta30 != null && delta30 < 0 ? Math.round(-delta30) : 0
  const risePct = delta30 != null && delta30 > 0 ? Math.round(delta30) : 0
  const rangedTail = `it ranged from ${money(lo30)} to ${money(hi30)}.`
  // 30-day directional summary — "increased/dropped by X% and it ranged …";
  // falls back to a plain range when the rounded move is 0, and to '' when the
  // SKU has < 30 days of history (Line-1 window rule then stands alone)
  const directionalSummary =
    price30dAgo == null
      ? ''
      : risePct > 0
        ? `In the last 30 days, price has increased by ${risePct}% and ${rangedTail}`
        : dropPct > 0
          ? `In the last 30 days, price has dropped by ${dropPct}% and ${rangedTail}`
          : rangeOrStable
  // "lowest" states always frame the move as a drop (current sits at the low)
  const droppedSummary =
    price30dAgo == null ? '' : dropPct > 0 ? directionalSummary : rangeOrStable

  let insight
  if (has12mo && current <= Math.min(...win365)) {
    insight = { tone: 'down', icon: 'down', highlight: 'Lowest price in a year', summary: droppedSummary }
  } else if (win90.length && current <= Math.min(...win90)) {
    insight = { tone: 'down', icon: 'down', highlight: 'Lowest price in the last 90 days', summary: droppedSummary }
  } else if (win30.length && current <= Math.min(...win30)) {
    insight = { tone: 'down', icon: 'down', highlight: 'Lowest price in the last 30 days', summary: droppedSummary }
  } else if (win90.length && current >= p25 && current <= p75 && delta30 != null && Math.abs(delta30) < 3) {
    insight = { tone: 'stable', icon: 'flat', highlight: 'Around the typical price for this product', summary: `${rangeOrStable}${mrpClause}` }
  } else if (risePct > 0) {
    // price rose over the month → orange "increased" state
    insight = { tone: 'up', icon: 'up', highlight: '', summary: directionalSummary }
  } else if (dropPct > 0) {
    // price fell (but not to a window low) → green "dropped" state
    insight = { tone: 'down', icon: 'down', highlight: '', summary: directionalSummary }
  } else {
    // flat → neutral grey
    insight = { tone: 'stable', icon: 'flat', highlight: '', summary: `${rangeOrStable}${mrpClause}` }
  }
  const priceHigh = insight.tone === 'up'
  const tone = TREND[insight.tone]
  // 30-day delta chip beside the current price (sign + 2-decimal %)
  const deltaText = delta30 == null ? null : `${delta30 >= 0 ? '+' : '-'}${Math.abs(delta30).toFixed(2)}%`
  // chart line + endpoint dot follow the state (orange rising, blue otherwise)
  const lineColor = tone.chart
  // shared y-scale: nice rounded ticks covering the range's span. The labels
  // are equal-height cells (each tick centres at (k+0.5)/n of the column), so
  // the chart domain widens by half a step per side to keep the curve aligned.
  // In bar mode the scale follows the (bucketed) BAR values so the bars fill
  // the plot per period, instead of the raw point range.
  const scaleVals = isBars ? bars.map((b) => b.value) : prices
  const { lo, hi, step, ticks } = niceTicks(Math.min(...scaleVals), Math.max(...scaleVals))
  // symmetric half-step padding keeps the equal-height y-tick cells aligned
  // with the value scale (bars, curve and avg line)
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
  const series = [{ i: domainLo, price: prices[0] }, ...points]

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
      y: ((yHi - prices[i]) / (yHi - yLo)) * rect.height,
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
    lowest: Math.min(...prices),
    highest: Math.max(...prices),
    today: todayPrice,
  }
  const onStatClick = (key) => {
    if (selectedStat === key) {
      setSelectedStat(null)
      setScrub(null)
      return
    }
    setSelectedStat(key)
    markerAt(key === 'today' ? points.length - 1 : prices.indexOf(statValues[key]))
  }
  // date for point i — the series ends on `data.asOf` (datasets with a fixed
  // export date, e.g. the real wearables series) or today, and spans `days`
  // back. Points must be UNIFORMLY spaced for these dates to line up.
  const scrubDate = (i) => {
    const asOf = active.asOf ?? data.asOf // per-range export date wins (1Y real data)
    const d = asOf ? new Date(asOf) : new Date()
    d.setDate(d.getDate() - Math.round(((points.length - 1 - i) * (active.days ?? 365)) / (points.length - 1)))
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  }
  const selectRange = (key) => {
    setRange(key)
    setScrub(null)
    setSelectedStat(null)
    setBarSel(null)
  }

  // selecting a size: toggle, release any pinned marker (positions change)
  const selectVariant = (id) => {
    setVariantId((cur) => (cur === id ? null : id))
    setScrub(null)
    setSelectedStat(null)
    setBarSel(null)
  }
  // deal section visibility — amber state, or any state once a size is picked
  const showDeal = priceHigh || !!activeVariant
  // pill flips right when there isn't ~120px of room on the left of the line
  const pillLeft = scrub ? scrub.x > 120 : true
  // header content follows the selected size
  const headerImage = activeVariant?.image ?? image
  const subtitleParts = [data.subtitle[0], data.subtitle[1], activeVariant?.label ?? data.subtitle[2]]
  // compact skin (variation 2): header shows the PRODUCT as the title and
  // "colour · spec" as the subtitle, instead of the generic "Price history".
  const compactTitle = data.subtitle[1]
  const compactSubParts = [activeVariant?.label ?? data.subtitle[2], data.specs?.[0]].filter(Boolean)

  // Range switch — placed at the TOP by default, or at the BOTTOM (narrower,
  // centred, bordered pill with a grey selected segment) in the compact skin.
  const rangeSwitch = (
    <div
      data-id={did('switch')}
      className={`flex h-10 items-center rounded-full p-1 ${
        compact
          ? 'mx-auto w-[220px] border border-[#EAECF0] bg-white'
          : 'bg-[#F9F9FB] shadow-[inset_0px_1px_4px_rgba(36,36,36,0.04)]'
      }`}
    >
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
                transition={sheetMotion.control}
                className={`absolute inset-0 rounded-full ${
                  compact
                    ? 'bg-[#EAECF0]'
                    : 'border border-white bg-white shadow-[0px_1px_6px_rgba(34,34,34,0.06)]'
                }`}
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
  )

  // Insight banner — reused above the graph (compact) or below it (default).
  const bannerBlock = (
    <div
      data-id={did('trend')}
      className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5"
      style={{ background: tone.bg, color: tone.color }}
    >
      <RollSwap
        id={`${insight.highlight}|${insight.summary}`}
        transition={sheetMotion.rollText}
        className="min-w-0 flex-1"
      >
        <span className="flex min-w-0 flex-col gap-0.5 font-noontree text-[12px] leading-4 tracking-[-0.1px]">
          {insight.highlight && (
            <span data-id={did('trend-highlight')} className="font-semibold">
              {withDirham(insight.highlight)}
            </span>
          )}
          <span data-id={did('trend-summary')} className="font-medium">
            {withDirham(insight.summary)}
          </span>
        </span>
      </RollSwap>
    </div>
  )

  return (
    // Always-mounted shell whose pointer-events follow `open` — the moment the
    // sheet closes, taps/scroll pass through to the page again, even while the
    // exit animation is still playing (or if a nested presence delays unmount).
    <div
      data-id={did('root')}
      className="fixed inset-0 z-[60]"
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      <AnimatePresence>
        {open && (
          <motion.div key={dataId} data-id={dataId} className="absolute inset-0 flex justify-center">
            {/* frame-width column so the scrim + sheet track the phone frame */}
            <div className="relative w-full max-w-md">
            {/* Scrim — 80% #000 */}
            <motion.div
              data-id={did('scrim')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: sheetMotion.scrimOut }}
              transition={sheetMotion.scrimIn}
              onClick={onClose}
              className="absolute inset-0 bg-black/80"
            />

            {/* Grabber + sheet */}
            <motion.div
              data-id={did('wrap')}
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '110%', transition: sheetMotion.sheetOut }}
              transition={sheetMotion.sheetIn}
              className="absolute inset-x-0 bottom-0 flex flex-col items-center"
            >
              <div data-id={did('grabber')} className="flex h-7 items-center justify-center">
                <span className="h-1 w-9 rounded-full bg-white/[0.64]" />
              </div>

              <div
                data-id={did('sheet')}
                className="mx-3 mb-3 flex max-h-[min(85dvh,700px)] w-[calc(100%-24px)] flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_-2px_16px_rgba(0,0,0,0.12)]"
              >
                {/* Header — product tile + title + dotted subtitle. Compact
                    (variation 2) shows the product name as the title and a
                    dashed divider, per the M-SectionHeader spec. */}
                <div data-id={did('header')} className={`flex shrink-0 items-center gap-3 p-4 ${compact ? 'border-b border-dashed border-[#F2F3F7]' : 'border-b border-[#F9F9FB]'}`}>
                  <span data-id={did('header-image')} className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#EAECF0] bg-white ${compact ? 'h-10 w-10' : 'h-14 w-14'}`}>
                    <RollSwap id={headerImage} className={compact ? 'h-8 w-8' : 'h-12 w-12'}>
                      <img src={headerImage} alt="" aria-hidden="true" className={`object-contain ${compact ? 'h-8 w-8' : 'h-12 w-12'}`} />
                    </RollSwap>
                  </span>
                  <div data-id={did('header-copy')} className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span data-id={did('title')} className={`font-noontree tracking-[-0.15px] text-[#1D2539] ${compact ? 'text-[16px] font-semibold leading-[22px]' : 'text-[16px] font-bold leading-5'}`}>
                      {compact ? compactTitle : 'Price history'}
                    </span>
                    <span data-id={did('subtitle')} className="flex min-w-0 items-center gap-2.5">
                      {(compact ? compactSubParts : subtitleParts).map((part, i, arr) => {
                        // last part (the variant, e.g. "Midnight Black") flexes
                        // and truncates so a long value can't overflow the row;
                        // store + product keep their space
                        const isLast = i === arr.length - 1
                        return (
                          <span key={i} className={`flex items-center gap-2.5 ${isLast ? 'min-w-0 flex-1' : 'shrink-0'}`}>
                            {i > 0 && <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-[#D9D9D9]" />}
                            {/* each value rolls independently when it changes */}
                            <RollSwap id={part} className={isLast ? 'min-w-0' : ''}>
                              <span className="truncate font-noontree text-[12px] font-normal leading-[18px] tracking-[-0.1px] text-[#475067]">
                                {part}
                              </span>
                            </RollSwap>
                          </span>
                        )
                      })}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div ref={bodyRef} data-id={did('body')} className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-2">
                  {/* Section 1 — the analysis: range tabs + graph read as ONE unit */}
                  <div data-id={did('chart-group')} className="flex shrink-0 flex-col gap-3">
                    {/* Range switch at the top (default layout only) */}
                    {!compact && rangeSwitch}

                    {/* Graph container. Default: bordered white card with the
                        trend note below. Compact (variation 2): borderless, with
                        the amount → banner → graph stacked, per the mock. */}
                    <div
                      data-id={did('chart-card')}
                      className={
                        compact
                          ? 'flex flex-col gap-2'
                          : 'flex flex-col gap-3 rounded-2xl border border-[#EAECF0] bg-white px-2 py-4'
                      }
                    >
                    {/* Compact (variation 2) — the amount block and the insight
                        banner are grouped as one unit, 12px apart. */}
                    {compact && (
                      <div data-id={did('stats-trend-group')} className="flex flex-col gap-3">
                      <div data-id={did('stats')} className="flex flex-col gap-2 px-1 pt-1">
                        <div className="flex items-end gap-1.5">
                          <button
                            type="button"
                            data-id={did('stat-today')}
                            aria-pressed={selectedStat === 'today'}
                            onClick={() => onStatClick('today')}
                            className="inline-flex items-center gap-px font-noontree text-[18px] font-semibold leading-6 tracking-[-0.15px] text-[#1D2539] outline-none"
                          >
                            <Dirham />
                            {statValues.today}
                          </button>
                          {deltaText && (
                            <span data-id={did('delta')} className="inline-flex items-center gap-1 pb-0.5">
                              <span className="font-noontree text-[12px] font-semibold leading-[18px] tracking-[-0.1px]" style={{ color: tone.accent }}>
                                {deltaText}
                              </span>
                              <TrendIcon dir={insight.icon} color={tone.accent} />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            data-id={did('stat-highest')}
                            aria-pressed={selectedStat === 'highest'}
                            onClick={() => onStatClick('highest')}
                            className="inline-flex items-center gap-1 font-noontree text-[12px] font-normal leading-[18px] tracking-[-0.1px] text-[#666D85] outline-none"
                          >
                            Highest:
                            <span className="inline-flex items-center gap-px font-semibold text-[#1D2539]">
                              <Dirham />
                              {statValues.highest}
                            </span>
                          </button>
                          <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-[#D9D9D9]" />
                          <button
                            type="button"
                            data-id={did('stat-lowest')}
                            aria-pressed={selectedStat === 'lowest'}
                            onClick={() => onStatClick('lowest')}
                            className="inline-flex items-center gap-1 font-noontree text-[12px] font-normal leading-[18px] tracking-[-0.1px] text-[#666D85] outline-none"
                          >
                            Lowest:
                            <span className="inline-flex items-center gap-px font-semibold text-[#1D2539]">
                              <Dirham />
                              {statValues.lowest}
                            </span>
                          </button>
                        </div>
                      </div>
                      {bannerBlock}
                      </div>
                    )}
                    {/* Stats — Current price leads (value in the trend colour +
                        matching arrow), then Highest (amber) and Lowest (teal).
                        Tapping a stat pins the marker. */}
                    {!compact && (
                    <div data-id={did('stats')} className="flex items-center gap-3 p-2">
                      {/* Current price (today) */}
                      <button
                        type="button"
                        data-id={did('stat-today')}
                        aria-pressed={selectedStat === 'today'}
                        onClick={() => onStatClick('today')}
                        className="flex flex-[3] flex-col items-start gap-0 text-left outline-none"
                      >
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="inline-flex items-center gap-px font-noontree text-[14px] font-bold leading-5 tracking-[-0.1px]"
                            style={{ color: tone.color }}
                          >
                            <Dirham />
                            {statValues.today}
                          </span>
                          <TrendIcon dir={insight.icon} color={tone.color} />
                        </span>
                        <span className="font-noontree text-[12px] font-medium leading-[18px] tracking-[-0.1px] text-[#666D85]">
                          Current price
                        </span>
                      </button>

                      {/* Highest + Lowest — grouped and sharing the remaining
                          width evenly alongside the current-price block */}
                      <div data-id={did('stats-hilo')} className="flex flex-[7] items-start gap-3">
                        {/* Highest */}
                        <button
                          type="button"
                          data-id={did('stat-highest')}
                          aria-pressed={selectedStat === 'highest'}
                          onClick={() => onStatClick('highest')}
                          className="flex flex-1 items-start gap-2 text-left outline-none"
                        >
                          <HighestArrow />
                          <span className="flex flex-col items-start gap-0">
                            <span className="inline-flex items-center gap-px font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#1D2539]">
                              <Dirham />
                              {statValues.highest}
                            </span>
                            <span className="font-noontree text-[12px] font-medium leading-[18px] tracking-[-0.1px] text-[#666D85]">
                              Highest
                            </span>
                          </span>
                        </button>

                        {/* Lowest */}
                        <button
                          type="button"
                          data-id={did('stat-lowest')}
                          aria-pressed={selectedStat === 'lowest'}
                          onClick={() => onStatClick('lowest')}
                          className="flex flex-1 items-start gap-2 text-left outline-none"
                        >
                          <LowestArrow />
                          <span className="flex flex-col items-start gap-0">
                            <span className="inline-flex items-center gap-px font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#1D2539]">
                              <Dirham />
                              {statValues.lowest}
                            </span>
                            <span className="font-noontree text-[12px] font-medium leading-[18px] tracking-[-0.1px] text-[#666D85]">
                              Lowest
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>
                    )}

                        {/* Plot + x-axis labels grouped, 4px apart */}
                        <div data-id={did('chart-plot-group')} className="flex flex-col gap-1">
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
                            onPointerMove={isBars ? undefined : (e) => updateScrub(e.clientX)}
                            onPointerDown={
                              isBars
                                ? undefined
                                : (e) => {
                                    e.currentTarget.setPointerCapture?.(e.pointerId)
                                    updateScrub(e.clientX)
                                  }
                            }
                            onPointerUp={isBars ? undefined : (e) => { if (e.pointerType !== 'mouse') setScrub(null) }}
                            onPointerLeave={isBars ? undefined : () => setScrub(null)}
                            className={`relative min-w-0 flex-1 border-b-[0.5px] border-l-[0.5px] border-[#E4E5EA] ${isBars ? '' : 'touch-none'}`}
                          >
                            {/* average price guide — springs to the new level on
                                period change (recharts' ReferenceLine can't move) */}
                            <motion.div
                              data-id={did('avg-line')}
                              aria-hidden="true"
                              initial={false}
                              animate={{ top: `${((yHi - avgPrice) / (yHi - yLo)) * 100}%` }}
                              transition={sheetMotion.guide}
                              className="pointer-events-none absolute inset-x-0 z-10 h-px"
                            >
                              <svg width="100%" height="1" preserveAspectRatio="none" className="block">
                                <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="#C0C2F6" strokeWidth="0.75" strokeDasharray="4 4" />
                              </svg>
                            </motion.div>

                            {/* scrubber — dashed line + dot + date/price pill */}
                            <AnimatePresence>
                              {!isBars && scrub && (
                                <motion.div
                                  key="scrub"
                                  data-id={did('scrub')}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={sheetMotion.fade}
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
                                        {prices[scrub.i]}
                                      </span>
                                    </div>
                                  </motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {isBars ? (
                              <PriceBars bars={bars} yLo={yLo} yHi={yHi} selected={barSel} onSelect={setBarSel} dataId={dataId} />
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                                  <defs>
                                    <linearGradient id="ph-fill" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
                                      <stop offset="55%" stopColor={lineColor} stopOpacity={0.06} />
                                      <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                                    </linearGradient>
                                    {/* soft glow under the stroke so the line reads
                                        crisp over the gradient fill */}
                                    <filter id="ph-line-glow" x="-2%" y="-10%" width="104%" height="130%">
                                      <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor={lineColor} floodOpacity="0.18" />
                                    </filter>
                                  </defs>
                                  <XAxis dataKey="i" type="number" domain={[domainLo, domainHi]} hide />
                                  <YAxis domain={[yLo, yHi]} hide />
                                  <Area
                                    type={data.curve ?? 'stepAfter'}
                                    dataKey="price"
                                    stroke={lineColor}
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ filter: 'url(#ph-line-glow)' }}
                                    fill="url(#ph-fill)"
                                    isAnimationActive
                                    animationDuration={500}
                                    animationEasing="ease-out"
                                    dot={<EndDot todayI={points.length - 1} color={lineColor} />}
                                    activeDot={false}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>

                        {/* Section 2 — spacer (left) | period labels (right), same
                            column widths as section 1. Equal-width cells; labels
                            adapt to the range (days for 1M, months for 3M/1Y). */}
                        <div data-id={did('chart-label-row')} className={`flex ${compact ? 'h-5' : 'h-7'}`}>
                          <div className="shrink-0" style={{ width: axisWidth }} />
                          {isBars ? (
                            /* one cell per bar (matching gap) so labels sit under
                               their bars; blank cells hold the alignment */
                            <div data-id={did('x-axis')} className={`flex min-w-0 flex-1 items-end ${barsDense ? 'gap-[2px]' : 'gap-1.5'}`}>
                              {barTicks.map((label, i) => (
                                <span key={i} data-id={did(`x-tick-${i}`)} className="relative min-w-0 flex-1">
                                  {label && (
                                    <span
                                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap font-noontree text-[11px] leading-[14px] tracking-[-0.1px] ${
                                        label === 'Today' ? 'font-semibold text-[#1D2539]' : 'font-normal text-[#989FB3]'
                                      }`}
                                    >
                                      {label}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div data-id={did('x-axis')} className={`flex min-w-0 flex-1 ${compact ? 'items-start' : 'items-end'}`}>
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
                          )}
                        </div>
                        </div>
                      </div>
                    </div>

                  {/* Trend note below the graph (default layout only) */}
                  {!compact && bannerBlock}

                  {/* Better deal row — shown when the price is higher now, to
                      steer the shopper to cheaper options (retention). Once a
                      size is selected it STAYS visible even if the deal turned
                      green, so the user can keep switching options. MOUNTED
                      permanently and height-animated from state — a mount-time
                      AnimatePresence height animation can lock a stale pixel
                      height and clip everything inside (incl. the variants). */}
                  <motion.div
                    data-id={did('deal')}
                    initial={false}
                    animate={{ height: showDeal ? 'auto' : 0, opacity: showDeal ? 1 : 0 }}
                    transition={sheetMotion.container}
                    className="shrink-0 overflow-hidden"
                    aria-hidden={!showDeal}
                    style={{ pointerEvents: showDeal ? 'auto' : 'none' }}
                  >
                        <motion.div
                          data-id={did('deal-inner')}
                          initial={false}
                          animate={{ y: showDeal ? 0 : 28 }}
                          transition={sheetMotion.container}
                          className="flex flex-col gap-3 pt-1"
                        >
                          <span aria-hidden="true" className="h-px w-full border-t border-dashed border-[#F2F3F7]" />
                          <button
                            type="button"
                            data-id={did('deal-row')}
                            aria-expanded={dealOpen}
                            onClick={() => setDealOpen((o) => !o)}
                            className="flex items-center justify-between py-0.5 outline-none"
                          >
                            <span className="flex flex-col items-start">
                              <span className="font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#1D2539]">
                                {hasSimilar ? 'Better value available' : `Try another ${noun}, pay less`}
                              </span>
                              <span className="font-noontree text-[12px] font-normal leading-[18px] tracking-[-0.1px] text-[#666D85]">
                                {hasSimilar
                                  ? withDirham(`${(data.specs ?? []).join(' · ')} — from AED${cheapestSimilar}`)
                                  : `same ${data.subtitle[1].toLowerCase()}, just a different ${noun} size`}
                              </span>
                            </span>
                            <motion.svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                              className="shrink-0"
                              animate={{ rotate: dealOpen ? 180 : 0 }}
                              transition={sheetMotion.control}
                            >
                              <path d="M6 9.5l6 6 6-6" stroke="#1D2539" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </motion.svg>
                          </button>

                          {/* Variants accordion — horizontally scrollable size
                              option cards (Figma "Variants"). Stays MOUNTED and
                              animates height 0 ↔ auto: a nested AnimatePresence
                              height animation can wedge at a partial height and
                              permanently clip the cards. */}
                          <motion.div
                            data-id={did('variants')}
                            initial={false}
                            animate={{ height: dealOpen ? 'auto' : 0, opacity: dealOpen ? 1 : 0 }}
                            transition={sheetMotion.container}
                            className="overflow-hidden"
                            aria-hidden={!dealOpen}
                          >
                                {hasSimilar ? (
                                  /* similar-product comparison cards */
                                  <div data-id={did('similar-rail')} className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 pt-3">
                                    {data.similar.map((s) => {
                                      const save = Math.round((todayPrice - s.price) * 100) / 100
                                      return (
                                        <button
                                          key={s.id}
                                          type="button"
                                          data-id={did(`similar-${s.id}`)}
                                          className="flex w-[150px] shrink-0 flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#EAECF0] bg-white text-left outline-none"
                                        >
                                          {/* image container — flush to the card edges, no padding */}
                                          <span className="flex h-[104px] items-center justify-center bg-[#F7F8FA]">
                                            <img src={s.image} alt="" aria-hidden="true" loading="lazy" className="h-[92px] w-auto object-contain" />
                                          </span>
                                          {/* details — padded */}
                                          <span className="flex flex-col p-2.5">
                                            <span data-id={did(`similar-${s.id}-title`)} className="line-clamp-2 min-h-8 font-noontree text-[12px] font-medium leading-4 tracking-[-0.1px] text-[#1D2539]">
                                              {s.title}
                                            </span>
                                            <span className="mt-1 flex w-fit items-center gap-0.5 rounded bg-[#F7F8FA] px-1 py-0.5">
                                              <img src={ratingStar} alt="" aria-hidden="true" className="h-3 w-3" />
                                              <span className="font-noontree text-[11px] font-semibold leading-[14px] tracking-[-0.1px] text-[#101628]">{s.rating}</span>
                                            </span>
                                            <span data-id={did(`similar-${s.id}-price`)} className="mt-1.5 flex items-end gap-1">
                                              <span className="inline-flex items-center gap-px font-noontree text-[14px] font-bold leading-5 tracking-[-0.1px] text-[#1D2539]">
                                                <Dirham />
                                                {s.price}
                                              </span>
                                              {s.comparePrice && (
                                                <span className="inline-flex items-center gap-px pb-0.5 font-noontree text-[11px] font-normal leading-[14px] tracking-[-0.1px] text-[#989FB3] line-through">
                                                  <Dirham />
                                                  {s.comparePrice}
                                                </span>
                                              )}
                                            </span>
                                            {save > 0 && (
                                              <span data-id={did(`similar-${s.id}-save`)} className="mt-1 w-fit rounded bg-[#DCFCE7] px-1 py-0.5 font-noontree text-[10px] font-bold leading-3 tracking-[-0.1px] text-[#0F8857]">
                                                {withDirham(`Save AED${save}`)}
                                              </span>
                                            )}
                                          </span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <div data-id={did('variants-rail')} className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 pt-3">
                                    {(data.variants ?? []).map((v) => {
                                      const selected = v.id === variantId
                                      // best value = lowest price-per-unit when a
                                      // unit exists (shampoo ml), else lowest price
                                      const bestValue = v.id === bestValueId
                                      return (
                                        <button
                                          key={v.id}
                                          type="button"
                                          data-id={did(`variant-${v.id}`)}
                                          aria-pressed={selected}
                                          onClick={() => selectVariant(v.id)}
                                          className={`relative flex min-w-[101px] flex-1 items-center rounded-2xl border-[1.5px] bg-white p-3 shadow-[0px_6px_12px_rgba(14,14,14,0.02)] outline-none transition-colors duration-200 ease-out ${
                                            selected ? 'border-[#BDDBFF]' : 'border-[#EAECF0]'
                                          }`}
                                        >
                                          <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                                            {/* size + price */}
                                            <span data-id={did(`variant-${v.id}-size`)} className="font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px] text-[#1D2539]">
                                              {v.label}
                                            </span>
                                            <span data-id={did(`variant-${v.id}-price`)} className="inline-flex items-center gap-px font-noontree text-[14px] font-bold leading-5 tracking-[-0.1px] text-[#1D2539]">
                                              <Dirham />
                                              {v.price}
                                            </span>
                                          </span>

                                          {/* best-value ribbon — centred on the card's TOP edge */}
                                          {bestValue && (
                                            <span
                                              data-id={did(`variant-${v.id}-best`)}
                                              className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-white bg-[#DCFCE7] px-1.5 py-0.5 font-noontree text-[10px] font-bold leading-3 tracking-[-0.1px] text-[#0F8857]"
                                            >
                                              Best value
                                            </span>
                                          )}
                                        </button>
                                      )
                                    })}
                                  </div>
                                )}
                              </motion.div>
                        </motion.div>
                  </motion.div>

                  {/* Compact: range switch anchored at the BOTTOM, narrower */}
                  {compact && <div className="pt-1">{rangeSwitch}</div>}

                </div>

                {/* Action bar */}
                <div data-id={did('footer')} className="shrink-0 border-t border-[#F9F9FB] bg-white p-3">
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
    </div>
  )
}
