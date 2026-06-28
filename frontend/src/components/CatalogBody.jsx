import { motion } from 'framer-motion'
import { SectionCard, Accordion, ProductCard } from './common'
import { combos, similar, productDetails } from '../data/catalog'
import bestCombo from '../assets/icons/bestcombo.svg'

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

  const comboCards = combos.map((c, i) => (
    <ProductCard
      key={c.id}
      dataId={id(`product-${c.id}`)}
      comboAnim={comboAnim}
      comboDelay={i * comboStagger}
      width={140}
      {...c}
    />
  ))

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

      {comboAnim === 'static' ? (
        /* Full-bleed combos banner: white→pale-green gradient, 20px padding,
           SVG title + gradient count tag. */
        <div
          data-id={id('section-combos')}
          className="-mx-3 pb-4 pt-4"
          style={{
            background: 'linear-gradient(360deg, #FFFFFF 0%, #FAFFF3 100%)',
          }}
        >
          <div className="mb-3 flex h-[46px] items-center justify-between px-5">
            <img
              src={bestCombo}
              alt="Best Value combos"
              className="h-[31px] w-auto"
            />
            <span
              className="relative flex h-6 items-center gap-1 overflow-hidden rounded-[99px] py-0.5 pl-0.5 pr-2"
              style={{
                background:
                  'linear-gradient(90deg, #598E04 -1.63%, #A0C80F 101.06%)',
              }}
            >
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 font-noontree text-[12px] font-bold text-[#598E04]">
                {combos.length}
              </span>
              <span className="font-noontree text-[12px] font-semibold text-white">
                Combos available
              </span>
              {/* shimmer sweep */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-[45deg]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                }}
                initial={{ x: 0 }}
                animate={{ x: ['0%', '500%'] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  ease: 'easeInOut',
                }}
              />
            </span>
          </div>
          <div className="scrollbar-hide flex gap-3 overflow-x-auto px-5 pb-1">
            {comboCards}
          </div>
        </div>
      ) : (
        <SectionCard
          dataId={id('section-combos')}
          title="Save more with combos"
          actionLabel="View all 6"
          onAction={() => {}}
        >
          <div className="scrollbar-hide -mx-3 flex gap-3 overflow-x-auto px-3 pb-1">
            {comboCards}
          </div>
        </SectionCard>
      )}

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
