const https = require('https');
const urls = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'https://images.unsplash.com/photo-1516280440502-61dc573b185b?w=800&q=80',
  'https://images.unsplash.com/photo-1535139262971-c5184570fa67?w=800&q=80',
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode < 400);
    }).on('error', () => resolve(false));
  });
}

async function main() {
  for (const url of urls) {
    const ok = await checkUrl(url);
    console.log(`${ok ? 'OK' : 'BROKEN'}: ${url}`);
  }
}
main();
