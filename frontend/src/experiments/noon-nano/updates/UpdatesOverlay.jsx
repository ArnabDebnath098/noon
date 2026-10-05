import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimate, useReducedMotion } from 'framer-motion'
import CardDeck from './CardDeck'
import { CARD_ART } from './NotificationCard'
import { createBell3D } from './bell3d'
import { loadUpdates } from './updatesData'
import header1 from '../../../assets/nano/updates/header-1.webp'
import header2 from '../../../assets/nano/updates/header-2.webp'
import header3 from '../../../assets/nano/updates/header-3.webp'
import header4 from '../../../assets/nano/updates/header-4.webp'
import headerBell from '../../../assets/nano/updates/header-bell.webp'
import swoosh from '../../../assets/nano/updates/swoosh.svg'
import hintHand from '../../../assets/nano/updates/hint-hand.webp'
import hintTrack from '../../../assets/nano/updates/hint-track.svg'
import hintThumb from '../../../assets/nano/updates/hint-thumb.svg'
import iconToast from '../../../assets/nano/updates/icon-toast.svg'

/**
 * UpdatesOverlay — "Updates today", the bell's stack of update cards over Home
 * (Figma Kids-Side 02 · Notifications — the bell, 36:10275). On noon nano the
 * bot is the bell: tapping it opens this.
 *
 * Swipe the top card left or right to mark it read (./CardDeck — GSAP
 * Draggable + Inertia): it's thrown off, the next card rises to the front and
 * the read card is gone — nothing stacks above (Figma Notification stack: Default
 * → Scrolled → End of list). On the last card the caption reads "You're all
 * caught up"; swiping it away closes the stack (bell cleared). Tapping a card
 * shows its pressed state and goes where it leads (`onGo(update)`). Tap the
 * dimmed area (or Esc) to close.
 *
 * States: Loading (skeleton stack), Single update, Couldn't load (toast +
 * error card, Try again), Offline (toast; cached cards still swipe). The swipe
 * hint shows on first view only.
 *
 * `onClose(readIds)` reports which cards were read.
 */

const HINT_KEY = 'nano.updates.hint-seen'
// the title art's visual centre vs its 375 × 97 box (bell above the words; ring and "Today" lean right), ×1.18
const TITLE_VISUAL = { x: -5, y: 30 }
const INTRO_RISE_MS = 1450 // the title has expanded and settled
const INTRO_CARDS_MS = 1800 // it has mostly risen
const CAPTION = 'whitespace-nowrap font-noontree text-[12px] font-medium text-white/80'

function readHintSeen() {
  try {
    return window.localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return false
  }
}
function writeHintSeen() {
  try {
    window.localStorage.setItem(HINT_KEY, '1')
  } catch {
    // storage unavailable: the hint just shows again next time
  }
}

/**
 * Figma "Header art · Updates today" (295:3193), 375 × 97, built in 3D from
 * the centre: a glow pulses out of the middle, then every layer starts as a
 * point at the art's centre and springs out to its own place — overshooting a
 * touch, then settling — staggered: "Updates", "Today" (both tipping up from
 * a 3D tilt), the gold ring (laid flat → upright), the checkered streaks, and
 * last the bell — live 3D (./bell3d) — which lands and rings, its clapper knocking. Once settled it keeps a slow
 * 3D sway. Layer boxes are the Figma layer frames (px in the 375 × 97 art).
 */
