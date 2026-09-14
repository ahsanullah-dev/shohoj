const nodemailer = require('nodemailer');

let ResendClient = null;
try {
  const { Resend } = require('resend');
  if (process.env.RESEND_API_KEY) {
    ResendClient = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) {}

let sgMail = null;
try {
  sgMail = require('@sendgrid/mail');
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
} catch (e) {}

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
  return transporter;
}

function generateSixDigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationEmail(toEmail, name, code) {
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

  // 1. SendGrid — the primary path. Runs over HTTPS, so it works fine on
  //    Render's free tier (which blocks outbound SMTP ports 25/465/587).
  //    Needs a verified "Single Sender" email — see backend/.env.example.
  if (process.env.SENDGRID_API_KEY && sgMail) {
    try {
      const from = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
      await sgMail.send({ to: toEmail, from, subject, text, html });
      return { sent: true, via: 'sendgrid' };
    } catch (sgErr) {
      const detail = sgErr.response?.body?.errors?.[0]?.message || sgErr.message;
      console.warn('[mailer] SendGrid failed, falling back:', detail);
    }
  }

  // 2. Resend — also HTTPS-based. Free sandbox domain only delivers to your
  //    own account email unless you verify a custom domain.
  if (process.env.RESEND_API_KEY) {
    try {
      if (!ResendClient) {
        const { Resend } = require('resend');
        ResendClient = new Resend(process.env.RESEND_API_KEY);
      }
      const fromEmail = process.env.EMAIL_FROM || 'Shohoj <onboarding@resend.dev>';
      const res = await ResendClient.emails.send({ from: fromEmail, to: toEmail, subject, text, html });
      return { sent: true, via: 'resend', ...res };
    } catch (resendErr) {
      console.warn('[mailer] Resend API failed, falling back to SMTP/Dev:', resendErr.message);
    }
  }

  // 3. Gmail SMTP — only works in local dev. Render's free tier blocks these
  //    ports platform-wide, so this will always time out in production there.
  const t = getTransporter();
  if (t) {
    try {
      const sendPromise = t.sendMail({
        from: `"Shohoj" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject,
        text,
        html,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email sending timed out after 5 seconds')), 5000)
      );
      const info = await Promise.race([sendPromise, timeoutPromise]);
      return { sent: true, via: 'smtp', ...info };
    } catch (err) {
      console.error(`[mailer] Failed to send email via SMTP to ${toEmail}:`, err.message);
    }
  }

  // 4. Last resort: log to console so local development still works.
  console.log(`[mailer] (FALLBACK — no provider delivered) Verification code for ${toEmail}: ${code}`);
  return { sent: false, devMode: true, code };
}

module.exports = { generateSixDigitCode, sendVerificationEmail };

