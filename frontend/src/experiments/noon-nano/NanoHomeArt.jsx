import aFHandL from '../../assets/nano/home/f-hand-l.png'
import aFHandR from '../../assets/nano/home/f-hand-r.png'
import aFSparkle from '../../assets/nano/home/f-sparkle.png'
import aGBg from '../../assets/nano/home/g-bg.png'
import aGClouds from '../../assets/nano/home/g-clouds.png'
import aGDark from '../../assets/nano/home/g-dark.svg'
import aGDiamond from '../../assets/nano/home/g-diamond.svg'
import aGEllipse1 from '../../assets/nano/home/g-ellipse-1.svg'
import aGEllipse2 from '../../assets/nano/home/g-ellipse-2.svg'
import aGLights from '../../assets/nano/home/g-lights.svg'
import aGLogo from '../../assets/nano/home/g-logo.png'
import aGMask from '../../assets/nano/home/g-mask.svg'
import aGOut from '../../assets/nano/home/g-out.svg'
import aGPattern1 from '../../assets/nano/home/g-pattern-1.svg'
import aGPattern2 from '../../assets/nano/home/g-pattern-2.svg'
import aGStar from '../../assets/nano/home/g-star.svg'
import aGStripesL from '../../assets/nano/home/g-stripes-l.svg'
import aGStripesR from '../../assets/nano/home/g-stripes-r.svg'
import aGTrack from '../../assets/nano/home/g-track.png'
import aGUnderline from '../../assets/nano/home/g-underline.svg'
import aGUnion from '../../assets/nano/home/g-union.svg'
import aMFood1 from '../../assets/nano/home/m-food-1.png'
import aMFoodBurger from '../../assets/nano/home/m-food-burger.png'
import aMFoodDeco from '../../assets/nano/home/m-food-deco.svg'
import aMFoodEllipse from '../../assets/nano/home/m-food-ellipse.svg'
import aMFoodFace from '../../assets/nano/home/m-food-face.png'
import aMFoodHeading from '../../assets/nano/home/m-food-heading.svg'
import aMFoodMask from '../../assets/nano/home/m-food-mask.svg'
import aMMinBadge from '../../assets/nano/home/m-min-badge.svg'
import aMMinCoke from '../../assets/nano/home/m-min-coke.png'
import aMMinDeco from '../../assets/nano/home/m-min-deco.svg'
import aMMinEllipse from '../../assets/nano/home/m-min-ellipse.svg'
import aMMinHeading from '../../assets/nano/home/m-min-heading.svg'
import aMMinLays from '../../assets/nano/home/m-min-lays.png'
import aMMinMask from '../../assets/nano/home/m-min-mask.svg'
import aMMinObject from '../../assets/nano/home/m-min-object.png'
import aMNoon1 from '../../assets/nano/home/m-noon-1.png'
import aMNoon2 from '../../assets/nano/home/m-noon-2.png'
import aMNoonDeco from '../../assets/nano/home/m-noon-deco.svg'
import aMNoonDetail from '../../assets/nano/home/m-noon-detail.png'
import aMNoonEllipse from '../../assets/nano/home/m-noon-ellipse.svg'
import aMNoonHeading from '../../assets/nano/home/m-noon-heading.svg'
import aMNoonMask from '../../assets/nano/home/m-noon-mask.svg'
import aMSmArt from '../../assets/nano/home/m-sm-art.png'
import aMSmBadge from '../../assets/nano/home/m-sm-badge.svg'
import aMSmDeco from '../../assets/nano/home/m-sm-deco.svg'
import aMSmEllipse from '../../assets/nano/home/m-sm-ellipse.svg'
import aMSmHeading1 from '../../assets/nano/home/m-sm-heading-1.svg'
import aMSmHeading2 from '../../assets/nano/home/m-sm-heading-2.svg'
import aMSmProduct from '../../assets/nano/home/m-sm-product.png'
import aMSubtract from '../../assets/nano/home/m-subtract.svg'
import aPBadge from '../../assets/nano/home/p-badge.png'
import aPCard from '../../assets/nano/home/p-card.png'
import aPDivider from '../../assets/nano/home/p-divider.svg'
import aPGrid from '../../assets/nano/home/p-grid.svg'
import aPLine from '../../assets/nano/home/p-line.svg'
import aPSparkle from '../../assets/nano/home/p-sparkle.png'
import aPUnion from '../../assets/nano/home/p-union.svg'
import aRectFade from '../../assets/nano/home/rect-fade.svg'
import aSwFood from '../../assets/nano/home/sw-food.svg'
import aSwMins from '../../assets/nano/home/sw-mins.png'
import aSwNanoBottom from '../../assets/nano/home/sw-nano-bottom.svg'
import aSwNanoTop from '../../assets/nano/home/sw-nano-top.svg'
import aSwNoonMask from '../../assets/nano/home/sw-noon-mask.svg'
import aSwNoonWord from '../../assets/nano/home/sw-noon-word.svg'
import aSwSupermall1 from '../../assets/nano/home/sw-supermall-1.svg'
import aSwSupermall2 from '../../assets/nano/home/sw-supermall-2.svg'
import aWBg from '../../assets/nano/home/w-bg.png'
import aWCactus from '../../assets/nano/home/w-cactus.png'
import aWCard from '../../assets/nano/home/w-card.png'
import aWEmpty from '../../assets/nano/home/w-empty.png'
import aWPlus from '../../assets/nano/home/w-plus.svg'
import aWShadowL from '../../assets/nano/home/w-shadow-l.svg'
import aWShadowR from '../../assets/nano/home/w-shadow-r.svg'

/**
 * NanoHomeArt — the noon nano Kids home artwork.
 *
 * The Figma Kids-Side "Home - Full screen" frame (492:26324) mapped 1:1 at its
 * native 375px width: brand switcher, wallet hero ("Wallet is Ready"), the four
 * marketplace cards, the customise-your-profile card, the Lights Out game
 * carousel and the "Shop, Earn & Save" footer. Every section sits at its Figma
 * coordinates with the export's own values (data-node-id = the Figma layer).
 *
 * Height is the frame minus its 144px bottom nav (2409px); the status bar is
 * left to the AppShell. Scale it to the screen width with a wrapper (see
 * index.jsx). Differences from the export, each to match the Figma render: the
 * title's white outline (not exported) is a stroked underlay; marketplace
 * product shots drop their layer blurs (the render shows them crisp); the
 * "win dhm5" badge sets tracking 0 so Chrome keeps Noontree's dirham ligature;
 * the condensed pixel face isn't available, so a mono fallback is squeezed to
 * its text box; Space Grotesk falls back to Noontree.
 */

/** artwork size in Figma px */
export const NANO_HOME_ART = { width: 375, height: 2409 }

