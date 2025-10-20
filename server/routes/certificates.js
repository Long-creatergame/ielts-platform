const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

const router = express.Router();

// Create certificates directory if it doesn't exist
const certificatesDir = path.join(__dirname, '../certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

// 🎓 Generate certificate PDF
router.post("/generate/:userId", async (req, res) => {
  try {
    const { achievementType, milestone, description } = req.body;
    const userId = req.params.userId;

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get achievement info
    const achievement = await Achievement.findOne({ userId });
    const bandScore = achievement ? achievement.totalBandAverage?.toFixed(1) || 0 : 0;

    // Create PDF
    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 50,
      layout: 'landscape' // Use landscape for better certificate layout
    });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${user.name.replace(/\s+/g, '_')}_${achievementType.replace(/\s+/g, '_')}_${timestamp}.pdf`;
    const outputPath = path.join(certificatesDir, filename);
    const outputStream = fs.createWriteStream(outputPath);

    doc.pipe(outputStream);

    // --- Certificate Layout ---
    // Background
    doc.rect(0, 0, 842, 595)
       .fill('#f8fff8'); // Light green background

    // Border
    doc.strokeColor('#35b86d')
       .lineWidth(8)
       .rect(20, 20, 802, 555)
       .stroke();

    // Inner border
    doc.strokeColor('#35b86d')
       .lineWidth(2)
       .rect(40, 40, 762, 515)
       .stroke();

    // Title
    doc.fillColor('#35b86d')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text('IELTS ACHIEVEMENT CERTIFICATE', 421, 80, { align: 'center' });

    // Subtitle
    doc.fillColor('#2d5a3d')
       .fontSize(16)
       .font('Helvetica')
       .text('Recognizing Excellence in IELTS Learning', 421, 120, { align: 'center' });

    // Decorative line
    doc.strokeColor('#35b86d')
       .lineWidth(3)
       .moveTo(200, 140)
       .lineTo(642, 140)
       .stroke();

    // Main content
    doc.fillColor('#333')
       .fontSize(18)
       .font('Helvetica')
       .text('This is to certify that', 421, 180, { align: 'center' });

    // Student name
    doc.fillColor('#35b86d')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text(user.name.toUpperCase(), 421, 220, { align: 'center' });

    // Achievement
    doc.fillColor('#333')
       .fontSize(16)
       .font('Helvetica')
       .text('has successfully achieved', 421, 270, { align: 'center' });

    doc.fillColor('#35b86d')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(achievementType, 421, 300, { align: 'center' });

    // Band score
    if (bandScore > 0) {
      doc.fillColor('#333')
         .fontSize(16)
         .font('Helvetica')
         .text(`with an average band score of`, 421, 340, { align: 'center' });

      doc.fillColor('#35b86d')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text(`${bandScore}`, 421, 370, { align: 'center' });
    }

    // Milestone info
    if (milestone) {
      doc.fillColor('#666')
         .fontSize(14)
         .font('Helvetica')
         .text(`Milestone: ${milestone}`, 421, 420, { align: 'center' });
    }

    // Date
    doc.fillColor('#333')
       .fontSize(14)
       .font('Helvetica')
       .text(`Date of Issue: ${new Date().toLocaleDateString('en-US', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       })}`, 421, 450, { align: 'center' });

    // Description
    if (description) {
      doc.fillColor('#666')
         .fontSize(12)
         .font('Helvetica')
         .text(description, 421, 480, { 
           align: 'center',
           width: 600
         });
    }

    // Footer
    doc.fillColor('#35b86d')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Antoree x IELTS Platform', 421, 520, { align: 'center' });

    // Signature lines
    doc.fillColor('#333')
       .fontSize(12)
       .font('Helvetica')
       .text('_________________________', 150, 560)
       .text('Academic Director', 150, 575);

    doc.text('_________________________', 642, 560, { align: 'right' })
       .text('Date', 642, 575, { align: 'right' });

    doc.end();

    outputStream.on('finish', async () => {
      try {
        // Save certificate record
        const cert = new Certificate({
          userId,
          name: user.name,
          achievementType,
          bandScore: parseFloat(bandScore),
          pdfUrl: `/certificates/${filename}`,
          description: description || '',
          milestone: milestone || '',
        });

        await cert.save();

        res.json({ 
          message: "Certificate generated successfully", 
          certificate: {
            _id: cert._id,
            achievementType: cert.achievementType,
            bandScore: cert.bandScore,
            issueDate: cert.issueDate,
            pdfUrl: cert.pdfUrl,
            milestone: cert.milestone
          }
        });
      } catch (saveError) {
        console.error('Error saving certificate:', saveError);
        res.status(500).json({ message: "Failed to save certificate record" });
      }
    });

    outputStream.on('error', (error) => {
      console.error('PDF generation error:', error);
      res.status(500).json({ message: "Failed to generate PDF" });
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: "Failed to generate certificate" });
  }
});

// 📜 Get user certificates
router.get("/user/:userId", async (req, res) => {
  try {
    const certificates = await Certificate.find({ 
      userId: req.params.userId,
      isActive: true 
    }).sort({ issueDate: -1 });

    res.json(certificates);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 📄 Serve certificate PDF files
router.get("/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(certificatesDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Certificate file not found" });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Certificate download error:', error);
    res.status(500).json({ message: "Failed to download certificate" });
  }
});

// 🏆 Check eligibility for certificates
router.get("/eligibility/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const achievement = await Achievement.findOne({ userId });
    const existingCerts = await Certificate.find({ userId, isActive: true });

    if (!achievement) {
      return res.json({ 
        eligible: false, 
        message: "Complete some tests to become eligible for certificates" 
      });
    }

    const eligibleCertificates = [];
    
    // Check Band 8+ eligibility
    if (achievement.totalBandAverage >= 8 && 
        !existingCerts.some(c => c.achievementType === 'Band 8 Achiever')) {
      eligibleCertificates.push({
        type: 'Band 8 Achiever',
        milestone: 'Band 8+',
        description: 'Achieved an average band score of 8.0 or higher'
      });
    }

    // Check Band 7+ eligibility
    if (achievement.totalBandAverage >= 7 && achievement.totalBandAverage < 8 && 
        !existingCerts.some(c => c.achievementType === 'Band 7 Achiever')) {
      eligibleCertificates.push({
        type: 'Band 7 Achiever',
        milestone: 'Band 7+',
        description: 'Achieved an average band score of 7.0 or higher'
      });
    }

    // Check Test Master eligibility
    if (achievement.totalTests >= 60 && 
        !existingCerts.some(c => c.achievementType === 'Test Master')) {
      eligibleCertificates.push({
        type: 'Test Master',
        milestone: '60+ Tests',
        description: 'Completed 60 or more IELTS practice tests'
      });
    }

    // Check Dedicated Learner eligibility
    if (achievement.totalTests >= 30 && 
        !existingCerts.some(c => c.achievementType === 'Dedicated Learner')) {
      eligibleCertificates.push({
        type: 'Dedicated Learner',
        milestone: '30+ Tests',
        description: 'Completed 30 or more IELTS practice tests'
      });
    }

    // Check Streak Champion eligibility
    if (achievement.streak >= 30 && 
        !existingCerts.some(c => c.achievementType === 'Streak Champion')) {
      eligibleCertificates.push({
        type: 'Streak Champion',
        milestone: '30-day streak',
        description: 'Maintained a 30-day study streak'
      });
    }

    // Check Weekly Warrior eligibility
    if (achievement.streak >= 7 && 
        !existingCerts.some(c => c.achievementType === 'Weekly Warrior')) {
      eligibleCertificates.push({
        type: 'Weekly Warrior',
        milestone: '7-day streak',
        description: 'Maintained a 7-day study streak'
      });
    }

    res.json({
      eligible: eligibleCertificates.length > 0,
      eligibleCertificates,
      currentStats: {
        totalTests: achievement.totalTests,
        totalBandAverage: achievement.totalBandAverage,
        streak: achievement.streak,
        level: achievement.level
      }
    });

  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 🎓 Auto-generate certificates for eligible achievements
router.post("/auto-generate/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const achievement = await Achievement.findOne({ userId });
    
    if (!achievement) {
      return res.json({ message: "No achievements found" });
    }

    const generatedCertificates = [];

    // Check and generate Band 8+ certificate
    if (achievement.totalBandAverage >= 8) {
      const existingCert = await Certificate.findOne({ 
        userId, 
        achievementType: 'Band 8 Achiever' 
      });
      
      if (!existingCert) {
        const response = await fetch(`http://localhost:4000/api/certificates/generate/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            achievementType: 'Band 8 Achiever',
            milestone: 'Band 8+',
            description: 'Outstanding achievement in IELTS preparation with band score 8.0 or higher'
          })
        });
        
        if (response.ok) {
          generatedCertificates.push('Band 8 Achiever');
        }
      }
    }

    // Check and generate Test Master certificate
    if (achievement.totalTests >= 60) {
      const existingCert = await Certificate.findOne({ 
        userId, 
        achievementType: 'Test Master' 
      });
      
      if (!existingCert) {
        const response = await fetch(`http://localhost:4000/api/certificates/generate/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            achievementType: 'Test Master',
            milestone: '60+ Tests',
            description: 'Exceptional dedication with 60 or more completed IELTS practice tests'
          })
        });
        
        if (response.ok) {
          generatedCertificates.push('Test Master');
        }
      }
    }

    // Check and generate Streak Champion certificate
    if (achievement.streak >= 30) {
      const existingCert = await Certificate.findOne({ 
        userId, 
        achievementType: 'Streak Champion' 
      });
      
      if (!existingCert) {
        const response = await fetch(`http://localhost:4000/api/certificates/generate/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            achievementType: 'Streak Champion',
            milestone: '30-day streak',
            description: 'Incredible consistency with a 30-day study streak'
          })
        });
        
        if (response.ok) {
          generatedCertificates.push('Streak Champion');
        }
      }
    }

    res.json({
      message: "Auto-generation complete",
      generatedCertificates,
      totalGenerated: generatedCertificates.length
    });

  } catch (error) {
    console.error('Auto-generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
