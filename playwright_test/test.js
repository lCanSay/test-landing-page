const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const viewports = [
    { width: 1400, height: 900, name: 'desktop' },
    { width: 800, height: 900, name: 'tablet' }
  ];

  const filePath = 'file:///' + path.resolve('../index.html').replace(/\\/g, '/');
  await page.goto(filePath);

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.reload();
    await page.waitForTimeout(1000);
    
    const timeline = await page.locator('.timeline-section');
    if (await timeline.count() > 0) {
      await timeline.screenshot({ path: `screenshot_timeline_${vp.name}.png` });
    }
  }

  await browser.close();
})();
