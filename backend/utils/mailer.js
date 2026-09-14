const nodemailer = require('nodemailer');

let ResendClient = null;
try {
  const { Resend } = require('resend');
  if (process.env.RESEND_API_KEY) {
    ResendClient = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) { }

let sgMail = null;
try {
  sgMail = require('@sendgrid/mail');
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
} catch (e) { }

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
  const subject = `${code} is your Shohoj verification code`;
  const text = `Hi ${name || 'there'},\n\nYour Shohoj verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nTip: If this email landed in your spam or junk folder, please mark it as 'Not Spam' so you don't miss notifications about your campus listings.\n\n— Shohoj Campus Network`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shohoj Verification Code</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f8fafc;margin:0;padding:24px 12px;color:#1e293b;">
  <div style="max-width:500px;margin:auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
    <div style="background:linear-gradient(135deg,#4f46e5 0%,#06b6d4 100%);padding:30px 24px;text-align:center;color:#ffffff;">
      <div style="font-size:26px;font-weight:800;letter-spacing:-0.5px;">Shohoj</div>
      <div style="font-size:13px;opacity:0.9;margin-top:4px;">Your Campus Marketplace &amp; Peer Gigs</div>
    </div>
    <div style="padding:28px 24px;">
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;color:#0f172a;">Hi ${name || 'there'},</div>
      <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 20px 0;">
        Thank you for joining <strong>Shohoj</strong>. To activate your campus account and verify your student email, enter the 6-digit confirmation code below:
      </p>
      <div style="background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:12px;padding:18px;text-align:center;margin:20px 0;">
        <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#4f46e5;margin:0;padding-left:10px;">${code}</div>
        <div style="font-size:12px;color:#64748b;margin-top:8px;font-weight:600;">Valid for 10 minutes</div>
      </div>
      <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;font-size:12px;line-height:1.5;color:#92400e;margin-bottom:20px;">
        💡 <strong>Can't find our emails in the future?</strong> Please check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> tab and mark Shohoj as "Not Spam".
      </div>
      <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin:0;">
        If you didn't create an account on Shohoj, you can safely ignore this email.
      </p>
    </div>
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 24px;text-align:center;font-size:12px;color:#94a3b8;">
      &copy; Shohoj Campus Network • Peer-to-Peer Student Services
    </div>
  </div>
</body>
</html>`;

  // 1. Brevo (Sendinblue) API — Recommended. Runs over HTTPS (works on Render free tier).
  //    Allows sending up to 300 free emails/day to ANY email address using your personal Gmail.
  if (process.env.BREVO_API_KEY) {
    try {
      const apiKey = process.env.BREVO_API_KEY.trim().replace(/^["']|["']$/g, '');
      const senderEmail = (process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'no-reply@shohoj.app').trim();
      const senderName = process.env.BREVO_SENDER_NAME || 'Shohoj';
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: toEmail, name: name || 'User' }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });
      if (response.ok) {
        return { sent: true, via: 'brevo' };
      }
      const errData = await response.json().catch(() => ({}));
      console.warn('[mailer] Brevo API failed, falling back:', errData.message || response.statusText);
    } catch (brevoErr) {
      console.warn('[mailer] Brevo error, falling back:', brevoErr.message);
    }
  }

  // 2. SendGrid — Runs over HTTPS, works on Render free tier.
  //    Needs a verified "Single Sender" email — see backend/.env.example.
  if (process.env.SENDGRID_API_KEY && sgMail) {
    try {
      const from = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
      await sgMail.send({ to: toEmail, from: { email: from, name: 'Shohoj' }, subject, text, html });
      return { sent: true, via: 'sendgrid' };
    } catch (sgErr) {
      const detail = sgErr.response?.body?.errors?.[0]?.message || sgErr.message;
      console.warn('[mailer] SendGrid failed, falling back:', detail);
    }
  }

  // 3. Resend — also HTTPS-based. Free sandbox domain only delivers to your
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

