import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import NotificationCard from './NotificationCard'

gsap.registerPlugin(Draggable, InertiaPlugin)

/**
 * CardDeck — the bell's swipeable stack, driven by GSAP Draggable + InertiaPlugin.
 *
 * The top card and the next two are real cards: the ones behind sit in the
 * Figma sliver slots (311 wide at +41, 287 at +81), scaled from their top edge
 * and frosted (white 90% / 70%), so a card can rise to the front as itself.
 *
 *  - Drag: the top card follows the finger on a slight elastic (it trails a
 *    touch, more the further it goes) and its tilt eases in; the card
 *    behind already starts rising and clearing in proportion (anticipation).
 *  - Release: momentum decides — a flick past THROW_V px/s (in the drag's
 *    direction, past FLICK_MIN_PX) throws it even on a short drag; otherwise it
 *    must pass THROW_PX; else it wobbles back home (elastic).
 *  - Throw: it carries its release velocity off-screen (ease-out, duration
 *    from speed), and the moment it leaves, the deck promotes: next → front
 *    (springs forward with a little elastic give, frost clears), back → middle, and a new back card fades up.
 *  - Press: 0.985 scale; tap (no drag) opens the card. Arrow keys mark read
 *    with no animation (keyboard actions shouldn't wait on motion).
 *
 * Everything animates transform / opacity only and is interruptible (GSAP
 * `overwrite: 'auto'` retargets from wherever the card is).
 */

const W = 335
const DEPTH = [
  { y: 0, scale: 1, frost: 0, autoAlpha: 1 },
  { y: 41, scale: 311 / W, frost: 0.9, autoAlpha: 1 },
  { y: 81, scale: 287 / W, frost: 0.7, autoAlpha: 1 },
]
const OFFSTAGE = { y: 104, scale: 263 / W, frost: 0.7, autoAlpha: 0 } // where a new back card rises from
const THROW_PX = 96
const THROW_V = 400 // px/s: a quick flick is enough…
const FLICK_MIN_PX = 24 // …once it has actually moved (a tap never throws)
const MAX_TILT = 16 // deg
const EASE_PROMOTE = 'elastic.out(1, 0.7)' // the next card springs to the front with a little give
const EASE_SPRINGBACK = 'elastic.out(1.1, 0.45)' // a let-go card wobbles home
const DRAG_GIVE = 0.16 // the card trails the finger by up to 16%, like it's on an elastic
const DRAG_GIVE_PX = 320 // …reached at this far
const lerp = (a, b, t) => a + (b - a) * t

