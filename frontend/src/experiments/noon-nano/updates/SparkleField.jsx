import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * SparkleField — the lively backdrop of "Updates today": colourful four-point
 * stars that twinkle and soft dots that drift up, scattered through the middle
 * of the screen (around the title and the sides of the stack — not on the bell).
 *
 * On open they burst out of the screen's centre with the title (staggered,
 * spring out to their spots), then keep a calm loop: stars twinkle (scale +
 * glow + a little spin), dots float and fade. All CSS transform / opacity, so
 * it stays cheap. Layout is seeded, so it's the same every open. Reduced
 * motion: they just sit there, softly lit.
 */

const COLOURS = ['#FFE066', '#FF8AD8', '#8FE3FF', '#C9A2FF', '#FFFFFF', '#7DFFB0']
const COUNT = { stars: 9, dots: 10 }
// depth of field: about 3 in 4 sit out of focus (layer blur, a little dimmer); the rest stay sharp up front
const BLURRED = 0.72
const BLUR_PX = [1.6, 3.6] // range for the out-of-focus ones
// where they live, as fractions of the overlay: a wide band through the middle, a little
// denser around the title; the very centre column above the words is left clear for the bell
const BAND = { top: 0.12, bottom: 0.78 }
const BELL_CLEAR = { x: [0.4, 0.62], y: [0.12, 0.34] }

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function layout() {
  const r = rng(20261006)
  const place = () => {
    for (;;) {
      const x = 0.04 + r() * 0.92
      // bias toward the upper middle, where the title builds
      const y = BAND.top + Math.pow(r(), 1.35) * (BAND.bottom - BAND.top)
      const inBell = x > BELL_CLEAR.x[0] && x < BELL_CLEAR.x[1] && y > BELL_CLEAR.y[0] && y < BELL_CLEAR.y[1]
      if (!inBell) return { x, y }
    }
  }
  const items = []
  for (let i = 0; i < COUNT.stars; i++) {
    items.push({
      kind: 'star',
      ...place(),
      size: i < 2 ? 18 + r() * 6 : 8 + r() * 10,
      colour: COLOURS[i % COLOURS.length],
      dur: 1.8 + r() * 1.8,
      delay: r() * 2.2,
      spin: r() < 0.5 ? -1 : 1,
    })
  }
  for (let i = 0; i < COUNT.dots; i++) {
    items.push({
      kind: 'dot',
      ...place(),
      size: 2.5 + r() * 4.5,
      colour: COLOURS[(i + 2) % COLOURS.length],
      dur: 3 + r() * 3,
      delay: r() * 3,
      drift: 8 + r() * 14,
    })
  }
  // seeded, so the same ones are in focus every open; the two biggest stars stay sharp
  for (const it of items) {
    const sharp = it.kind === 'star' && it.size >= 18 ? true : r() > BLURRED
    it.blur = sharp ? 0 : BLUR_PX[0] + r() * (BLUR_PX[1] - BLUR_PX[0])
  }
  return items
}

const KEYFRAMES = `
@keyframes nano-twinkle {
  0%, 100% { transform: scale(0.55) rotate(0deg); opacity: 0.35; }
  50% { transform: scale(1.1) rotate(var(--spin)); opacity: 1; }
}
@keyframes nano-float {
  0% { transform: translateY(0); opacity: 0; }
  20% { opacity: 0.9; }
  80% { opacity: 0.6; }
  100% { transform: translateY(calc(var(--drift) * -1)); opacity: 0; }
}
`

/** a soft four-point star (concave sides), filled with its colour and glowing */
const Star = ({ size, colour }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ filter: `drop-shadow(0 0 ${size * 0.35}px ${colour})`, overflow: 'visible' }}>
    <path d="M12 0C12.9 7.6 16.4 11.1 24 12C16.4 12.9 12.9 16.4 12 24C11.1 16.4 7.6 12.9 0 12C7.6 11.1 11.1 7.6 12 0Z" fill={colour} />
  </svg>
)

function SparkleField({ reduceMotion = false }) {
  const items = useMemo(layout, [])
  return (
    <div data-id="nano-updates-sparkles" aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{KEYFRAMES}</style>
      {items.map((it, i) => (
        // the burst: out of the screen's centre to its spot, staggered with the title's expand
        <motion.div
          key={i}
          className="absolute"
          style={{
            marginLeft: -it.size / 2,
            marginTop: -it.size / 2,
            // out-of-focus layer: blurred and a touch dimmer, so the sharp ones read as nearer
            filter: it.blur ? `blur(${it.blur.toFixed(1)}px)` : undefined,
            zIndex: it.blur ? 0 : 1,
          }}
          // % of the overlay, so it's right inside the desktop phone frame too
          initial={reduceMotion ? { left: `${it.x * 100}%`, top: `${it.y * 100}%` } : { left: '50%', top: '44%', scale: 0.2, opacity: 0 }}
          animate={{ left: `${it.x * 100}%`, top: `${it.y * 100}%`, scale: 1, opacity: it.blur ? 0.75 : 1 }}
          transition={{
            delay: 0.15 + (i % 12) * 0.035,
            type: 'spring',
            stiffness: 120,
            damping: 16,
            opacity: { delay: 0.15 + (i % 12) * 0.035, duration: 0.3 },
          }}
        >
          {it.kind === 'star' ? (
            <div
              style={{
                '--spin': `${it.spin * 25}deg`,
                animation: reduceMotion ? undefined : `nano-twinkle ${it.dur}s ease-in-out ${-it.delay}s infinite`,
                opacity: reduceMotion ? 0.7 : undefined,
              }}
            >
              <Star size={it.size} colour={it.colour} />
            </div>
          ) : (
            <div
              className="rounded-full"
              style={{
                width: it.size,
                height: it.size,
                background: it.colour,
                boxShadow: `0 0 ${it.size * 1.6}px ${it.colour}`,
                '--drift': `${it.drift}px`,
                animation: reduceMotion ? undefined : `nano-float ${it.dur}s ease-in-out ${-it.delay}s infinite`,
                opacity: reduceMotion ? 0.6 : undefined,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default memo(SparkleField)
