const puppeteer = require('/home/kensey/work/koreana/info-website/tmp-screenshot/node_modules/puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto('http://localhost:8787', { waitUntil: 'networkidle0' });

    // Scroll to brands section
    await page.evaluate(() => {
        document.getElementById('brands').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 600));

    // Click first brand card
    await page.click('.brand-card');
    await new Promise(r => setTimeout(r, 50));

    // Sample backdrop-filter value at multiple frames during animation
    const samples = [];
    for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 35)); // ~35ms between samples
        const val = await page.evaluate(() => {
            const bd = document.querySelector('.modal__backdrop');
            return window.getComputedStyle(bd).backdropFilter;
        });
        samples.push(val);
    }

    console.log('Blur samples during animation:');
    samples.forEach((s, i) => console.log(`  Frame ${i+1}: ${s}`));

    // Check if we got intermediate values (not just snap between 0 and 8)
    const uniqueValues = new Set(samples);
    if (uniqueValues.size > 3) {
        console.log('\n✅ SMOOTH: Multiple intermediate blur values detected');
    } else {
        console.log('\n❌ SNAPPING: Only', uniqueValues.size, 'unique values:', [...uniqueValues]);
    }

    await browser.close();
})();
