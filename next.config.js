/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'] },
  async headers() {
    return [{ source: '/brand/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }, { key: 'Cache-Control', value: 'public, max-age=86400' }] }];
  }
};
