import express from 'express';

const router = express.Router();

// POST /ai/assess - AI Assessment endpoint
router.post('/assess', async (req, res) => {
  try {
    const { skill, answer, level } = req.body;
    
    if (!answer || answer.trim().length === 0) {
      return res.json({
        bandScore: 0,
        feedback: 'No answer provided. Please complete the task to receive an assessment.'
      });
    }

    // TEMPORARY: Disable AI assessment to fix deployment
    // TODO: Re-enable after fixing OpenAI API key and billing
    return res.json({
      bandScore: 6.0,
      feedback: 'AI assessment temporarily disabled. Basic scoring applied. Please contact support if you need detailed feedback.'
    });

  } catch (error) {
    console.error('AI assessment error:', error);
    res.status(500).json({
      bandScore: 5.0,
      feedback: 'AI assessment temporarily unavailable. Please try again later.'
    });
  }
});

export default router;