export default function NanoHomeArt() {
  return (
    <div data-id="nano-home-art" className="relative h-[2409px] w-[375px] overflow-x-clip bg-white">
      {/* ── Footer 492:26325 ── */}
      <div data-id="nano-home-footer" className="absolute" style={{ left: '0', top: '2139.5928px', width: '375px', height: '260px' }}>
        <div className="relative size-full" data-node-id="492:26325" data-name="Footer">
          <div className="-translate-x-1/2 absolute bg-gradient-to-b bottom-0 from-[26.784%] from-white h-[260px] left-1/2 to-[102.33%] to-white via-[68.163%] via-[rgba(210,210,210,0.6)] w-[375px]" data-node-id="492:26326"></div>
          <div className="-translate-x-1/2 -translate-y-1/2 absolute contents left-1/2 top-[calc(50%-10.59px)]" data-node-id="492:26327">
            <div className="-translate-x-1/2 absolute flex h-[53.876px] items-center justify-center left-1/2 top-[calc(50%-53.09px)] w-[107.552px]" data-node-id="492:26328">
              <div className="flex-none rotate-[-3.25deg]">
                <p className="[word-break:break-word] bg-clip-text font-noontree font-extrabold leading-[48px] relative text-[length:40px] text-[transparent] text-center tracking-[-0.25px] whitespace-nowrap m-0" style={{ backgroundImage: 'linear-gradient(180.15439653738872deg, rgb(210, 210, 210) 34.456%, rgb(61, 61, 61) 176.93%)' }}>Shop,</p>
              </div>
            </div>
            <p className="-translate-x-1/2 [word-break:break-word] absolute bg-clip-text font-noontree font-extrabold leading-[48px] left-1/2 text-[length:40px] text-[transparent] text-center top-[calc(50%-16.08px)] tracking-[-0.25px] whitespace-nowrap m-0" data-node-id="492:26329" style={{ backgroundImage: 'linear-gradient(180.07505401108216deg, rgb(210, 210, 210) 34.456%, rgb(61, 61, 61) 176.93%)' }}>Earn &amp; Save</p>
          </div>
          <div className="absolute h-[144.505px] left-[177.37px] top-[102.55px] w-[278.141px]" data-node-id="492:26330">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aFHandR} />
          </div>
          <div className="absolute flex h-[35.605px] items-center justify-center left-[67.63px] top-[69.31px] w-[36.568px]" data-node-id="492:26331">
            <div className="flex-none rotate-[-27.62deg]">
              <div className="h-[25.598px] opacity-80 relative w-[27.877px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[186.85%] left-[-35.2%] max-w-none top-[-74.28%] w-[171.57%]" src={aFSparkle} />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[26.864px] items-center justify-center left-[302.41px] top-[110.12px] w-[28.063px]" data-node-id="492:26332">
            <div className="flex-none rotate-[17.88deg]">
              <div className="h-[20.888px] opacity-80 relative w-[22.749px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[186.85%] left-[-35.2%] max-w-none top-[-74.28%] w-[171.57%]" src={aFSparkle} />
                </div>
              </div>
            </div>
          </div>
          <div className="-translate-x-1/2 absolute h-[186.747px] left-[calc(50%-116.15px)] top-[88.25px] w-[248.997px]" data-node-id="492:26333">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aFHandL} />
          </div>
        </div>
      </div>

      {/* ── Game 492:26334 ── */}
      <div data-id="nano-home-game" className="absolute" style={{ left: '0', top: '1599.5px', width: '375px', height: '610px' }}>
        <div className="relative size-full" data-node-id="492:26334" data-name="Game">
          <div className="absolute h-[607px] left-0 top-[1.5px] w-[375px]" data-node-id="492:26335">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={aGUnion} />
          </div>
          <div className="absolute contents left-0 top-[1.5px]" data-node-id="492:26339">
            <div className="-translate-x-1/2 absolute contents left-[calc(50%+0.03px)] top-[-58.71px]" data-node-id="492:26341">
              <div className="-translate-x-1/2 absolute contents left-[calc(50%+0.03px)] top-[-58.71px]" data-node-id="492:26342">
                <div className="-translate-x-1/2 absolute blur-[2px] h-[728px] left-[calc(50%-0.32px)] top-[-58.71px] w-[410px]" data-node-id="492:26343" style={{ maskImage: `url(${aGMask})`, WebkitMaskImage: `url(${aGMask})`, maskMode: 'alpha', maskComposite: 'intersect', maskClip: 'no-clip', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: '17.815px 60.213px', WebkitMaskPosition: '17.815px 60.213px', maskSize: '375px 607px', WebkitMaskSize: '375px 607px' }}>
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aGBg} />
                </div>
                <div className="-translate-x-1/2 absolute bg-gradient-to-b from-[49.714%] from-[rgba(0,0,0,0.1)] h-[728px] left-[calc(50%+0.03px)] to-[131.18%] to-black top-[-58.71px] w-[410.688px]" data-node-id="492:26344" style={{ maskImage: `url(${aGMask})`, WebkitMaskImage: `url(${aGMask})`, maskMode: 'alpha', maskComposite: 'intersect', maskClip: 'no-clip', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: '17.815px 60.213px', WebkitMaskPosition: '17.815px 60.213px', maskSize: '375px 607px', WebkitMaskSize: '375px 607px' }}></div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-[-0.15px] content-stretch flex flex-col h-[100px] items-center justify-center left-[0.31px] py-[30px] w-[375px]" data-node-id="492:26345">
            <div className="border-[3px] border-solid border-white content-stretch flex gap-[6px] h-[52px] items-center justify-center overflow-clip px-[14px] py-[16px] relative rounded-[9999px] shrink-0 w-[200px]" data-id="nano-home-play" data-node-id="492:26346" data-name="M-NeutralButton">
              <div aria-hidden className="absolute bg-[#212121] inset-0 pointer-events-none rounded-[9999px]"></div>
              <p className="[word-break:break-word] font-noontree font-bold leading-[24px] relative shrink-0 text-[color:white] text-[length:16px] tracking-[0px] whitespace-nowrap m-0" data-node-id="492:26347">Play Now</p>
              <div className="absolute inset-[-3px] pointer-events-none rounded-[inherit] shadow-[inset_0px_-8px_5px_0px_black,inset_0px_4px_5px_0px_#a9a9a9]"></div>
            </div>
          </div>
          <div className="-translate-x-1/2 absolute content-stretch flex gap-[28px] items-center left-[calc(50%-0.3px)] top-[172px]" data-node-id="492:26349">
            {/* side card (left) */}
            <div className="blur-[2.5px] content-stretch flex flex-col items-center overflow-clip p-[4.2px] relative rounded-[14px] shadow-[0px_2.8px_11.9px_1.4px_rgba(255,255,255,0.11)] shrink-0 w-[172.2px]" data-node-id="492:26350">
              <div aria-hidden className="absolute bg-[#eddbff] inset-0 pointer-events-none rounded-[14px]"></div>
              <div className="border-[0.7px] border-solid border-white h-[210px] overflow-clip relative rounded-[11.2px] shrink-0 w-full" data-node-id="492:26351">
                <div aria-hidden className="absolute bg-[#1a1016] inset-0 pointer-events-none rounded-[11.2px]"></div>
                <div className="-translate-x-1/2 absolute bg-[#008afa] h-[568.4px] left-1/2 overflow-clip rounded-[14px] top-[-25.43px] w-[262.5px]" data-node-id="492:26352">
                  <div className="absolute contents inset-[-0.97%_-7.17%_0_-7.17%]" data-node-id="492:26353">
                    <div className="absolute inset-[-0.97%_-7.17%_50.49%_-7.17%] opacity-10" data-node-id="492:26354">
                      <div className="absolute inset-[-0.49%_-0.47%]"><img alt="" className="block max-w-none size-full" src={aGPattern1} /></div>
                    </div>
                    <div className="absolute inset-[49.51%_-7.17%_0_-7.17%] opacity-10" data-node-id="492:26446">
                      <div className="absolute inset-[-0.49%_-0.47%]"><img alt="" className="block max-w-none size-full" src={aGPattern2} /></div>
                    </div>
                  </div>
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[568.4px] left-1/2 top-1/2 w-[262.5px]" data-node-id="492:26538" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 262.5 568.4' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(1.7249e-15 8.9598 -8.9598 4.6227e-13 131.25 101.62)'><stop stop-color='rgba(156,228,252,1)' offset='0'/><stop stop-color='rgba(117,216,253,0.75)' offset='0.25'/><stop stop-color='rgba(79,204,254,0.5)' offset='0.5'/><stop stop-color='rgba(1,180,255,0)' offset='1'/></radialGradient></defs></svg>")` }}></div>
                  <div className="-translate-x-1/2 absolute bottom-0 h-[568.4px] left-1/2 w-[262.5px]" data-node-id="492:26539">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={aGDark} />
                  </div>
                  <div className="absolute content-stretch flex flex-col items-center left-[52.69px] top-[134.37px] w-[157.286px]" data-node-id="492:26540">
                    <div className="content-stretch flex gap-[5.637px] h-[20.295px] items-center justify-center mb-[-3.946px] relative shrink-0 w-full" data-node-id="492:26541">
                      <div className="h-[10.147px] relative shrink-0 w-[37.775px]" data-node-id="492:26542">
                        <div className="absolute inset-[-20.2%_-5.43%_-20.19%_0]"><img alt="" className="block max-w-none size-full" src={aGStar} /></div>
                      </div>
                      <p className="[word-break:break-word] font-noontree font-bold leading-[11.275px] relative shrink-0 text-[9.02px] text-center text-white tracking-[-0.0846px] whitespace-nowrap m-0" data-node-id="492:26547">FIND OBJECTS</p>
                      <div className="flex items-center justify-center relative shrink-0" data-node-id="492:26548">
                        <div className="-scale-y-100 flex-none rotate-180">
                          <div className="h-[10.147px] relative w-[37.775px]">
                            <div className="absolute inset-[-20.2%_-5.42%_-20.19%_0]"><img alt="" className="block max-w-none size-full" src={aGDiamond} /></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="[word-break:break-word] bg-clip-text bg-gradient-to-b flex flex-col font-noontree font-extrabold from-[50%] from-white justify-center leading-[0] min-w-full relative shrink-0 text-[18.04px] text-[transparent] text-center to-[#ffd105] tracking-[-0.1409px] w-[min-content]" data-node-id="492:26553">
                      <p className="leading-[22.55px] m-0">to win rewards</p>
                    </div>
                    <div className="absolute h-[14.376px] left-[5.14%] right-[5.72%] top-[19.45px]" data-node-id="492:26554">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={aGUnderline} />
                    </div>
                  </div>
                  <div className="-translate-x-1/2 absolute h-[47.895px] left-[calc(50%+0.09px)] top-[86.48px] w-[132.668px]" data-node-id="492:26557">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aGLogo} />
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_12.6px_6.3px_rgba(0,0,0,0.55)]"></div>
              </div>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_2.8px_1.4px_rgba(255,255,255,0.9)]"></div>
            </div>
            {/* centre card: Lights Out */}
            <div className="content-stretch flex flex-col items-center overflow-clip p-[6px] relative rounded-[20px] shadow-[0px_4px_17px_2px_rgba(255,255,255,0.11)] shrink-0 w-[246px]" data-node-id="492:26558">
              <div aria-hidden className="absolute bg-[#eddbff] inset-0 pointer-events-none rounded-[20px]"></div>
              <div className="border border-solid border-white h-[300px] overflow-clip relative rounded-[16px] shrink-0 w-full" data-node-id="492:26559">
                <div aria-hidden className="absolute bg-[#1a1016] inset-0 pointer-events-none rounded-[16px]"></div>
                <div className="-translate-x-1/2 absolute bg-[#1d49a4] h-[530px] left-1/2 overflow-clip rounded-[12.582px] top-[-36.32px] w-[245px]" data-node-id="492:26560">
                  <div className="-translate-x-1/2 absolute bg-[#1d49a4] h-[594px] left-[calc(50%-0.04px)] overflow-clip top-[-246.68px] w-[274px]" data-node-id="492:26561">
                    <div className="-translate-x-1/2 absolute h-[593.922px] left-[calc(50%+3.74px)] top-[26.04px] w-[398.293px]" data-node-id="492:26562"></div>
                    <div className="absolute h-[653.176px] left-[-19.48px] top-[-50.67px] w-[302.524px]" data-node-id="492:26563">
                      <img alt="" className="absolute inset-0 max-w-none object-bottom pointer-events-none size-full" src={aGTrack} />
                    </div>
                    <div className="absolute blur-[2.111px] h-[265.277px] left-[92.18px] top-[-95px] w-[486.288px]" data-node-id="492:26564">
                      <img alt="" className="absolute inset-0 max-w-none object-cover opacity-75 pointer-events-none size-full" src={aGClouds} />
                    </div>
                    <div className="absolute flex h-[587.598px] items-center justify-center left-[-146.69px] top-[-180.75px] w-[591.937px]" data-node-id="492:26565">
                      <div className="rotate-[-60deg] flex-none">
                        <div className="h-[437.668px] relative w-[425.812px]">
                          <div className="absolute inset-[-55.04%_-56.57%]"><img alt="" className="block max-w-none size-full" src={aGEllipse1} /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute blur-[1.887px] h-[237.163px] left-[82.41px] top-[-84.93px] w-[434.752px]" data-node-id="492:26566">
                    <img alt="" className="absolute inset-0 max-w-none object-cover opacity-75 pointer-events-none size-full" src={aGClouds} />
                  </div>
                  <div className="absolute flex h-[525.325px] items-center justify-center left-[-131.14px] top-[-331.46px] w-[529.204px]" data-node-id="492:26567">
                    <div className="rotate-[-60deg] flex-none">
                      <div className="h-[391.284px] relative w-[380.685px]">
                        <div className="absolute inset-[-55.04%_-56.57%]"><img alt="" className="block max-w-none size-full" src={aGEllipse2} /></div>
                      </div>
                    </div>
                  </div>
                  <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[15px] items-center left-[calc(50%+0.5px)] top-[91.94px] w-[245px]" data-node-id="492:26568">
                    <div className="content-stretch flex gap-[14px] items-center justify-center relative shrink-0 w-[232px]" data-node-id="492:26569">
                      <div className="h-[21.39px] relative shrink-0 w-[35.231px]" data-node-id="492:26570">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={aGStripesL} />
                      </div>
                      <div className="content-stretch flex flex-col gap-[3.146px] items-center relative shrink-0" data-node-id="492:26573">
                        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-node-id="492:26574">
                          <div className="col-start-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-start-1" data-node-id="492:26575">
                            <div className="col-start-1 h-[19.359px] ml-0 mt-0 relative row-start-1 w-[144.128px]" data-node-id="492:26576">
                              <img alt="" className="absolute block inset-0 max-w-none size-full" src={aGLights} />
                            </div>
                          </div>
                        </div>
                        <div className="h-[16.279px] relative shrink-0 w-[76.425px]" data-node-id="492:26584">
                          <img alt="" className="absolute block inset-0 max-w-none size-full" src={aGOut} />
                        </div>
                      </div>
                      <div className="h-[21.39px] relative shrink-0 w-[33.343px]" data-node-id="492:26588">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={aGStripesR} />
                      </div>
                    </div>
                    <p className="[word-break:break-word] font-noontree font-medium h-[44px] leading-[22px] relative shrink-0 text-[18px] text-center text-white tracking-[-0.4px] w-[228.188px] m-0" data-node-id="492:26591">React faster &amp; win coupons!</p>
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_18px_9px_rgba(0,0,0,0.55)]"></div>
              </div>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_4px_2px_rgba(255,255,255,0.9)]"></div>
            </div>
            {/* side card (right) */}
            <div className="blur-[2.5px] content-stretch flex flex-col items-center overflow-clip p-[4.2px] relative rounded-[14px] shadow-[0px_2.8px_11.9px_1.4px_rgba(255,255,255,0.11)] shrink-0 w-[172.2px]" data-node-id="492:26592">
              <div aria-hidden className="absolute bg-[#eddbff] inset-0 pointer-events-none rounded-[14px]"></div>
              <div className="border-[0.7px] border-solid border-white h-[210px] overflow-clip relative rounded-[11.2px] shrink-0 w-full" data-node-id="492:26593">
                <div aria-hidden className="absolute bg-[#1a1016] inset-0 pointer-events-none rounded-[11.2px]"></div>
                <div className="-translate-x-1/2 absolute bg-[#008afa] h-[568.4px] left-1/2 overflow-clip rounded-[14px] top-[-25.43px] w-[262.5px]" data-node-id="492:26594">
                  <div className="absolute contents inset-[-0.97%_-7.17%_0_-7.17%]" data-node-id="492:26595">
                    <div className="absolute inset-[-0.97%_-7.17%_50.49%_-7.17%] opacity-10" data-node-id="492:26596">
                      <div className="absolute inset-[-0.49%_-0.47%]"><img alt="" className="block max-w-none size-full" src={aGPattern1} /></div>
                    </div>
                    <div className="absolute inset-[49.51%_-7.17%_0_-7.17%] opacity-10" data-node-id="492:26688">
                      <div className="absolute inset-[-0.49%_-0.47%]"><img alt="" className="block max-w-none size-full" src={aGPattern2} /></div>
                    </div>
                  </div>
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[568.4px] left-1/2 top-1/2 w-[262.5px]" data-node-id="492:26780" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 262.5 568.4' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(1.7249e-15 8.9598 -8.9598 4.6227e-13 131.25 101.62)'><stop stop-color='rgba(156,228,252,1)' offset='0'/><stop stop-color='rgba(117,216,253,0.75)' offset='0.25'/><stop stop-color='rgba(79,204,254,0.5)' offset='0.5'/><stop stop-color='rgba(1,180,255,0)' offset='1'/></radialGradient></defs></svg>")` }}></div>
                  <div className="-translate-x-1/2 absolute bottom-0 h-[568.4px] left-1/2 w-[262.5px]" data-node-id="492:26781">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={aGDark} />
                  </div>
                  <div className="absolute content-stretch flex flex-col items-center left-[52.69px] top-[134.37px] w-[157.286px]" data-node-id="492:26782">
                    <div className="content-stretch flex gap-[5.637px] h-[20.295px] items-center justify-center mb-[-3.946px] relative shrink-0 w-full" data-node-id="492:26783">
                      <div className="h-[10.147px] relative shrink-0 w-[37.775px]" data-node-id="492:26784">
                        <div className="absolute inset-[-20.2%_-5.43%_-20.19%_0]"><img alt="" className="block max-w-none size-full" src={aGStar} /></div>
                      </div>
                      <p className="[word-break:break-word] font-noontree font-bold leading-[11.275px] relative shrink-0 text-[9.02px] text-center text-white tracking-[-0.0846px] whitespace-nowrap m-0" data-node-id="492:26789">FIND OBJECTS</p>
                      <div className="flex items-center justify-center relative shrink-0" data-node-id="492:26790">
                        <div className="-scale-y-100 flex-none rotate-180">
                          <div className="h-[10.147px] relative w-[37.775px]">
                            <div className="absolute inset-[-20.2%_-5.42%_-20.19%_0]"><img alt="" className="block max-w-none size-full" src={aGDiamond} /></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="[word-break:break-word] bg-clip-text bg-gradient-to-b flex flex-col font-noontree font-extrabold from-[50%] from-white justify-center leading-[0] min-w-full relative shrink-0 text-[18.04px] text-[transparent] text-center to-[#ffd105] tracking-[-0.1409px] w-[min-content]" data-node-id="492:26795">
                      <p className="leading-[22.55px] m-0">to win rewards</p>
                    </div>
                    <div className="absolute h-[14.376px] left-[5.14%] right-[5.72%] top-[19.45px]" data-node-id="492:26796">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={aGUnderline} />
                    </div>
                  </div>
                  <div className="-translate-x-1/2 absolute h-[47.895px] left-[calc(50%+0.09px)] top-[86.48px] w-[132.668px]" data-node-id="492:26799">
                    <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aGLogo} />
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_12.6px_6.3px_rgba(0,0,0,0.55)]"></div>
              </div>
              <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_2.8px_1.4px_rgba(255,255,255,0.9)]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Wallet 492:26800 ── */}
      <div data-id="nano-home-wallet" className="absolute" style={{ left: '0', top: '-0.5px', width: '375px', height: '577px' }}>
        <div className="bg-white overflow-clip relative rounded-bl-[24px] rounded-br-[24px] size-full" data-node-id="492:26800" data-name="Wallet">
          <div className="-translate-x-1/2 absolute h-[772.922px] left-1/2 top-[-64.09px] w-[435px]" data-node-id="492:26801">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aWBg} />
          </div>
          <div className="absolute h-[590px] mix-blend-overlay right-0 top-[0.5px] w-[375px]" data-node-id="492:26802" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 375 590' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-8.3988e-15 30.489 -19.378 -5.0993e-14 187.5 271.05)'><stop stop-color='rgba(3,25,74,0)' offset='0.61605'/><stop stop-color='rgba(3,25,74,1)' offset='1'/></radialGradient></defs></svg>")` }}></div>
          <div className="absolute border-[3px] border-solid border-white content-stretch flex gap-[6px] h-[40px] items-center justify-center left-[116.5px] max-h-[40px] min-h-[40px] overflow-clip px-[14px] py-[16px] rounded-[9999px] top-[480px] w-[143px]" data-id="nano-home-topup" data-node-id="492:26803" data-name="M-NeutralButton">
            <div aria-hidden className="absolute bg-[#212121] inset-0 pointer-events-none rounded-[9999px]"></div>
            <div className="relative shrink-0 size-[20px]" data-node-id="492:26804">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={aWPlus} />
            </div>
            <p className="[word-break:break-word] font-noontree font-semibold leading-[20px] relative shrink-0 text-[color:white] text-[length:14px] tracking-[0px] whitespace-nowrap m-0" data-node-id="492:26805">Top up wallet</p>
            <div className="absolute inset-[-3px] pointer-events-none rounded-[inherit] shadow-[inset_0px_-8px_5px_0px_black,inset_0px_4px_5px_0px_#a9a9a9]"></div>
          </div>
          <div className="[word-break:break-word] absolute content-stretch flex flex-col gap-[8px] items-center left-0 text-center top-[385.69px] w-[375px]" data-node-id="492:26807">
            <p className="font-noontree font-semibold leading-[22px] relative shrink-0 text-[color:rgba(255,255,255,0.8)] text-[length:16px] tracking-[-0.15px] w-full m-0" data-node-id="492:26808">Ask your parents to add money </p>
            {/* the title's outside white stroke isn't in the export: a stroked copy sits behind the gradient fill */}
            <p aria-hidden className="absolute left-0 top-[30px] w-full font-noontree font-bold leading-[40px] text-[length:32px] tracking-[-0.25px] text-white m-0" style={{ WebkitTextStroke: '6px #fff', textShadow: '0px 1px 7px rgba(0,0,0,0.15)' }}>Wallet is Ready</p>
            <p className="bg-clip-text font-noontree font-bold leading-[40px] relative shrink-0 text-[length:32px] text-[transparent] tracking-[-0.25px] w-full m-0" data-node-id="492:26809" style={{ backgroundImage: 'linear-gradient(27.096631881753503deg, rgb(0, 0, 0) 41.842%, rgb(121, 36, 255) 77.963%)', textShadow: '0px 1px 7px rgba(0,0,0,0.15)' }}>Wallet is Ready</p>
          </div>
          <div className="-translate-x-1/2 absolute h-[192.15px] left-1/2 shadow-[0px_5px_10px_0px_rgba(0,0,0,0.55)] top-[171.27px] w-[272px]" data-node-id="492:26810">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aWCard} />
          </div>
          <div className="absolute flex h-[71.02px] items-center justify-center left-[5.87px] top-[196.32px] w-[110.631px]" data-node-id="492:26811">
            <div className="rotate-[-20deg] flex-none">
              <div className="h-[37.725px] relative shadow-[-2px_7px_4px_0px_rgba(0,0,0,0.32)] w-[104px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[136.75%] left-0 max-w-none top-[-18.25%] w-full" src={aWEmpty} />
                </div>
              </div>
            </div>
          </div>
          <div className="-translate-x-1/2 absolute contents left-[calc(50%+186.3px)] top-[324.01px]" data-node-id="492:26812">
            <div className="-translate-x-1/2 absolute h-[34.65px] left-[calc(50%+192.48px)] top-[368.04px] w-[128.232px]" data-node-id="492:26813">
              <div className="absolute inset-[-86.58%_-23.4%_-86.58%_-20.32%]"><img alt="" className="block max-w-none size-full" src={aWShadowR} /></div>
            </div>
            <div className="-translate-x-1/2 absolute flex h-[50.837px] items-center justify-center left-[calc(50%+142.47px)] top-[324.01px] w-[52.918px]" data-node-id="492:26814">
              <div className="-scale-y-100 flex-none rotate-180">
                <div className="h-[50.837px] relative w-[52.918px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="" className="absolute h-[104.09%] left-0 max-w-none top-0 w-full" src={aWCactus} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="-translate-x-1/2 absolute contents left-[calc(50%-109.21px)] top-[306.55px]" data-node-id="492:26815">
            <div className="-translate-x-1/2 absolute contents left-[calc(50%-109.21px)] top-[306.55px]" data-node-id="492:26816">
              <div className="-translate-x-1/2 absolute h-[34.65px] left-[calc(50%-95.03px)] top-[376.04px] w-[128.232px]" data-node-id="492:26817">
                <div className="absolute inset-[-86.58%_-23.4%_-86.58%_-20.32%]"><img alt="" className="block max-w-none size-full" src={aWShadowL} /></div>
              </div>
              <div className="-translate-x-1/2 absolute h-[78.775px] left-[calc(50%-146.5px)] top-[306.55px] w-[82px]" data-node-id="492:26818">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[104.09%] left-0 max-w-none top-0 w-full" src={aWCactus} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── switcher 492:26835 ── */}
      <div data-id="nano-home-switcher" className="absolute" style={{ left: '0', top: '45px', width: '375px', height: '92px' }}>
        <div className="content-stretch flex gap-[6px] items-center px-[12px] py-[8px] relative size-full" data-node-id="492:26835" data-name="switcher">
          <div className="bg-[#7924ff] h-[76px] overflow-clip relative rounded-[15px] shrink-0 w-[73px]" data-id="nano-home-switcher-nano" data-node-id="492:26836">
            <div className="absolute contents inset-[28.25%_9.98%]" data-node-id="492:26838">
              <div className="absolute inset-[28.25%_26.09%_59.36%_26.09%]" data-node-id="492:26839"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aSwNanoTop} /></div>
              <div className="absolute inset-[43.63%_9.98%_28.25%_9.98%]" data-node-id="492:26844"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aSwNanoBottom} /></div>
            </div>
          </div>
          <div className="h-[76px] relative shrink-0 w-[73px]" data-id="nano-home-switcher-noon" data-node-id="492:26860">
            <div className="absolute contents left-0 top-0" data-node-id="492:26861">
              <div className="absolute bg-[white] inset-0 rounded-[15px]" data-node-id="492:26862"></div>
              <div className="absolute h-[29.5px] left-[19px] top-[17px] w-[39.5px]" data-node-id="492:26863"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aSwNoonMask} /></div>
            </div>
            <div className="absolute inset-[40.79%_16.26%_42.09%_15.07%]" data-node-id="492:26865"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aSwNoonWord} /></div>
          </div>
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-id="nano-home-switcher-supermall" data-node-id="492:26870">
            <div className="col-start-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-start-1" data-node-id="492:26873">
              <div className="bg-white col-start-1 h-[76px] ml-0 mt-0 opacity-95 relative rounded-[15px] row-start-1 w-[73px]" data-node-id="492:26874"></div>
            </div>
            <div className="col-start-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[12.44px] mt-[22px] place-items-start relative row-start-1" data-node-id="492:26875">
              <div className="col-start-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-start-1" data-node-id="492:26876">
                <div className="col-start-1 h-[15.58px] ml-0 mt-0 relative row-start-1 w-[49.115px]" data-node-id="492:26877"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aSwSupermall1} /></div>
                <div className="col-start-1 h-[15.559px] ml-0 mt-[15.93px] relative row-start-1 w-[34.806px]" data-node-id="492:26884"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aSwSupermall2} /></div>
              </div>
            </div>
          </div>
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-id="nano-home-switcher-food" data-node-id="492:26890">
            <div className="col-start-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-start-1" data-node-id="492:26893">
              <div className="bg-white col-start-1 h-[76px] ml-0 mt-0 opacity-95 relative rounded-[15px] row-start-1 w-[73px]" data-node-id="492:26894"></div>
              <div className="col-start-1 h-[28.968px] ml-[10.68px] mt-[23.28px] relative row-start-1 w-[51.315px]" data-node-id="492:26895"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aSwFood} /></div>
            </div>
          </div>
          <div className="h-[76px] relative shrink-0 w-[73px]" data-id="nano-home-switcher-minutes" data-node-id="492:26898">
            <div className="absolute contents inset-0" data-node-id="492:26899">
              <div className="absolute bg-white inset-0 opacity-95 rounded-[15px]" data-node-id="492:26900"></div>
            </div>
            <div className="absolute left-[8px] size-[57px] top-[10px]" data-node-id="492:26901"><img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aSwMins} /></div>
          </div>
          <div className="absolute bottom-full contents left-0 right-full top-0" data-node-id="492:26902"></div>
        </div>
      </div>

      {/* ── Marketplaces 492:26905 ── */}
      <div data-id="nano-home-marketplaces" className="absolute" style={{ left: '0', top: '493px', width: '375px', height: '512px' }}>
        <div className="content-stretch drop-shadow-[0px_-8px_12px_rgba(0,0,0,0.12)] flex flex-col gap-[10px] items-center justify-center pt-[30px] relative size-full" data-node-id="492:26905" data-name="Marketplaces">
          <div className="absolute h-[512px] left-[-0.31px] top-[7.41px] w-[375px]" data-node-id="492:26906">
            <div className="absolute inset-[-5.9%_-6.4%_-3.12%_-6.4%]"><img alt="" className="block max-w-none size-full" src={aMSubtract} /></div>
          </div>
          <div className="gap-x-[12px] gap-y-[12px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[repeat(2,fit-content(100%))] overflow-clip px-[16px] relative shrink-0 w-[375px]" data-node-id="492:26907">
            {/* noon */}
            <div className="bg-[#e79e9e] col-start-1 h-[190px] justify-self-stretch overflow-clip relative rounded-[24px] row-start-1 shrink-0" data-id="nano-home-mp-noon" data-node-id="492:26908">
              <div className="absolute bg-[#fedc00] left-[-30px] size-[221px] top-[-11px]" data-node-id="492:26909"></div>
              <div className="absolute h-[169px] left-[-0.69%] right-[-6.19%] top-[21px]" data-node-id="492:26910"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMNoonMask} /></div>
              <div className="absolute flex h-[193.078px] items-center justify-center left-[-73.29px] top-[58.83px] w-[217.233px]" data-node-id="492:26913">
                <div className="flex-none rotate-[0.81deg]">
                  <div className="h-[190.072px] relative w-[214.574px]"><img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aMNoon1} /></div>
                </div>
              </div>
              <div className="absolute flex h-[195.389px] items-center justify-center left-[22.88px] top-[41.93px] w-[211.142px]" data-node-id="492:26914">
                <div className="flex-none rotate-[-12.38deg]">
                  <div className="h-[160.309px] relative w-[180.975px]"><img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aMNoon2} /></div>
                </div>
              </div>
              <div className="absolute flex h-[95.401px] items-center justify-center left-[4.56px] mix-blend-soft-light top-[64.53px] w-[95.402px]" data-node-id="492:26915">
                <div className="flex-none rotate-[-1.31deg]">
                  <div className="h-[93.29px] relative w-[93.291px]">
                    <div className="absolute inset-[-39.28%]"><img alt="" className="block max-w-none size-full" src={aMNoonEllipse} /></div>
                  </div>
                </div>
              </div>
              <div className="absolute flex inset-[24.66%_5.72%_0.69%_3.87%] items-center justify-center" data-node-id="492:26916" style={{ containerType: 'size' }}>
                <div className="flex-none h-[100cqw] rotate-90 w-[100cqh]">
                  <div className="relative size-full"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMNoonDeco} /></div>
                </div>
              </div>
              <div className="absolute flex h-[81.552px] items-center justify-center left-[38.31px] top-[58.76px] w-[103.67px]" data-node-id="492:26929">
                <div className="-scale-y-100 flex-none rotate-[94.9deg]">
                  <div className="h-[97.748px] relative w-[73.465px]"><img alt="" className="absolute inset-0 max-w-none object-bottom pointer-events-none size-full" src={aMNoonDetail} /></div>
                </div>
              </div>
              <div className="-translate-x-1/2 absolute h-[47px] left-1/2 top-[19px] w-[105px]" data-node-id="492:26930">
                <div className="-translate-x-1/2 absolute h-[14px] left-1/2 top-0 w-[55px]" data-node-id="492:26931"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMNoonHeading} /></div>
                <div className="-translate-x-1/2 absolute bg-[#a55b01] content-stretch flex h-[22px] items-center justify-center left-1/2 px-[10px] py-[3px] rounded-[18px] top-[25px]" data-node-id="492:26936">
                  <p className="[word-break:break-word] font-noontree font-extrabold leading-[0] not-italic relative shrink-0 text-[13px] text-white tracking-[-0.05px] whitespace-nowrap m-0" data-node-id="492:26937" style={{ textShadow: '0px 2px 3px #401d00,0px 1px 1px #401d00,0px 0.6px 0px #995400' }}><span className="leading-[15.385px] text-[#f9e24c]">20M+</span><span className="leading-[15.385px]"> Products</span></p>
                </div>
              </div>
            </div>
            {/* food */}
            <div className="col-2 justify-self-stretch overflow-clip relative rounded-[24px] row-start-1 self-stretch shrink-0" data-id="nano-home-mp-food" data-node-id="492:26938">
              <div className="absolute left-[-30px] pointer-events-none size-[221px] top-[-11px]" data-node-id="492:26939">
                <div aria-hidden className="absolute bg-[#ff1367] inset-0"></div>
                <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_4px_0px_rgba(0,0,0,0.25)]"></div>
              </div>
              <div className="absolute h-[169px] left-[-0.69%] right-[-6.19%] top-[21px]" data-node-id="492:26940"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMFoodMask} /></div>
              <div className="absolute flex inset-[24.66%_5.72%_0.69%_7.91%] items-center justify-center" data-node-id="492:26943" style={{ containerType: 'size' }}>
                <div className="flex-none h-[100cqw] rotate-90 w-[100cqh]">
                  <div className="relative size-full"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMFoodDeco} /></div>
                </div>
              </div>
              <div className="absolute h-[158.53px] left-[-52.96px] pointer-events-none top-[68.36px] w-[178.966px]" data-node-id="492:26955">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={aMFood1} />
                <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_4px_0px_rgba(0,0,0,0.25)]"></div>
              </div>
              <div className="absolute contents left-[40.03px] top-[82.25px]" data-node-id="492:26956">
                <div className="absolute flex h-[142.654px] items-center justify-center left-[40.03px] top-[82.25px] w-[153.168px]" data-node-id="492:26957">
                  <div className="flex-none rotate-[0.58deg]">
                    <div className="h-[141.123px] pointer-events-none relative w-[151.745px]">
                      <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={aMFoodBurger} />
                      <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_4px_0px_rgba(0,0,0,0.25)]"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute flex items-center justify-center left-[65.56px] mix-blend-soft-light size-[95.324px] top-[94.04px]" data-node-id="492:26958">
                  <div className="flex-none rotate-[-1.31deg]">
                    <div className="relative size-[93.215px]">
                      <div className="absolute inset-[-39.28%]"><img alt="" className="block max-w-none size-full" src={aMFoodEllipse} /></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-[10%_33.88%_82.63%_33.88%]" data-node-id="492:26959"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMFoodHeading} /></div>
              <div className="-translate-x-1/2 absolute content-stretch flex h-[22px] items-center justify-center left-1/2 px-[10px] py-[3px] rounded-[18px] top-[44px]" data-node-id="492:26964">
                <div aria-hidden className="absolute bg-[#bd0043] inset-0 pointer-events-none rounded-[18px]"></div>
                <p className="[word-break:break-word] font-noontree font-extrabold leading-[0] not-italic relative shrink-0 text-[13px] text-white tracking-[-0.05px] whitespace-nowrap m-0" data-node-id="492:26965" style={{ textShadow: '0px 2px 3px #65021e,0px 1px 1px #65021e,0px 0.6px 0px #bd0043' }}><span className="leading-[15.385px] text-[#f9e24c]">10K+</span><span className="leading-[15.385px]"> Restaurants </span></p>
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_4px_0px_rgba(0,0,0,0.25)]"></div>
              </div>
              <div className="absolute flex items-center justify-center left-[116.19px] size-[72.565px] top-[72.36px]" data-node-id="492:26966">
                <div className="flex-none rotate-[-35.82deg]">
                  <div className="pointer-events-none relative size-[51.978px]">
                    <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={aMFoodFace} />
                    <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_4px_0px_rgba(0,0,0,0.25)]"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* minutes */}
            <div className="bg-[#e79e9e] col-start-1 justify-self-stretch overflow-clip relative rounded-[24px] row-2 self-stretch shrink-0" data-id="nano-home-mp-minutes" data-node-id="492:26967">
              <div className="absolute bg-[#f82a26] left-[-30px] size-[221px] top-[-11px]" data-node-id="492:26968"></div>
              <div className="absolute h-[169px] left-[-5.69px] top-[21px] w-[176.887px]" data-node-id="492:26969"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMMinMask} /></div>
              <div className="absolute flex h-[180.367px] items-center justify-center left-[15.85px] top-[69.26px] w-[188.353px]" data-node-id="492:26972">
                <div className="flex-none rotate-[12.41deg]">
                  <div className="h-[149.489px] relative w-[159.973px]"><img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aMMinLays} /></div>
                </div>
              </div>
              <div className="absolute flex h-[63.764px] items-center justify-center left-[65.77px] top-[74.04px] w-[63.355px]" data-node-id="492:26973">
                <div className="flex-none rotate-[38.23deg]">
                  <div className="h-[46.483px] relative w-[44.034px]">
                    <div className="absolute inset-[-5.39%_-5.69%]"><img alt="" className="block max-w-none size-full" src={aMMinBadge} /></div>
                  </div>
                </div>
              </div>
              <div className="absolute flex inset-[78.39%_-5.99%_-7.85%_71.53%] items-center justify-center" data-node-id="492:26977" style={{ containerType: 'size' }}>
                <div className="flex-none h-[hypot(39.4054cqw,45.301cqh)] rotate-[-41.55deg] w-[hypot(60.5946cqw,-54.699cqh)]">
                  <div className="relative size-full">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img alt="" className="absolute h-[97.45%] left-[0.58%] max-w-none top-[1.35%] w-[98.84%]" src={aMMinObject} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute h-[137.8px] left-[-40.53px] top-[95.94px] w-[172.188px]" data-node-id="492:26978"><img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aMMinCoke} /></div>
              <div className="absolute flex h-[95.401px] items-center justify-center left-[31.34px] mix-blend-soft-light top-[106.29px] w-[95.402px]" data-node-id="492:26979">
                <div className="flex-none rotate-[-1.31deg]">
                  <div className="h-[93.29px] relative w-[93.291px]">
                    <div className="absolute inset-[-39.28%]"><img alt="" className="block max-w-none size-full" src={aMMinEllipse} /></div>
                  </div>
                </div>
              </div>
              <div className="absolute flex inset-[24.66%_5.72%_0.69%_7.91%] items-center justify-center" data-node-id="492:26980" style={{ containerType: 'size' }}>
                <div className="flex-none h-[100cqw] rotate-90 w-[100cqh]">
                  <div className="relative size-full"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMMinDeco} /></div>
                </div>
              </div>
              <div className="absolute flex inset-[38.3%_85.91%_35.03%_-14.25%] items-center justify-center" data-node-id="492:26992" style={{ containerType: 'size' }}>
                <div className="-scale-x-100 flex-none h-[hypot(-55.0778cqw,-30.5205cqh)] rotate-[120.9deg] w-[hypot(44.9222cqw,-69.4795cqh)]">
                  <div className="relative size-full">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img alt="" className="absolute h-[97.45%] left-[0.58%] max-w-none top-[1.35%] w-[98.84%]" src={aMMinObject} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="-translate-x-1/2 absolute h-[47px] left-1/2 top-[19px] w-[105px]" data-node-id="492:26993">
                <div className="-translate-x-1/2 absolute h-[13px] left-1/2 top-0 w-[93.204px]" data-node-id="492:26994">
                  <div className="absolute inset-[0.01%_0_-0.01%_0]" data-node-id="492:26995"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMMinHeading} /></div>
                </div>
                <div className="absolute bg-[#c01200] content-stretch flex items-center justify-center left-[-4px] px-[10px] py-[3px] right-[-4px] rounded-[20px] top-[25px]" data-node-id="492:27003">
                  <p className="[word-break:break-word] font-noontree font-extrabold leading-[0] not-italic relative shrink-0 text-[0px] text-white tracking-[-0.05px] whitespace-nowrap m-0" data-node-id="492:27004" style={{ textShadow: '0px 2px 3px #6a0002,0px 1px 1px #6a0002,0px 0.6px 0px #c01200' }}><span className="leading-[15.385px] text-[13px]">Get it in </span><span className="leading-[15.385px] text-[#f9e24c] text-[13px]">15mins</span></p>
                </div>
              </div>
            </div>
            {/* supermall */}
            <div className="bg-[#e79e9e] col-2 h-[190px] justify-self-stretch overflow-clip relative rounded-[24px] row-2 shrink-0" data-id="nano-home-mp-supermall" data-node-id="492:27005">
              <div className="absolute bg-[#2829f6] left-[-30px] size-[221px] top-[-11px]" data-node-id="492:27006"></div>
              <div className="absolute h-[169px] left-[-0.69%] right-[-6.19%] top-[21px]" data-node-id="492:27007"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMFoodMask} /></div>
              <div className="absolute flex items-center justify-center left-[-43.69px] size-[195.734px] top-[45.29px]" data-node-id="492:27010">
                <div className="flex-none rotate-[51.59deg]">
                  <div className="relative size-[139.325px]"><img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aMSmArt} /></div>
                </div>
              </div>
              <div className="absolute contents left-[4.27px] top-px" data-node-id="492:27011">
                <div className="absolute flex h-[286.78px] items-center justify-center left-[4.27px] top-px w-[264.726px]" data-node-id="492:27012">
                  <div className="flex-none rotate-[60.64deg]">
                    <div className="h-[173.556px] relative w-[231.408px]"><img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aMSmProduct} /></div>
                  </div>
                </div>
                <div className="absolute flex h-[81.981px] items-center justify-center left-[112.03px] top-[69.27px] w-[83.05px]" data-node-id="492:27013">
                  <div className="flex-none rotate-[-58.47deg]">
                    <div className="h-[61.62px] relative w-[58.374px]">
                      <div className="absolute inset-[-5.39%_-5.69%]"><img alt="" className="block max-w-none size-full" src={aMSmBadge} /></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute flex inset-[24.66%_6.74%_0.69%_7.46%] items-center justify-center" data-node-id="492:27017" style={{ containerType: 'size' }}>
                <div className="flex-none h-[100cqw] rotate-90 w-[100cqh]">
                  <div className="relative size-full"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMSmDeco} /></div>
                </div>
              </div>
              <div className="absolute h-[47px] left-[30.25px] top-[19px] w-[105px]" data-node-id="492:27030">
                <div className="absolute contents inset-[-8.51%_8.99%_65.12%_8.99%]" data-node-id="492:27031">
                  <div className="absolute inset-[1.43%_43.52%_65.12%_8.99%]" data-node-id="492:27032"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMSmHeading1} /></div>
                  <div className="absolute inset-[-8.51%_8.99%_75.1%_57.35%]" data-node-id="492:27039"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aMSmHeading2} /></div>
                </div>
                <div className="-translate-x-1/2 absolute bg-[#0809b5] content-stretch flex h-[22px] items-center justify-center left-1/2 px-[10px] py-[3px] rounded-[20px] top-[25px]" data-node-id="492:27045">
                  <p className="[word-break:break-word] font-noontree font-extrabold leading-[0] not-italic relative shrink-0 text-[#f9e24c] text-[13px] tracking-[-0.05px] whitespace-nowrap m-0" data-node-id="492:27046" style={{ textShadow: '0px 2px 3px #001360,0px 1px 1px #001360,0px 0.6px 0px #0809b5' }}><span className="leading-[15.385px] text-white">Get it in </span><span className="leading-[15.385px] text-[#fedc00]">1hr</span></p>
                </div>
              </div>
              <div className="absolute flex h-[95.401px] items-center justify-center left-[1.55px] mix-blend-soft-light top-[83.31px] w-[95.402px]" data-node-id="492:27047">
                <div className="flex-none rotate-[-1.31deg]">
                  <div className="h-[93.29px] relative w-[93.291px]">
                    <div className="absolute inset-[-39.28%]"><img alt="" className="block max-w-none size-full" src={aMSmEllipse} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Customise your profile 492:27048 ── */}
      <div data-id="nano-home-profile" className="absolute" style={{ left: '0', top: '998.5px', width: '375px', height: '610px' }}>
        <div className="relative size-full" data-node-id="492:27048">
          <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[607px] left-1/2 top-1/2 w-[375px]" data-node-id="492:27049"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aPUnion} /></div>
          <div className="absolute flex h-[493.903px] items-center justify-center left-[-23.3px] top-[48.01px] w-[501.564px]" data-node-id="492:27053">
            <div className="flex-none rotate-[14.23deg]">
              <div className="h-[404.299px] relative w-[414.89px]">
                <div className="absolute inset-[-1.19%_-0.34%_-0.53%_-1.09%]"><img alt="" className="block max-w-none size-full" src={aPLine} /></div>
              </div>
            </div>
          </div>
          <div className="absolute h-[137.187px] left-[-127.23px] top-[478.71px] w-[629.462px]" data-node-id="492:27054"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aPGrid} /></div>
          <div className="absolute bottom-0 content-stretch flex flex-col h-[100px] items-center justify-center left-0 py-[30px] w-[375px]" data-node-id="492:27064">
            <div className="border-[3px] border-solid border-white content-stretch flex gap-[6px] h-[52px] items-center justify-center overflow-clip px-[14px] py-[16px] relative rounded-[9999px] shrink-0 w-[200px]" data-id="nano-home-earn" data-node-id="492:27065" data-name="M-NeutralButton">
              <div aria-hidden className="absolute bg-[#212121] inset-0 pointer-events-none rounded-[9999px]"></div>
              <p className="[word-break:break-word] font-noontree font-bold leading-[24px] relative shrink-0 text-[color:white] text-[length:16px] tracking-[0px] whitespace-nowrap m-0" data-node-id="492:27066">Earn dhm5</p>
              <div className="absolute inset-[-3px] pointer-events-none rounded-[inherit] shadow-[inset_0px_-8px_5px_0px_black,inset_0px_4px_5px_0px_#a9a9a9]"></div>
            </div>
          </div>
          <div className="-translate-x-1/2 absolute contents left-[calc(50%-464.11px)] top-[583.2px]" data-node-id="492:27068">
            <div className="absolute contents left-0 size-0 top-0" data-node-id="492:27069"></div>
          </div>
          <div className="absolute contents left-[23.5px] top-[29.79px]" data-node-id="492:27071">
            <div className="-translate-x-1/2 absolute h-[492px] left-1/2 top-[29.79px] w-[328px]" data-node-id="492:27072"><img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aPCard} /></div>
            <div className="absolute contents left-[264.68px] top-[73.84px]" data-node-id="492:27073">
              <div className="[word-break:break-word] absolute font-mono leading-[0] left-[271.69px] not-italic opacity-[0.72] text-[12px] text-white top-[75.84px] tracking-[3px] uppercase whitespace-nowrap" data-node-id="492:27074" style={{ transform: 'scaleX(0.69)', transformOrigin: '0 0' }}>
                <p className="leading-[12px] mb-0 mt-0">Choose</p>
                <p className="leading-[12px] mb-0 mt-0">avatar</p>
                <p className="leading-[12px] m-0">interest</p>
              </div>
              <div className="absolute h-[40.049px] left-[264.68px] opacity-80 top-[73.84px] w-0" data-node-id="492:27075">
                <div className="absolute inset-[0_-0.5px]"><img alt="" className="block max-w-none size-full" src={aPDivider} /></div>
              </div>
            </div>
            <p className="-translate-x-1/2 [word-break:break-word] absolute font-noontree font-bold leading-[28px] left-1/2 not-italic text-[#eae5f7] text-[24px] text-center top-[445.8px] tracking-[-0.25px] whitespace-nowrap m-0" data-node-id="492:27076" style={{ textShadow: '0px 1px 4px rgba(255,255,255,0.23)' }}>Customise your profile</p>
          </div>
          <div className="absolute contents h-[148.208px] left-[-13.42px] top-[15.7px] w-[150.259px]" data-node-id="492:27077">
            <div className="absolute flex h-[136.513px] items-center justify-center left-[-7.35px] top-[21.55px] w-[138.108px]" data-node-id="492:27078">
              <div className="flex-none rotate-[-28.12deg]">
                <div className="h-[99.522px] relative shadow-[0px_4.469px_7.821px_0px_rgba(0,0,0,0.45)] w-[103.406px]"><img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aPBadge} /></div>
              </div>
            </div>
            <div className="absolute flex h-[72.24px] items-center justify-center left-[25.46px] top-[51.89px] w-[71.45px]" data-node-id="492:27079">
              <div className="rotate-[-15deg] flex-none">
                <div className="[word-break:break-word] content-stretch drop-shadow-[0px_3.352px_2.235px_rgba(0,0,0,0.15)] flex flex-col h-[59.219px] items-center relative text-black text-center w-[58.102px]">
                  <p className="font-noontree font-bold leading-[26.816px] mb-[-7.821px] mt-0 opacity-80 relative shrink-0 text-[20.112px] tracking-[-0.1676px] w-full" data-node-id="492:27080">win</p>
                  <p className="font-noontree font-extrabold leading-[40.225px] not-italic relative shrink-0 text-[31.286px] tracking-[0px] w-full m-0" data-node-id="492:27081">dhm5</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex h-[72.675px] items-center justify-center left-[309.26px] top-[423.47px] w-[67.602px]" data-node-id="492:27082">
            <div className="flex-none rotate-[89deg]">
              <div className="h-[66.367px] relative w-[71.531px]"><img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={aPSparkle} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rectangle 1891598679 492:27083 ── */}
      <div data-id="nano-home-footer-fade" className="absolute" style={{ left: '-224.0204px', top: '2129.8403px', width: '375px', height: '269.7525px' }}>
        <div className="relative size-full" data-node-id="492:27083"><img alt="" className="absolute block inset-0 max-w-none size-full" src={aRectFade} /></div>
      </div>
    </div>
  )
}
