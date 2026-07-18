// Marketplace switcher — VARIATION 1 (row + folder → App-Library expansion).
//
// Collapsed: a row of BIG_N marketplace tiles followed by a "folder" tile
// showing a 2×2 preview of more marketplaces. Tapping the folder runs an Apple
// App-Library-style open:
//   • press feedback (compress ~0.97) then the folder surface morphs into a
//     full panel (spring physics)
//   • OBJECT CONTINUITY: the row tiles and the preview icons are the same
//     elements that travel to their slots in the full grid (no crossfade)
//   • every other marketplace is tucked (invisible, mini) inside the folder and
//     flies out from its centre; on close everything pours back in
//
// Scroll-linked collapse — SAME MECHANICS AS VARIATION 4: the shared `progress`
// motion value (0→1 over the scroll range, spring-smoothed) continuously drives
//   • tile height ICON → COLLAPSE_H (width constant, pills top-aligned)
//   • smart logo restructure: fadeStack folds + fades its top wordmark,
//     supermall's "mall" position-morphs onto one line, logo/label marks
//     scale to their collapseScale
//   • squircle radius steps with the shrinking height (render prop → stepped
//     through state on whole-px changes, like V4)
//   • the folder pill crossfades its 2×2 preview for a 3-marketplace stack
// Opening the grid gates the collapse off (a spring multiplier) so the panel
// always expands from full-size tiles, even while scrolled.
import { useEffect, useMemo, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import useElementWidth from '../../../hooks/useElementWidth'
import {
  springs,
  easings,
  curvedPath,
  staggerContainer,
  pathFlightVariants,
  scrollSmoothing,
  clamp01,
  lerp,
} from '../../../utils/motion'
import MarketplaceMark from './MarketplaceMark'
import NewBadge from './NewBadge'

// ---- layout constants ----
// Tile size (ICON) is derived per-render from the available width so the
// collapsed row (BIG_N markets + folder) always fits with side padding + gap;
// the grid reuses the same ICON. MAX_ICON caps it on wide screens.
const MAX_ICON = 76 // reference size the marks are tuned to (upper bound)
const COLLAPSE_H = 36 // collapsed pill height (matches V4's TILE_MIN)
const GAP = 8 // gap between row tiles
const GAP_COLLAPSED = 6 // tighter tile gap in the scroll-collapsed pill row
const ROW_TOP = 8

const BIG_N = 4 // marketplaces shown as row tiles (the 5th slot is the folder/grid)
const SWAP_SLOT = 3 // the row slot a grid pick swaps into (the last row tile)

const MINI_RATIO = 0.33 // preview icon size as a fraction of the tile

// expanded panel grid
const PADP = 14 // panel padding
const PANEL_MARGIN = 16 // panel inset from each screen edge
const COLS = 4

// Which folder positions appear in the 2×2 preview, and in which mini slot
// (0=TL, 1=TR, 2=BL, 3=BR). These four land in the cells nearest the folder, and
// each slot sits directly above its destination cell so the morph is short.
// Every other folder position stays hidden (tucked in the folder centre).
const PREVIEW_SLOT = { 4: 0, 5: 1, 6: 2, 7: 3 }
const isPreview = (i) => PREVIEW_SLOT[i] !== undefined

// ---- animation config (see utils/motion) ----
const ICONS_CONTAINER = staggerContainer({ stagger: 0.022, delayChildren: 0.03 })
// slightly longer flight than the default snappy — the icons travel further
// now that the panel spans the full width
const ICON_VARIANTS = pathFlightVariants(
  { type: 'spring', duration: 0.5, bounce: 0.18 },
  { duration: 0.18 },
)
// blue gradient (same palette as the sticky header) — anchored to the panel
// top so the blue reads clearly and fades to white toward the bottom
const PANEL_BG = {
  background:
    'radial-gradient(160% 120% at 50% 0%, #D4EFF6 0%, #DBE1F9 32%, #EBF3F9 58%, #FFFFFF 88%)',
}
// the marketplace card flips on its Y axis when a slot's marketplace swaps
const FLIP_TRANSITION = {
  rotateY: springs.flip,
  opacity: { duration: 0.18 },
  borderRadius: springs.snappy,
}

/**
 * One marketplace tile. Flies along `offsetPath` between its collapsed pose
 * (`collapsedScale`/`collapsedOpacity`, fed to the variant via `custom`) and its
 * full grid cell; the inner card flips when `m` changes (a swap).
 *
 * The scroll collapse rides `eff` (the gated progress spring) exactly like
 * variation 4's RailTile: height morphs to a pill and the mark restructures
 * continuously (fadeStack fold / supermall rowMorph / proportional scale).
 * `pillable` limits the morph to the visible row tiles; `fadeOnScroll` fades
 * the folder's 2×2 preview minis out as the stack takes over.
 */
function FolderIcon({
  m,
  size,
  collapseH,
  pillable,
  fadeOnScroll,
  eff,
  active,
  offsetPath,
  collapsedScale,
  collapsedOpacity,
  radius,
  bordered,
  pillShiftX = 0,
  interactive,
  onClick,
}) {
  const k = size / 76 // scale from the 76px reference the mark assets are tuned to
  const zero = useMotionValue(0)
  const drive = pillable ? eff : zero
  const fadeDrive = fadeOnScroll ? eff : zero

  // pill morph: height shrinks; y lifts so the pill stays top-aligned; x pulls
  // the tiles together as the row gap tightens (GAP → GAP_COLLAPSED)
  const h = useTransform(drive, (v) => size - (size - collapseH) * v)
  const y = useTransform(drive, (v) => (-(size - collapseH) / 2) * v)
  const x = useTransform(drive, (v) => pillShiftX * v)
  // preview minis fade out early on scroll (the folder stack replaces them)
  const wrapOpacity = useTransform(fadeDrive, [0, 0.45], [1, 0])

  // fadeStack tiles: the top wordmark folds (height → 0) and fades away early
  const topH = useTransform(drive, [0, 1], [(m.fadeH ?? 13) * k, 0])
  const topOpacity = useTransform(drive, [0, 0.55], [1, 0])
  const topGap = useTransform(drive, [0, 1], [2, 0])

  // rowMorph tile (supermall): expanded = super over mall; collapsed = one
  // line. "mall" position-morphs from below to the right (no crossfade).
  // The px constants were tuned in V4 at K = 64/76 — rescale them to this
  // tile's mark scale so "mall" clears the full width of "super".
  const rm = k / (64 / 76)
  const rmItemH = useTransform(drive, [0, 1], [13 * k, 11.5 * k])
  const rmSuperNudge = useTransform(drive, [0, 1], [0, 2.1 * rm]) // p-descender baseline drop
  const rmMallX = useTransform(drive, [0, 1], [0, 30.5 * rm])
  const rmMallY = useTransform(drive, [0, 1], [13 * k + 2, -0.5 * rm]) // slight lift so mall's cap aligns with super
  const rmWrapW = useTransform(drive, [0, 1], [35 * rm, 53 * rm])
  const rmWrapH = useTransform(drive, [0, 1], [2 * 13 * k + 2, 11.5 * k])

  // plain logo / label tiles: proportional shrink
  const collapsedMarkScale =
    m.collapseScale ??
    (m.logoHSmall && m.logoH
      ? m.logoHSmall / (m.logoH * k)
      : m.logo || m.logoStack
        ? 0.6
        : 0.85)
  const markScale = useTransform(drive, [0, 1], [1, collapsedMarkScale])

  // active art: pre-coloured stacks skip the white-invert; mono forces black
  const usingActiveArt = active && (m.activeFadeStack || m.activeLogoStack)
  const filter = usingActiveArt
    ? undefined
    : active && !m.lightAccent
      ? 'brightness(0) invert(1)'
      : m.mono
        ? 'brightness(0)'
        : undefined

  let content
  if (m.rowMorph && m.logoStack) {
    const stack = active && m.activeLogoStack ? m.activeLogoStack : m.logoStack
    content = (
      <motion.span style={{ width: rmWrapW, height: rmWrapH }} className="relative block">
        <motion.img
          src={stack[0]}
          alt=""
          style={{ height: rmItemH, y: rmSuperNudge }}
          className="absolute left-0 top-0 w-auto"
        />
        <motion.img
          src={stack[1]}
          alt=""
          style={{ height: rmItemH, x: rmMallX, y: rmMallY }}
          className="absolute left-0 top-0 w-auto"
        />
      </motion.span>
    )
  } else if (m.fadeStack) {
    const stack = active && m.activeFadeStack ? m.activeFadeStack : m.fadeStack
    // fadeMatchH: both marks share one cap height; otherwise equal width
    const img = m.fadeMatchH
      ? { className: 'w-auto', style: { height: (m.fadeH ?? 12) * k } }
      : { className: 'h-auto', style: { width: (m.keepW ?? 46) * k } }
    content = (
      <span className="flex flex-col items-center">
        <motion.span
          style={{ height: topH, opacity: topOpacity, marginBottom: topGap }}
          className="flex items-end justify-center overflow-hidden"
        >
          <img src={stack[0]} alt="" className={img.className} style={img.style} />
        </motion.span>
        <img src={stack[1]} alt="" className={img.className} style={img.style} />
      </span>
    )
  } else if (m.logo) {
    content = (
      <motion.span style={{ scale: markScale }} className="flex items-center justify-center">
        {m.logoH ? (
          <img src={m.logo} alt="" className="w-auto" style={{ height: m.logoH * k }} />
        ) : (
          <img src={m.logo} alt="" className="h-auto" style={{ width: (m.logoW ?? 56) * k }} />
        )}
      </motion.span>
    )
  } else {
    content = (
      <motion.span style={{ scale: markScale }} className="flex items-center justify-center">
        <span
          className="whitespace-pre-line text-center font-noontree font-black lowercase"
          style={{
            color: active && !m.lightAccent ? '#fff' : m.fg,
            fontSize: 15 * k,
            lineHeight: `${15 * k}px`,
          }}
        >
          {m.label}
        </span>
      </motion.span>
    )
  }

  return (
    <motion.div
      data-id={`mp-tile-${m.id}`}
      variants={ICON_VARIANTS}
      custom={{ scale: collapsedScale, opacity: collapsedOpacity }}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: size,
        height: size,
        zIndex: 30,
        perspective: 700,
        offsetPath,
        offsetRotate: '0deg',
        offsetAnchor: '50% 50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // invisible icons (tucked in the folder) must not swallow taps meant
        // for the content sitting under them.
        pointerEvents: interactive ? 'auto' : 'none',
      }}
    >
      {/* pill wrapper — rides the scroll morph independently of the
          offset-path flight on the root */}
      <motion.div style={{ position: 'relative', width: size, height: h, x, y, opacity: wrapOpacity }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={m.id}
            initial={{ rotateY: -110, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 110, opacity: 0 }}
            transition={FLIP_TRANSITION}
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
            }}
          >
            {/* squircle surface (radius steps with the pill height). The 1px
                hairline is an INSET box-shadow, clipped to the squircle path —
                NOT corner-smoothing's borderWidth mode, which re-injects a
                <style> tag into <head> every frame the tile resizes and is the
                root cause of the scroll jank. */}
            <Squircle
              as="span"
              cornerRadius={radius}
              cornerSmoothing={1}
              style={{
                position: 'absolute',
                inset: 0,
                background: active ? m.accent : m.bg ?? '#FFFFFF',
                boxShadow: bordered ? 'inset 0 0 0 1px #E5E7EB' : 'none',
              }}
              className="flex items-center justify-center overflow-hidden"
            >
              <span style={{ filter }} className="relative flex items-center justify-center">
                {content}
              </span>
            </Squircle>
          </motion.div>
        </AnimatePresence>
        {m.isNew && <NewBadge dataId={`mp-tile-${m.id}-new`} />}
      </motion.div>
    </motion.div>
  )
}

export default function MarketplaceSwitcherV3({ items, activeId, onChange, progress }) {
  const [ref, W] = useElementWidth(375)
  const [expanded, setExpanded] = useState(false)
  const [pressed, setPressed] = useState(false)
  // which marketplace currently sits in each slot (mutated by swaps)
  const [slotOrder, setSlotOrder] = useState(() => items.map((m) => m.id))
  const byId = useMemo(() => new Map(items.map((m) => [m.id, m])), [items])

  // ---- scroll-linked collapse (V4 mechanics) -----------------------------
  // One shared smoothing spring drives every tile's collapse morph; a gate
  // spring multiplies it to 0 while the grid is open, so tiles always fly out
  // full-size even when the page is scrolled.
  const fallback = useMotionValue(0)
  const sp = useSpring(progress ?? fallback, scrollSmoothing)
  // the gate also paces the panel morph — crisp with a hint of life (≈0.35s)
  const gate = useSpring(1, { stiffness: 260, damping: 28 })
  useEffect(() => {
    gate.set(expanded ? 0 : 1)
  }, [expanded, gate])
  const eff = useTransform([sp, gate], ([v, g]) => clamp01(v) * clamp01(g))

  // ---- geometry ----------------------------------------------------------
  // Collapsed row: BIG_N tiles + the folder. GAP is fixed (8px); the tile size
  // is derived so all ROW_N slots fit within the width with 16px side padding,
  // then the row is centred. The grid reuses the same tile + gap.
  const ROW_N = BIG_N + 1
  const ROW_PAD = 16
  const ICON = Math.min(MAX_ICON, Math.floor((W - 2 * ROW_PAD - (ROW_N - 1) * GAP) / ROW_N))
  const MINI = Math.round(ICON * MINI_RATIO)
  const MINI_SCALE = MINI / ICON
  const slotGap = GAP
  const rowContentW = ROW_N * ICON + (ROW_N - 1) * slotGap
  const rowStart = Math.max(ROW_PAD, (W - rowContentW) / 2)
  const rowCx = (i) => rowStart + ICON / 2 + i * (ICON + slotGap)
  const folderLeft = rowStart + BIG_N * (ICON + slotGap)
  const folderCx = folderLeft + ICON / 2
  const folderCy = ROW_TOP + ICON / 2
  // On scroll-collapse the gap tightens GAP → GAP_COLLAPSED: each slot slides
  // toward the row centre by its share (row stays centred overall).
  const pillShiftOf = (i) => ((ROW_N - 1) / 2 - i) * (GAP - GAP_COLLAPSED)

  // Stepped radii (whole px) — Squircle's cornerRadius is a render prop, so it
  // chases stepped state, exactly like V4. Step the RADIUS itself (~12 distinct
  // values per collapse) rather than the pill height (~40): every step re-renders
  // all tiles and rebuilds their clip-paths, so fewer steps = smooth scrolling.
  // Everything that can ride a motion value (heights, opacity) does.
  const fullRadius = Math.round(ICON * 0.28)
  const [tileRadius, setTileRadius] = useState(fullRadius)
  const [stackLive, setStackLive] = useState(false)
  useMotionValueEvent(eff, 'change', (v) => {
    const r = Math.round(lerp(ICON, COLLAPSE_H, clamp01(v)) * 0.28)
    setTileRadius((p) => (p === r ? p : r))
    const live = v > 0.9 && !expanded
    setStackLive((p) => (p === live ? p : live))
  })
  useEffect(() => {
    setTileRadius(Math.round(lerp(ICON, COLLAPSE_H, clamp01(eff.get())) * 0.28))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ICON])
  const [gateStep, setGateStep] = useState(1)
  useMotionValueEvent(gate, 'change', (g) => {
    const q = Math.round(clamp01(g) * 10) / 10
    setGateStep((p) => (p === q ? p : q))
  })
  const panelRadius = Math.round(lerp(26, tileRadius, gateStep))

  // heights ride motion values — no re-renders during the morph
  const pillHMV = useTransform(eff, (v) => lerp(ICON, COLLAPSE_H, clamp01(v)))
  // the folder stack overlay follows the folder's gap-tightening slide
  const stackLeftMV = useTransform(eff, (v) => folderLeft + pillShiftOf(BIG_N) * clamp01(v))
  // header row height follows the pill morph (like V4's rail)
  const switcherH = useTransform(eff, (v) => ROW_TOP + lerp(ICON, COLLAPSE_H, clamp01(v)) + 8)
  // the folder's 3-marketplace stack fades in late in the collapse
  const stackOpacity = useTransform(eff, [0.55, 1], [0, 1])

  // 2×2 preview cells inside the folder.
  const MP = Math.round(ICON * 0.1) // padding inside the folder (scales with tile)
  const MG = ICON - 2 * MP - 2 * MINI // gap between the two mini columns
  const miniCenter = (slot) => ({
    x: folderLeft + MP + MINI / 2 + (slot % 2) * (MINI + MG),
    y: ROW_TOP + MP + MINI / 2 + Math.floor(slot / 2) * (MINI + MG),
  })

  // Expanded panel + its grid cells (natural fill: position i → cell i, so
  // tiles pack from the top-left and the empty slot is bottom-right). Grid tiles
  // keep the full row size; the column gap is derived so the columns fill the
  // panel evenly. Rows use a larger fixed gap for vertical breathing room.
  const panelW = W - 2 * PANEL_MARGIN
  const panelLeft = PANEL_MARGIN
  const cellGap = (panelW - 2 * PADP - COLS * ICON) / (COLS - 1)
  const rowGap = 24
  const rows = Math.ceil(items.length / COLS)
  // PADP on top, 24px breathing room below the last row
  const panelH = rows * ICON + (rows - 1) * rowGap + PADP + 24

  // The panel's box rides the SAME motion values as the tiles (no `animate`
  // target to chase), so the collapsed pill's height — and with it the stepped
  // radius — tracks the row pills exactly at every scroll position and at
  // settle. The gate blends the pill out to the full grid panel on open.
  const panelBoxH = useTransform([sp, gate], ([v, g]) => {
    const pill = lerp(ICON, COLLAPSE_H, clamp01(v) * clamp01(g))
    return lerp(panelH, pill, clamp01(g))
  })
  const panelBoxW = useTransform(gate, (g) => lerp(panelW, ICON, clamp01(g)))
  const panelBoxLeft = useTransform([sp, gate], ([v, g]) => {
    const cg = clamp01(g)
    // the folder slides with the tightening row gap while collapsed
    const pillLeft = folderLeft + pillShiftOf(BIG_N) * clamp01(v) * cg
    return lerp(panelLeft, pillLeft, cg)
  })
  const cellCenter = (i) => ({
    x: panelLeft + PADP + ICON / 2 + (i % COLS) * (ICON + cellGap),
    y: ROW_TOP + PADP + ICON / 2 + Math.floor(i / COLS) * (ICON + rowGap),
  })

  // Collapsed pose per position: row tiles in the row, preview icons in their
  // mini slot, everyone else mini-sized & invisible in the folder centre.
  const collapsedCenter = (i) => {
    if (i < BIG_N) return { x: rowCx(i), y: folderCy }
    if (isPreview(i)) return miniCenter(PREVIEW_SLOT[i])
    return { x: folderCx, y: folderCy }
  }
  const collapsedScale = (i) => (i < BIG_N ? 1 : MINI_SCALE)
  const collapsedOpacity = (i) => (i < BIG_N || isPreview(i) ? 1 : 0)

  // Collapsed folder pill: a 3-chip carousel cycling through ALL marketplaces
  // not visible in the row (everything past the BIG_N row slots, tracked via
  // slotOrder so swaps stay excluded). Advances only while the pill is settled.
  const hiddenItems = useMemo(
    () => slotOrder.slice(BIG_N).map((id) => byId.get(id)),
    [slotOrder, byId],
  )
  const [stackStart, setStackStart] = useState(0)
  useEffect(() => {
    if (!stackLive) return undefined
    const t = setInterval(() => setStackStart((s) => s + 1), 1600)
    return () => clearInterval(t)
  }, [stackLive])
  const stackItems = [0, 1, 2].map((o) => hiddenItems[(stackStart + o) % hiddenItems.length])

  // The offset-path each icon travels, and its straight-line length (used to
  // order the stagger: nearest-travel first). Paths depend only on the width-
  // derived geometry, so memoise them — a fresh string every radius-step
  // re-render would needlessly churn each tile's offsetPath.
  const travelOf = (i) => Math.hypot(cellCenter(i).x - collapsedCenter(i).x, cellCenter(i).y - collapsedCenter(i).y)
  const paths = useMemo(
    () => Array.from({ length: items.length }, (_, i) => curvedPath(collapsedCenter(i), cellCenter(i))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [W, items.length],
  )
  const drawOrder = useMemo(
    () => slotOrder.map((id, i) => ({ id, i })).sort((a, b) => travelOf(a.i) - travelOf(b.i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slotOrder, W],
  )

  // ---- interactions ------------------------------------------------------
  const open = () => {
    setPressed(true)
    setTimeout(() => {
      setPressed(false)
      setExpanded(true)
    }, 45)
  }
  const close = () => setExpanded(false)

  // Pick a marketplace from the grid. Row tiles (incl. the swap slot) just
  // select in place; a marketplace from outside the row swaps into SWAP_SLOT.
  const select = (slot) => {
    onChange(slotOrder[slot])
    if (slot >= BIG_N) {
      setSlotOrder((prev) => {
        const next = [...prev]
        ;[next[SWAP_SLOT], next[slot]] = [next[slot], next[SWAP_SLOT]]
        return next
      })
    }
    setTimeout(close, 420) // let the swap flip play, then close
  }

  // Tap routing: collapsed → folder opens / row tile selects; expanded → select.
  const handleTap = (i, id) => (e) => {
    e.stopPropagation()
    if (!expanded) return i >= BIG_N ? open() : onChange(id)
    select(i)
  }

  return (
    <motion.div ref={ref} data-id="mp-switcher" className="relative w-full" style={{ height: switcherH }}>
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="backdrop"
            data-id="mp-grid-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: easings.ios }}
            onClick={close}
            className="fixed inset-0 z-20 bg-black/80"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: `${folderCx}px ${folderCy}px`, zIndex: 25 }}
        animate={{ scale: pressed ? 0.97 : 1 }}
        transition={springs.press}
      >
        {/* folder surface → full panel (squircle-clipped); when collapsed it
            chases the stepped pill height so the folder shrinks with the row.
            Gradient fill + inset-shadow hairline (no borderWidth mode — see the
            tile note; this box also resizes every frame). */}
        <Squircle
          as={motion.div}
          data-id="mp-grid-panel"
          cornerRadius={panelRadius}
          cornerSmoothing={1}
          onClick={() => !expanded && open()}
          style={{
            position: 'absolute',
            left: panelBoxLeft,
            top: ROW_TOP,
            width: panelBoxW,
            height: panelBoxH,
            background: PANEL_BG.background,
            boxShadow: 'inset 0 0 0 1px #E5E7EB',
            filter: expanded ? 'drop-shadow(0 16px 40px rgba(16,24,40,0.22))' : 'none',
          }}
          className={expanded ? 'backdrop-blur-xl' : ''}
        ></Squircle>

        {/* icons cascade out of / back into the folder (children are ordered
            nearest-travel-first so the stagger matches the geometry).
            pointer-events-none: the overlay spans the whole switcher, and
            without it taps in the gaps between icons never reach the folder
            surface below — the "click sometimes doesn't work" bug. */}
        <motion.div
          data-id="mp-icons"
          className="pointer-events-none absolute inset-0"
          variants={ICONS_CONTAINER}
          initial={false}
          animate={expanded ? 'open' : 'closed'}
        >
          {drawOrder.map(({ id, i }) => {
            const m = byId.get(id)
            const pillable = i < BIG_N
            return (
              <FolderIcon
                key={i}
                m={m}
                size={ICON}
                collapseH={COLLAPSE_H}
                pillable={pillable}
                fadeOnScroll={isPreview(i)}
                eff={eff}
                active={m.id === activeId}
                offsetPath={paths[i]}
                collapsedScale={collapsedScale(i)}
                collapsedOpacity={collapsedOpacity(i)}
                // radius tracks the pill height so the squircle keeps its
                // shape as the tile shrinks on scroll
                radius={pillable ? tileRadius : fullRadius}
                bordered={!expanded}
                pillShiftX={pillable ? pillShiftOf(i) : 0}
                interactive={expanded || collapsedOpacity(i) > 0}
                onClick={handleTap(i, id)}
              />
            )
          })}
        </motion.div>

        {/* collapsed folder pill — a 3-marketplace stack that fades in as the
            2×2 preview fades out (both scrubbed by the same scroll spring) */}
        <motion.div
          data-id="mp-folder-stack"
          className="pointer-events-none absolute flex items-center justify-center"
          style={{ left: stackLeftMV, top: ROW_TOP, width: ICON, height: pillHMV, opacity: stackOpacity, zIndex: 31 }}
        >
          {/* white bordered pill — fades in with the stack, covering the
              folder's gradient so the collapsed pill matches the tiles */}
          <Squircle
            as="span"
            cornerRadius={tileRadius}
            cornerSmoothing={1}
            className="block"
            style={{ position: 'absolute', inset: 0, background: '#FFFFFF', boxShadow: 'inset 0 0 0 1px #E5E7EB' }}
          />
          <AnimatePresence mode="popLayout" initial={false}>
          {stackItems.map((m, idx) => {
            const CHIP = 24
            return (
              <motion.span
                key={m.id}
                layout
                initial={{ opacity: 0, x: 14, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -14, scale: 0.5 }}
                transition={springs.snappy}
                className="relative block"
                style={{ width: CHIP, height: CHIP, marginLeft: idx === 0 ? 0 : -7, zIndex: stackItems.length - idx }}
              >
                {/* miniature of the real tile — transform-scaled so the squircle
                    ratio, border and mark match the full marketplace tiles */}
                <span
                  className="absolute left-0 top-0 block"
                  style={{
                    width: ICON,
                    height: ICON,
                    transform: `scale(${CHIP / ICON})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <Squircle
                    as="span"
                    cornerRadius={fullRadius}
                    cornerSmoothing={1}
                    className="flex items-center justify-center overflow-hidden"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      // solid light tint of the marketplace colour (mixed into
                      // white, no opacity) + a white border so the overlapping
                      // stack chips read as separate cards
                      background: m.accent ? `color-mix(in srgb, ${m.accent} 14%, #FFFFFF)` : '#F4F6FA',
                      boxShadow: 'inset 0 0 0 3px #FFFFFF',
                    }}
                  >
                    <MarketplaceMark m={m} size={ICON} />
                  </Squircle>
                </span>
              </motion.span>
            )
          })}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
