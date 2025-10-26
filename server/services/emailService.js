const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Email templates
const templates = {
  welcome: (userName) => ({
    subject: '🎉 Welcome to IELTS Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to IELTS Platform!</h1>
        <p>Hi ${userName},</p>
        <p>Thank you for joining our IELTS preparation platform! 🎓</p>
        <p>Start your journey to IELTS success with personalized practice tests, AI-powered feedback, and comprehensive skill development.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What's Next?</h3>
          <ul>
            <li>📝 Take your first practice test</li>
            <li>🎯 Set your target IELTS band</li>
            <li>🔥 Complete daily challenges</li>
            <li>📊 Track your progress</li>
          </ul>
        </div>
        <p>Happy learning!</p>
        <p>The IELTS Platform Team</p>
      </div>
    `
  }),

  testCompletion: (userName, score, band) => ({
    subject: '🎯 Your IELTS Test Results',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Great job, ${userName}! 🎉</h1>
        <p>You've completed your IELTS practice test!</p>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; color: white; margin: 20px 0;">
          <h2 style="margin: 0; font-size: 48px;">${band}</h2>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Overall Band Score</p>
        </div>
        <p>Keep practicing to improve your score! 💪</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Detailed Results
          </a>
        </div>
      </div>
    `
  }),

  dailyChallenge: (userName, streak) => ({
    subject: `🔥 ${streak} Day Streak! Keep It Going!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">${streak} Day Streak! 🔥</h1>
        <p>Hi ${userName},</p>
        <p>Congratulations on maintaining a ${streak}-day streak! 🎉</p>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0;"><strong>💡 Today's Challenge Awaits!</strong></p>
          <p style="margin: 10px 0 0 0;">Complete today's challenge to extend your streak and earn bonus points!</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
             style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Start Today's Challenge
          </a>
        </div>
      </div>
    `
  }),

  milestone: (userName, milestoneName) => ({
    subject: '🏆 Achievement Unlocked!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Achievement Unlocked! 🏆</h1>
        <p>Hi ${userName},</p>
        <p>Congratulations! You've unlocked a new achievement: <strong>${milestoneName}</strong></p>
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; text-align: center; color: white; margin: 20px 0;">
          <p style="font-size: 72px; margin: 0;">🏆</p>
          <h2 style="margin: 10px 0; color: white;">${milestoneName}</h2>
        </div>
        <p>Your dedication is paying off! Keep up the excellent work! 💪</p>
      </div>
    `
  }),

  weeklyReport: (userName, stats) => ({
    subject: '📊 Your Weekly Progress Report',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Weekly Progress Report 📊</h1>
        <p>Hi ${userName},</p>
        <p>Here's your progress this week:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span><strong>Tests Completed:</strong></span>
            <span style="color: #2563eb; font-size: 18px;">${stats.tests || 0}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span><strong>Daily Streak:</strong></span>
            <span style="color: #f59e0b; font-size: 18px;">${stats.streak || 0} days</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span><strong>Highest Score:</strong></span>
            <span style="color: #10b981; font-size: 18px;">${stats.bestScore || 'N/A'}</span>
          </div>
        </div>
        <p>Keep up the great work! 🚀</p>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: '🔐 Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Password Reset Request</h1>
        <p>Hi ${data.userName},</p>
        <p>We received a request to reset your password for your IELTS Platform account.</p>
        
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px; text-align: center; color: white; margin: 20px 0;">
          <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 4px;">${data.resetCode}</p>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Your Reset Code</p>
        </div>

        <p><strong>Or click the button below to reset your password:</strong></p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetLink}" 
             style="background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="color: #6b7280; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, templateName, data) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('⚠️ SENDGRID_API_KEY not set. Email would have been sent to:', to);
      return { success: false, message: 'Email service not configured' };
    }

    const template = templates[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const emailContent = typeof template === 'function' ? template(data) : template;

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@ieltsplatform.com',
      subject: emailContent.subject,
      html: emailContent.html
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}: ${templateName}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  templates
};
