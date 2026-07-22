import { useEffect, useState } from 'react'
import { Squircle } from 'corner-smoothing'

// iPhone 13 logical size (pt) + its screen corner radius.
const PHONE_W = 390
const PHONE_H = 844
const PHONE_RADIUS = 48
const SAFE_TOP = 47 // status-bar inset
const SAFE_BOTTOM = 34 // home-indicator inset

// Show the framed device only on a real desktop — enough room AND a fine
// pointer with hover (a mouse). Touch devices (phones, tablets) stay full-bleed
// so they never get the faux status-bar / home-indicator safe area.
const DEVICE_QUERY =
  '(min-width: 768px) and (min-height: 720px) and (hover: hover) and (pointer: fine)'

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

// True when running as an installed home-screen app. Only then is the webview
// edge-to-edge (under the status bar / home indicator) with viewport-fit=cover,
// so only then do the env() safe-area insets belong to us — a browser tab's
// chrome already owns those regions (and iOS reports spurious bottom insets
// there, which is why the insets must stay 0 in tabs).
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

function useStandalone() {
  const [standalone, setStandalone] = useState(
    () => typeof window !== 'undefined' && isStandalone(),
  )
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    const on = () => setStandalone(isStandalone())
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return standalone
}

// The exact VISIBLE viewport height, straight from the browser. CSS units
// (100vh/100dvh) mismeasure on mobile — Safari sizes them to the toolbar-hidden
// viewport, so a bottom-pinned surface floats above the real bottom with a
// white gap under it. visualViewport.height is always the currently-visible
// area, so sizing the frame to it makes the bottom edge land exactly on-screen.
function useViewportHeight() {
  const read = () =>
    (typeof window !== 'undefined' && window.visualViewport?.height) ||
    (typeof window !== 'undefined' ? window.innerHeight : 0)
  const [h, setH] = useState(read)
  useEffect(() => {
    const vv = window.visualViewport
    const on = () => setH(read())
    on()
    vv?.addEventListener('resize', on)
    window.addEventListener('resize', on)
    window.addEventListener('orientationchange', on)
    return () => {
      vv?.removeEventListener('resize', on)
      window.removeEventListener('resize', on)
      window.removeEventListener('orientationchange', on)
    }
  }, [])
  return h
}

// The full PHYSICAL screen height. In an installed (standalone) iOS app the
// webview is truly full screen, but every relative height there computes short
// of it — 100dvh, fixed inset:0 AND visualViewport.height all land above the
// real bottom (visualViewport excludes the status-bar strip), leaving a band of
// the page background below the frame. screen.height is the one value that
// reports the true edge-to-edge height, so the standalone frame is sized to it
// as explicit px — forcing its bottom onto the physical screen bottom. Read as
// the larger of screen width/height so a landscape flip still gives the long
// edge (screen.height doesn't reliably swap on orientation change).
function useScreenHeight() {
  const read = () =>
    typeof window !== 'undefined' && window.screen
      ? Math.max(window.screen.height || 0, window.screen.width || 0)
      : 0
  const [h, setH] = useState(read)
  useEffect(() => {
    const on = () => setH(read())
    on()
    window.addEventListener('resize', on)
    window.addEventListener('orientationchange', on)
    return () => {
      window.removeEventListener('resize', on)
      window.removeEventListener('orientationchange', on)
    }
  }, [])
  return h
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
  const standalone = useStandalone()
  const vh = useViewportHeight()
  const screenH = useScreenHeight()

  // Native-like viewport lock (mobile only). The app is a fixed 100dvh frame
  // that scrolls internally, so the DOCUMENT must never pan — but iOS scrolls
  // it anyway when the keyboard opens over a focused input, and leaves it
  // scrolled after dismiss: bottom-pinned surfaces (nav, banners) then float
  // above a white band. Lock document overflow and snap any drift back to 0.
  useEffect(() => {
    if (framed) return undefined
    const html = document.documentElement
    const body = document.body
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      overscroll: html.style.overscrollBehavior,
    }
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    const snap = () => {
      if (window.scrollY || window.scrollX) window.scrollTo(0, 0)
    }
    window.addEventListener('scroll', snap, { passive: true })
    window.visualViewport?.addEventListener('resize', snap)
    return () => {
      html.style.overflow = prev.htmlOverflow
      body.style.overflow = prev.bodyOverflow
      html.style.overscrollBehavior = prev.overscroll
      window.removeEventListener('scroll', snap)
      window.visualViewport?.removeEventListener('resize', snap)
    }
  }, [framed])

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
              // faux safe-area insets — surfaces run edge-to-edge and blend
              // their own background into the inset (pink banner, white nav),
              // padding their CONTENT by --sat/--sab like native apps
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

  // Vertical fill strategy differs by context:
  // - Standalone (installed to home screen): edge-to-edge, no browser chrome,
  //   but every relative height (100dvh / fixed inset:0 / visualViewport.height)
  //   computes SHORT of the real screen and leaves a band of page background
  //   below the frame. screen.height is the only value that reports the true
  //   physical height, so pin top:0 and set that as an explicit px height —
  //   forcing the frame bottom onto the physical screen bottom.
  // - Browser tab: the toolbar occupies part of the screen and 100vh/100dvh
  //   overshoot it, so size to the measured VISIBLE height (visualViewport) and
  //   pin only the top; the bottom then lands on the visible-area bottom.
  const fill = standalone
    ? { top: 0, height: screenH ? `${screenH}px` : '100dvh' }
    : { top: 0, height: vh ? `${vh}px` : '100dvh' }

  return (
    <div
      data-id="app-frame"
      className={`fixed inset-x-0 mx-auto flex w-full max-w-md flex-col overflow-hidden bg-white ${className}`}
      style={{
        ...fill,
        // containing block for fixed children (bottom nav, banner) so they pin
        // to this frame, not the viewport
        transform: 'translateZ(0)',
        // Top safe area: real env() inset in a standalone (installed) app so the
        // header clears the iOS status-bar clock; 0 in a plain browser tab (its
        // chrome owns that region). Bottom safe area is intentionally OFF — the
        // frame fills to the physical screen bottom (see `fill` above) and
        // surfaces run edge-to-edge with no home-indicator inset.
        '--sat': standalone ? 'env(safe-area-inset-top, 0px)' : '0px',
        '--sab': '0px',
      }}
    >
      {children}
    </div>
  )
}
