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
function EndDot({ cx, cy, payload, todayI }) {
  if (payload?.i !== todayI) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill={LINE} opacity={0.12} />
      <circle cx={cx} cy={cy} r={4.5} fill={LINE} stroke="#FFFFFF" strokeWidth={1.5} />
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

// Trend colours by state — green = current price is a good deal, amber = higher.
const TREND = {
  lower: {
    color: '#0B623F',
    shell: 'linear-gradient(180deg, #F5F5F5 29.28%, #F6FEEC 67.02%, #DCFFCA 100%)',
    bg: '#F1FBEC', // solid tint for the standalone trend box
  },
  higher: {
    color: '#A36200',
    shell: 'linear-gradient(180deg, #F5F5F5 29.28%, #FEF9EC 67.02%, #FFDAAA 100%)',
    bg: '#FEF6EA',
  },
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

export default function PriceHistorySheet({ open, onClose, onAdd, image, data, dataId = 'ph-sheet' }) {
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
  // ---- hero insight: use-case driven messaging (not always avg comparison) --
  // Classified from the selected period + variant state, in priority order:
  //   better variant picked → lowest price → stable → price dropped →
  //   priced above usual → below average (fallback)
  const savingsVsBase = activeVariant && baseVariant ? Math.round((baseVariant.price - activeVariant.price) * 100) / 100 : 0
  const variantCheaper = savingsVsBase > 0
  // similar-product mode (e.g. the phone) — the "better value" action shows
  // alternative products instead of this product's own variants
  const hasSimilar = (data.similar?.length ?? 0) > 0
  const cheapestSimilar = hasSimilar ? Math.min(...data.similar.map((s) => s.price)) : 0
  const periodMin = Math.min(...prices)
  const periodMax = Math.max(...prices)
  const dropFromHigh = Math.round((periodMax - todayPrice) * 100) / 100
  const fmtAmt = (x) => String(x >= 5 ? Math.round(x) : Math.round(x * 2) / 2)
  const periodLabel = active.label.toLowerCase()

  // Copy is kept short enough to stay on ONE line even on an iPhone SE
  // (~42 chars max at 12px in the strip).
  let insight
  if (variantCheaper) {
    // Better variant exists (and picked) → switch pays off
    insight = { tone: 'lower', icon: 'down', bold: `AED${savingsVsBase} saved`, rest: `with ${activeVariant.label} — great pick` }
  } else if (todayPrice <= periodMin) {
    // Lowest price → best time to buy
    insight = { tone: 'lower', icon: 'down', bold: 'Best time to buy', rest: `— ${periodLabel} low` }
  } else if ((periodMax - periodMin) / avgPrice <= 0.05) {
    // Stable → buy with confidence
    insight = { tone: 'lower', icon: 'flat', bold: 'Price rarely changes', rest: '— buy with confidence' }
  } else if (dropFromHigh / periodMax >= 0.12 && todayPrice <= avgPrice) {
    // Price dropped → buy now
    insight = { tone: 'lower', icon: 'down', bold: `Price dropped AED${fmtAmt(dropFromHigh)}`, rest: `from AED${periodMax} — buy now` }
  } else if (todayPrice > avgPrice * 1.04 || todayPrice >= periodMax * 0.985) {
    // Priced high — either meaningfully above the period average (>4%) OR
    // sitting at/near the period HIGH (the chart ends at its top). Steer to the
    // cheaper option below: similar products if any, else cheaper own variants.
    const atHigh = todayPrice >= periodMax * 0.985
    const bold = atHigh ? 'Near its highest price' : 'Priced above usual'
    insight = hasSimilar
      ? { tone: 'higher', icon: 'up', bold, rest: '— better value below' }
      : { tone: 'higher', icon: 'up', bold, rest: `— cheaper ${noun}s below` }
  } else if (Math.abs(todayPrice - avgPrice) / avgPrice <= 0.04) {
    // Within ±4% of the period average — real daily ASP data hovers around its
    // baseline, so this is "typical price", not above/below. Quote the average
    // so the copy ties directly to the dashed guide line on the chart.
    insight = { tone: 'lower', icon: 'flat', bold: 'Around its usual price', rest: `— avg AED${Math.round(avgPrice)}` }
  } else {
    // Meaningfully below average (but not the low) → still a good moment
    insight = { tone: 'lower', icon: 'down', bold: `AED${fmtAmt(avgPrice - todayPrice)} lower`, rest: `than the ${periodLabel} average` }
  }
  const isLower = insight.tone === 'lower'
  const tone = TREND[insight.tone]
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
    const d = data.asOf ? new Date(data.asOf) : new Date()
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
  const showDeal = !isLower || !!activeVariant
  // pill flips right when there isn't ~120px of room on the left of the line
  const pillLeft = scrub ? scrub.x > 120 : true
  // header content follows the selected size
  const headerImage = activeVariant?.image ?? image
  const subtitleParts = [data.subtitle[0], data.subtitle[1], activeVariant?.label ?? data.subtitle[2]]

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
                {/* Header — product tile + title + dotted subtitle */}
                <div data-id={did('header')} className="flex shrink-0 items-center gap-3 border-b border-[#F9F9FB] p-4">
                  <span data-id={did('header-image')} className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#EAECF0] bg-white">
                    <RollSwap id={headerImage} className="h-12 w-12">
                      <img src={headerImage} alt="" aria-hidden="true" className="h-12 w-12 object-contain" />
                    </RollSwap>
                  </span>
                  <div data-id={did('header-copy')} className="flex min-w-0 flex-1 flex-col gap-1">
                    <span data-id={did('title')} className="font-noontree text-[16px] font-bold leading-5 tracking-[-0.15px] text-[#1D2539]">
                      Price history
                    </span>
                    <span data-id={did('subtitle')} className="flex min-w-0 items-center gap-2.5">
                      {subtitleParts.map((part, i) => {
                        // last part (the variant, e.g. "Midnight Black") flexes
                        // and truncates so a long value can't overflow the row;
                        // store + product keep their space
                        const isLast = i === subtitleParts.length - 1
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
                                transition={sheetMotion.control}
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

                    {/* Graph container — its own white card with a hairline
                        border; the trend note is a SEPARATE box below. Stats sit
                        on top INSIDE the card, then the plot. */}
                    <div
                      data-id={did('chart-card')}
                      className="flex flex-col gap-3 rounded-2xl border border-[#EAECF0] bg-white px-2 py-4"
                    >
                    {/* Stats — Current price leads (value in the trend colour +
                        matching arrow), then Highest (amber) and Lowest (teal).
                        Tapping a stat pins the marker. */}
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
                                      <stop offset="0%" stopColor={LINE} stopOpacity={0.2} />
                                      <stop offset="55%" stopColor={LINE} stopOpacity={0.06} />
                                      <stop offset="100%" stopColor={LINE} stopOpacity={0} />
                                    </linearGradient>
                                    {/* soft glow under the stroke so the line reads
                                        crisp over the gradient fill */}
                                    <filter id="ph-line-glow" x="-2%" y="-10%" width="104%" height="130%">
                                      <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor={LINE} floodOpacity="0.18" />
                                    </filter>
                                  </defs>
                                  <XAxis dataKey="i" type="number" domain={[domainLo, domainHi]} hide />
                                  <YAxis domain={[yLo, yHi]} hide />
                                  <Area
                                    type={data.curve ?? 'stepAfter'}
                                    dataKey="price"
                                    stroke={LINE}
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ filter: 'url(#ph-line-glow)' }}
                                    fill="url(#ph-fill)"
                                    isAnimationActive
                                    animationDuration={500}
                                    animationEasing="ease-out"
                                    dot={<EndDot todayI={points.length - 1} />}
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
                        <div data-id={did('chart-label-row')} className="flex h-7">
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
                          )}
                        </div>
                      </div>
                    </div>

                  {/* Trend note — a SEPARATE box below the graph, filled with the
                      tone tint and a hairline border. Headline semibold, copy
                      medium; text rolls like a carousel when the insight changes. */}
                  <div
                    data-id={did('trend')}
                    className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5"
                    style={{ background: tone.bg, color: tone.color }}
                  >
                    <RollSwap
                      id={`${insight.bold}|${insight.rest}`}
                      transition={sheetMotion.rollText}
                      className="min-w-0 flex-1"
                    >
                      <span className="min-w-0 font-noontree text-[12px] font-medium leading-4 tracking-[-0.1px]">
                        <span className="font-semibold">{withDirham(insight.bold)}</span>{' '}
                        {withDirham(insight.rest)}
                      </span>
                    </RollSwap>
                  </div>

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
