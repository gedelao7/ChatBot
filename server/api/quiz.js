const express = require('express');
const router = express.Router();
const { generateQuizQuestions } = require('./openai');

// Generate quiz questions
router.post('/quiz', async (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 5 } = req.body;
    
    // Generate quiz questions
    const questions = await generateQuizQuestions(topic, difficulty, count);
    
    res.json({ questions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

module.exports = router; 