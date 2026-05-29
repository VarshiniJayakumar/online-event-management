const https = require('https');

const sendEmail = async ({ to, subject, htmlContent }) => {
  const BREVO_API_KEY = (process.env.BREVO_API_KEY || '').trim();
  const BREVO_SENDER_EMAIL = (process.env.BREVO_SENDER_EMAIL || 'noreply@eventure.com').trim();
  const BREVO_SENDER_NAME = 'Eventure Team';

  console.log('--- Email System Status Check ---');
  console.log(`🔑 BREVO_API_KEY: ${BREVO_API_KEY ? '✅ DETECTED' : '❌ MISSING'}`);
  console.log(`📧 BREVO_SENDER_EMAIL: ${BREVO_SENDER_EMAIL}`);
  console.log('---------------------------------');

  if (!BREVO_API_KEY) {
    console.log('\n📢 EMAIL NOTICE: Running in SIMULATION MODE (no API key).');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link: ${htmlContent.match(/href="([^"]+)"/)?.[1] || 'No link found'}`);
    return { success: true, message: 'Email simulated', simulated: true };
  }

  const payload = JSON.stringify({
    sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Brevo email sent successfully to:', to);
          resolve({ success: true, messageId: JSON.parse(data).messageId });
        } else {
          console.error('💥 Brevo API Error:', res.statusCode, data);
          resolve({ success: false, error: `Brevo API error ${res.statusCode}: ${data}` });
        }
      });
    });

    req.on('error', (error) => {
      console.error('💥 Brevo request error:', error.message);
      resolve({ success: false, error: error.message });
    });

    req.write(payload);
    req.end();
  });
};

module.exports = { sendEmail };
