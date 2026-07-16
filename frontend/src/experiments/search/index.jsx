import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Squircle } from 'corner-smoothing'
import AppShell from '../../components/layout/AppShell'
import noonLogo from '../../assets/marketplace/noon.svg'

// Primary text / muted colours from the SLP design tokens.
const INK = 'rgba(2, 6, 12, 0.92)'
const MUTED = 'rgba(2, 6, 12, 0.45)'
const HAIRLINE = 'rgba(2, 6, 12, 0.15)'
const ELEVATION_200 = '0px 4px 8px rgba(2, 6, 12, 0.1)'
const AI_GRADIENT =
  'linear-gradient(90deg, #F91A47 -6.74%, #F73B86 56.21%, #034EFC 125.22%)'

// A tiny catalogue so the search is genuinely interactive — anything that
// matches renders as a lightweight result grid, anything that doesn't (e.g.
// "office chairs") drops to the no-results cross-sell modal.
const CATALOG = [
  { name: 'iPhone 15 Pro', price: 'AED 4,199', tint: '#EAF0FF' },
  { name: 'Samsung Galaxy S24', price: 'AED 3,299', tint: '#F0ECFF' },
  { name: 'AirPods Pro 2', price: 'AED 899', tint: '#EAF7F0' },
  { name: 'Sony WH-1000XM5', price: 'AED 1,399', tint: '#FDEFEF' },
  { name: 'MacBook Air M3', price: 'AED 4,999', tint: '#EAF4FF' },
  { name: 'Apple Watch Series 9', price: 'AED 1,699', tint: '#FFF1E8' },
]

/* ── iOS status bar ─────────────────────────────────────────────────────── */
function StatusBar() {
  return (
    <div
      data-id="search-statusbar"
      className="relative flex h-[47px] w-full shrink-0 items-end justify-between px-[27px] pb-2"
    >
      <span
        data-id="search-statusbar-time"
        className="font-noontree text-[17px] font-semibold leading-none"
        style={{ color: INK, letterSpacing: '-0.408px' }}
      >
        9:41
      </span>
      <div data-id="search-statusbar-icons" className="flex items-center gap-[7px]">
        {/* mobile signal */}
        <svg data-id="search-statusbar-signal" width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="1" fill="#02060C" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#02060C" />
          <rect x="10" y="3" width="3" height="9" rx="1" fill="#02060C" />
          <rect x="15" y="0.5" width="3" height="11.5" rx="1" fill="#02060C" />
        </svg>
        {/* wifi */}
        <svg data-id="search-statusbar-wifi" width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden="true">
          <path d="M8.5 2C11.4 2 14 3.1 15.9 5l-1.5 1.5C12.9 5 10.8 4.1 8.5 4.1S4.1 5 2.6 6.5L1.1 5C3 3.1 5.6 2 8.5 2Z" fill="#02060C" />
          <path d="M8.5 5.7c1.7 0 3.3.6 4.5 1.7l-1.6 1.6a4 4 0 0 0-5.8 0L4 7.4a6.5 6.5 0 0 1 4.5-1.7Z" fill="#02060C" />
          <path d="M8.5 9.3c.7 0 1.4.3 1.9.8l-1.9 1.9-1.9-1.9c.5-.5 1.2-.8 1.9-.8Z" fill="#02060C" />
        </svg>
        {/* battery */}
        <div data-id="search-statusbar-battery" className="relative flex h-[13px] w-[25px] items-center">
          <div data-id="search-statusbar-battery-outline" className="absolute inset-0 rounded-[4px] border" style={{ borderColor: '#02060C', opacity: 0.35 }} />
          <div data-id="search-statusbar-battery-cap" className="absolute right-[-3px] top-1/2 h-[4px] w-[1.4px] -translate-y-1/2 rounded-r" style={{ background: '#02060C', opacity: 0.4 }} />
          <div data-id="search-statusbar-battery-fill" className="absolute left-[2px] top-1/2 h-[9px] w-[19px] -translate-y-1/2 rounded-[2px]" style={{ background: '#02060C' }} />
        </div>
      </div>
    </div>
  )
}

/* ── "Shop with Magic List" AI button ───────────────────────────────────── */
function MagicListButton() {
  return (
    <button
      type="button"
      data-id="search-magic-list"
      className="relative flex h-[52px] w-[90px] shrink-0 flex-col items-center justify-center gap-[3px] rounded-[12px] border bg-white transition active:scale-[0.97]"
      style={{ borderColor: HAIRLINE, boxShadow: ELEVATION_200 }}
    >
      <span
        data-id="search-magic-list-badge"
        className="absolute -top-[8px] left-1/2 flex h-[18px] -translate-x-1/2 items-center justify-center rounded-full px-[6px] font-noontree text-[9px] font-semibold text-white"
        style={{ background: 'linear-gradient(180deg, #2969FF 0%, #0037B8 100%)' }}
      >
        New
      </span>
      <span data-id="search-magic-list-eyebrow" className="font-noontree text-[10px] font-semibold leading-none" style={{ color: MUTED }}>
        Shop with
      </span>
      <span data-id="search-magic-list-wordmark" className="flex items-center gap-[2px]">
        <svg data-id="search-magic-list-spark" width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 0c.3 2.5 1.2 3.4 3.7 3.7C7.2 4 6.3 5 6 7.4 5.7 5 4.8 4 2.3 3.7 4.8 3.4 5.7 2.5 6 0Z" fill="url(#ml-spark)" />
          <path d="M10 6.4c.15 1.2.6 1.7 1.8 1.85-1.2.15-1.65.6-1.8 1.85-.15-1.25-.6-1.7-1.8-1.85 1.2-.15 1.65-.65 1.8-1.85Z" fill="url(#ml-spark)" />
          <defs>
            <linearGradient id="ml-spark" x1="0" y1="0" x2="12" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F91A47" />
              <stop offset="1" stopColor="#BF0333" />
            </linearGradient>
          </defs>
        </svg>
        <span
          data-id="search-magic-list-label"
          className="font-noontree text-[14px] font-bold leading-none"
          style={{ background: AI_GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Magic List
        </span>
      </span>
    </button>
  )
}

/* ── Shared search bar row (search field + Magic List) ──────────────────── */
function SearchRow({ idPrefix, query, onChange, onClear, onEnter, inputRef, showMagic = true }) {
  const hasQuery = query.trim().length > 0
  return (
    <div data-id={`${idPrefix}-bar-row`} className="flex w-full items-center gap-2">
      <div data-id={`${idPrefix}-field`} className="flex h-[52px] flex-1 items-center gap-2 rounded-[12px] border bg-white px-3" style={{ borderColor: HAIRLINE, boxShadow: ELEVATION_200 }}>
        <svg data-id={`${idPrefix}-field-icon`} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="9" cy="9" r="6.3" stroke="#F91A47" strokeWidth="1.7" />
          <path d="m14 14 3.3 3.3" stroke="#F91A47" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          data-id={`${idPrefix}-input`}
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onEnter?.() }}
          placeholder="Search"
          className="min-w-0 flex-1 bg-transparent font-noontree text-[17px] font-medium leading-none outline-none placeholder:text-[rgba(2,6,12,0.45)]"
          style={{ color: INK, letterSpacing: '-0.26px' }}
        />
        {hasQuery && (
          <button type="button" data-id={`${idPrefix}-clear`} aria-label="Clear search" onClick={onClear} className="shrink-0">
            <svg data-id={`${idPrefix}-clear-icon`} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="9" fill="rgba(2,6,12,0.45)" />
              <path d="m7 7 6 6M13 7l-6 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      {showMagic && <MagicListButton />}
    </div>
  )
}

/* ── Small 4-point sparkle used by the modal feature pills ──────────────── */
function Sparkle() {
  return (
    <svg data-id="search-modal-feature-spark" width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
      <path d="M4 0c.2 1.7.8 2.3 2.5 2.5C4.8 2.7 4.2 3.3 4 5c-.2-1.7-.8-2.3-2.5-2.5C3.2 2.3 3.8 1.7 4 0Z" fill="#666D85" />
    </svg>
  )
}

/* ── Result card ────────────────────────────────────────────────────────── */
function ResultCard({ item }) {
  return (
    <div data-id="search-result-card" className="flex flex-col overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: HAIRLINE }}>
      <div data-id="search-result-card-media" className="flex h-[120px] items-center justify-center" style={{ background: item.tint }}>
        <svg data-id="search-result-card-icon" width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="3" stroke={INK} strokeOpacity="0.35" strokeWidth="1.4" />
          <path d="M9 3v18M4 9h16" stroke={INK} strokeOpacity="0.18" strokeWidth="1.2" />
        </svg>
      </div>
      <div data-id="search-result-card-info" className="flex flex-col gap-1 p-3">
        <span data-id="search-result-card-name" className="font-noontree text-[13px] font-medium leading-tight" style={{ color: INK }}>{item.name}</span>
        <span data-id="search-result-card-price" className="font-noontree text-[13px] font-bold" style={{ color: INK }}>{item.price}</span>
      </div>
    </div>
  )
}

/* ── No-results cross-sell modal (Image #5) ─────────────────────────────── */
function NoResultsModal({ query, onQueryChange, onClear, onDismiss, inputRef }) {
  return (
    <motion.div
      data-id="search-modal-overlay"
      className="absolute inset-0 z-40 flex items-start justify-center px-3"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 47px) + 4px)', background: 'rgba(2, 6, 12, 0.55)' }}
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(3px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onDismiss}
    >
      <motion.div
        data-id="search-modal-card"
        className="w-full"
        style={{ filter: 'drop-shadow(0px 24px 48px rgba(2, 6, 12, 0.24))', transformOrigin: 'top center' }}
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
      >
       <Squircle
        as="div"
        data-id="search-modal-sheet"
        cornerRadius={16}
        cornerSmoothing={1}
        className="flex w-full flex-col gap-3 bg-white p-3"
       >
        {/* Search bar (full modal-content width, aligned with the CTA below)
            + "No results found", framed by a secondary surface. */}
        <div data-id="search-modal-searchblock" className="flex flex-col gap-1 rounded-[12px] bg-[#F2F3F7]">
          <SearchRow idPrefix="search-modal" query={query} onChange={onQueryChange} onClear={onClear} inputRef={inputRef} showMagic={false} />
          <div data-id="search-modal-noresults" className="flex h-7 items-center justify-center">
            <span data-id="search-modal-noresults-text" className="font-noontree text-[12px] font-medium" style={{ color: '#475067', letterSpacing: '-0.1px' }}>
              No results found
            </span>
          </div>
        </div>

        {/* Cross-sell content */}
        <div data-id="search-modal-content" className="flex flex-col">
          <div data-id="search-modal-pitch" className="flex flex-col items-center gap-[14px] px-3 py-3">
            <div data-id="search-modal-brand" className="flex flex-col items-center gap-3">
              <span data-id="search-modal-continue" className="font-noontree text-[11px] font-semibold" style={{ color: '#475067', letterSpacing: '-0.1px' }}>
                Continue your search on
              </span>
              <img data-id="search-modal-noon-logo" src={noonLogo} alt="noon" className="h-6 w-auto" />
            </div>
            <div data-id="search-modal-features" className="flex items-center justify-center gap-3">
              <span data-id="search-modal-feature-1" className="flex items-center gap-[6px]">
                <Sparkle />
                <span className="font-noontree text-[12px] font-normal" style={{ color: '#475067', letterSpacing: '-0.1px' }}>Wide assortment</span>
              </span>
              <span data-id="search-modal-feature-2" className="flex items-center gap-[6px]">
                <Sparkle />
                <span className="font-noontree text-[12px] font-normal" style={{ color: '#475067', letterSpacing: '-0.1px' }}>Delivered today</span>
              </span>
            </div>
          </div>

          <div data-id="search-modal-actions" className="flex flex-col items-center gap-3 py-2">
            <button
              type="button"
              data-id="search-modal-cta"
              className="flex h-14 w-full items-center justify-center rounded-[16px] font-noontree text-[17px] font-semibold text-white transition active:scale-[0.98]"
              style={{ background: '#0F7EFF', letterSpacing: '-0.25px' }}
            >
              Get it on noon
            </button>
            <button
              type="button"
              data-id="search-modal-dismiss"
              onClick={onDismiss}
              className="flex h-7 items-center justify-center px-2 font-noontree text-[14px] font-semibold"
              style={{ color: '#1D2539' }}
            >
              Stay on minutes
            </button>
          </div>
        </div>
       </Squircle>
      </motion.div>
    </motion.div>
  )
}

/**
 * Search experiment — SLP (search landing page). The field starts empty; typing
 * a query filters a small demo catalogue. A query with no matches (e.g. "office
 * chairs") opens a Framer Motion cross-sell modal over a dimmed/blurred SLP,
 * offering to continue the search on noon.
 */
export default function SearchExperiment() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const inputRef = useRef(null)
  const modalInputRef = useRef(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return CATALOG.filter((c) => c.name.toLowerCase().includes(q))
  }, [query])

  const hasQuery = query.trim().length > 0
  const noResults = hasQuery && results.length === 0

  // Debounce the modal so it appears once the shopper pauses on a term that
  // returns nothing — not on every intermediate keystroke.
  useEffect(() => {
    if (!noResults) {
      setModalOpen(false)
      return
    }
    const timer = setTimeout(() => setModalOpen(true), 450)
    return () => clearTimeout(timer)
  }, [noResults, query])

  // Focus the modal's own field when it opens so typing continues seamlessly.
  useEffect(() => {
    if (modalOpen) modalInputRef.current?.focus()
  }, [modalOpen])

  const dismissModal = () => {
    setModalOpen(false)
    setQuery('')
  }

  return (
    <AppShell className="!bg-white">
      <StatusBar />

      {/* Search bar row */}
      <div data-id="search-bar-wrap" className="w-full shrink-0 px-3 py-4">
        <SearchRow
          idPrefix="search"
          query={query}
          onChange={setQuery}
          onClear={() => { setQuery(''); inputRef.current?.focus() }}
          onEnter={() => { if (noResults) setModalOpen(true) }}
          inputRef={inputRef}
        />
      </div>

      {/* Body — results when the query matches, otherwise trending searches */}
      <main data-id="search-main" className="flex-1 overflow-y-auto overscroll-contain" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
        {results.length > 0 ? (
          <div data-id="search-results" className="flex flex-col gap-3 px-3 pb-6 pt-1">
            <p data-id="search-results-count" className="px-1 font-noontree text-[13px]" style={{ color: MUTED }}>
              {results.length} result{results.length === 1 ? '' : 's'} for “{query.trim()}”
            </p>
            <div data-id="search-results-grid" className="grid grid-cols-2 gap-3">
              {results.map((item) => (<ResultCard key={item.name} item={item} />))}
            </div>
          </div>
        ) : (
          <div data-id="search-trending" className="flex flex-col gap-3 px-4 pb-6 pt-2">
            <p data-id="search-trending-label" className="font-noontree text-[13px] font-semibold" style={{ color: MUTED }}>Trending searches</p>
            <div data-id="search-trending-chips" className="flex flex-wrap gap-2">
              {CATALOG.map((c) => (
                <button key={c.name} data-id="search-trending-chip" type="button" onClick={() => setQuery(c.name)} className="rounded-full border px-3 py-2 font-noontree text-[13px] font-medium" style={{ borderColor: HAIRLINE, color: INK }}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* No-results cross-sell modal */}
      <AnimatePresence>
        {modalOpen && (
          <NoResultsModal
            key="search-modal"
            query={query}
            inputRef={modalInputRef}
            onQueryChange={setQuery}
            onClear={() => { setQuery(''); modalInputRef.current?.focus() }}
            onDismiss={dismissModal}
          />
        )}
      </AnimatePresence>

      {/* Back affordance — floating pill, out of the design's way */}
      <button
        type="button"
        data-id="search-back"
        onClick={() => navigate('/')}
        aria-label="Back to experiments"
        className="absolute bottom-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 backdrop-blur transition active:scale-95"
        style={{ borderColor: HAIRLINE, boxShadow: ELEVATION_200 }}
      >
        <svg data-id="search-back-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12.5 5 7.5 10l5 5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </AppShell>
  )
}
