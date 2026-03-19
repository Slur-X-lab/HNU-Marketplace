const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (to, name, code) => {
  const { error } = await resend.emails.send({
    from: process.env.SMTP_FROM || 'HNU Marketplace <onboarding@resend.dev>',
    to,
    subject: `${code} is your HNU Marketplace verification code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f8f7f4; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1a3c6e, #2a5298); padding: 36px 40px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
          .header p { color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px; }
          .body { padding: 36px 40px; }
          .body p { color: #444; line-height: 1.6; font-size: 15px; margin: 0 0 16px; }
          .code-box { background: #f0f4ff; border: 2px dashed #2a5298; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .code { font-size: 48px; font-weight: 800; color: #1a3c6e; letter-spacing: 12px; font-family: monospace; }
          .expires { font-size: 13px; color: #999; text-align: center; margin-top: 0; }
          .footer { background: #f8f7f4; padding: 20px 40px; text-align: center; font-size: 12px; color: #aaa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 HNU Marketplace</h1>
            <p>Holy Name University · Students Only</p>
          </div>
          <div class="body">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Use the verification code below to confirm your email address:</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p class="expires">⏱ This code expires in <strong>15 minutes</strong>.</p>
            <p style="font-size:13px; color:#999;">If you didn't create an HNU Marketplace account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} HNU Marketplace · Holy Name University, Tagbilaran City, Bohol
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (error) throw new Error(`Email service error: ${error.message}`);
};

const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: process.env.SMTP_FROM || 'HNU Marketplace <onboarding@resend.dev>',
    to,
    subject: '🔐 Reset your HNU Marketplace password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f8f7f4; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1a3c6e, #2a5298); padding: 36px 40px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
          .body { padding: 36px 40px; }
          .body p { color: #444; line-height: 1.6; font-size: 15px; margin: 0 0 16px; }
          .btn { display: block; width: fit-content; margin: 28px auto; background: #1a3c6e; color: white; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 700; font-size: 15px; }
          .note { font-size: 12px !important; color: #999 !important; text-align: center; }
          .footer { background: #f8f7f4; padding: 20px 40px; text-align: center; font-size: 12px; color: #aaa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🎓 HNU Marketplace</h1></div>
          <div class="body">
            <p>Hi <strong>${name}</strong>,</p>
            <p>We received a request to reset your password. Click the button below:</p>
            <a href="${resetUrl}" class="btn">Reset My Password</a>
            <p class="note">This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
          </div>
          <div class="footer">&copy; ${new Date().getFullYear()} HNU Marketplace · Holy Name University</div>
        </div>
      </body>
      </html>
    `,
  });

  if (error) throw new Error(`Email service error: ${error.message}`);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };