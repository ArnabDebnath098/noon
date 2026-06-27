import { SectionCard, Accordion, ProductCard } from './common'
import { combos, similar, productDetails } from '../data/catalog'

/**
 * CatalogBody — the shared page body (Product Details + combos + similar rails),
 * reused by Home / Categories / Deals. Each route passes a different combo count
 * animation via `comboAnim` and a `idPrefix` to keep data-ids unique.
 */
export default function CatalogBody({
  comboAnim = 'type',
  comboStagger = 0,
  idPrefix = '',
}) {
  const id = (s) => (idPrefix ? `${idPrefix}-${s}` : s)

  return (
    <div
      data-id={id('page')}
      className="flex flex-col gap-3 px-3"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 47px) + 56px + 12px)',
        paddingBottom: 'calc(85px + 72px + env(safe-area-inset-bottom, 0px) + 12px)',
      }}
    >
      <SectionCard dataId={id('section-details')} title="Product Details">
        <Accordion items={productDetails} dataId={id('accordion')} />
      </SectionCard>

      <SectionCard
        dataId={id('section-combos')}
        title="Save more with combos"
        actionLabel="View all 6"
        onAction={() => {}}
      >
        <div className="scrollbar-hide -mx-3 flex gap-3 overflow-x-auto px-3 pb-1">
          {combos.map((c, i) => (
            <ProductCard
              key={c.id}
              dataId={id(`product-${c.id}`)}
              comboAnim={comboAnim}
              comboDelay={i * comboStagger}
              width={140}
              {...c}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard dataId={id('section-similar')} title="Similar Products">
        <div className="scrollbar-hide -mx-3 flex gap-3 overflow-x-auto px-3 pb-1">
          {similar.map((p) => (
            <ProductCard
              key={p.id}
              dataId={id(`similar-${p.id}`)}
              discountTone="green"
              {...p}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
