import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import LaunchSequence from './LaunchSequence'
import noonMark from '../../assets/intro/noon-mark.svg'

const SPLASH_MS = 2000 // how long the yellow splash holds before the white screen

// noon splash mark (static, subtle scale/fade-in entrance).
function NoonMark() {
  return (
    <motion.img
      data-id="mp-intro-mark"
      src={noonMark}
      alt="noon"
      className="h-[92px] w-[92px]"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  )
}

/**
 * Marketplace switcher INTRO experiment. On open it mimics the noon app launch:
 * a yellow splash (noon mark) holds for ~2s, then fades to reveal the white
 * screen where the intro/switcher animation will be built.
 */
export default function MarketplaceSwitcherIntroExperiment() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('splash') // 'splash' → 'white'

  useEffect(() => {
    const t = setTimeout(() => setPhase('white'), SPLASH_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <AppShell>
      <main data-id="mp-intro-main" className="relative flex-1 overflow-hidden bg-white">
        {/* White screen with the launch choreography — mounts after the splash
            so its timeline starts as the yellow screen fades away. */}
        {phase === 'white' && <LaunchSequence />}

        {/* Yellow launch splash — fades out to reveal the white screen. */}
        <AnimatePresence>
          {phase === 'splash' && (
            <motion.div
              key="splash"
              data-id="mp-intro-splash"
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-[#FEEE00]"
            >
              <NoonMark />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Back to experiments (hidden during the splash) */}
      {phase === 'white' && (
        <div
          className="pointer-events-none fixed left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 justify-end px-4"
          style={{ bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            type="button"
            data-id="mp-intro-back"
            aria-label="Back to experiments"
            onClick={() => navigate('/')}
            className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1D2539] text-white shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:scale-95"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </AppShell>
  )
}