const ART = { cx: 187.5, cy: 48.5 }
const LAYER = {
  flags: { left: 47.545, top: -10.899, width: 279.91, height: 118.798 },
  ring: { left: 70.37, top: 12.89, width: 253.009, height: 84.336 },
  today: { left: 129.25, top: 44.66, width: 135.237, height: 52.562 },
  bell: { left: 160.98, top: -40.39, width: 71.777, height: 68.701 },
  updates: { left: 81.08, top: 0, width: 212.836, height: 70.945 },
}
/** offset that puts a layer's centre on the art's centre */
const fromCentre = ({ left, top, width, height }) => ({ x: ART.cx - (left + width / 2), y: ART.cy - (top + height / 2) })
// expand: quick, with one soft overshoot (ζ ≈ 0.5), then settle
const EXPAND = { type: 'spring', stiffness: 210, damping: 15, mass: 0.9 }
const STAGGER = { updates: 0.08, today: 0.16, ring: 0.24, flags: 0.22, bell: 0.42 }
const START = {
  updates: { rotateX: -55 },
  today: { rotateX: 55 },
  ring: { rotateX: 75, rotate: -40 },
  bell: { rotate: 0 },
}
// the words' slight 3D: tipped back a few degrees, with a ~4.5px stacked purple edge and a soft drop
const WORD_TILT = 9
const WORD_DEPTH = 'drop-shadow(0 1.5px 0 #6c28d9) drop-shadow(0 1.5px 0 #561cb3) drop-shadow(0 1.5px 0 #41138d) drop-shadow(0 7px 7px rgba(18, 4, 52, 0.5))'
// the shine: a bright diagonal band sweeping left → right, 3 passes ≈ 5.5s once the title has settled
const SHINE = {
  start: 0.9,
  lag: 0.14, // "Today" follows "Updates" a beat later
  pass: 1.45,
  gap: 0.45,
  passes: 3,
  // a gloss band: bright enough to read over the pale letters, soft enough that the bevels show through
  band: 'linear-gradient(105deg, rgba(255,255,255,0) 36%, rgba(255,255,255,0.18) 44%, rgba(255,255,255,0.62) 49%, rgba(255,255,255,0.62) 51%, rgba(255,255,255,0.18) 56%, rgba(255,255,255,0) 64%)',
}
// the 3D bell's canvas: larger than its Figma box so the swing and sparkles have room
const BELL_CANVAS = 1.8
function Bell3D({ fallback, ringAt, reduceMotion }) {
  const canvasRef = useRef(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    let bell
    try {
      bell = createBell3D({ canvas, reduceMotion })
    } catch {
      setFailed(true) // no WebGL: the flat bell art
      return undefined
    }
    const t = window.setTimeout(() => bell.ring(), ringAt * 1000)
    return () => {
      window.clearTimeout(t)
      bell.dispose()
    }
  }, [reduceMotion, ringAt])
  if (failed) return <img src={fallback} alt="" draggable={false} className="absolute inset-0 size-full max-w-none object-cover" />
  const { width, height } = LAYER.bell
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute"
      style={{
        width: width * BELL_CANVAS,
        height: width * BELL_CANVAS,
        left: (width - width * BELL_CANVAS) / 2,
        top: (height - width * BELL_CANVAS) / 2 - 24, // lifted so the mouth and clapper clear "Updates"
      }}
    />
  )
}

