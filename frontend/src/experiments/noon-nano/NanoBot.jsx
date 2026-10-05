import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { createNoonBot } from './bot/noonBot'

/**
 * NanoBot — the floating 3D noon bot (Bot 2) on the noon nano home.
 *
 * Starts at the bottom right, just above the bottom nav. Press and drag to move it anywhere between the status bar
 * and the nav; it leans into the drag and rocks upright when let go. A tap is
 * a reaction: each tap hops and plays the next mood (face + pose), then it
 * settles back to idle; three quick taps make it dizzy,
 * and asleep it waits for a tap to wake. Arrow keys nudge it when focused,
 * Enter / Space taps it.
 *
 * The position is kept as fractions of the free area so it survives screen
 * size changes, and remembered per browser (a convenience only).
 *
 * `top` / `bottom` are CSS lengths for the free area's edges (frame-relative).
 */

const HANDLE = 72 // px: the grabbable box around the head
const CANVAS = 156 // px: the scene reaches past the handle so hops / beads don't clip
const CANVAS_DY = 9 // px: the camera looks slightly below the head centre
const EDGE_X = 16 // px: side gutter (the ears reach past the handle), as the FAB's
const EDGE_Y = 8 // px: gap to the status bar / nav
const TAP_PX = 6
const TAP_MS = 300
const KEY_STEP = 16
const STORE_KEY = 'nano.bot.pos'
// tap reactions, played in turn; `hold` stays until the next tap
const REACTIONS = [
  { state: 'greeting', say: 'Hi there!' },
  { state: 'working', say: 'Hmm, thinking…' },
  { state: 'angry', say: 'Hey, no poking!' },
  { state: 'error', say: 'Oops!' },
  { state: 'sleepy', say: 'Zzz… tap to wake me', hold: true },
]
const DIZZY = { state: 'dizzy', say: 'Whoa, so dizzy!' }
const REACT_MS = 2200
const QUICK_TAPS = 3 // this many taps within QUICK_MS → dizzy
const QUICK_MS = 900

const clamp01 = (v) => Math.min(1, Math.max(0, v))

function readStored() {
  try {
    const v = JSON.parse(window.localStorage.getItem(STORE_KEY))
    if (v && Number.isFinite(v.fx) && Number.isFinite(v.fy)) return { fx: clamp01(v.fx), fy: clamp01(v.fy) }
  } catch {
    // storage unavailable: start from the default spot
  }
  return null
}
function writeStored(pos) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(pos))
  } catch {
    // storage unavailable: position just isn't remembered
  }
}

