const express = require('express');
const router = express.Router();
const { generateFlashcards } = require('./openai');

// Flashcards endpoint
router.post('/flashcards', async (req, res) => {
  try {
    const { topic } = req.body;
    
    // Generate flashcards
    const flashcards = await generateFlashcards(topic);
    
    res.json({ 
      flashcards: flashcards || [], 
      status: 'success' 
    });
  } catch (error) {
    console.error('Flashcards API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate flashcards', 
      status: 'error' 
    });
  }
});

module.exports = router; 