const HeaderArt = memo(function HeaderArt({ reduceMotion }) {
  const still = reduceMotion // reduced motion: the art just appears
  const layer = (name, src) => {
    const delay = STAGGER[name]
    const at = fromCentre(LAYER[name])
    if (name === 'flags') {
      // the checkered streaks sweep out: a wipe from the centre to both sides, a slow fade and a
      // blur that sharpens — eased, no spring, so they flow in behind the ring instead of popping
      return (
        <motion.img
          src={src}
          alt=""
          draggable={false}
          className="absolute max-w-none object-cover"
          style={LAYER.flags}
          initial={still ? false : { clipPath: 'inset(0% 50% 0% 50%)', opacity: 0, scaleX: 0.7, filter: 'blur(6px)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, scaleX: 1, filter: 'blur(0px)' }}
          transition={{ delay, duration: 0.85, ease: [0.16, 1, 0.3, 1], opacity: { delay, duration: 0.5, ease: 'easeOut' } }}
        />
      )
    }
    if (name === 'updates' || name === 'today') {
      // the words: a touch more 3D (a stacked purple edge under the letters + a soft drop, tipped
      // back slightly) and a light sweep masked to the letters, a few passes over the first ~6s
      const shineDelay = SHINE.start + (name === 'today' ? SHINE.lag : 0)
      return (
        <motion.div
          className="absolute"
          style={{ ...LAYER[name], transformOrigin: '50% 50%' }}
          initial={still ? false : { ...at, scale: 0, opacity: 0, ...START[name] }}
          animate={{ x: 0, y: 0, scale: 1, opacity: 1, rotateX: WORD_TILT, rotate: 0 }}
          transition={{ default: { ...EXPAND, delay }, opacity: { delay, duration: 0.14 } }}
        >
          <img src={src} alt="" draggable={false} className="absolute inset-0 size-full max-w-none object-cover" style={{ filter: WORD_DEPTH }} />
          {!still && (
            <motion.div
              data-name="Shine"
              className="absolute inset-0"
              style={{
                WebkitMaskImage: `url(${src})`,
                maskImage: `url(${src})`,
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
                backgroundImage: SHINE.band,
                backgroundSize: '260% 100%',
                backgroundRepeat: 'no-repeat',
              }}
              initial={{ backgroundPosition: '160% 0%', opacity: 1 }}
              animate={{ backgroundPosition: ['160% 0%', '-60% 0%'], opacity: [1, 1, 0] }}
              transition={{
                backgroundPosition: { delay: shineDelay, duration: SHINE.pass, repeat: SHINE.passes - 1, repeatDelay: SHINE.gap, ease: [0.45, 0, 0.2, 1] },
                // fades out after the last pass, so it never sits half-way across a letter
                opacity: { delay: shineDelay, duration: SHINE.passes * SHINE.pass + (SHINE.passes - 1) * SHINE.gap + 0.2, times: [0, 0.97, 1] },
              }}
            />
          )}
        </motion.div>
      )
    }
    if (name === 'bell') {
      // the bell is live 3D (./bell3d): it pops out like the other layers, then rings — it swings
      // and the clapper inside lags, catches up and knocks
      return (
        <motion.div
          className="absolute"
          style={{ ...LAYER.bell, transformOrigin: '50% 50%' }}
          initial={still ? false : { ...at, scale: 0, opacity: 0 }}
          animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ default: { ...EXPAND, delay }, opacity: { delay, duration: 0.14 } }}
        >
          <Bell3D fallback={src} ringAt={delay + 0.3} reduceMotion={reduceMotion} />
        </motion.div>
      )
    }
    return (
      <motion.img
        src={src}
        alt=""
        draggable={false}
        className="absolute max-w-none object-cover"
        style={{ ...LAYER[name], transformOrigin: '50% 50%' }}
        initial={still ? false : { ...at, scale: 0, opacity: 0, ...START[name] }}
        animate={{ x: 0, y: 0, scale: 1, scaleY: 1, opacity: 1, rotateX: 0, rotate: 0 }}
        transition={{ default: { ...EXPAND, delay }, opacity: { delay, duration: 0.14 } }}
      />
    )
  }
  return (
    <div
      data-name="Header art · Updates today"
      aria-hidden="true"
      className="pointer-events-none relative h-[97px] w-[375px] shrink-0"
      style={{ perspective: 700 }}
    >
      {/* the burst: a soft glow pulsing out of the centre as the layers expand */}
      {!still && (
        <motion.div
          className="absolute rounded-full"
          style={{
            left: ART.cx - 90,
            top: ART.cy - 90,
            width: 180,
            height: 180,
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(201,150,255,0.55) 32%, rgba(121,36,255,0) 70%)',
          }}
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{ scale: [0.1, 1, 2.2], opacity: [0, 1, 0] }}
          transition={{ duration: 0.75, times: [0, 0.3, 1], ease: 'easeOut' }}
        />
      )}
      <motion.div
        className="absolute inset-0"
        // flat (no preserve-3d): each layer keeps its 3D tilt but they stack in Figma order, so the
        // streaks and ring never cut through the words while those tip up
        style={{ perspective: 700 }}
        animate={still ? undefined : { rotateY: [-4, 4], rotateX: [2.5, -2] }}
        transition={{ duration: 3.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror', delay: 1.6 }}
      >
        {layer('flags', header1)}
        {layer('ring', header2)}
        {layer('bell', headerBell)}
        {layer('updates', header4)}
        {/* "Today" sits in front of "Updates", so its top isn't hidden under the word's 3D edge */}
        {layer('today', header3)}
      </motion.div>
    </div>
  )
})

