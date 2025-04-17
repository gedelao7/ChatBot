const express = require('express');
const router = express.Router();
const { getChatResponse } = require('./openai');
const { getRelevantContent } = require('./transcriptManager');

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get relevant transcript content for the query
    const relevantContent = getRelevantContent(message);
    
    // Generate AI response
    const response = await getChatResponse(message, relevantContent);
    
    res.json({ message: response });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

module.exports = router; 