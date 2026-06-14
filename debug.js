const puppeteer = require('puppeteer-core');

(async () => {
  // Try to use a local chrome or edge if puppeteer-core doesn't have it
  // Actually, let's just use the puppeteer-cli package which should have downloaded chrome.
  const browser = await puppeteer.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.setViewport({width: 1920, height: 1080});
  await page.goto('http://localhost:3000');
  
  const boxes = await page.evaluate(() => {
    const timeline = document.querySelector('.timeline');
    const items = Array.from(document.querySelectorAll('.timeline__item'));
    return {
      timeline: timeline.getBoundingClientRect().toJSON(),
      items: items.map(item => {
        const photo = item.querySelector('.timeline__photo');
        const text = item.querySelector('.timeline__content');
        return {
          item: item.getBoundingClientRect().toJSON(),
          photo: photo ? photo.getBoundingClientRect().toJSON() : null,
          text: text ? text.getBoundingClientRect().toJSON() : null,
          photoTransform: photo ? window.getComputedStyle(photo).transform : null,
          photoLeft: photo ? window.getComputedStyle(photo).left : null,
          photoRight: photo ? window.getComputedStyle(photo).right : null
        };
      })
    };
  });
  
  console.log(JSON.stringify(boxes, null, 2));
  await browser.close();
})();
