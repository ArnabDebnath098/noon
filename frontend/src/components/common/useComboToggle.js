import { useEffect, useState } from 'react'

// Drives the Combo <-> count alternation. The "Combo" tag shows for `comboMs`
// (1s) then changes to the count, which rests for `countMs`. `delay` phase-shifts
// the start so cards can toggle at staggered times.
export function useComboToggle(delay = 0, comboMs = 2000, countMs = 3000) {
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

    const startId = setTimeout(tick, delay)
    return () => {
      clearTimeout(startId)
      clearTimeout(timer)
    }
  }, [delay, comboMs, countMs])

  return showCombo
}
