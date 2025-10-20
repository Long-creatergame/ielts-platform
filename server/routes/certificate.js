const express = require('express');
const auth = require('../middleware/auth');
const { generateCertificate, verifyCertificate } = require('../controllers/certificate.controller');

const router = express.Router();

// Generate PDF certificate (requires authentication)
router.get('/:testId/pdf', auth, generateCertificate);

// Verify certificate (public endpoint)
router.get('/verify/:testId', verifyCertificate);

module.exports = router;
