import { chromium } from 'playwright-core';
import { existsSync } from 'fs';
const exe = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Chromium.app/Contents/MacOS/Chromium'].find(existsSync);
const b = await chromium.launch({ executablePath: exe, headless: true });
for (const [label, url] of [['switcher','/marketplace-switcher'],['search','/search'],['combo','/combo-animation']]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('http://localhost:5173'+url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  await p.screenshot({ path: `/tmp/${label}.png` });
  const info = await p.evaluate(() => {
    const g = s => { const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return {top:Math.round(r.top),bottom:Math.round(r.bottom)}; };
    return { docH: document.documentElement.scrollHeight, winH: window.innerHeight, frame:g('[data-id=app-frame]'), nav:g('nav') };
  });
  console.log(label, JSON.stringify(info));
  await p.close();
}
await b.close();
