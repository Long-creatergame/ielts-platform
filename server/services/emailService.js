const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Prefer SendGrid if available
      if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
        });
        this.fromAddress = process.env.SENDGRID_FROM_EMAIL;
        this.isConfigured = true;
        console.log('Email service initialized with SendGrid SMTP');
        return;
      }

      // Fallback to generic SMTP
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        this.fromAddress = process.env.EMAIL_USER;
        this.isConfigured = true;
        console.log('Email service initialized with generic SMTP');
        return;
      }

      console.warn('Email service not configured. Set SENDGRID_API_KEY/SENDGRID_FROM_EMAIL or EMAIL_HOST/EMAIL_USER/EMAIL_PASS');
      return;

    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.isConfigured || !this.transporter) {
      console.warn('Email service not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const from = this.fromAddress || process.env.EMAIL_USER || process.env.SENDGRID_FROM_EMAIL;
      const mailOptions = {
        from: `"IELTS Platform" <${from}>`,
        to: to,
        subject: subject,
        html: html,
        text: text || this.htmlToText(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  htmlToText(html) {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  // Welcome email for new users
  async sendWelcomeEmail(user) {
    const subject = 'Welcome to IELTS Platform! 🎉';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to IELTS Platform!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your journey to IELTS success starts here</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hi ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining our IELTS preparation platform. We're excited to help you achieve your target band score!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">🎯 Your Target: Band ${user.targetBand || 7.0}</h3>
            <p style="color: #666; margin: 5px 0;">Current Level: ${user.currentLevel || 'Intermediate'}</p>
            <p style="color: #666; margin: 5px 0;">Goal: ${user.goal || 'Academic Study'}</p>
          </div>
          
          <h3 style="color: #333;">🚀 Get Started:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Take a practice test to assess your current level</li>
            <li>Explore AI-powered practice questions</li>
            <li>Track your progress with detailed analytics</li>
            <li>Get personalized recommendations</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/test/start" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Start Your First Test
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Need help? Contact us at support@ieltsplatform.com
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  // Weekly progress report
  async sendWeeklyReport(user, reportData) {
    const subject = `Your Weekly IELTS Progress Report - Week of ${reportData.week.start}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">📊 Weekly Progress Report</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${reportData.week.start} to ${reportData.week.end}</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hi ${user.name}!</h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 20px 0;">
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin: 0; font-size: 32px;">${reportData.metrics.totalTests}</h3>
              <p style="color: #666; margin: 5px 0 0 0;">Tests Completed</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin: 0; font-size: 32px;">${reportData.metrics.averageScore}</h3>
              <p style="color: #666; margin: 5px 0 0 0;">Average Score</p>
            </div>
          </div>
          
          ${reportData.insights.length > 0 ? `
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">💡 This Week's Insights</h3>
              <ul style="color: #666; line-height: 1.6; margin: 0;">
                ${reportData.insights.map(insight => `<li>${insight}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${reportData.recommendations.length > 0 ? `
            <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #7b1fa2; margin-top: 0;">🚀 Recommendations</h3>
              <ul style="color: #666; line-height: 1.6; margin: 0;">
                ${reportData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              View Full Dashboard
            </a>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  // Test completion notification
  async sendTestCompletionEmail(user, testResult) {
    const subject = `Test Completed! Your Score: ${testResult.overallBand}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Test Completed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Great job on finishing your IELTS practice test</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hi ${user.name}!</h2>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0;">Your Overall Band Score</h3>
            <div style="font-size: 48px; font-weight: bold; color: #4caf50; margin: 10px 0;">${testResult.overallBand}</div>
            <p style="color: #666; margin: 0;">${testResult.testType || 'IELTS Practice Test'}</p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin: 20px 0;">
            ${Object.entries(testResult.skillScores || {}).map(([skill, score]) => `
              <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h4 style="color: #333; margin: 0 0 5px 0; text-transform: capitalize;">${skill}</h4>
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">${score}</div>
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/test/result/${testResult.id}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              View Detailed Results
            </a>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  // Milestone achievement notification
  async sendMilestoneEmail(user, milestone) {
    const subject = `🏆 Milestone Achieved: ${milestone}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🏆 Milestone Achieved!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Congratulations on your achievement</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hi ${user.name}!</h2>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0;">🎉 ${milestone.replace(/_/g, ' ').toUpperCase()}</h3>
            <p style="color: #666; margin: 10px 0 0 0;">You've reached an important milestone in your IELTS journey!</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              View Your Progress
            </a>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();