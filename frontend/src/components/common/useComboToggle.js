import { useEffect, useState } from 'react'

// Drives the Combo <-> count alternation with SYMMETRIC timing: the "Combo" tag
// and the count each stay visible for `interval` ms. `delay` phase-shifts the
// start so cards can toggle at different times (staggered).
export function useComboToggle(delay = 0, interval = 3000) {
  const [showCombo, setShowCombo] = useState(true)

  useEffect(() => {
    let intervalId
    const startId = setTimeout(() => {
      setShowCombo((s) => !s)
      intervalId = setInterval(() => setShowCombo((s) => !s), interval)
    }, delay + interval)

    return () => {
      clearTimeout(startId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [delay, interval])

  return showCombo
}
