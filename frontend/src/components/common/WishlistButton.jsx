// WishlistButton — the animated wishlist heart used across product cards.
// On tap: fills, heartbeats, emits a heart-shaped ripple and a few small
// floating hearts. Self-contained (own liked/burst state); size + circle bg are
// props so it drops into any card. Mirrors the ProductCard heart behaviour.
import { useState } from 'react'
import { motion } from 'framer-motion'
import wishlistHeartRaw from '../../assets/icons/wishlist.svg?raw'
import heartFillRaw from '../../assets/icons/heart-fill.svg?raw'

// Recolour both heart variants to inherit currentColor.
const HEART_HTML = wishlistHeartRaw.replace(/fill="black"/gi, 'fill="currentColor"')
const HEART_FILL_HTML = heartFillRaw.replace(/fill="#[0-9a-f]{3,8}"/gi, 'fill="currentColor"')

export function WishlistButton({ size = 32, bg = '#F9F9FB', dataId = 'wishlist', className = '', onChange }) {
  const [liked, setLiked] = useState(false)
  const [burst, setBurst] = useState(0) // bumps on each "like" to retrigger fx
  const iconBox = Math.round(size * 0.625) // 20 @ 32

  const toggle = () => {
    const next = !liked
    setLiked(next)
    if (next) setBurst((b) => b + 1)
    onChange?.(next)
  }

  return (
    <button
      type="button"
      data-id={dataId}
      aria-label="Add to wishlist"
      aria-pressed={liked}
      onClick={toggle}
      className={`relative flex items-center justify-center rounded-full ${className}`}
      style={{ width: size, height: size, background: bg, color: liked ? '#D92626' : '#666D85' }}
    >
      {/* heart-shaped ripple — grows from the icon and fades */}
      {burst > 0 && (
        <motion.span
          key={`ripple-${burst}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto text-[#D92626] [&>svg]:h-full [&>svg]:w-full"
          style={{ width: iconBox, height: iconBox }}
          initial={{ scale: 0.6, opacity: 0.55 }}
          animate={{ scale: 10, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          dangerouslySetInnerHTML={{ __html: HEART_FILL_HTML }}
        />
      )}

      {/* the heart itself — heartbeat on like */}
      <motion.span
        aria-hidden="true"
        className="flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
        style={{ width: iconBox, height: iconBox }}
        animate={{ scale: liked ? [1, 1.35, 0.85, 1.15, 1] : 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        dangerouslySetInnerHTML={{ __html: liked ? HEART_FILL_HTML : HEART_HTML }}
      />

      {/* small scattered floating hearts */}
      {burst > 0 && (
        <div key={`hearts-${burst}`} aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[
            { x: -20, y: -30, s: 0.75 },
            { x: 4, y: -40, s: 0.55 },
            { x: 22, y: -24, s: 0.9 },
            { x: -10, y: -18, s: 0.5 },
          ].map((h, i) => (
            <motion.span
              key={i}
              className="absolute text-[11px] leading-none text-[#D92626]"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
              animate={{ x: h.x, y: h.y, opacity: [0, 1, 0], scale: h.s }}
              transition={{ duration: 0.85, delay: i * 0.04, ease: 'easeOut' }}
            >
              ♥
            </motion.span>
          ))}
        </div>
      )}
    </button>
  )
}
