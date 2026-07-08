// Collapsed trigger row shared by the flyout switcher variants (dial, V6):
// the first 3 marketplaces as quick tiles + a "grid" tile whose 2×2 mini-logo
// preview opens the full flyout.
import MarketplaceMark from './MarketplaceMark'

const PREVIEW_IDS = ['pay', 'minutes', 'home', 'send'] // 2×2 preview (TL,TR,BL,BR)

export default function TriggerRow({ items, activeId, onChange, onOpen, rootRef }) {
  const preview = PREVIEW_IDS.map((id) => items.find((m) => m.id === id)).filter(Boolean)

  return (
    <div
      ref={rootRef}
      data-id="mp-switcher"
      className="flex items-center justify-center gap-2 px-5 py-2"
    >
      {items.slice(0, 3).map((m) => {
        const active = m.id === activeId
        return (
          <button
            key={m.id}
            type="button"
            data-id={`mp-tile-${m.id}`}
            aria-pressed={active}
            onClick={() => onChange(m.id)}
            style={{ width: 76, height: 76, borderRadius: 20, background: active ? m.accent : m.bg ?? '#FFFFFF' }}
            className="flex shrink-0 items-center justify-center border border-[#EFEFEF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform active:scale-95"
          >
            <MarketplaceMark m={m} white={active && !m.lightAccent} active={active} size={68} />
          </button>
        )
      })}
      <button
        type="button"
        data-id="mp-dial-open"
        aria-label="Open all marketplaces"
        onClick={onOpen}
        style={{ width: 76, height: 76, borderRadius: 20 }}
        className="grid shrink-0 grid-cols-2 gap-1.5 border border-[#EFEFEF] bg-[#F4F5F7] p-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-transform active:scale-95"
      >
        {preview.map((m) => (
          <span key={m.id} className="flex items-center justify-center rounded-[10px] bg-white">
            <MarketplaceMark m={m} size={24} />
          </span>
        ))}
      </button>
    </div>
  )
}
