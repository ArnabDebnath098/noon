// Reusable framer-motion primitives shared across experiments.
// Keep everything here generic — component-specific numbers belong in the
// component, the patterns belong here.

/**
 * iOS system easing curves, for tween/CSS transitions that should feel native.
 * `ios` is the curve UIKit uses for sheet presentation and nav pushes —
 * a fast start with a long decelerating tail.
 */
export const easings = {
  ios: [0.32, 0.72, 0, 1],
  iosCss: 'cubic-bezier(0.32, 0.72, 0, 1)',
}

/**
 * Spring presets tuned for UI motion, expressed the way iOS/SwiftUI tunes
 * springs: `duration` ≈ response (how fast it reaches the target) and
 * `bounce` ≈ 1 − dampingFraction (how much it overshoots). Small bounce
 * values (0–0.2) give the settled, physical feel of system iOS animations.
 */
export const springs = {
  // crisp settle with a hint of life — good default for tiles/icons
  snappy: { type: 'spring', duration: 0.45, bounce: 0.15 },
  // a larger surface (panel/folder) that should feel weightier
  panel: { type: 'spring', duration: 0.55, bounce: 0.2 },
  // bottom-sheet slide
  sheet: { type: 'spring', duration: 0.6, bounce: 0.15 },
  // quick tactile press/release — critically damped, no overshoot
  press: { type: 'spring', duration: 0.25, bounce: 0 },
  // 3D card flip — playful, visible overshoot
  flip: { type: 'spring', duration: 0.55, bounce: 0.3 },
  // physics spring for settling after a drag/pan — keeps gesture velocity
  // (duration-based springs recalculate and lose it)
  settle: { type: 'spring', stiffness: 300, damping: 30 },
}

/**
 * Physics config for `useSpring` smoothing of scroll-linked motion values.
 * (`useSpring` takes raw physics, not duration/bounce.) Tight and overdamped —
 * it's a smoothing filter, not choreography.
 */
export const scrollSmoothing = { stiffness: 480, damping: 48, mass: 0.45 }

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
export const clamp01 = (v) => clamp(v, 0, 1)
export const lerp = (a, b, t) => a + (b - a) * t

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
