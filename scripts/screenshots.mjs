import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';

// Run npm run build && npm run preview first. Captures use a clean browser profile.
const baseURL = process.env.MEMOL_PREVIEW_URL || 'http://localhost:4173';
const browser = await chromium.launch({
  executablePath: existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
  args: ['--no-sandbox'],
});
await mkdir('screenshots', { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(baseURL);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'screenshots/mobile-home.png' });
  await page.evaluate(() => scrollTo(0, document.querySelector('.finder').getBoundingClientRect().top + scrollY - 80));
  // Let the sticky header settle after scrolling before taking a screenshot.
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshots/mobile-discover.png' });
  await page.locator('.card-title').first().click();
  await page.screenshot({ path: 'screenshots/mobile-detail.png' });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1280 }, deviceScaleFactor: 1 });
  await desktop.goto(baseURL);
  await desktop.mouse.move(1400, 0);
  await desktop.screenshot({ path: 'screenshots/desktop.png' });
  const screens = await Promise.all(['mobile-home', 'mobile-discover', 'mobile-detail'].map(async name => `data:image/png;base64,${(await readFile(`screenshots/${name}.png`)).toString('base64')}`));
  const overview = await browser.newPage({ viewport: { width: 1296, height: 1032 }, deviceScaleFactor: 1 });
  await overview.setContent(`<!doctype html><html lang="ja"><meta charset="utf-8"><style>
  *{box-sizing:border-box}body{margin:0;padding:30px 40px;background:#e9eee4;color:#294735;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans CJK JP',sans-serif}
  header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:21px}h1{font-family:Georgia,serif;margin:0;font-size:36px;letter-spacing:-1px}header p{font-size:12px;color:#6e7d62;letter-spacing:1px}
  main{display:flex;gap:23px}figure{margin:0;width:390px}figcaption{font-size:12px;letter-spacing:1px;margin-bottom:12px;font-weight:600}figcaption span{font-size:10px;color:#829172;margin-right:9px}img{display:block;width:390px;height:844px;border-radius:15px;border:1px solid #d9e1ce;box-shadow:0 9px 24px #2a452314}footer{margin-top:19px;color:#7a8b6e;font-size:11px}
  </style><header><h1>Memol.</h1><p>ひらめきを、次の一歩に。</p></header><main>${screens.map((src,i)=>`<figure><figcaption><span>0${i+1}</span>${['ホーム','チャンスを探す','応募情報・自分用メモ'][i]}</figcaption><img src="${src}"></figure>`).join('')}</main><footer>実装したアプリのブラウザ画面 ／ スマホ表示 390 × 844 px</footer></html>`);
  await overview.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  await overview.screenshot({ path: 'screenshots/preview.png' });
} finally {
  await browser.close();
}
console.log('Saved mobile, desktop and overview screenshots to screenshots/');
