import { createPortal } from 'react-dom'
import { PHONE_H, PHONE_W, useFramed } from './AppShell'

const GAP = 20 // px between the phone frame and the button
const SIZE = 48

/**
 * FrameBackButton — the round "back to experiments" button.
 *
 * On the web (the framed desktop view) it sits OUTSIDE the phone, on the page
 * beside the frame's top-left corner, so it never covers the app. The frame is
 * the containing block for fixed children and clips them, so it's portalled to
 * <body> and placed against the frame's (centred) box. On a phone it renders
 * inside the app as before: `mobile` is the in-app placement (a wrapper style).
 */
export default function FrameBackButton({ onClick, dataId = 'back', label = 'Back to experiments', mobile }) {
  const framed = useFramed()
  const button = (
    <button
      type="button"
      data-id={dataId}
      aria-label={label}
      onClick={onClick}
      className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1D2539] text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:scale-95"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 5l-7 7 7 7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
  if (framed) {
    // the frame is centred in the viewport (AppShell): PHONE_W wide, PHONE_H tall (capped to the viewport)
    return createPortal(
      <div
        className="pointer-events-none fixed z-[100]"
        style={{
          left: `calc(50% - ${PHONE_W / 2 + GAP + SIZE}px)`,
          top: `calc(50% - min(${PHONE_H}px, 100dvh - 48px) / 2)`,
        }}
      >
        {button}
      </div>,
      document.body,
    )
  }
  return (
    <div className="pointer-events-none fixed left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 justify-start px-4" style={mobile}>
      {button}
    </div>
  )
}
