const express = require('express');
const router = express.Router();
const { generateFlashcards } = require('./openai');
const { getTranscriptById } = require('./transcriptManager');

// Generate flashcards
router.post('/flashcards', async (req, res) => {
  try {
    const { topic, count = 5 } = req.body;
    
    // Generate flashcards
    const flashcards = await generateFlashcards(topic, count);
    
    res.json({ flashcards });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

module.exports = router; 