const https = require('https');
const urls = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80'
];
async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => resolve(res.statusCode < 400)).on('error', () => resolve(false));
  });
}
async function main() {
  for (const url of urls) console.log(`${await checkUrl(url) ? 'OK' : 'BROKEN'}: ${url}`);
}
main();
