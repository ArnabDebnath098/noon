import { motion } from 'framer-motion'

// FloatingTabs — a floating rounded segmented control (pill) that sits above the
// action bar. The active segment is a sliding highlight animated with Framer
// Motion (shared layoutId). Used on Home to switch the combo card style.
export default function FloatingTabs({ tabs, value, onChange, dataId }) {
  return (
    <div
      data-id={dataId}
      className="pointer-events-none fixed inset-x-0 z-20 flex justify-center px-3"
      style={{
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)',
      }}
    >
      <div className="pointer-events-auto flex gap-0.5 rounded-full border border-[#EAECF0] bg-white p-1 shadow-[0px_6px_20px_rgba(0,0,0,0.12)]">
        {tabs.map((t) => {
          const active = t.value === value
          return (
            <button
              key={t.value}
              type="button"
              data-id={`${dataId}-${t.value}`}
              onClick={() => onChange(t.value)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full"
            >
              {active && (
                <motion.span
                  layoutId="floating-tab-indicator"
                  className="absolute inset-0 rounded-full bg-[#0F61FF]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span
                className={`relative z-10 font-noontree text-[12px] font-semibold transition-colors ${
                  active ? 'text-white' : 'text-[#404553]'
                }`}
              >
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
