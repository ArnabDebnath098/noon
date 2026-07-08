// Marketplace switcher — VARIATION 3 (row + folder → App-Library expansion).
//
// Collapsed: a row of 3 marketplace tiles followed by a "folder" tile showing a
// 2×2 preview of more marketplaces. Tapping the folder runs an Apple
// App-Library-style open:
//   • press feedback (compress ~0.97) then the folder surface morphs into a
//     full panel (spring physics)
//   • OBJECT CONTINUITY: the 3 row tiles and the 4 preview icons are the same
//     elements that travel to their slots in the full grid (no crossfade)
//   • every other marketplace is tucked (invisible, mini) inside the folder and
//     flies out from its centre; on close everything pours back in
//   • icons glide along curved offset-paths, staggered, and the close is the
//     open played in reverse (staggerDirection: -1)
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useElementWidth from '../../../hooks/useElementWidth'
import { springs, easings, curvedPath, staggerContainer, pathFlightVariants } from '../../../utils/motion'
import MarketplaceMark from './MarketplaceMark'

// ---- layout constants ----
const ICON = 76 // tile size (px), and the reference size for marks
const GAP = 8 // gap between collapsed row tiles
const ROW_TOP = 8
const RADIUS = 20 // collapsed folder corner radius

const BIG_N = 3 // marketplaces shown as row tiles
const SWAP_SLOT = 2 // the row slot a grid pick swaps into (the 3rd tile)

const MINI = 31 // preview icon size inside the folder
const MINI_SCALE = MINI / ICON

// expanded panel grid
const PADP = 14 // panel padding
const PANEL_MARGIN = 16 // panel inset from each screen edge
const COLS = 4

// Which folder positions appear in the 2×2 preview, and in which mini slot
// (0=TL, 1=TR, 2=BL, 3=BR). These four land in the cells nearest the folder, and
// each slot sits directly above its destination cell so the morph is short.
// Every other folder position stays hidden (tucked in the folder centre).
const PREVIEW_SLOT = { 3: 1, 5: 0, 6: 2, 7: 3 }
const isPreview = (i) => PREVIEW_SLOT[i] !== undefined

// ---- animation config (see utils/motion) ----
const ICONS_CONTAINER = staggerContainer({ stagger: 0.022, delayChildren: 0.03 })
// slightly longer flight than the default snappy — the icons travel further
// now that the panel spans the full width
const ICON_VARIANTS = pathFlightVariants(
  { type: 'spring', duration: 0.5, bounce: 0.18 },
  { duration: 0.18 },
)
const PANEL_SHADOW = 'shadow-[0_18px_50px_rgba(16,24,40,0.22)] backdrop-blur-xl'
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
 */
