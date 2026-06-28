import Header from './Header.jsx'
import ActionBar from './ActionBar.jsx'

/**
 * MobileLayout
 * Persistent PDP shell: a centered column capped at a phone-ish width. Header
 * and the sticky add-to-cart bar stay mounted; the routed page renders inside
 * <main> (which clips horizontal overflow so page slides don't cause a
 * scrollbar). No bottom nav — this is a product details page.
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
      </div>
    </div>
  )
}
