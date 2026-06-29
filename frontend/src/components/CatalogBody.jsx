import { motion } from 'framer-motion'
import { SectionCard, Accordion, ProductCard, BentoProductCard, HorizontalComboCard } from './common'
import bestCombo from '../assets/icons/bestcombo.svg'

// Small lavender "combo" mark used in the stacked-list header.
function ComboIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3.5" y="3" width="9" height="13" rx="2.6" transform="rotate(-10 8 9.5)" fill="#C7D6FF" />
      <rect x="7" y="4" width="9" height="13" rx="2.6" fill="#9FB6FF" />
    </svg>
  )
}

/**
 * CatalogBody — presentational PDP body (Product Details + combos + similar
 * rails). Data is passed in by the experiment (no direct data import), so the
 * data layer stays owned by each experiment. `comboAnim` picks the combo-tag
 * style and `idPrefix` keeps data-ids unique.
 */
export default function CatalogBody({
  combos = [],
  similar = [],
  productDetails = [],
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

  const bentoCards = combos.map((c) => (
    <BentoProductCard
      key={c.id}
      dataId={id(`bento-${c.id}`)}
      images={c.images}
      title={c.title}
      itemCount={parseInt(c.productCount, 10) || c.images.length}
      price={c.price}
      originalPrice={c.originalPrice}
      discount={c.discount}
      badge={c.badge}
    />
  ))

  return (
    <div
      data-id={id('page')}
      className="flex flex-col gap-3 px-3"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 47px) + 56px + 12px)',
        paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px)',
      }}
    >
      <SectionCard dataId={id('section-details')} title="Product Details">
        <Accordion items={productDetails} dataId={id('accordion')} />
      </SectionCard>

      {comboAnim === 'list' ? (
        /* Stacked list of horizontal combo cards (Figma Variant5). */
        <div
          data-id={id('section-combos')}
          className="flex flex-col gap-3 rounded-2xl bg-white p-3"
        >
          <div data-id={id('combos-header')} className="flex items-center gap-4 px-2">
            <span data-id={id('combos-header-icon')}>
              <ComboIcon />
            </span>
            <span data-id={id('combos-header-divider')} className="h-4 w-px bg-[#D0D4DD]" />
            <div data-id={id('combos-header-text')} className="flex flex-1 flex-col gap-0.5">
              <span
                data-id={id('combos-header-title')}
                className="font-noontree text-[16px] font-semibold leading-5 tracking-[-0.1px] text-[rgba(2,6,12,0.92)]"
              >
                Save more with combos
              </span>
              <span
                data-id={id('combos-header-subtitle')}
                className="font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#666D85]"
              >
                buy together and unlock extra savings
              </span>
            </div>
          </div>

          <span data-id={id('combos-divider')} className="h-px w-full border-t border-dashed border-[#F2F3F7]" />

          <div data-id={id('combos-list')} className="flex flex-col gap-3">
            {combos.slice(0, 1).map((c) => (
              <HorizontalComboCard key={c.id} dataId={id(`combo-${c.id}`)} {...c} />
            ))}
          </div>
        </div>
      ) : comboAnim === 'bento' ? (
        <SectionCard
          dataId={id('section-combos')}
          title="Save more with combos"
          actionLabel="View all 6"
          onAction={() => {}}
        >
          <div className="scrollbar-hide -mx-3 flex gap-3 overflow-x-auto px-3 pb-1">
            {bentoCards}
          </div>
        </SectionCard>
      ) : ['chiptop', 'mediatag', 'static'].includes(comboAnim) ? (
        /* Gradient banner variants: variation 1 (chiptop) uses a blue theme;
           the others keep the green theme. */
        (() => {
          // variations 1 (chiptop) and 2 (mediatag) share the blue theme + text header
          const blue = comboAnim === 'chiptop' || comboAnim === 'mediatag'
          return (
        <div
          data-id={id('section-combos')}
          className="-mx-3 flex flex-col gap-5 pb-4 pt-4"
          style={{
            background:
              comboAnim === 'mediatag'
                ? '#FFFFFF' // variation 2: pure white, no gradient
                : 'linear-gradient(360deg, #FFFFFF 0%, #F0F7FF 100%)',
          }}
        >
          {blue ? (
            /* Variation 1: simple two-line text header */
            <div data-id={id('combos-header')} className="flex flex-col gap-0.5 px-5">
              <span className="font-noontree text-[16px] font-semibold leading-5 tracking-[-0.1px] text-[rgba(2,6,12,0.92)]">
                Save more with combos
              </span>
              <span className="font-noontree text-[12px] font-normal leading-[14px] tracking-[-0.12px] text-[#666D85]">
                buy together and unlock extra savings
              </span>
            </div>
          ) : (
            <div className="flex h-[46px] items-center justify-between px-5">
              <img src={bestCombo} alt="Best Value combos" className="h-[31px] w-auto" />
              <span
                className="relative flex h-6 items-center gap-1 overflow-hidden rounded-[99px] py-0.5 pl-0.5 pr-2"
                style={{ background: 'linear-gradient(90deg, #598E04 -1.63%, #A0C80F 101.06%)' }}
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
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                />
              </span>
            </div>
          )}
          <div className="scrollbar-hide flex gap-3 overflow-x-auto px-5 pb-1">
            {comboCards}
          </div>
        </div>
          )
        })()
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
