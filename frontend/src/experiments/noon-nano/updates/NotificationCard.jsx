import { memo } from 'react'
import photo1 from '../../../assets/nano/updates/photo-1.webp'
import photo2 from '../../../assets/nano/updates/photo-2.webp'
import photo3 from '../../../assets/nano/updates/photo-3.webp'
import walletArt from '../../../assets/nano/updates/wallet-art.webp'
import productBottle from '../../../assets/nano/updates/product-bottle.webp'
import productCafe from '../../../assets/nano/updates/product-cafe.webp'
import artNoon from '../../../assets/nano/updates/art-noon.webp'
import artSupermall from '../../../assets/nano/updates/art-supermall.webp'
import artSupermallNote from '../../../assets/nano/updates/art-supermall-declined-note.webp'
import artMinutes from '../../../assets/nano/updates/art-minutes.webp'
import artFood from '../../../assets/nano/updates/art-food.webp'
import artFoodNote from '../../../assets/nano/updates/art-food-declined-note.webp'
import logoMinutes from '../../../assets/nano/updates/logo-minutes.png'
import taskReceivedBg from '../../../assets/nano/updates/task-received-bg.webp'
import sparkles from '../../../assets/nano/updates/sparkles.webp'
import rewardFlower from '../../../assets/nano/updates/reward-flower.webp'
import iconCheck from '../../../assets/nano/updates/icon-check.svg'
import iconDeclined from '../../../assets/nano/updates/icon-declined.svg'
import iconMessage from '../../../assets/nano/updates/icon-message.svg'
import iconDot from '../../../assets/nano/updates/icon-dot.svg'
import tickerGreenL from '../../../assets/nano/updates/ticker-green-l.svg'
import tickerGreenR from '../../../assets/nano/updates/ticker-green-r.svg'
import tickerBlueL from '../../../assets/nano/updates/ticker-blue-l.svg'
import tickerBlueR from '../../../assets/nano/updates/ticker-blue-r.svg'
import tickerGreyL from '../../../assets/nano/updates/ticker-grey-l.svg'
import tickerGreyR from '../../../assets/nano/updates/ticker-grey-r.svg'
import logoNoon from '../../../assets/nano/updates/logo-noon.svg'
import logoSupermall from '../../../assets/nano/updates/logo-supermall.svg'
import logoFood from '../../../assets/nano/updates/logo-food.svg'
import footerNoonNote from '../../../assets/nano/updates/footer-noon-note.svg'
import footerSupermallNote from '../../../assets/nano/updates/footer-supermall-note.svg'
import footerFoodNote from '../../../assets/nano/updates/footer-food-note.svg'

/**
 * NotificationCard — Figma Kids-Side "Notification card" (33:3405), 335 × 400.
 *
 * Type × Status × Marketplace (+ a parent's note): Task (Success / Error /
 * Received), Top-up (Success / Error), Order (Success / Error) × noon ·
 * supermall · minutes · food. With a `message` the card shrinks to 330px and
 * the note tray shows under it. `pressed` = the tap overlay. Copy comes from
 * the update (title / meta / amount / message).
 *
 * The declined marketplace / wallet art is the colour art desaturated (Figma's
 * image filter — it doesn't export, so it's a CSS grayscale here).
 */

const INK = '#1D2539'
const MUTED = '#666D85'
// Noontree's dirham ligature needs tracking 0 in Chrome
const DHM = { letterSpacing: 0 }
const CARD_SHADOW = 'shadow-[0px_6px_18px_0px_rgba(15,20,41,0.06)]'

