const nodemailer = require('nodemailer');

/**
 * Sends an email if SMTP env vars are configured; otherwise logs to console.
 * This keeps the app fully runnable without requiring real SMTP credentials.
 */
const sendEmail = async ({ to, subject, html }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('--- [Email - SMTP not configured, logging instead] ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);
    console.log('-------------------------------------------------------');
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
