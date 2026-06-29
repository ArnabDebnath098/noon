// ComboChipOnce — a ONE-TIME "Combo" → product-count reveal, done as a vertical
// odometer reel: both lines are stacked in a track and the track slides up by
// one line, masked to a single line. No crossfade/ghosting — a clean slide.
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const H = 20 // line height of the masked window

export function ComboChipOnce({
  count,
  delay = 2000,
  dataId,
  bare = false,
  countColor = '#0F61FF', // colour of the "count" line ("Combo" stays blue)
  countWeight = 600, // font-weight of the "count" line ("Combo" stays 600)
  centered = false, // centre-align the lines instead of left
}) {
  const [showCount, setShowCount] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowCount(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  // `bare` drops the chip background/padding (the parent already provides it).
  const base = `relative inline-block w-fit overflow-hidden font-noontree text-[12px] font-semibold ${
    bare ? '' : 'rounded-md bg-[#F5FAFF] px-1.5'
  }`
  const lineAlign = centered ? 'items-center justify-center text-center' : 'items-center justify-start text-left'

  return (
    <span data-id={dataId} className={base} style={{ height: H }}>
      <motion.span
        className="flex flex-col"
        animate={{ y: showCount ? -H : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* "Combo" fades out as it rises, so it's gone before the masked edge
            (no hard cut); the count fades in as it arrives */}
        <motion.span
          className={`flex whitespace-nowrap ${lineAlign}`}
          style={{ height: H, color: '#0F61FF', fontWeight: 600 }}
          animate={{ opacity: showCount ? 0 : 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          Combo
        </motion.span>
        <motion.span
          className={`flex whitespace-nowrap ${lineAlign}`}
          style={{ height: H, color: countColor, fontWeight: countWeight }}
          initial={{ opacity: 0 }}
          animate={{ opacity: showCount ? 1 : 0 }}
          transition={{ duration: 0.42, ease: 'easeOut' }}
        >
          {count}
        </motion.span>
      </motion.span>
    </span>
  )
}
