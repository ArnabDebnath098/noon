// Combos rail (reuses the combo data + ProductCard from the combo experiment).
import { ProductCard } from '../../../components/common'
import { combos } from '../../../data/combo'

export default function CombosSection() {
  return (
    <div data-id="mp-section-combos" className="bg-[#F7F8FA] py-4">
      <h2 className="mb-3 px-4 font-figtree text-[17px] font-bold tracking-[-0.02em] text-[#262A33]">
        Save more with combos
      </h2>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-1">
        {combos.map((c, i) => (
          <ProductCard
            key={c.id}
            dataId={`mp-combo-${c.id}`}
            comboAnim="counter"
            comboDelay={i * 600}
            width={140}
            {...c}
          />
        ))}
      </div>
    </div>
  )
}
