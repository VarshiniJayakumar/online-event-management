const sendEmail = async ({ to, subject, htmlContent }) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;

  console.log('--- Email System Status Check ---');
  console.log(`🔑 BREVO_API_KEY: ${BREVO_API_KEY ? '✅ DETECTED' : '❌ MISSING'}`);
  console.log(`📧 SENDER_EMAIL: ${SENDER_EMAIL ? '✅ DETECTED' : '❌ MISSING'}`);
  console.log('---------------------------------');

  if (!BREVO_API_KEY) {
    console.log('\n📢 EMAIL NOTICE: Running in SIMULATION MODE.');
    console.log(`Link: ${htmlContent.match(/href="([^"]+)"/)?.[1] || 'No link found'}\n`);
    return { success: true, message: 'Email simulated', simulated: true };
  }

  try {
    console.log(`\n📧 Attempting to send email to: ${to} via Brevo...`);
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "Eventure Team", email: SENDER_EMAIL },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Brevo API Success:', JSON.stringify(data));
      return { success: true, data };
    } else {
      console.error('❌ Brevo API Error:', JSON.stringify(data));
      throw new Error(data.message || 'Failed to send email');
    }
  } catch (error) {
    console.error('💥 Fatal Email Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
