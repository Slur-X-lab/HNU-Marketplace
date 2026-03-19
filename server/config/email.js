require('dotenv').config();

const LOGO_URL = 'https://hnu-marketplace.up.railway.app/assets/logo.png';

const emailLayout = (body) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f0faf4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0faf4;padding:32px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,171,65,0.12);border:1px solid #d4f0e0;">
        <tr>
          <td style="background:linear-gradient(135deg,#00ab41 0%,#007d30 100%);padding:28px 36px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:14px;">
                <img src="${LOGO_URL}" alt="HNU" width="52" height="52"
                  style="width:52px;height:52px;border-radius:12px;background:white;padding:4px;display:block;object-fit:contain;border:2px solid rgba(255,255,255,0.3);"/>
              </td>
              <td>
                <p style="margin:0;color:#fff;font-size:20px;font-weight:800;line-height:1;">HNU Marketplace</p>
                <p style="margin:5px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">Holy Name University · Tagbilaran City, Bohol</p>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="padding:32px 36px;">${body}</td></tr>
        <tr>
          <td style="background:#f0faf4;padding:18px 36px;border-top:1px solid #d4f0e0;text-align:center;">
            <p style="margin:0;color:#88c4a0;font-size:11px;">&copy; ${new Date().getFullYear()} HNU Marketplace &nbsp;·&nbsp; Students Only &nbsp;·&nbsp; Holy Name University</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const sendEmail = async (to, subject, htmlContent) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'HNU Marketplace', email: process.env.BREVO_FROM_EMAIL || 'marketplacehnu@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Brevo error:', JSON.stringify(data));
    throw new Error(data.message || 'Failed to send email');
  }
  console.log(`✅ Email sent to ${to}`);
};

const sendVerificationEmail = async (to, name, code) => {
  const body = `
    <p style="margin:0 0 6px;color:#1a1a1a;font-size:16px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6;">Use the verification code below to confirm your HNU Marketplace account.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td align="center" style="background:#f0faf4;border:2px dashed #00ab41;border-radius:14px;padding:24px;">
          <p style="margin:0 0 6px;color:#00ab41;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Verification Code</p>
          <p style="margin:0;color:#00ab41;font-size:48px;font-weight:900;letter-spacing:14px;font-family:monospace;">${code}</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="background:#fff8e6;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:10px 14px;">
          <p style="margin:0;color:#92400e;font-size:13px;">⏱ This code expires in <strong>15 minutes</strong>. Do not share it with anyone.</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#aaa;font-size:12px;">If you didn't create an HNU Marketplace account, you can safely ignore this email.</p>`;

  await sendEmail(to, `${code} — Your HNU Marketplace verification code`, emailLayout(body));
};

const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  const body = `
    <p style="margin:0 0 6px;color:#1a1a1a;font-size:16px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;">We received a request to reset your HNU Marketplace password.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" style="display:inline-block;background:#00ab41;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:10px;">
            Reset My Password
          </a>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="background:#fff8e6;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:10px 14px;">
          <p style="margin:0;color:#92400e;font-size:13px;">⏱ This link expires in <strong>1 hour</strong>.</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#aaa;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>`;

  await sendEmail(to, 'Reset your HNU Marketplace password', emailLayout(body));
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };