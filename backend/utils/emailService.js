const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const sendEmail = async ({ to, subject, htmlContent }) => {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    console.log('\n📢 EMAIL NOTICE: Running in SIMULATION MODE because BREVO_API_KEY is missing.');
    console.log('To send real emails, add BREVO_API_KEY to your Render environment variables.');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${htmlContent.slice(0, 200)}...`);
    console.log('-------------------------------------------\n');
    return { success: true, message: 'Email simulated', simulated: true };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { 
          name: "Eventure Team", 
          email: process.env.BREVO_SENDER_EMAIL || "notifications@eventure.com" 
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send email');
    
    return { success: true, data };
  } catch (error) {
    console.error('Brevo Email Error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
