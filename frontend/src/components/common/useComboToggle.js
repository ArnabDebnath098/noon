import { useEffect, useState } from 'react'

// Drives the Combo <-> count alternation with ASYMMETRIC timing: the count
// stays visible for `countMs` (long) and the "Combo" tag flashes for `comboMs`
// (short). `delay` phase-shifts the start so cards toggle at different times.
export function useComboToggle(delay = 0, comboMs = 1400, countMs = 4200) {
  const [showCombo, setShowCombo] = useState(true)

  useEffect(() => {
    let current = true
    let timer

    const tick = () => {
      timer = setTimeout(
        () => {
          current = !current
          setShowCombo(current)
          tick()
        },
        current ? comboMs : countMs
      )
    }

    const startTimer = setTimeout(tick, delay)
    return () => {
      clearTimeout(startTimer)
      clearTimeout(timer)
    }
  }, [delay, comboMs, countMs])

  return showCombo
}
