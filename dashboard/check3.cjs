const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', msg => { if (['error','warning'].includes(msg.type())) errs.push(msg.type()+':'+msg.text()); });
  // load home first then click
  await page.goto('http://127.0.0.1:8765/site/#/', { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => { location.hash = '#/alexander/food'; });
  await page.waitForTimeout(2500);
  console.log('after food hash');
  console.log('url', page.url());
  console.log('text', JSON.stringify((await page.locator('#app').innerText()).slice(0,200)));
  console.log('html', (await page.locator('#app').innerHTML()).slice(0,500));
  console.log('errs', errs);
  await page.evaluate(() => { location.hash = '#/alexander/diary'; });
  await page.waitForTimeout(1500);
  console.log('diary', JSON.stringify((await page.locator('#app').innerText()).slice(0,150)));
  console.log('errs2', errs);
  await browser.close();
})();