/**
 * Figma Pager (291:3216): chrome beads = read, gel marker = current, recessed
 * dots = upcoming — in a recessed glass groove. Simple and 3D: when the
 * current card changes, the gel marker slides to its slot on a spring and
 * stretches a little on the way (squash & stretch), the dots slide aside to
 * make room, and a dot that becomes "read" pops in as a chrome bead.
 * Stops are absolutely placed (6px dots, 5px gaps, a 22px marker) so they can
 * move — a flex row would just jump.
 */
// pager: a black groove with a domed white pill on the current card, small raised white beads
// for the cards read and dimples sunk into the groove for the ones to come. Everything is one
// height on one centred track, so nothing sits high or low.
const PAGER = { dot: 6, gap: 8, marker: 22, padX: 8, padY: 5 }
const PAGER_STEP = PAGER.dot + PAGER.gap
const PAGER_SPRING = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }
function Pager({ count, current, dim = false }) {
  const reduceMotion = useReducedMotion() ?? false
  const [scope, animateMarker] = useAnimate()
  const prev = useRef(current)
  useEffect(() => {
    if (prev.current === current || reduceMotion) {
      prev.current = current
      return
    }
    // squash & stretch toward the direction of travel, then settle
    const dir = Math.sign(current - prev.current)
    prev.current = current
    // anchor the leading edge and stretch the tail back: a motion streak that never overshoots the groove
    scope.current.style.transformOrigin = dir > 0 ? '100% 50%' : '0% 50%'
    animateMarker(scope.current, { scaleX: [1, 1.5, 0.94, 1] }, { duration: 0.42, times: [0, 0.35, 0.7, 1], ease: 'easeOut' })
  }, [animateMarker, current, reduceMotion, scope])
  const inner = (count - 1) * PAGER_STEP + PAGER.marker
  const motionT = reduceMotion ? { duration: 0 } : PAGER_SPRING
  return (
    <div
      data-id="nano-updates-pager"
      className="relative rounded-full border border-white/[0.12] bg-gradient-to-b from-[#121016] to-[#201c28]"
      style={{
        width: inner + PAGER.padX * 2,
        height: PAGER.dot + PAGER.padY * 2,
        opacity: dim ? 0.4 : 1,
        // recessed groove: dark along the top inside, a faint lit lip along the bottom
        boxShadow: 'inset 0 1.5px 2.5px rgba(0,0,0,0.85), inset 0 -1px 0 rgba(255,255,255,0.07), 0 2px 6px rgba(0,0,0,0.35)',
      }}
    >
      {/* the track: one row, every stop and the marker exactly PAGER.dot tall, so nothing sits off-centre */}
      <div className="absolute" style={{ left: PAGER.padX, top: PAGER.padY, width: inner, height: PAGER.dot }}>
        {Array.from({ length: count }, (_, i) => {
          if (i === current) return null
          const read = i < current
          return (
            <motion.div
              key={i}
              className="absolute top-0 rounded-full"
              style={{ width: PAGER.dot, height: PAGER.dot }}
              initial={false}
              animate={{ x: i * PAGER_STEP + (i > current ? PAGER.marker - PAGER.dot : 0) }}
              transition={motionT}
            >
              {read ? (
                <motion.div
                  key="read"
                  data-name="Stop · read"
                  className="absolute inset-0 rounded-full"
                  style={{
                    // a small raised bead: lit from the top-left, shaded underneath
                    background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #f2f2f5 45%, #c9c9d2 100%)',
                    boxShadow: '0 1px 1.5px rgba(0,0,0,0.6), inset 0 -1px 1px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
                  }}
                  initial={reduceMotion ? false : { scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 18, delay: 0.12 }}
                />
              ) : (
                <div
                  data-name="Stop · next"
                  className="absolute inset-0 rounded-full bg-black/40"
                  // a dimple sunk into the groove: dark inside its top edge, a lit rim along its bottom
                  style={{ boxShadow: 'inset 0 1px 1.5px rgba(0,0,0,0.95), 0 1px 0 rgba(255,255,255,0.1)' }}
                />
              )}
            </motion.div>
          )
        })}
        {/* the marker: a white pill that slides on a spring, with a soft white glow */}
        <motion.div
          className="absolute left-0 top-0"
          data-name="Marker · current"
          style={{ width: PAGER.marker, height: PAGER.dot }}
          initial={false}
          animate={{ x: current * PAGER_STEP }}
          transition={motionT}
        >
          <div
            ref={scope}
            className="absolute inset-0 rounded-full"
            style={{
              // a domed pill: bright at the crown, shading to grey at the base, with a soft glow
              background: 'linear-gradient(180deg, #ffffff 0%, #f4f4f7 50%, #d6d6de 100%)',
              boxShadow: '0 1.5px 2px rgba(0,0,0,0.6), 0 0 6px rgba(255,255,255,0.35), inset 0 -1px 1px rgba(0,0,0,0.16)',
            }}
          >
            {/* the gloss: a thin highlight along the crown */}
            <div aria-hidden className="absolute left-[4px] right-[4px] top-[1px] h-[1.5px] rounded-full bg-white" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/** Figma Swipe hint (295:3187): a hand dragging the thumb along a faded track; first view only */
function SwipeHint({ reduceMotion }) {
  return (
    <motion.div
      data-id="nano-updates-hint"
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[230px] z-10 h-[118px] w-[206px] -translate-x-[39%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <img src={hintTrack} alt="" className="absolute left-[-12px] top-[11.07px] h-[60px] w-[166px]" />
      <motion.div
        className="absolute left-0 top-0 size-full"
        animate={reduceMotion ? undefined : { x: [-40, 10, 10, -40] }}
        transition={{
          duration: 2,
          times: [0, 0.45, 0.75, 1],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img src={hintThumb} alt="" className="absolute left-[103px] top-[13.07px] size-[46px]" />
        <div className="absolute left-[calc(50%+56px)] top-0 flex size-[117.857px] -translate-x-1/2 items-center justify-center">
          <img src={hintHand} alt="" className="size-[86.277px] -rotate-30 object-cover drop-shadow-[0px_6px_12px_rgba(0,0,0,0.3)]" />
        </div>
      </motion.div>
    </motion.div>
  )
}

/** M-Toast · Error (7:3264) — "Couldn't load notifications" / "You're offline" */
function Toast({ children }) {
  return (
    <motion.div
      role="status"
      data-id="nano-updates-toast"
      className="pointer-events-none absolute inset-x-0 z-20 flex justify-center"
      style={{ top: 'calc(var(--sat, 0px) + 8px)' }}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -16, opacity: 0 }}
    >
      {/* centred by this wrapper: motion owns its transform, so no translate-x here */}
      <div className="flex items-center gap-2 rounded-[14px] border border-white/[0.08] bg-[#d92626] p-3 drop-shadow-[0px_12px_14px_rgba(11,12,14,0.1)]">
        <img src={iconToast} alt="" width={24} height={24} className="size-6 shrink-0" />
        <p className="m-0 whitespace-nowrap font-noontree text-[14px] font-semibold leading-5 tracking-[-0.1px] text-white">{children}</p>
      </div>
    </motion.div>
  )
}

/** a sliver card peeking above (read) or below (to come) the top card; `enter` eases it in */
const Sliver = ({ top, wide, enter = false }) => (
  <motion.div
    initial={enter ? { opacity: 0, y: 14, scale: 0.97 } : false}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
    aria-hidden="true"
    className={`absolute shadow-[0px_6px_18px_0px_rgba(15,20,41,0.06)] backdrop-blur-[10px] ${
      wide ? 'left-3 h-[371px] w-[311px] rounded-[22px] bg-white/90' : 'left-6 h-[343px] w-[287px] rounded-[21px] bg-white/70'
    }`}
    style={{ top }}
  />
)

function SkeletonCard() {
  return (
    <div
      data-name="Skeleton card"
      className="absolute left-0 top-0 flex h-[400px] w-[335px] flex-col items-start gap-3 overflow-clip rounded-[24px] bg-white p-[22px] shadow-[0px_12px_32px_0px_rgba(0,0,0,0.12)]"
    >
      {['h-8 w-[110px] bg-[#e5e8f0]', 'mt-1 h-5 w-[220px] bg-[#d6dbe5]', 'h-3.5 w-[150px] bg-[#e5e8f0]'].map((c) => (
        <div key={c} className={`animate-pulse rounded-full ${c}`} />
      ))}
      <div className="mt-3 flex items-start gap-3 overflow-clip">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 w-[118px] shrink-0 animate-pulse rounded-xl bg-[#e5e8f0]" />
        ))}
      </div>
    </div>
  )
}

function ErrorCard({ onRetry }) {
  return (
    <div
      data-id="nano-updates-error"
      className="flex h-[400px] w-[335px] flex-col items-center justify-center gap-2 overflow-clip rounded-[24px] bg-gradient-to-b from-white via-white via-40% to-[#e2e4ea] p-8 shadow-[0px_12px_32px_0px_rgba(0,0,0,0.12)]"
    >
      <img src={headerBell} alt="" className="h-[109.922px] w-[114.844px] object-cover" style={{ filter: 'grayscale(1)' }} />
      <div className="h-3 w-px" />
      <p className="m-0 whitespace-nowrap text-center font-noontree text-[20px] font-bold text-[#1d2539]">Couldn’t load your updates</p>
      <p className="m-0 whitespace-nowrap text-center font-noontree text-[14px] font-medium text-[#666d85]">Check your connection and try again.</p>
      <div className="h-3 w-px" />
      {/* nano button · Secondary (19:5179) */}
      <button
        type="button"
        data-id="nano-updates-retry"
        onClick={onRetry}
        className="relative flex w-[200px] items-center justify-center rounded-2xl border-2 border-white bg-white px-[18px] py-4 shadow-[inset_0px_4px_4px_0px_rgba(152,159,179,0.1),inset_0px_-6px_6px_0px_rgba(152,159,179,0.22)] outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-[#7924ff] active:scale-[0.98]"
      >
        <span className="font-noontree text-[16px] font-semibold leading-6 text-[#1d2539]">Try again</span>
      </button>
    </div>
  )
}

/** warm the browser cache with the overlay's art (title layers + the first cards), e.g. on idle */
export function preloadUpdates() {
  for (const src of [header1, header2, header3, header4, headerBell, swoosh, ...CARD_ART]) {
    const img = new Image()
    img.decoding = 'async'
    img.src = src
  }
}

export default function UpdatesOverlay({ open, onClose, onGo }) {
  const reduceMotion = useReducedMotion() ?? false
  const [phase, setPhase] = useState('loading') // loading · ready · error
  const [updates, setUpdates] = useState([])
  const [index, setIndex] = useState(0) // the top card
  const [offline, setOffline] = useState(false)
  const [hint, setHint] = useState(false)
  const readIds = useRef([])
  // mounted while open and while fading out (AnimatePresence's exit stalled here, leaving an
  // invisible layer over the page — so the fade-out is tracked by hand)
  const [mounted, setMounted] = useState(open)
  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  // intro: the title builds in the middle of the screen, rises to its place, then the cards come up
  const [stage, setStage] = useState('done') // title · rise · done
  const [plays, setPlays] = useState(0) // remounts the header art so its build replays each open
  useEffect(() => {
    if (!open) return undefined
    setPlays((n) => n + 1)
    if (reduceMotion) {
      setStage('done')
      return undefined
    }
    setStage('title')
    const rise = window.setTimeout(() => setStage('rise'), INTRO_RISE_MS)
    const done = window.setTimeout(() => setStage('done'), INTRO_CARDS_MS)
    return () => {
      window.clearTimeout(rise)
      window.clearTimeout(done)
    }
  }, [open, reduceMotion])
  // how far the title's final spot is from the screen's middle (layout offsets ignore transforms)
  const overlayRef = useRef(null)
  const columnRef = useRef(null)
  const headerRef = useRef(null)
  const [centerY, setCenterY] = useState(0)
  useLayoutEffect(() => {
    const o = overlayRef.current
    const c = columnRef.current
    const h = headerRef.current
    if (!o || !c || !h) return
    const finalMid = o.clientHeight - c.offsetHeight + h.offsetTop + 97 / 2
    // centre what you see, not the box: the bell rides ~TITLE_VISUAL.y above the words, so the box
    // centre sits that much below the screen's middle for the whole title to read as centred
    const y = Math.round(o.clientHeight / 2 + TITLE_VISUAL.y - finalMid)
    setCenterY((prev) => (prev === y ? prev : y))
  }, [mounted, phase, updates.length, index])

  const fetchUpdates = useCallback(() => {
    setPhase('loading')
    loadUpdates()
      .then((list) => {
        setUpdates(list)
        setIndex(0)
        setPhase('ready')
        setHint(!readHintSeen() && list.length > 0)
      })
      .catch(() => setPhase('error'))
  }, [])

  useEffect(() => {
    if (!open) return undefined
    readIds.current = []
    setOffline(typeof navigator !== 'undefined' && navigator.onLine === false)
    fetchUpdates()
    const onOffline = () => setOffline(true)
    const onOnline = () => setOffline(false)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [open, fetchUpdates])

  const close = useCallback(() => onClose?.(readIds.current), [onClose])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const markRead = useCallback(
    (u) => {
      if (!readIds.current.includes(u.id)) readIds.current.push(u.id)
      if (hint) {
        setHint(false)
        writeHintSeen()
      }
      if (index + 1 >= updates.length)
        close() // the last one read: bell cleared
      else setIndex(index + 1)
    },
    [close, hint, index, updates.length],
  )

  const go = useCallback(
    (u) => {
      if (!readIds.current.includes(u.id)) readIds.current.push(u.id)
      onGo?.(u)
      close()
    },
    [close, onGo],
  )

  const n = updates.length
  const below = Math.min(n - index - 1, 2) // cards still to come
  // the stack keeps one fixed layout from the first card to the last: the current card always sits
  // on top in the same spot, the cards still to come peek out below it (read cards just leave —
  // nothing stacks above), so the title and cards never jump as cards are read
  const cardTop = 0
  const stackH = 424 // card + the deepest sliver below (81 + 343)
  const last = phase === 'ready' && index === n - 1
  const caption =
    phase === 'loading' ? 'Loading your updates…' : n === 1 ? 'That’s your only update' : last ? 'You’re all caught up' : 'Swipe left or right to mark as read'

  if (!mounted) return null
  return (
    <motion.div
      ref={overlayRef}
      data-id="nano-updates"
      data-open={open || undefined}
      data-intro={stage}
      role="dialog"
      aria-modal="true"
      aria-label="Updates today"
      aria-hidden={!open}
      className="fixed inset-0 left-1/2 z-[55] w-full max-w-md -translate-x-1/2 overflow-hidden"
      style={{ pointerEvents: open ? 'auto' : 'none' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: open ? 1 : 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
      onAnimationComplete={() => {
        if (!open) setMounted(false)
      }}
    >
      {/* Overlay: blurred, darkened home; tapping the dim area closes */}
      <button
        type="button"
        aria-label="Close updates"
        data-id="nano-updates-backdrop"
        onClick={close}
        className="absolute inset-0 cursor-default bg-gradient-to-b from-[rgba(0,0,0,0.6)] to-[rgba(47,41,57,0.93)] to-[41%] backdrop-blur-[10px] outline-none [-webkit-tap-highlight-color:transparent]"
      />
      {/* the swoosh behind the stack */}
      <div aria-hidden className="pointer-events-none absolute bottom-[-150px] left-[-144px] flex h-[418px] w-[413px] items-center justify-center">
        <img src={swoosh} alt="" className="h-[328.247px] w-[336.846px] max-w-none rotate-[72.91deg]" />
      </div>

      <AnimatePresence>
        {phase === 'error' && <Toast key="err">Couldn’t load notifications</Toast>}
        {phase !== 'error' && offline && <Toast key="off">You’re offline</Toast>}
      </AnimatePresence>

      <div
        ref={columnRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center px-5"
        style={{
          paddingBottom: phase === 'error' ? 100 : 'calc(32px + var(--sab, 0px))',
        }}
      >
        {/* the title: builds big in the middle, then glides up to its Figma spot */}
        <motion.div
          ref={headerRef}
          className="relative z-10 mb-[22px]"
          initial={false}
          animate={stage === 'title' ? { x: TITLE_VISUAL.x, y: centerY, scale: 1.18 } : { x: 0, y: 0, scale: 1 }}
          // building: pinned to the middle (snaps there on the first measure); rising: a soft spring
          transition={stage === 'title' ? { duration: 0 } : { type: 'spring', stiffness: 140, damping: 20, mass: 1 }}
        >
          <HeaderArt key={plays} reduceMotion={reduceMotion} />
        </motion.div>

        {/* the cards come up once the title is in place */}
        <motion.div
          className="flex flex-col items-center"
          initial={false}
          animate={stage === 'done' ? { opacity: 1, y: 0 } : { opacity: 0, y: 160 }}
          transition={stage === 'done' ? { type: 'spring', stiffness: 210, damping: 24 } : { duration: 0 }}
          style={{ pointerEvents: stage === 'done' ? undefined : 'none' }}
        >
          {phase === 'error' ? (
            <div className="pointer-events-auto">
              <ErrorCard onRetry={fetchUpdates} />
            </div>
          ) : (
            <>
              <div
                data-id="nano-updates-stack"
                data-state={phase === 'loading' ? 'loading' : n === 1 ? 'single' : last ? 'end' : index ? 'scrolled' : 'default'}
                className="pointer-events-auto relative w-[335px] shrink-0 transition-[height] duration-200"
                style={{
                  height: phase === 'loading' ? 424 : stackH,
                  '--card-top': `${cardTop}px`,
                }}
              >
                {phase === 'loading' ? (
                  <>
                    <Sliver top={81} />
                    <Sliver top={41} wide />
                    <SkeletonCard />
                  </>
                ) : (
                  <>
                    {/* the deck: the top card plus the next two as real cards in the sliver slots */}
                    <CardDeck updates={updates} index={index} cardTop={cardTop} onRead={markRead} onTap={go} reduceMotion={reduceMotion} />
                    <AnimatePresence>{hint && <SwipeHint key="hint" reduceMotion={reduceMotion} />}</AnimatePresence>
                  </>
                )}
              </div>
              <div className="mt-6 flex flex-col items-center gap-4">
                {(phase === 'loading' || n > 1) && (
                  <Pager count={phase === 'loading' ? 4 : n} current={phase === 'loading' ? 0 : index} dim={phase === 'loading'} />
                )}
                <p className={`m-0 ${CAPTION}`} aria-live="polite">
                  {caption}
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