export default function NanoBot({ top, bottom }) {
  const reduceMotion = useReducedMotion() ?? false
  const areaRef = useRef(null)
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const gesture = useRef(null)
  const [area, setArea] = useState({ w: 0, h: 0 })
  // fractions of the free travel (0 = left / top edge, 1 = right / bottom edge); null = default spot
  const [pos, setPos] = useState(readStored)
  const [dragging, setDragging] = useState(false)
  const [failed, setFailed] = useState(false)
  const [spoken, setSpoken] = useState(null) // what the screen reader announces: { key, say }
  const reaction = useRef({ next: 0, taps: [], timer: 0 })

  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el) return undefined
    const measure = () => setArea({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    let engine
    try {
      engine = createNoonBot({ canvas, reduceMotion })
    } catch {
      setFailed(true) // no WebGL: leave the page as is, without the bot
      return undefined
    }
    engineRef.current = engine
    const r = reaction.current
    return () => {
      window.clearTimeout(r.timer)
      engine.dispose()
      engineRef.current = null
    }
  }, [reduceMotion])

  // free travel for the handle's top-left corner
  const spanX = Math.max(0, area.w - HANDLE - 2 * EDGE_X)
  const spanY = Math.max(0, area.h - HANDLE - 2 * EDGE_Y)
  const fx = pos?.fx ?? 1
  const fy = pos?.fy ?? 1
  const left = EDGE_X + fx * spanX
  const topPx = EDGE_Y + fy * spanY

  const moveBy = useCallback(
    (dx, dy) => {
      setPos({
        fx: spanX ? clamp01(fx + dx / spanX) : fx,
        fy: spanY ? clamp01(fy + dy / spanY) : fy,
      })
    },
    [fx, fy, spanX, spanY],
  )

  const say = (text, ms) => {
    const r = reaction.current
    window.clearTimeout(r.timer)
    setSpoken({ key: performance.now(), say: text })
    if (ms) r.timer = window.setTimeout(() => setSpoken(null), ms)
  }
  // a tap: hop + the next reaction, or wake up if asleep
  const react = () => {
    const engine = engineRef.current
    if (!engine) return
    const r = reaction.current
    if (engine.state === 'sleepy') {
      engine.tap() // wakes with a big hop
      say("I'm up!", 1400)
      return
    }
    const now = performance.now()
    r.taps = [...r.taps.filter((t) => now - t < QUICK_MS), now]
    let next
    if (r.taps.length >= QUICK_TAPS) {
      r.taps = []
      next = DIZZY
    } else {
      next = REACTIONS[r.next]
      r.next = (r.next + 1) % REACTIONS.length
    }
    engine.tap()
    engine.setState(next.state)
    say(next.say, next.hold ? 0 : REACT_MS)
    if (!next.hold) {
      r.timer = window.setTimeout(() => {
        if (engineRef.current?.state === next.state) engineRef.current.setState('idle')
        setSpoken(null)
      }, REACT_MS)
    }
  }

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const now = performance.now()
    gesture.current = { x: e.clientX, y: e.clientY, lx: e.clientX, lt: now, t: now, fx, fy, moved: 0, vx: 0 }
  }
  const onPointerMove = (e) => {
    const g = gesture.current
    if (!g) return
    const dx = e.clientX - g.x
    const dy = e.clientY - g.y
    g.moved = Math.max(g.moved, Math.hypot(dx, dy))
    if (g.moved < TAP_PX) return // let taps stay taps
    if (!dragging) setDragging(true)
    setPos({
      fx: spanX ? clamp01(g.fx + dx / spanX) : g.fx,
      fy: spanY ? clamp01(g.fy + dy / spanY) : g.fy,
    })
    const now = performance.now()
    const dt = Math.max(1, now - g.lt) / 1000
    g.vx += ((e.clientX - g.lx) / dt - g.vx) * 0.3 // smoothed horizontal velocity
    g.lx = e.clientX
    g.lt = now
    engineRef.current?.setLean(g.vx)
  }
  const endGesture = () => {
    const g = gesture.current
    if (!g) return
    gesture.current = null
    engineRef.current?.setLean(0)
    if (g.moved < TAP_PX && performance.now() - g.t < TAP_MS) react()
    else if (pos) writeStored(pos)
    setDragging(false)
  }

  const onKeyDown = (e) => {
    const step = { ArrowLeft: [-KEY_STEP, 0], ArrowRight: [KEY_STEP, 0], ArrowUp: [0, -KEY_STEP], ArrowDown: [0, KEY_STEP] }[e.key]
    if (step) {
      e.preventDefault()
      moveBy(...step)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      react()
    }
  }
  // remember keyboard moves too
  useEffect(() => {
    if (pos && !gesture.current) writeStored(pos)
  }, [pos])

  if (failed) return null

  return (
    <div
      ref={areaRef}
      data-id="nano-bot-area"
      className="pointer-events-none fixed left-1/2 z-[35] w-full max-w-md -translate-x-1/2"
      style={{ top, bottom }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="noon bot. Drag to move, tap to play"
        data-id="nano-bot"
        data-dragging={dragging || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onKeyDown={onKeyDown}
        className={`pointer-events-auto absolute touch-none select-none rounded-full outline-none focus-visible:ring-2 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          width: HANDLE,
          height: HANDLE,
          left,
          top: topPx,
          visibility: area.w ? 'visible' : 'hidden', // wait for the first measure
          '--tw-ring-color': '#7924FF',
        }}
      >
        <canvas
          ref={canvasRef}
          data-id="nano-bot-scene"
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            width: CANVAS,
            height: CANVAS,
            left: (HANDLE - CANVAS) / 2,
            top: (HANDLE - CANVAS) / 2 + CANVAS_DY,
          }}
        />
      </div>

      {/* no visible text: the reaction is announced to screen readers only */}
      <span className="sr-only" aria-live="polite">
        {spoken?.say}
      </span>
    </div>
  )
}
