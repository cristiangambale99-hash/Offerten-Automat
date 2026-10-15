/* Kopiert die DejaVu-Schriften (Verdana-Ersatz für die PDF-Erzeugung) aus dem npm-Paket nach public/brand */
const fs = require('fs'), path = require('path');
const src = path.dirname(require.resolve('dejavu-fonts-ttf/package.json'));
const dst = path.join(__dirname, '..', 'public', 'brand');
fs.mkdirSync(dst, { recursive: true });
for (const f of ['DejaVuSans.ttf', 'DejaVuSans-Bold.ttf']) fs.copyFileSync(path.join(src, 'ttf', f), path.join(dst, f));
console.log('brand fonts ready');
