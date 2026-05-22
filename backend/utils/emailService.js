const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, htmlContent }) => {
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT || 587;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const SMTP_SENDER = process.env.SMTP_SENDER || 'noreply@eventure.com';

  console.log('--- Email System Status Check ---');
  console.log(`🔑 SMTP_HOST: ${SMTP_HOST ? '✅ DETECTED' : '❌ MISSING'}`);
  console.log(`📧 SMTP_USER: ${SMTP_USER ? '✅ DETECTED' : '❌ MISSING'}`);
  console.log('---------------------------------');

  // Fallback to simulation if SMTP is not configured
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('\n📢 EMAIL NOTICE: Running in SIMULATION MODE.');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link: ${htmlContent.match(/href="([^"]+)"/)?.[1] || 'No link found'}`);
    console.log(`HTML Preview Snippet: ${htmlContent.slice(0, 300)}...\n`);
    return { success: true, message: 'Email simulated', simulated: true };
  }

  try {
    console.log(`\n📧 Attempting to send email to: ${to} via SMTP...`);
    
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
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

