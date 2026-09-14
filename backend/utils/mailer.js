const nodemailer = require('nodemailer');

// Free email sending via Gmail SMTP.
// Setup (all free):
//   1. Use any Gmail account (a new one just for Shohoj is fine).
//   2. Turn on 2-Step Verification: https://myaccount.google.com/security
//   3. Create an "App Password": https://myaccount.google.com/apppasswords
//      (choose app "Mail", device "Other" -> name it "Shohoj") — copy the 16-char code.
//   4. Set EMAIL_USER=youraddress@gmail.com and EMAIL_APP_PASSWORD=<that 16-char code>
//      in backend/.env (and in Render's Environment tab for production).
// Gmail's free sending limit is ~500 emails/day, which is far more than a
// student project needs. No domain purchase or verification required.

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn(
      '[mailer] EMAIL_USER / EMAIL_APP_PASSWORD not set — verification emails will be logged, not sent.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
  return transporter;
}

function generateSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationEmail(toEmail, name, code) {
  const t = getTransporter();
  const subject = 'Your Shohoj verification code';
  const text = `Hi ${name || ''},\n\nYour Shohoj verification code is: ${code}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.\n\n— Shohoj`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;">
      <h2 style="color:#111;">Verify your Shohoj account</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Your verification code is:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:6px;background:#f5f5f5;padding:16px 20px;border-radius:8px;text-align:center;">${code}</p>
      <p style="color:#666;font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>`;

  if (!t) {
    // Dev fallback: no SMTP configured, just log the code so you can still test the flow.
    console.log(`[mailer] (DEV) Verification code for ${toEmail}: ${code}`);
    return { devMode: true };
  }

  return t.sendMail({
    from: `"Shohoj" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    text,
    html,
  });
}

module.exports = { generateSixDigitCode, sendVerificationEmail };
