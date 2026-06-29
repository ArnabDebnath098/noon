// Section 4a — promo cashback banner + cashback strip.
import { Dirham } from '../../../components/common/Dirham'

export default function PromoBanner() {
  return (
    <div data-id="mp-promo" className="flex flex-col gap-4 py-3">
      {/* Cashback banner */}
      <div className="px-3">
        <div
          data-id="mp-promo-banner"
          className="flex h-[150px] items-center justify-center rounded-[20px] px-4 text-center"
          style={{
            background:
              'radial-gradient(257% 197% at 50% 100%, #FFF1D2 39%, #FFFEF5 100%)',
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-figtree text-[12px] font-bold text-[rgba(14,14,14,0.78)]">
              Welcome! Earn
            </span>
            <span className="inline-flex items-center gap-0.5 font-noontree text-[34px] font-extrabold leading-[26px] text-black">
              <Dirham />50
            </span>
            <span className="font-figtree text-[12px] font-bold text-[rgba(14,14,14,0.78)]">
              Cashback on your first order
            </span>
            <span className="mt-1 rounded-[6px] bg-[#FEEE00] px-2.5 py-1 font-figtree text-[10px] font-bold text-[#2D0802]">
              Use Code: FREE50
            </span>
          </div>
        </div>
      </div>

      {/* Cashback strip */}
      <div className="px-3">
        <div
          data-id="mp-cashback-strip"
          className="flex h-[62px] items-center justify-between rounded-[12px] px-4"
          style={{
            background:
              'radial-gradient(113% 110% at 50% 0%, rgba(153,153,153,0.06) 0%, rgba(153,153,153,0.1) 100%), #FFFFFF',
            boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
          }}
        >
          <div className="flex flex-col">
            <span className="font-figtree text-[20px] font-bold leading-tight text-[#262A33]">
              10% cashback
            </span>
            <span className="font-figtree text-[12px] font-medium text-[#262A33]">
              on every E-Commerce spends
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-figtree text-[13px] font-bold text-[rgba(14,14,14,0.78)]">
              1/5
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-black" />
              <span className="h-1 w-1 rounded-full bg-black/30" />
              <span className="h-1 w-1 rounded-full bg-black/30" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
