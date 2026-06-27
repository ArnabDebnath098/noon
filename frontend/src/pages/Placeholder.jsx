/**
 * Placeholder — simple empty page for nav destinations not yet built
 * (Profile, Cart). Entrance handled by the uniform route slide transition.
 */
export default function Placeholder({ title }) {
  return (
    <div
      data-id="placeholder-page"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-3"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 47px) + 56px + 12px)' }}
    >
      <h1 className="font-noontree text-2xl font-bold text-noon-dark">{title}</h1>
      <p className="text-sm text-noon-gray">Coming soon.</p>
    </div>
  )
}