function FolderIcon({ m, active, offsetPath, collapsedScale, collapsedOpacity, radius, interactive, onClick }) {
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
        width: ICON,
        height: ICON,
        zIndex: 30,
        perspective: 700,
        offsetPath,
        offsetRotate: '0deg',
        offsetAnchor: '50% 50%',
        // invisible icons (tucked in the folder) must not swallow taps meant
        // for the content sitting under them.
        pointerEvents: interactive ? 'auto' : 'none',
      }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={m.id}
          initial={{ rotateY: -110, opacity: 0, borderRadius: radius }}
          animate={{ rotateY: 0, opacity: 1, borderRadius: radius }}
          exit={{ rotateY: 110, opacity: 0 }}
          transition={FLIP_TRANSITION}
          style={{
            position: 'absolute',
            inset: 0,
            background: active ? m.accent : m.bg ?? '#FFFFFF',
            border: '1px solid #E5E7EB',
            backfaceVisibility: 'hidden',
          }}
          className="flex items-center justify-center"
        >
          <MarketplaceMark m={m} white={active && !m.lightAccent} active={active} size={ICON} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default function MarketplaceSwitcherV3({ items, activeId, onChange }) {
  const [ref, W] = useElementWidth(375)
  const [expanded, setExpanded] = useState(false)
  const [pressed, setPressed] = useState(false)
  // which marketplace currently sits in each slot (mutated by swaps)
  const [slotOrder, setSlotOrder] = useState(() => items.map((m) => m.id))
  const byId = useMemo(() => new Map(items.map((m) => [m.id, m])), [items])

  // ---- geometry ----------------------------------------------------------
  // Collapsed row: BIG_N tiles + the folder, centred.
  const ROW_N = BIG_N + 1
  const rowLeft = (W - (ROW_N * ICON + (ROW_N - 1) * GAP)) / 2
  const rowCx = (i) => rowLeft + ICON / 2 + i * (ICON + GAP)
  const folderLeft = rowLeft + BIG_N * (ICON + GAP)
  const folderCx = folderLeft + ICON / 2
  const folderCy = ROW_TOP + ICON / 2

  // 2×2 preview cells inside the folder.
  const MP = 5 // padding inside the folder
  const MG = ICON - 2 * MP - 2 * MINI // gap between the two mini columns
  const miniCenter = (slot) => ({
    x: folderLeft + MP + MINI / 2 + (slot % 2) * (MINI + MG),
    y: ROW_TOP + MP + MINI / 2 + Math.floor(slot / 2) * (MINI + MG),
  })

  // Expanded panel + its grid cells (left-aligned natural fill: position i →
  // cell i, so tiles pack from the top-left and the empty slot is bottom-right).
  // The panel spans the full width minus PANEL_MARGIN per side; the grid gap is
  // derived from the leftover space so the columns spread evenly, and the same
  // gap is used vertically so the grid reads uniform.
  const panelW = W - 2 * PANEL_MARGIN
  const panelLeft = PANEL_MARGIN
  const cellGap = (panelW - 2 * PADP - COLS * ICON) / (COLS - 1)
  const rows = Math.ceil(items.length / COLS)
  const panelH = rows * ICON + (rows - 1) * cellGap + 2 * PADP
  const cellCenter = (i) => ({
    x: panelLeft + PADP + ICON / 2 + (i % COLS) * (ICON + cellGap),
    y: ROW_TOP + PADP + ICON / 2 + Math.floor(i / COLS) * (ICON + cellGap),
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

  // The offset-path each icon travels, and its straight-line length (used to
  // order the stagger: nearest-travel first).
  const pathOf = (i) => curvedPath(collapsedCenter(i), cellCenter(i))
  const travelOf = (i) => Math.hypot(cellCenter(i).x - collapsedCenter(i).x, cellCenter(i).y - collapsedCenter(i).y)
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
    <div ref={ref} data-id="mp-switcher" className="relative w-full" style={{ height: ROW_TOP + ICON + 8 }}>
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
            className="fixed inset-0 z-20 bg-black/25"
          />
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: `${folderCx}px ${folderCy}px`, zIndex: 25 }}
        animate={{ scale: pressed ? 0.97 : 1 }}
        transition={springs.press}
      >
        {/* folder surface → full panel */}
        <motion.div
          data-id="mp-grid-panel"
          onClick={() => !expanded && open()}
          initial={false}
          animate={
            expanded
              ? { left: panelLeft, top: ROW_TOP, width: panelW, height: panelH, borderRadius: 26, backgroundColor: '#FFFFFF' }
              : { left: folderLeft, top: ROW_TOP, width: ICON, height: ICON, borderRadius: RADIUS, backgroundColor: '#E8F2FB' }
          }
          transition={springs.panel}
          style={{ position: 'absolute' }}
          className={expanded ? PANEL_SHADOW : ''}
        />

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
            return (
              <FolderIcon
                key={i}
                m={m}
                active={m.id === activeId}
                offsetPath={pathOf(i)}
                collapsedScale={collapsedScale(i)}
                collapsedOpacity={collapsedOpacity(i)}
                radius={i < BIG_N || expanded ? ICON * 0.28 : ICON / 2}
                interactive={expanded || collapsedOpacity(i) > 0}
                onClick={handleTap(i, id)}
              />
            )
          })}
        </motion.div>
      </motion.div>
    </div>
  )
}
