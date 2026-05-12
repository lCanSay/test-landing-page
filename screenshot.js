const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('file:///home/kensey/work/koreana/info-website/versions/v2-enhanced/index.html');
  // Wait a bit for animations
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  await browser.close();
})();
