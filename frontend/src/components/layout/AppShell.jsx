/**
 * AppShell — the centered, phone-width frame used by every page/experiment.
 * Pages compose their own header/content/footers inside it.
 */
export default function AppShell({ children, className = '' }) {
  return (
    <div
      data-id="app-shell"
      className="flex min-h-screen w-full justify-center bg-noon-dark/5"
    >
      <div
        data-id="app-frame"
        className={`relative flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-white shadow-sm ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
