import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Track an element's pixel width via ResizeObserver.
 *
 * @param {number} initial - width to use before the first measure / as fallback
 * @returns {[React.RefObject, number]} ref to attach + the measured width
 *
 * @example
 *   const [ref, width] = useElementWidth(375)
 *   return <div ref={ref} />
 */
export default function useElementWidth(initial = 0) {
  const ref = useRef(null)
  const [width, setWidth] = useState(initial)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.offsetWidth || initial)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [initial])

  return [ref, width]
}