const BADGES = {
  green: { bg: 'bg-[#e3fcf2]', text: 'text-[#0f8857]', dot: 'bg-[#0f8857]' },
  blue: { bg: 'bg-[#f5faff]', text: 'text-[#0f61ff]', dot: 'bg-[#0f61ff]' },
}
function StatusBadge({ tone, label, bordered = false }) {
  if (tone === 'error') {
    return (
      <div data-name="Status badge" className="relative flex h-8 shrink-0 items-center gap-1.5 overflow-clip rounded-[40px] bg-[#fee] pl-1.5 pr-3">
        <img src={iconDeclined} alt="" width={20} height={20} className="size-5 shrink-0" />
        <p className="m-0 whitespace-nowrap font-noontree text-[14px] font-semibold leading-[18px] tracking-[-0.1px] text-[#c42a30]">{label}</p>
      </div>
    )
  }
  if (tone === 'new') {
    return (
      <div
        data-name="Status badge"
        className="flex h-8 items-center overflow-clip rounded-[40px] border border-white bg-gradient-to-b from-[#e2f6ff] to-[#bcdaff] px-3 shadow-[0px_1px_8px_0px_rgba(0,0,0,0.25)]"
      >
        <p className="m-0 whitespace-nowrap font-noontree text-[14px] font-semibold leading-[18px] tracking-[-0.1px] text-[#0f61ff]">{label}</p>
      </div>
    )
  }
  const t = BADGES[tone]
  return (
    <div
      data-name="Status badge"
      className={`relative flex h-8 shrink-0 items-center gap-1.5 overflow-clip rounded-[40px] pl-1.5 pr-3 ${t.bg} ${bordered ? 'border border-white' : ''}`}
    >
      <div className={`flex shrink-0 items-center rounded-xl p-1 ${t.dot}`}>
        <img src={iconCheck} alt="" width={12} height={12} className="size-3" />
      </div>
      <p className={`m-0 whitespace-nowrap font-noontree text-[14px] font-semibold leading-[18px] tracking-[-0.1px] ${t.text}`}>{label}</p>
    </div>
  )
}

const TICKETS = {
  green: { l: tickerGreenL, r: tickerGreenR, bg: 'linear-gradient(108.27deg, #0f8857 0.59%, #26b57c 50.25%, #0f8857 99.9%)' },
  blue: { l: tickerBlueL, r: tickerBlueR, bg: 'linear-gradient(98.59deg, #0f61ff 0.59%, #4585ff 50.25%, #0f61ff 99.9%)' },
  grey: { l: tickerGreyL, r: tickerGreyR, bg: 'linear-gradient(98.59deg, #86878c 0.59%, #9c9ea4 50.25%, #86878c 99.9%)' },
}
/** the amount ticket: notched ends (SVG tickers) around a gradient strip */
function Amount({ tone, children }) {
  const t = TICKETS[tone]
  return (
    <div data-name="Amount" className="relative flex shrink-0 items-stretch py-px">
      <img src={t.l} alt="" className="w-[3.143px] shrink-0" />
      <div className="flex items-center justify-center px-3 py-1.5" style={{ backgroundImage: t.bg }}>
        <p className="m-0 whitespace-pre font-noontree text-[24px] font-bold leading-8 text-white" style={DHM}>
          {children}
        </p>
      </div>
      <img src={t.r} alt="" className="w-[3.143px] shrink-0" />
    </div>
  )
}

function Photos() {
  return (
    <div data-name="Media" className="relative flex min-h-px w-full flex-1 items-start gap-3 pt-6">
      {[photo1, photo2, photo3].map((src) => (
        <div key={src} data-name="Photo tile" className="relative h-full w-[118px] shrink-0 rounded-xl border-2 border-white">
          <img src={src} alt="" className="pointer-events-none absolute inset-0 size-full rounded-xl object-cover" />
        </div>
      ))}
    </div>
  )
}

