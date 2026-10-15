/* pdf.js – HTML → PDF mit Chromium (lokal: installierter Chromium, auf Vercel: @sparticuz/chromium) */
async function launch() {
  const puppeteer = (await import('puppeteer-core')).default;
  if (process.env.CHROME_PATH) {
    return puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'] });
  }
  const chromium = (await import('@sparticuz/chromium')).default;
  return puppeteer.launch({ args: [...chromium.args, '--font-render-hinting=none'], defaultViewport: { width: 1200, height: 1600 }, executablePath: await chromium.executablePath(), headless: true });
}

async function htmlToPdf(html) {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: ['load', 'networkidle0'], timeout: 45000 });
    await page.emulateMediaType('print');
    const buf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    return Buffer.from(buf);
  } finally {
    await browser.close();
  }
}
module.exports = { htmlToPdf };
