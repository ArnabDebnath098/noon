// Reusable framer-motion primitives shared across experiments.
// Keep everything here generic — component-specific numbers belong in the
// component, the patterns belong here.

/** Spring presets tuned for UI motion. */
export const springs = {
  // crisp, well-damped settle with no overshoot — good default for tiles/icons
  snappy: { type: 'spring', stiffness: 340, damping: 33, mass: 0.6 },
  // a larger surface (panel/sheet) that should feel weightier
  panel: { type: 'spring', stiffness: 300, damping: 30, mass: 0.85 },
  // quick tactile press/release
  press: { type: 'spring', stiffness: 700, damping: 30 },
  // 3D card flip
  flip: { type: 'spring', stiffness: 260, damping: 22 },
}

/**
 * Build an SVG `offset-path` string describing a gentle arc between two points.
 * Set it as `style.offsetPath` and animate `offsetDistance` 0% → 100% to send
 * an element gliding along the curve.
 *
 * @param {{x:number, y:number}} a - start point
 * @param {{x:number, y:number}} b - end point
 * @param {number} curvature - bow height as a fraction of the straight distance
 */
export function curvedPath(a, b, curvature = 0.22) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.hypot(dx, dy) || 1
  const bow = dist * curvature
  // control point: the segment midpoint pushed out along the perpendicular
  const mx = (a.x + b.x) / 2 + (-dy / dist) * bow
  const my = (a.y + b.y) / 2 + (dx / dist) * bow
  return `path("M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}")`
}

/**
 * Container variants for a staggered reveal that plays in reverse on close
 * (open: first child first; close: last child first). Pair with children that
 * define matching `open` / `closed` variants; drive the container's `animate`
 * with `'open' | 'closed'`.
 *
 * @param {{stagger?:number, delayChildren?:number}} opts
 */
export function staggerContainer({ stagger = 0.04, delayChildren = 0 } = {}) {
  return {
    open: { transition: { staggerChildren: stagger, delayChildren } },
    closed: { transition: { staggerChildren: stagger, staggerDirection: -1 } },
  }
}

/**
 * Child variants that fly an element along its `offset-path` (set separately in
 * `style.offsetPath`) between a collapsed pose and its full-size, in-place pose.
 * The collapsed pose is read from the element's `custom={{ scale, opacity }}`,
 * so each child can start from a different size/visibility.
 *
 * @param {object} spring - transition for offsetDistance + scale
 * @param {object} fade - transition for opacity
 */
export function pathFlightVariants(spring = springs.snappy, fade = { duration: 0.16 }) {
  const transition = { offsetDistance: spring, scale: spring, opacity: fade }
  return {
    open: { offsetDistance: '100%', scale: 1, opacity: 1, transition },
    closed: ({ scale, opacity }) => ({ offsetDistance: '0%', scale, opacity, transition }),
  }
}