/** order products: two tilted tiles; `size` lg (order card) · md (note card, minutes / food) · sm (note card) */
const TILE = {
  lg: {
    box: 'h-[137px] w-[105.773px]',
    tile: 'h-[132px] w-[99px] rounded-[13.753px] border-[3.056px] shadow-[0px_3.056px_12.225px_0px_rgba(0,0,0,0.1)]',
    inner: 'rounded-[11px] border-[1.375px]',
    overlap: 'mr-[-10px]',
  },
  md: {
    box: 'h-[116.243px] w-[89.747px]',
    tile: 'h-[112px] w-[84px] rounded-[9px] border-2 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]',
    inner: 'rounded-[7.2px] border-[0.9px]',
    overlap: '',
  },
  sm: {
    box: 'h-[91.334px] w-[70.515px]',
    tile: 'h-[88px] w-[66px] rounded-[9px] border-2 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)]',
    inner: 'rounded-[7.2px] border-[0.9px]',
    overlap: 'mr-[-4px]',
  },
}
function Products({ size, align = 'center', className = '' }) {
  const s = TILE[size]
  return (
    <div
      data-name="Media"
      className={`relative flex w-full ${align === 'start' ? 'items-start' : 'items-center'} ${size === 'md' ? 'gap-2.5' : ''} ${className}`}
    >
      {[
        [productBottle, '-rotate-3', s.overlap],
        [productCafe, 'rotate-3', ''],
      ].map(([src, rot, overlap]) => (
        <div key={src} className={`relative flex shrink-0 items-center justify-center ${s.box} ${overlap}`}>
          <div className={rot}>
            <div data-name="Master" className={`relative overflow-clip border-solid border-white bg-[#f2f3f7] ${s.tile}`}>
              <div className={`absolute inset-0 border-solid border-[#f2f3f7] ${s.inner}`}>
                <img src={src} alt="" className="absolute inset-0 size-full object-contain" />
                <div className="absolute inset-0 bg-[#f9f9fb] mix-blend-multiply" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const MARKETPLACE = {
  noon: {
    tint: '#fff5b0',
    art: artNoon,
    box: 'bottom-[-35.63px] left-[calc(50%+26.5px)] h-[223.251px] w-[334.877px]',
    declinedBox: 'bottom-[-41.63px] left-[calc(50%+26.5px)] h-[223.251px] w-[334.877px]',
    logo: { src: logoNoon, w: 62.937, h: 16 },
    noteFooter: { src: footerNoonNote, className: 'top-[276px] h-8' },
  },
  supermall: {
    tint: '#b0caff',
    art: artSupermall,
    noteArt: artSupermallNote,
    fade: 'linear-gradient(195.48deg, rgba(255,255,255,0) 48.27%, #fff 92.18%)',
    box: 'bottom-[-21.43px] left-1/2 h-[193.926px] w-[387.853px]',
    logo: { src: logoSupermall, w: 108.323, h: 24 },
    noteFooter: { src: footerSupermallNote, className: 'top-[268px] h-10' },
  },
  minutes: {
    tint: '#ffc0b0',
    art: artMinutes,
    fade: 'linear-gradient(222.33deg, rgba(255,255,255,0) 52.33%, #fff 90.12%)',
    box: 'bottom-[-21.43px] left-1/2 h-[187.165px] w-[374.33px]',
    logo: { src: logoMinutes, w: 104.889, h: 24 },
    products: 'start',
  },
  food: {
    tint: '#f390b0',
    art: artFood,
    noteArt: artFoodNote,
    fade: 'linear-gradient(242.83deg, rgba(255,255,255,0) 25.81%, #fff 89.05%)',
    box: 'bottom-[-23.29px] left-[calc(50%-6.5px)] h-[182.79px] w-[365.58px]',
    logo: { src: logoFood, w: 86.414, h: 24 },
    noteFooter: { src: footerFoodNote, className: 'top-[268px] h-10' },
    products: 'start',
  },
}

/** the marketplace's art, bottom of the card: colour when ordered, grey when declined */
function MarketplaceArt({ m, declined, note }) {
  const mp = MARKETPLACE[m]
  const isNoon = m === 'noon'
  // Figma layer opacities per variant
  const wrap = declined ? (isNoon ? 1 : note ? (m === 'food' ? 0.7 : 1) : 0.35) : m === 'food' ? 0.7 : 1
  const img = declined ? (isNoon ? 0.6 : note ? { supermall: 0.25, minutes: 0.5, food: 0.5 }[m] : { supermall: 0.6, minutes: 0.5, food: 1 }[m]) : 0.35
  const src = declined && note && mp.noteArt ? mp.noteArt : mp.art
  const grey = declined && !(note && mp.noteArt) // the note-tray art exports already grey
  return (
    <div
      data-name="Marketplace art"
      aria-hidden="true"
      className={`pointer-events-none absolute -translate-x-1/2 ${declined && isNoon ? mp.declinedBox : mp.box}`}
      style={{ opacity: wrap }}
    >
      <img
        src={src}
        alt=""
        className={`absolute inset-0 size-full ${m === 'minutes' ? 'object-bottom' : 'object-cover'}`}
        style={{ opacity: img, filter: grey ? 'grayscale(1)' : undefined }}
      />
      {mp.fade && <div className="absolute inset-0" style={{ backgroundImage: mp.fade }} />}
    </div>
  )
}

function Logo({ m }) {
  const { src, w, h } = MARKETPLACE[m].logo
  return (
    <div data-name="Footer" className="relative flex w-full flex-col items-start justify-center overflow-clip py-2">
      <img src={src} alt={m} width={w} height={h} style={{ width: w, height: h }} className={m === 'minutes' ? 'object-cover' : ''} />
    </div>
  )
}

function Meta({ meta }) {
  if (!Array.isArray(meta)) {
    return (
      <p className="m-0 w-full font-noontree text-[14px] font-medium" style={{ color: MUTED, ...DHM }}>
        {meta}
      </p>
    )
  }
  return (
    <div className="flex w-full items-center gap-2">
      {meta.map((part, i) => (
        <span key={part} className="contents">
          {i > 0 && <img src={iconDot} alt="" width={4} height={4} className="size-1 shrink-0" />}
          <p className="m-0 whitespace-nowrap font-noontree text-[14px] font-medium" style={{ color: MUTED, ...DHM }}>
            {part}
          </p>
        </span>
      ))}
    </div>
  )
}

const Title = ({ children, strike = false, className = '' }) => (
  <p className={`m-0 w-full whitespace-pre-line font-noontree text-[20px] font-bold ${strike ? 'line-through' : ''} ${className}`} style={{ color: INK }}>
    {children}
  </p>
)

const Pressed = ({ on, inset = 'inset-0' }) =>
  on ? <div data-name="Pressed overlay" className={`pointer-events-none absolute ${inset} rounded-[24px] bg-[rgba(10,8,23,0.12)]`} /> : null

/** a 330px card over the 400px note tray (parent's message) */
function WithNote({ message, children }) {
  return (
    <>
      <div data-name="Message tray" className="absolute inset-0 overflow-clip rounded-[24px] bg-white">
        <div data-name="Message" className="absolute left-0 top-[330px] flex h-[70px] w-full items-center gap-3 overflow-clip px-5 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[20px] bg-[#f2f3f7]">
            <img src={iconMessage} alt="" width={20} height={20} className="size-5" />
          </div>
          <p className="m-0 min-w-px flex-1 font-noontree text-[14px] font-medium leading-5 text-black">{message}</p>
        </div>
      </div>
      {children}
    </>
  )
}

function NotificationCard({ update, pressed = false }) {
  const { type, status, marketplace: m, message, amount, title, meta } = update
  const note = Boolean(message)
  const h = note ? 'h-[330px]' : 'h-[400px]'
  const base = `absolute left-0 top-0 flex w-[335px] flex-col items-start overflow-clip rounded-[24px] ${CARD_SHADOW} ${h}`

  let card
  if (type === 'Task' && status === 'Received') {
    card = (
      <div data-name="Card" className={`${base} border-4 border-white`}>
        <img src={taskReceivedBg} alt="" className="pointer-events-none absolute inset-0 size-full rounded-[24px] object-cover" />
        <img src={sparkles} alt="" className="pointer-events-none absolute left-[191.77px] top-[246px] h-[134.234px] w-[107.426px] object-cover" />
        <img src={sparkles} alt="" className="pointer-events-none absolute left-[12.22px] top-[261.77px] h-[134.234px] w-[107.426px] object-cover" />
        <div className="absolute left-1/2 top-[13.62px] h-[437.824px] w-[302.559px] -translate-x-1/2 rounded-t-2xl border border-white/50" />
        <img
          src={rewardFlower}
          alt=""
          className="pointer-events-none absolute bottom-[-120.22px] left-1/2 h-[367.847px] w-[245.231px] -translate-x-1/2 object-cover"
        />
        <div className="absolute left-1/2 top-[35.77px] flex w-[233px] -translate-x-1/2 flex-col items-center gap-3 overflow-clip text-center">
          <p className="m-0 w-full font-noontree text-[24px] font-bold leading-8 tracking-[-0.25px] text-white">{title}</p>
          <p className="m-0 w-full font-noontree text-[14px] font-medium text-white/80">{meta}</p>
        </div>
        <p
          className="absolute left-1/2 top-[212.05px] m-0 -translate-x-1/2 whitespace-nowrap font-noontree text-[40px] font-bold leading-[48px]"
          style={{ color: INK, ...DHM }}
        >
          {amount}
        </p>
        <div className="absolute left-1/2 top-[331.77px] -translate-x-1/2">
          <StatusBadge tone="new" label="New task" />
        </div>
      </div>
    )
  } else if (type === 'Task') {
    const ok = status === 'Success'
    card = (
      <div data-name="Card" className={`${base} gap-4 bg-gradient-to-b from-white via-white via-40% p-[22px] ${ok ? 'to-[#ddf7ea]' : 'to-[#ffe4e4]'}`}>
        <StatusBadge tone={ok ? 'green' : 'error'} label={ok ? 'Approved' : 'Not done yet'} />
        {ok && <Amount tone="green">{amount}</Amount>}
        <div data-name="Content" className="flex w-full flex-col items-start gap-1 overflow-clip">
          <Title strike={ok}>{title}</Title>
          <Meta meta={meta} />
        </div>
        <Photos />
      </div>
    )
  } else if (type === 'Top-up') {
    const ok = status === 'Success'
    card = (
      <div
        data-name="Card"
        className={`${base} gap-[18px] px-[22px] pb-5 pt-[22px] ${ok ? '' : 'bg-gradient-to-b from-white via-white via-40% to-[#ffe4e4]'}`}
        style={ok ? { backgroundImage: 'linear-gradient(-0.68deg, #75b8f7 44.13%, #fff 78.46%), linear-gradient(90deg, #fbf0fe, #fbf0fe)' } : undefined}
      >
        <div data-name="Head" className="flex w-full flex-col items-start gap-6 overflow-clip">
          <StatusBadge tone={ok ? 'blue' : 'error'} label={ok ? 'Topup received' : 'Topup declined'} />
          <div data-name="Amount & title" className="flex flex-col items-start gap-2">
            <Amount tone={ok ? 'blue' : 'grey'}>{amount}</Amount>
            <p className="m-0 w-[276px] font-noontree text-[24px] font-semibold leading-8 tracking-[-0.25px]" style={{ color: INK }}>
              {title}
            </p>
          </div>
        </div>
        <p className="m-0 whitespace-nowrap font-noontree text-[14px] font-medium leading-5 tracking-[-0.1px] text-[#475067]">{meta}</p>
        <div data-name="Wallet art" className="flex w-full flex-col items-start pt-5">
          <div className="relative aspect-[404/286] w-full overflow-hidden" style={ok ? undefined : { opacity: 0.55 }}>
            <img
              src={walletArt}
              alt=""
              className={ok ? 'absolute left-[-1.2%] top-[-5.57%] h-[109.48%] w-[102.39%] max-w-none' : 'absolute inset-0 size-full object-bottom'}
              style={ok ? undefined : { filter: 'grayscale(1)' }}
            />
          </div>
        </div>
      </div>
    )
  } else {
    // Order × marketplace
    const ok = status === 'Success'
    const mp = MARKETPLACE[m]
    const start = mp.products === 'start'
    card = (
      <div
        data-name="Card"
        className={`${base} gap-4 p-[22px] ${ok ? '' : 'bg-gradient-to-b from-white to-[#e2e4ea]'}`}
        style={ok ? { backgroundImage: `linear-gradient(154.1deg, #fff 23.48%, ${mp.tint} 99.33%)` } : undefined}
      >
        <MarketplaceArt m={m} declined={!ok} note={note} />
        <StatusBadge tone={ok ? 'green' : 'error'} label={ok ? 'Approved & ordered' : 'Not approved'} bordered={ok} />
        {note ? (
          <>
            <div data-name="Content" className="relative flex w-full flex-col items-start gap-1 overflow-clip">
              <Title>{title}</Title>
              <Meta meta={meta} />
            </div>
            <Products size={start ? 'md' : 'sm'} align={start ? 'start' : 'center'} className="h-[112px] shrink-0" />
            {mp.noteFooter ? (
              <img src={mp.noteFooter.src} alt={m} className={`absolute left-[22px] w-[291px] ${mp.noteFooter.className}`} />
            ) : (
              <div className="absolute left-[22px] top-[268px] w-[291px]">
                <Logo m={m} />
              </div>
            )}
          </>
        ) : (
          <>
            <div data-name="Content" className={`relative flex w-full flex-col items-start gap-2 overflow-clip pb-3 ${m === 'food' && ok ? '' : 'pt-3'}`}>
              <Title>{title}</Title>
              <Meta meta={meta} />
            </div>
            <Products size="lg" align={start ? 'start' : 'center'} className="min-h-px flex-1" />
            <Logo m={m} />
          </>
        )}
      </div>
    )
  }

  return (
    <div data-id={`nano-update-${update.id}`} data-type={type} data-status={status} className="relative h-[400px] w-[335px] rounded-[24px]">
      {note ? <WithNote message={message}>{card}</WithNote> : card}
      <Pressed on={pressed} inset={type === 'Task' && status === 'Received' ? '-inset-1' : note ? 'inset-x-0 top-0 h-[330px]' : 'inset-0'} />
    </div>
  )
}

// memo: a swipe re-renders the overlay, but a card only changes when its update or pressed state does
export default memo(NotificationCard)

/** art the sample stack shows first — preloaded on idle so the first open doesn't pop images in */
export const CARD_ART = [photo1, photo2, photo3, walletArt, productBottle, productCafe, artNoon, artSupermallNote, logoNoon, logoSupermall, footerSupermallNote]
