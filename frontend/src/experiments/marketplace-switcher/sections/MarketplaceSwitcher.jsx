// Section 1 — marketplace switcher. Tiles are 76×76 logo tiles that collapse to
// a 76×36 pill row as the content scrolls up.
//
// The collapse is scroll-linked: each tile's height/radius AND its logo scale
// are driven by a `progress` motion value (0 = expanded → 1 = collapsed),
// lightly spring-smoothed. The logo continuously scales down with the tile
// rather than swapping to a different rendering.
import { motion, useTransform, useSpring } from 'framer-motion'
import { springs, scrollSmoothing } from '../../../utils/motion'

function TileArt({ m }) {
  if (m.logoStack) {
    const useH = m.stackItemH != null
    const sz = useH ? m.stackItemH : (m.stackItemW ?? 44)
    return (
      <span className={`flex flex-col justify-center gap-0.5 ${m.align === 'left' ? 'items-start' : 'items-center'}`}>
        {m.logoStack.map((src, i) => (
          <img key={i} src={src} alt="" className={useH ? 'w-auto' : 'h-auto'} style={useH ? { height: sz } : { width: sz }} />
        ))}
      </span>
    )
  }
  if (m.logo) {
    return m.logoH ? (
      <img src={m.logo} alt={m.id} className="w-auto" style={{ height: m.logoH }} />
    ) : (
      <img src={m.logo} alt={m.id} className="h-auto" style={{ width: m.logoW ?? 56 }} />
    )
  }
  if (m.sub) {
    return (
      <span className="flex flex-col items-center leading-none">
        <span className="font-noontree text-[24px] font-black" style={{ color: m.fg }}>{m.label}</span>
        <span className="mt-0.5 font-noontree text-[8px] font-bold tracking-[1px]" style={{ color: m.fg }}>{m.sub}</span>
      </span>
    )
  }
  return (
    <span className="whitespace-pre-line text-center font-noontree text-[15px] font-black lowercase leading-[15px]" style={{ color: m.fg }}>
      {m.label}
    </span>
  )
}

function Tile({ m, activeId, onChange, sp }) {
  const height = useTransform(sp, [0, 1], [76, 36])
  const radius = useTransform(sp, [0, 1], [20, 10])
  // text/logo tiles: shrink in proportion with the tile (per-tile override)
  const defScale = m.logo || m.logoStack ? 0.5 : 0.85
  const scale = useTransform(sp, [0, 1], [1, m.collapseScale ?? defScale])
  // fadeStack tiles (food, send, minutes): the top mark fades + collapses away
  const topH = useTransform(sp, [0, 1], [m.fadeH ?? 0, 0])
  const topOpacity = useTransform(sp, [0, 0.55], [1, 0])
  // rowMorph tile (supermall): expanded = super over mall (left-aligned);
  // collapsed = super left, mall right. "mall" slides from below to the right
  // (a position morph — no crossfade, so no double-image). super gets a small
  // baseline nudge in the collapsed one-line form.
  const rmItemH = useTransform(sp, [0, 1], [13, 10])
  const rmSuperNudge = useTransform(sp, [0, 1], [0, 2.6])
  const rmMallX = useTransform(sp, [0, 1], [0, 31.8])
  const rmMallY = useTransform(sp, [0, 1], [16, 0])
  const rmWrapW = useTransform(sp, [0, 1], [41, 55])
  const rmWrapH = useTransform(sp, [0, 1], [29, 10])

  const active = m.id === activeId
  // when active, a marketplace may swap to a pre-coloured logo set (e.g. yellow)
  // instead of the default white-invert
  const rowLogos = active && m.activeLogoStack ? m.activeLogoStack : m.logoStack

  let content
  if (m.rowMorph) {
    content = (
      <motion.span style={{ width: rmWrapW, height: rmWrapH }} className="relative block">
        <motion.img
          src={rowLogos[0]}
          alt=""
          style={{ height: rmItemH, y: rmSuperNudge }}
          className="absolute left-0 top-0 w-auto"
        />
        <motion.img
          src={rowLogos[1]}
          alt=""
          style={{ height: rmItemH, x: rmMallX, y: rmMallY }}
          className="absolute left-0 top-0 w-auto"
        />
      </motion.span>
    )
  } else if (m.fadeStack) {
    const fade = active && m.activeFadeStack ? m.activeFadeStack : m.fadeStack
    content = (
      <span className="flex flex-col items-center gap-0.5">
        <motion.span
          style={{ height: topH, opacity: topOpacity }}
          className="flex items-end overflow-hidden"
        >
          <img src={fade[0]} alt="" className="h-auto" style={{ width: m.fadeW }} />
        </motion.span>
        <img src={fade[1]} alt={m.id} className="h-auto" style={{ width: m.keepW }} />
      </span>
    )
  } else {
    content = (
      <motion.span style={{ scale }} className="flex items-center justify-center">
        <TileArt m={m} />
      </motion.span>
    )
  }

  return (
    <motion.button
      type="button"
      data-id={`mp-tile-${m.id}`}
      aria-pressed={active}
      onClick={() => onChange(m.id)}
      whileTap={{ scale: 0.96 }}
      transition={springs.press}
      style={{ height, borderRadius: radius, width: 76, background: active ? m.accent : m.bg ?? '#FFFFFF' }}
      className="relative flex shrink-0 items-center justify-center overflow-hidden px-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
    >
      {/* selected → content turns white via invert filter (kept dark on light
          accents like noon's yellow, or when a pre-coloured activeLogoStack is used) */}
      <span style={{ filter: active && !m.lightAccent && !m.activeLogoStack && !m.activeFadeStack ? 'brightness(0) invert(1)' : undefined }} className="flex items-center justify-center">
        {content}
      </span>
    </motion.button>
  )
}

export default function MarketplaceSwitcher({ items, activeId, onChange, progress }) {
  // one shared smoothing spring; every tile derives its morph from it
  const sp = useSpring(progress, scrollSmoothing)
  return (
    <div data-id="mp-switcher" className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-4 py-2">
      {items.map((m) => (
        <Tile key={m.id} m={m} activeId={activeId} onChange={onChange} sp={sp} />
      ))}
    </div>
  )
}
