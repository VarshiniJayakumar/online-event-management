const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, htmlContent }) => {
  // Support both explicit SMTP vars and Brevo-specific vars
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const SMTP_PORT = process.env.SMTP_PORT || 587;
  const SMTP_USER = process.env.SMTP_USER || process.env.BREVO_SENDER_EMAIL;
  const SMTP_PASS = process.env.SMTP_PASS || process.env.BREVO_API_KEY;
  const SMTP_SENDER = process.env.SMTP_SENDER || process.env.BREVO_SENDER_EMAIL || 'noreply@eventure.com';

  console.log('--- Email System Status Check ---');
  console.log(`🔑 SMTP_HOST: ${SMTP_HOST}`);
  console.log(`📧 SMTP_USER: ${SMTP_USER ? '✅ DETECTED' : '❌ MISSING'}`);
  console.log(`🔐 SMTP_PASS: ${SMTP_PASS ? '✅ DETECTED' : '❌ MISSING'}`);
  console.log('---------------------------------');

  // Fallback to simulation if credentials are missing
  if (!SMTP_USER || !SMTP_PASS) {
    console.log('\n📢 EMAIL NOTICE: Running in SIMULATION MODE.');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link: ${htmlContent.match(/href="([^"]+)"/)?.[1] || 'No link found'}`);
    console.log(`HTML Preview Snippet: ${htmlContent.slice(0, 300)}...\n`);
    return { success: true, message: 'Email simulated', simulated: true };
  }

  try {
    console.log(`\n📧 Attempting to send email to: ${to} via ${SMTP_HOST}...`);

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Eventure Team" <${SMTP_SENDER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log('✅ SMTP Email Sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('💥 Fatal SMTP Email Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
