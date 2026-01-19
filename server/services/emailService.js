const sgMail = require('@sendgrid/mail');

function resolveFrom() {
  return process.env.SENDGRID_FROM || process.env.SENDGRID_FROM_EMAIL || null;
}

function isEmailConfigured() {
  return !!process.env.SENDGRID_API_KEY && !!resolveFrom();
}

function ensureConfig() {
  if (!isEmailConfigured()) {
    const err = new Error('Password reset email service not configured');
    err.statusCode = 501;
    throw err;
  }
}

async function sendPasswordReset(email, resetUrl) {
  ensureConfig();
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: resolveFrom(),
    subject: 'Reset your IELTS Writing password',
    text: `Reset your password using this link: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color:#0f172a;">Password reset requested</h2>
        <p>We received a request to reset your IELTS Writing Platform password.</p>
        <p style="margin:24px 0;">
          <a href="${resetUrl}" style="background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Reset password
          </a>
        </p>
        <p>If you did not request this change, you can safely ignore this email.</p>
      </div>
    `,
  };

  await sgMail.send(msg);
}

module.exports = {
  sendPasswordReset,
  isEmailConfigured,
};



