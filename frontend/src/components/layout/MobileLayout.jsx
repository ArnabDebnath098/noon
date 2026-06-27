import Header from './Header.jsx'
import BottomNav from './BottomNav.jsx'
import ActionBar from './ActionBar.jsx'

/**
 * MobileLayout
 * Persistent mobile-first shell: a centered column capped at a phone-ish width.
 * Header, action bar and bottom nav stay mounted across route changes; the
 * routed page is rendered as children inside <main> (which clips horizontal
 * overflow so page slide transitions don't cause a scrollbar).
 */
export default function MobileLayout({ children }) {
  return (
    <div data-id="mobile-layout-backdrop" className="min-h-screen w-full bg-noon-dark/5 flex justify-center">
      <div data-id="mobile-layout-frame" className="relative w-full max-w-md min-h-screen bg-white flex flex-col shadow-sm">
        <Header data-id="mobile-layout-header" />

        <main
          data-id="mobile-layout-main"
          className="flex-1 overflow-x-clip bg-[#F2F3F7]"
        >
          {children}
        </main>

        <ActionBar data-id="mobile-layout-action-bar" />
        <BottomNav data-id="mobile-layout-bottom-nav" />
      </div>
    </div>
  )
}
