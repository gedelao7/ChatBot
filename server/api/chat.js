const express = require('express');
const router = express.Router();
const { getChatResponse } = require('./openai');
const { getRelevantContent } = require('./transcriptManager');

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get relevant transcript content for the query
    const relevantContent = getRelevantContent(message);
    
    // Check if we should filter by transcript context
    if (context === 'transcripts' && !relevantContent.length) {
      return res.json({ 
        response: "I'm sorry, I can only answer questions about the lecture transcripts. Please ask something related to the course content.",
        outsideScope: true,
        status: 'success'
      });
    }
    
    // Generate AI response
    const response = await getChatResponse(message, relevantContent);
    
    res.json({ 
      response,  // Using 'response' instead of 'message'
      status: 'success'
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to get response', status: 'error' });
  }
});

module.exports = router; 