import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { createNoonBot } from './bot/noonBot'
import { createBubble3D } from './bot/bubble3d'

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
 * Task / approval events pop a 3D message bubble out of the bot (./bot/bubble3d:
 * a glossy bubble with an LED pixel-text screen) with a reaction for each:
 * a new task → it looks up at the bubble and double-hops; waiting → it thinks
 * until the answer comes; approved → a hop with a full spin; declined → a
 * flinch, then it droops. With `onlyOnNotify` the bot stays away until an
 * event: it grows in with a spin, reacts, the bubble pops once it has landed,
 * and it leaves after the bubble (a tap dismisses early; waiting stays). Call `notify(kind)` via the `notification` prop
 * ({ kind, id }); `demo` plays task → waiting → approved → task → waiting →
 * declined once. In dev, window.nanoBot.notify('approved') triggers one.
 *
 * `onOpen` (optional): the bot is the bell — when set, a tap hops, greets and
 * calls it (noon nano opens its Updates stack) instead of the next reaction.
 *
 * The position is kept as fractions of the free area so it survives screen
 * size changes, and remembered per browser (a convenience only).
 *
 * `top` / `bottom` are CSS lengths for the free area's edges (frame-relative).
 * `paused` stops the bot's and bubble's render loops while they're covered.
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
// task / approval events: bubble kind → bot mood, how long it shows (0 = until the next event)
const EVENTS = {
  task: { state: 'greeting', hop: true, ms: 4000, say: 'New task' },
  pending: { state: 'working', ms: 0, say: 'Waiting for approval' },
  approved: { state: 'greeting', hop: true, ms: 3600, say: 'Approved' },
  declined: { state: 'error', ms: 3600, say: 'Declined' },
}
const DEMO = [
  [3200, 'task'],
  [8200, 'pending'],
  [12800, 'approved'],
  [19000, 'task'],
  [24000, 'pending'],
  [28600, 'declined'],
]
const SETTLE_MS = 140 // a beat after the bot has faced front, then the bubble scales out of it
const LEAVE_MS = 320 // bubble shrinks before the bot leaves
const BUBBLE_H = 124 // px: the bubble strip above (or below) the bot
const TIP_DY = 3 // px: the tail tip touches the head this far inside the handle (crown / chin)
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

export default function NanoBot({ top, bottom, notification = null, demo = false, onOpen = null, onlyOnNotify = false, paused = false }) {
  const reduceMotion = useReducedMotion() ?? false
  const areaRef = useRef(null)
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const bubbleCanvasRef = useRef(null)
  const bubbleRef = useRef(null)
  const eventRef = useRef({ kind: null, timers: [] })
  const [shown, setShown] = useState(!onlyOnNotify)
  const hiddenStart = useRef(onlyOnNotify) // the engine is created once with this
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
      engine = createNoonBot({ canvas, reduceMotion, hidden: hiddenStart.current })
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

  useEffect(() => {
    const canvas = bubbleCanvasRef.current
    if (!canvas) return undefined
    let bubble
    try {
      bubble = createBubble3D({ canvas, reduceMotion })
    } catch {
      return undefined // no WebGL: the bot already bowed out
    }
    bubbleRef.current = bubble
    const ev = eventRef.current
    return () => {
      ev.timers.forEach((t) => window.clearTimeout(t))
      bubble.dispose()
      bubbleRef.current = null
    }
  }, [reduceMotion])

  // covered (e.g. by the Updates overlay): stop both 3D loops until it's visible again
  useEffect(() => {
    engineRef.current?.setPaused(paused)
    bubbleRef.current?.setPaused(paused)
  }, [paused])

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

  // the bubble hangs above the bot, or below it when there's no room up top
  const bubbleBelow = topPx < BUBBLE_H - 40
  const tipX = left + HANDLE / 2
  const tipY = bubbleBelow ? topPx + HANDLE - TIP_DY : topPx + TIP_DY
  const bubbleTop = bubbleBelow ? tipY - 6 : tipY - (BUBBLE_H - 6)
  useEffect(() => {
    bubbleRef.current?.setAnchor(tipX, tipY - bubbleTop, bubbleBelow)
  }, [tipX, tipY, bubbleTop, bubbleBelow])

  const clearEventTimers = () => {
    const e = eventRef.current
    e.timers.forEach((t) => window.clearTimeout(t))
    e.timers = []
  }
  const later = (ms, fn) => eventRef.current.timers.push(window.setTimeout(fn, ms))
  // glance at the bubble: up (or down when it hangs below), toward its centre
  const lookAtBubble = (secs) => {
    const dx = Math.min(area.w - EDGE_X - 90, Math.max(EDGE_X + 90, tipX)) - tipX // the bubble's sideways slide
    engineRef.current?.look(Math.max(-0.3, Math.min(0.3, -dx / 300)), bubbleBelow ? 0.16 : -0.24, secs)
  }
  /** the event is over: bubble out, then (onlyOnNotify) the bot leaves */
  const finish = () => {
    clearEventTimers()
    eventRef.current.kind = null
    bubbleRef.current?.hide()
    engineRef.current?.setState('idle')
    if (!onlyOnNotify) return
    later(LEAVE_MS, () => {
      engineRef.current?.exit(() => {
        if (!eventRef.current.kind) setShown(false)
      })
    })
  }

  /** a task / approval event: (bring the bot,) pop its bubble and play its reaction */
  const notify = (kind) => {
    const ev = EVENTS[kind]
    const engine = engineRef.current
    if (!ev || !engine) return
    clearEventTimers()
    eventRef.current.kind = kind
    // bring it in (or back, if it was on its way out)
    setShown(true)
    engine.enter()
    // the bot comes first: its bubble (and its reaction) wait until it has grown in and turned to
    // face front — then the bubble scales out of its head
    const lead = reduceMotion ? 0 : engine.settleIn > 0 ? engine.settleIn + SETTLE_MS : 0
    later(lead, () => {
      const bot = engineRef.current
      if (!bot) return
      switch (kind) {
        case 'task':
          bot.setState('greeting')
          bot.tap()
          later(380, () => engineRef.current?.tap()) // excited double hop
          lookAtBubble(1.6)
          break
        case 'pending':
          bot.setState('working')
          lookAtBubble(1.2)
          break
        case 'approved':
          bot.setState('greeting')
          // the spin waits for the grow-in turn to finish, so it reads as its own moment
          later(220, () => engineRef.current?.celebrate())
          break
        case 'declined':
          bot.setState('error') // flinch
          later(1100, () => {
            engineRef.current?.setState('idle')
            engineRef.current?.look(0, 0.22, 1.8) // ...and droop
          })
          break
        default:
          break
      }
    })
    later(lead, () => bubbleRef.current?.show(kind))
    setSpoken({ key: performance.now(), say: ev.say })
    if (ev.ms) later(lead + ev.ms, finish)
  }
  const notifyRef = useRef(notify)
  notifyRef.current = notify
  const stableNotify = useCallback((kind) => notifyRef.current(kind), [])
  useEffect(() => {
    if (notification?.kind) stableNotify(notification.kind)
  }, [notification, stableNotify])
  useEffect(() => {
    if (!demo) return undefined
    const timers = DEMO.map(([at, kind]) => window.setTimeout(() => stableNotify(kind), at))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [demo, stableNotify])
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined
    window.nanoBot = { notify: stableNotify, get engine() { return engineRef.current } }
    window.nanoExportGlb = (opts) => import('./exportGlb').then((m) => m.exportGlb(opts)) // GLB export of the nav + bubble models
    return () => {
      delete window.nanoBot
      delete window.nanoExportGlb
    }
  }, [stableNotify])

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
    if (onOpen) {
      // the bell: a happy hop, then open the updates
      clearEventTimers()
      bubbleRef.current?.hide()
      eventRef.current.kind = null
      engine.tap()
      engine.setState('greeting')
      window.setTimeout(() => {
        if (engineRef.current?.state === 'greeting') engineRef.current.setState('idle')
      }, REACT_MS)
      onOpen()
      if (onlyOnNotify) window.setTimeout(finish, 700) // then it heads off
      return
    }
    const r = reaction.current
    // a tap dismisses a finished bubble (waiting stays until it's answered)
    const e = eventRef.current
    if (e.kind && e.kind !== 'pending') {
      finish()
      if (onlyOnNotify) return // it's on its way out
    }
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
      {/* 3D message bubble strip: full frame width so the bubble can slide inside it */}
      <canvas
        ref={bubbleCanvasRef}
        data-id="nano-bot-bubble"
        aria-hidden="true"
        className="pointer-events-none absolute left-0 w-full"
        style={{ top: bubbleTop, height: BUBBLE_H, visibility: area.w ? 'visible' : 'hidden' }}
      />
      <div
        role="button"
        tabIndex={shown ? 0 : -1}
        aria-hidden={shown ? undefined : true}
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
          visibility: area.w && shown ? 'visible' : 'hidden', // wait for the first measure; away until an event
          pointerEvents: shown ? undefined : 'none',
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