export default function CardDeck({ updates, index, cardTop, onRead, onTap, reduceMotion }) {
  const visible = updates.slice(index, index + DEPTH.length)
  const nodes = useRef(new Map()) // id → { root, frost }
  const depthOf = useRef(new Map()) // id → depth it was last placed at
  const deckRef = useRef(null)
  const mounted = useRef(false)
  const throwing = useRef(false)
  const [pressedId, setPressedId] = useState(null)

  const ref = (id, part) => (el) => {
    const n = nodes.current.get(id) ?? {}
    n[part] = el
    nodes.current.set(id, n)
  }

  /** move a card to a depth slot (tweened unless `instant`) */
  const place = useCallback(
    (id, d, { instant = false, from = null } = {}) => {
      const n = nodes.current.get(id)
      if (!n?.root) return
      const t = DEPTH[d]
      const dur = instant || reduceMotion ? 0 : 0.8
      if (from) {
        gsap.set(n.root, { x: 0, rotation: 0, y: from.y, scale: from.scale, autoAlpha: from.autoAlpha })
        gsap.set(n.frost, { opacity: from.frost })
      }
      gsap.to(n.root, { x: 0, rotation: 0, y: t.y, scale: t.scale, autoAlpha: t.autoAlpha, duration: dur, ease: EASE_PROMOTE, overwrite: 'auto' })
      gsap.to(n.frost, { opacity: t.frost, duration: dur * 0.5, ease: 'power2.out', overwrite: 'auto' })
      depthOf.current.set(id, d)
    },
    [reduceMotion],
  )

  // lay the deck out whenever the window of cards changes (promotion after a throw, new data)
  useLayoutEffect(() => {
    const seen = new Set()
    visible.forEach((u, d) => {
      seen.add(u.id)
      const was = depthOf.current.get(u.id)
      if (was === d) return // already there (a throw promotes ahead of the re-render)
      if (!mounted.current) place(u.id, d, { instant: true })
      else place(u.id, d, was === undefined ? { from: OFFSTAGE } : {})
    })
    for (const id of [...depthOf.current.keys()]) if (!seen.has(id)) depthOf.current.delete(id)
    mounted.current = true
    throwing.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `visible` is derived from these two
  }, [index, updates, place])

  // the deck shifts down when read cards start stacking above it (Figma Scrolled: card at +24)
  useLayoutEffect(() => {
    gsap.to(deckRef.current, { y: cardTop, duration: reduceMotion ? 0 : 0.45, ease: 'power3.out', overwrite: 'auto' })
  }, [cardTop, reduceMotion])

  const top = visible[0]
  const next = visible[1]
  const back = visible[2]

  /** promote everything behind the top card one slot forward */
  const promote = useCallback(() => {
    if (next) place(next.id, 0)
    if (back) place(back.id, 1)
    const incoming = updates[index + DEPTH.length]
    if (incoming) depthOf.current.delete(incoming.id) // it mounts after the re-render and rises from offstage
  }, [back, index, next, place, updates])

  /** throw the top card off-screen in `dir`, carrying velocity `v` (px/s) */
  const throwOut = useCallback(
    (dir, v = 0) => {
      const n = top && nodes.current.get(top.id)
      if (!n?.root || throwing.current) return
      throwing.current = true
      setPressedId(null)
      if (reduceMotion) {
        onRead(top)
        return
      }
      const x = gsap.getProperty(n.root, 'x')
      const endX = dir * (W + 180)
      // keep the release speed: duration from distance / speed, kept within a snappy range
      const speed = Math.max(Math.abs(v), 1500)
      const dur = gsap.utils.clamp(0.2, 0.42, Math.abs(endX - x) / speed)
      gsap.to(n.root, {
        x: endX,
        y: '-=18',
        rotation: dir * 26,
        duration: dur,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => onRead(top),
      })
      promote()
    },
    [onRead, promote, reduceMotion, top],
  )

  // Draggable on the current top card
  useLayoutEffect(() => {
    const n = top && nodes.current.get(top.id)
    if (!n?.root) return undefined
    const behind = next && nodes.current.get(next.id)
    InertiaPlugin.track(n.root, 'x')
    const pressScale = (s) => gsap.to(n.root, { scale: s, duration: 0.14, ease: 'power2.out', overwrite: 'auto' })
    // our own release velocity from the last ~100ms of pointer movement: InertiaPlugin samples on
    // GSAP's ticker, which can under-read a flick that only lasts a few frames
    let samples = []
    let pressX = 0 // pointer x at press, for the elastic drag
    let lastX = 0 // the card's x as drawn (after the elastic)
    const sample = (x) => {
      const t = performance.now()
      samples.push([t, x])
      while (samples.length > 2 && t - samples[0][0] > 100) samples.shift()
    }
    const pointerVelocity = () => {
      if (samples.length < 2) return 0
      const [t0, x0] = samples[0]
      const [t1, x1] = samples[samples.length - 1]
      return t1 - t0 > 0 ? ((x1 - x0) / (t1 - t0)) * 1000 : 0
    }

    const [drag] = Draggable.create(n.root, {
      type: 'x',
      minimumMovement: 6,
      allowContextMenu: true,
      zIndexBoost: false,
      onPress() {
        pressX = this.pointerX
        lastX = 0
        if (throwing.current) return
        setPressedId(top.id)
        if (!reduceMotion) pressScale(0.985)
      },
      onRelease() {
        setPressedId(null)
        if (!this.isDragging && !throwing.current && !reduceMotion) pressScale(1)
      },
      onDragStart() {
        samples = []
        sample(this.x)
        setPressedId(null)
        if (!reduceMotion) pressScale(1)
      },
      onDrag() {
        sample(this.x)
        lastX = this.x
        if (reduceMotion) return
        // elastic: the card lags the finger slightly (more the further it goes), and the tilt eases in
        const raw = this.pointerX - pressX
        const x = raw * (1 - DRAG_GIVE * Math.min(Math.abs(raw) / DRAG_GIVE_PX, 1))
        gsap.set(n.root, { x })
        lastX = x
        gsap.to(n.root, { rotation: gsap.utils.clamp(-MAX_TILT, MAX_TILT, x * 0.075), duration: 0.22, ease: 'power2.out', overwrite: 'auto' })
        if (behind?.root) {
          // anticipation: the next card starts coming forward with the drag
          const p = Math.min(Math.abs(lastX) / 200, 1)
          gsap.to(behind.root, { y: lerp(DEPTH[1].y, 14, p), scale: lerp(DEPTH[1].scale, 0.975, p), duration: 0.25, ease: 'power2.out', overwrite: 'auto' })
          gsap.to(behind.frost, { opacity: lerp(DEPTH[1].frost, 0.35, p), duration: 0.25, overwrite: 'auto' })
        }
      },
      onDragEnd() {
        const vi = InertiaPlugin.getVelocity(n.root, 'x')
        const vp = performance.now() - (samples.at(-1)?.[0] ?? 0) < 80 ? pointerVelocity() : 0 // stale if the finger paused
        const v = Math.abs(vp) > Math.abs(vi) ? vp : vi
        const flick = Math.abs(v) > THROW_V && Math.abs(lastX) > FLICK_MIN_PX && Math.sign(v) === Math.sign(lastX)
        if (Math.abs(lastX) > THROW_PX || flick) {
          throwOut(Math.sign(flick ? v : lastX) || 1, v)
          return
        }
        // not far / fast enough: spring back, and the next card settles back behind
        gsap.to(n.root, { x: 0, rotation: 0, duration: reduceMotion ? 0 : 0.95, ease: EASE_SPRINGBACK, overwrite: 'auto' })
        if (next) place(next.id, 1)
      },
      onClick() {
        if (!throwing.current) onTap(top)
      },
    })
    return () => {
      drag.kill()
      InertiaPlugin.untrack(n.root)
    }
  }, [next, onTap, place, reduceMotion, throwOut, top])

  const onKeyDown = (e) => {
    if (!top) return
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      // keyboard: mark read straight away, no throw animation
      if (!throwing.current) {
        throwing.current = true
        onRead(top)
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onTap(top)
    }
  }

  return (
    <div ref={deckRef} data-id="nano-updates-deck" className="absolute inset-x-0 top-0 h-[400px]">
      {visible.map((u, d) => (
        <div
          key={u.id}
          ref={ref(u.id, 'root')}
          data-id={d === 0 ? 'nano-updates-top-card' : 'nano-updates-deck-card'}
          data-depth={d}
          role={d === 0 ? 'button' : undefined}
          tabIndex={d === 0 ? 0 : -1}
          aria-hidden={d === 0 ? undefined : true}
          aria-label={d === 0 ? `${u.type} update: ${u.title.replace('\n', ' ')}. Swipe left or right to mark as read` : undefined}
          onKeyDown={d === 0 ? onKeyDown : undefined}
          className={`absolute left-0 top-0 h-[400px] w-[335px] select-none rounded-[24px] outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-white/70 ${
            d === 0 ? 'cursor-grab touch-pan-y active:cursor-grabbing' : 'pointer-events-none'
          }`}
          style={{ zIndex: DEPTH.length - d, transformOrigin: '50% 0%', willChange: 'transform' }}
        >
          <NotificationCard update={u} pressed={pressedId === u.id} />
          {/* frost: makes a card behind read as the Figma sliver; clears as it comes forward */}
          <div
            ref={ref(u.id, 'frost')}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[24px] bg-white shadow-[0px_6px_18px_0px_rgba(15,20,41,0.06)]"
            style={{ opacity: DEPTH[Math.min(d, DEPTH.length - 1)].frost }}
          />
        </div>
      ))}
    </div>
  )
}
