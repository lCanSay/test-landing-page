/**
 * Generates a high-fidelity PDF of the KOREANA website
 * that looks exactly like full-screen browsing (1920×1080).
 *
 * Key fixes:
 *  - Forces all scroll-triggered fade-in animations to visible
 *  - Sets animated counters to their final values
 *  - Uses a proper 1920×1080 viewport
 *  - Renders with printBackground for all gradients / dark sections
 *  - Produces A4-landscape pages that preserve the desktop layout
 */

const puppeteer = require('puppeteer-core');
const path = require('path');

const PORT = 9123;

async function startServer() {
  const http = require('http');
  const fs = require('fs');
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
  };

  const root = __dirname;

  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(root, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`Server running at http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

(async () => {
  const server = await startServer();

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });

  const page = await browser.newPage();

  // Full HD desktop viewport — exactly what the user sees in full screen
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  await page.goto(`http://127.0.0.1:${PORT}/index.html`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Wait a moment for fonts and images
  await new Promise(r => setTimeout(r, 2000));

  // ─── Fix all rendering issues for PDF capture ───
  await page.evaluate(() => {
    // 1. Force ALL fade-in elements to visible (scroll animations won't fire in headless)
    document.querySelectorAll('.fade-in').forEach(el => {
      el.classList.add('visible');
    });

    // 2. Set counters to their final values (IntersectionObserver won't fire)
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      el.textContent = target.toLocaleString('ru-RU');
    });

    // 3. Remove position:fixed from header — let it flow normally in the document
    const header = document.querySelector('.header');
    if (header) {
      header.style.position = 'absolute';
      header.style.background = 'rgba(0,0,0,0.4)';
      header.style.backdropFilter = 'blur(12px)';
    }

    // 4. Hide floating WhatsApp button and scroll indicator
    document.querySelectorAll('.whatsapp-float, .hero__scroll').forEach(el => {
      el.style.display = 'none';
    });

    // 5. Remove hover-only transforms that might look odd in static PDF
    // (already fine because CSS only applies on :hover)

    // 6. Make the hero exactly viewport height (not more)
    const hero = document.querySelector('.hero--cinematic');
    if (hero) {
      hero.style.minHeight = '1080px';
      hero.style.height = '1080px';
    }

    // 7. Ensure body has no overflow-x hidden issues in print
    document.documentElement.style.overflowX = 'visible';
    document.body.style.overflowX = 'visible';
  });

  // Wait for CSS changes to apply
  await new Promise(r => setTimeout(r, 500));

  // Generate the PDF — landscape A4 to match widescreen desktop layout
  await page.pdf({
    path: path.join(__dirname, 'KOREANA_beta_website.pdf'),
    printBackground: true,
    format: 'A4',
    landscape: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    preferCSSPageSize: false,
  });

  console.log('✅ PDF saved to KOREANA_beta_website.pdf');

  await browser.close();
  server.close();
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
