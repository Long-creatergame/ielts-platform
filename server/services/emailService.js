const sgMail = require('@sendgrid/mail');

function resolveFrom() {
  return process.env.EMAIL_FROM || process.env.SENDGRID_FROM || process.env.SENDGRID_FROM_EMAIL || null;
}

function isEmailConfigured() {
  return !!process.env.SENDGRID_API_KEY && !!resolveFrom();
}

function ensureConfig(featureName = 'Email service') {
  if (!isEmailConfigured()) {
    const err = new Error(`${featureName} not configured`);
    err.statusCode = 501;
    throw err;
  }
}

function buildEmail({ subject, text, html }) {
  return {
    subject,
    text,
    html,
  };
}

function verificationTemplate(verifyUrl) {
  return buildEmail({
    subject: 'Verify your email for IELTS Writing',
    text: `Verify your email using this link: ${verifyUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color:#0f172a;">Verify your email</h2>
        <p>Thanks for signing up. Please verify your email to activate your account.</p>
        <p style="margin:24px 0;">
          <a href="${verifyUrl}" style="background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Verify email
          </a>
        </p>
        <p style="color:#64748b;font-size:12px;">If you did not create an account, you can ignore this email.</p>
      </div>
    `,
  });
}

function resetPasswordTemplate(resetUrl) {
  return buildEmail({
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
  });
}

async function sendPasswordReset(email, resetUrl) {
  ensureConfig('Password reset email service');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const content = resetPasswordTemplate(resetUrl);
  const msg = { to: email, from: resolveFrom(), ...content };

  await sgMail.send(msg);
}

async function sendEmailVerification(email, verifyUrl) {
  ensureConfig('Email verification service');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const content = verificationTemplate(verifyUrl);
  const msg = { to: email, from: resolveFrom(), ...content };
  await sgMail.send(msg);
}

module.exports = {
  sendPasswordReset,
  sendEmailVerification,
  isEmailConfigured,
};



