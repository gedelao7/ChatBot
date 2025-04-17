const express = require('express');
const router = express.Router();
const { generateQuiz } = require('./openai');

// Quiz endpoint
router.post('/quiz', async (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 5 } = req.body;
    
    // Generate quiz questions
    const questions = await generateQuiz(topic, difficulty, count);
    
    res.json({ 
      questions: questions || [], 
      status: 'success' 
    });
  } catch (error) {
    console.error('Quiz API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz', 
      status: 'error' 
    });
  }
});

module.exports = router; 