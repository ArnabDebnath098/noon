import nanoTop from '../../assets/nano/switcher/nano-top.svg'
import nanoBottom from '../../assets/nano/switcher/nano-bottom.svg'
import noonMask from '../../assets/nano/switcher/noon-mask.svg'
import noonWord from '../../assets/nano/switcher/noon-word.svg'
import supermall1 from '../../assets/nano/switcher/supermall-1.svg'
import supermall2 from '../../assets/nano/switcher/supermall-2.svg'
import foodLogo from '../../assets/nano/switcher/food.svg'
import minsLogo from '../../assets/nano/switcher/mins.png'

/**
 * NanoAppSwitcher — Figma Kids-Side "App switcher" (345:3641), mapped 1:1.
 *
 * 375 wide, 12px side / 8px vertical padding, 6px gaps: the selected nano tile
 * (76 × 76, #7924FF, r15) then noon, supermall, noon FOOD and Minutes (73 × 76,
 * white r15 — 95% for all but noon). Every mark sits at its Figma frame (the
 * export's inset percentages, resolved to px). The tiles run past 375 (416px),
 * so the row scrolls sideways, as on the device; tiles press in on tap.
 */

const TILE_H = 76

/** a mark placed at its Figma frame inside the tile (px) */
const Mark = ({ src, x, y, w, h, cover = false }) => (
  <img
    src={src}
    alt=""
    draggable={false}
    width={w}
    height={h}
    className={`pointer-events-none absolute block max-w-none ${cover ? 'object-cover' : ''}`}
    style={{ left: x, top: y, width: w, height: h }}
  />
)

const TILES = [
  {
    id: 'nano',
    label: 'noon nano',
    w: 76,
    bg: '#7924FF',
    // insets 27.88% 25.79% 59.47% 25.96% · 43.59% 9.53% 27.69% 9.7% of 76 × 76
    marks: [
      { src: nanoTop, x: 19.73, y: 21.19, w: 36.6676, h: 9.61727 },
      { src: nanoBottom, x: 7.37, y: 33.13, w: 61.3877, h: 21.8264 },
    ],
  },
  {
    id: 'noon',
    label: 'noon',
    w: 73,
    bg: '#FFFFFF',
    // mask group 39.5 × 29.5 at (19, 17); wordmark insets 40.79% 16.26% 42.09% 15.07%
    marks: [
      { src: noonMask, x: 19, y: 17, w: 39.5, h: 29.5 },
      { src: noonWord, x: 11, y: 31, w: 50.1334, h: 13.0105 },
    ],
  },
  {
    id: 'supermall',
    label: 'supermall',
    w: 73,
    bg: '#FFFFFF',
    bgOpacity: 0.95,
    // "super" at (12.44, 22), "mall" 15.93px below it
    marks: [
      { src: supermall1, x: 12.44, y: 22, w: 49.1151, h: 15.5801 },
      { src: supermall2, x: 12.44, y: 37.93, w: 34.8057, h: 15.559 },
    ],
  },
  {
    id: 'food',
    label: 'noon FOOD',
    w: 73,
    bg: '#FFFFFF',
    bgOpacity: 0.95,
    marks: [{ src: foodLogo, x: 10.68, y: 23.28, w: 51.3154, h: 28.9684 }],
  },
  {
    id: 'minutes',
    label: 'Minutes',
    w: 73,
    bg: '#FFFFFF',
    bgOpacity: 0.95,
    marks: [{ src: minsLogo, x: 8, y: 10, w: 57, h: 57, cover: true }],
  },
]

export default function NanoAppSwitcher({ activeId = 'nano', onSelect }) {
  return (
    <div
      data-id="nano-app-switcher"
      data-node-id="345:3641"
      role="tablist"
      aria-label="noon apps"
      className="scrollbar-hide flex w-[375px] items-center gap-[6px] overflow-x-auto px-3 py-2"
    >
      {TILES.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === activeId}
          aria-label={t.label}
          data-id={`nano-app-${t.id}`}
          onClick={() => onSelect?.(t.id)}
          className="relative shrink-0 overflow-clip rounded-[15px] outline-none transition-transform duration-150 ease-out [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-[#7924FF] active:scale-[0.96]"
          style={{ width: t.w, height: TILE_H }}
        >
          <span aria-hidden className="absolute inset-0 rounded-[15px]" style={{ background: t.bg, opacity: t.bgOpacity ?? 1 }} />
          {t.marks.map((m) => (
            <Mark key={m.src} {...m} />
          ))}
        </button>
      ))}
    </div>
  )
}
