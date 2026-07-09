// ComboGif — the noon "combo" animated GIF. It loops on its own in normal
// browsers, but some webviews freeze a GIF on a cached frame after the first
// pass, so we remount it once per loop (via an incrementing key) to guarantee
// it keeps autoplaying. Same cached src → no refetch.
import { useEffect, useState } from 'react'

export const COMBO_GIF = 'https://f.nooncdn.com/s/app/com/noon/images/combo-animated.gif'
const COMBO_GIF_MS = 4810 // one full loop (27 frames)

export function ComboGif({ className, dataId, alt = '' }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), COMBO_GIF_MS)
    return () => clearInterval(t)
  }, [])
  return (
    <img
      key={tick}
      data-id={dataId}
      src={COMBO_GIF}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={className}
    />
  )
}
