// SectionCard — a white rounded card with a 24px header row (title + optional
// action) and a flexible body slot. The body accepts any content via children,
// so different sections (product rails, lists, banners) reuse the same shell.

export function SectionCard({
  title,
  actionLabel,
  onAction,
  children,
  dataId,
  className = '',
}) {
  return (
    <section
      data-id={dataId}
      className={[
        'flex flex-col gap-3 self-stretch rounded-2xl bg-white p-3',
        className,
      ].join(' ')}
    >
      {/* Header — 24px tall, title left, optional action right. */}
      <div
        data-id="section-card-header"
        className="flex h-6 items-center justify-between"
      >
        <h2
          data-id="section-card-title"
          className="text-sm font-semibold text-[#0E0E0E]"
        >
          {title}
        </h2>
        {actionLabel && (
          <button
            type="button"
            data-id="section-card-action"
            onClick={onAction}
            className="text-sm font-semibold text-blue-600"
          >
            {actionLabel}
          </button>
        )}
      </div>

      {/* Body — flexible slot, content varies per section. */}
      <div data-id="section-card-body" className="w-full">
        {children}
      </div>
    </section>
  );
}
