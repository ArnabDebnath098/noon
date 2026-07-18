import { useEffect, useState } from 'react'
import { Squircle } from 'corner-smoothing'

// iPhone 13 logical size (pt) + its screen corner radius.
const PHONE_W = 390
const PHONE_H = 844
const PHONE_RADIUS = 48
const SAFE_TOP = 47 // status-bar inset
const SAFE_BOTTOM = 34 // home-indicator inset

// Show the framed device only when there's room for it (desktop / large web).
const DEVICE_QUERY = '(min-width: 768px) and (min-height: 720px)'

const INK = 'rgba(2, 6, 12, 0.92)'

/* Faux iOS status bar — 9:41 + signal / wifi / battery. Drawn as device chrome
   on the web frame so the reserved top safe-area reads as a real phone. */
function StatusBar() {
  return (
    <div
      data-id="device-statusbar"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex items-end justify-between px-[27px] pb-2"
      style={{ height: SAFE_TOP }}
    >
      <span className="font-noontree text-[15px] font-semibold leading-none" style={{ color: INK, letterSpacing: '-0.3px' }}>
        9:41
      </span>
      <div className="flex items-center gap-[6px]">
        <svg width="17" height="11" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="1" fill="#02060C" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#02060C" />
          <rect x="10" y="3" width="3" height="9" rx="1" fill="#02060C" />
          <rect x="15" y="0.5" width="3" height="11.5" rx="1" fill="#02060C" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 17 12" fill="none">
          <path d="M8.5 2C11.4 2 14 3.1 15.9 5l-1.5 1.5C12.9 5 10.8 4.1 8.5 4.1S4.1 5 2.6 6.5L1.1 5C3 3.1 5.6 2 8.5 2Z" fill="#02060C" />
          <path d="M8.5 5.7c1.7 0 3.3.6 4.5 1.7l-1.6 1.6a4 4 0 0 0-5.8 0L4 7.4a6.5 6.5 0 0 1 4.5-1.7Z" fill="#02060C" />
          <path d="M8.5 9.3c.7 0 1.4.3 1.9.8l-1.9 1.9-1.9-1.9c.5-.5 1.2-.8 1.9-.8Z" fill="#02060C" />
        </svg>
        <div className="relative flex h-[12px] w-[24px] items-center">
          <div className="absolute inset-0 rounded-[3px] border" style={{ borderColor: '#02060C', opacity: 0.35 }} />
          <div className="absolute right-[-2.5px] top-1/2 h-[4px] w-[1.3px] -translate-y-1/2 rounded-r" style={{ background: '#02060C', opacity: 0.4 }} />
          <div className="absolute left-[2px] top-1/2 h-[8px] w-[18px] -translate-y-1/2 rounded-[1.5px]" style={{ background: '#02060C' }} />
        </div>
      </div>
    </div>
  )
}

/* Home indicator pill, centred in the bottom safe-area. */
function HomeIndicator() {
  return (
    <div
      data-id="device-home-indicator"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[60] flex items-end justify-center"
      style={{ height: SAFE_BOTTOM }}
    >
      <span className="mb-[8px] h-[5px] w-[134px] rounded-full bg-[#02060C]/85" />
    </div>
  )
}

function useFramed() {
  const [framed, setFramed] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DEVICE_QUERY).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(DEVICE_QUERY)
    const on = () => setFramed(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return framed
}

/**
 * AppShell — the phone-width frame every page/experiment composes into.
 *
 * On a phone it's edge-to-edge full screen. On the web it renders inside an
 * iPhone-13-sized squircle with a drop shadow. The frame carries a `transform`
 * so it becomes the containing block for its `position: fixed` descendants
 * (bottom nav, header, floating tabs, sheet backdrops) — they pin to the FRAME
 * instead of the browser viewport — and its squircle clip-path trims content to
 * the rounded screen just like a real device.
 */
export default function AppShell({ children, className = '' }) {
  const framed = useFramed()

  if (framed) {
    return (
      <div
        data-id="app-shell"
        className="flex min-h-[100dvh] w-full items-center justify-center bg-[#E7E9EE] p-6"
      >
        {/* wrapper carries the shadow as a drop-shadow filter so it follows the
            squircle silhouette (a box-shadow would be clipped by the clip-path) */}
        <div style={{ filter: 'drop-shadow(0 24px 60px rgba(16,24,40,0.30))' }}>
          <Squircle
            as="div"
            data-id="app-frame"
            cornerRadius={PHONE_RADIUS}
            cornerSmoothing={1}
            className={`relative flex flex-col overflow-hidden bg-white ${className}`}
            style={{
              width: PHONE_W,
              height: PHONE_H,
              maxHeight: 'calc(100dvh - 48px)',
              transform: 'translateZ(0)', // containing block for fixed children
              // faux safe-area insets so the app reserves room for the frame's
              // status bar / home indicator (env() is 0 on desktop — its
              // fallback never fires there, so we drive the insets ourselves)
              '--sat': `${SAFE_TOP}px`,
              '--sab': `${SAFE_BOTTOM}px`,
            }}
          >
            {children}
            <StatusBar />
            <HomeIndicator />
          </Squircle>
        </div>
      </div>
    )
  }

  return (
    <div
      data-id="app-shell"
      className="flex min-h-[100dvh] w-full justify-center bg-noon-dark/5"
    >
      <div
        data-id="app-frame"
        className={`relative flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-white ${className}`}
        style={{
          // on real devices --sat/--sab resolve to the actual safe-area insets
          '--sat': 'env(safe-area-inset-top, 0px)',
          '--sab': 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
