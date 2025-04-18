const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const transcriptManager = require('./transcriptManager');

// Initialize OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Function to check if a question is related to the transcript
const isQuestionAboutTranscript = (question) => {
  // Get transcript-specific keywords
  const transcriptKeywords = [];
  transcriptManager.getAllTranscripts().forEach(transcript => {
    const fullTranscript = transcriptManager.getTranscriptById(transcript.id);
    const title = fullTranscript.title.toLowerCase();
    // Add transcript title words as keywords
    title.split(/\s+/).forEach(word => {
      if (word.length > 3) transcriptKeywords.push(word);
    });
  });
  
  // General subject keywords
  const subjectKeywords = [
    'machine learning', 'artificial intelligence', 'ai', 'data', 'patterns', 
    'supervised learning', 'unsupervised learning', 'reinforcement learning',
    'labeled data', 'unlabeled data', 'algorithm', 'models', 'training',
    'recommendation systems', 'virtual assistants', 'spam filters', 
    'fraud detection', 'medical diagnosis', 'self-driving cars', 
    'natural language processing', 'nlp', 'ml', 'deep learning',
    'neural networks', 'algorithms', 'data science', 'course',
    'cardiopulmonary', 'heart', 'lungs', 'breathing', 'cardiac',
    'pulmonary', 'respiratory', 'physical therapy', 'rehabilitation',
    'anatomy', 'physiology', 'structure', 'function', 'blood',
    'oxygen', 'circulation', 'vessels', 'arteries', 'veins',
    'capillaries', 'ventilation', 'respiration', 'gas exchange',
    'assessment', 'diagnosis', 'treatment', 'intervention',
    'exercise', 'rehabilitation', 'pathology', 'disease',
    'condition', 'symptoms', 'signs', 'monitoring', 'testing',
    'organ', 'system', 'body', 'health', 'medical', 'patient',
    'care', 'clinical', 'practice', 'doctor', 'nurse', 'hospital',
    'medicine', 'healthcare', 'wellness', 'fitness', 'exercise',
    'training', 'education', 'learn', 'study', 'course', 'class',
    'lecture', 'material', 'content', 'topic', 'subject', 'field',
    'area', 'discipline', 'specialty', 'profession', 'career'
  ];
  
  const allKeywords = [...new Set([...transcriptKeywords, ...subjectKeywords])];
  
  // Convert question to lowercase for case-insensitive matching
  const lowerQuestion = question.toLowerCase();
  
  // Check if any keyword is in the question
  for (const keyword of allKeywords) {
    if (lowerQuestion.includes(keyword.toLowerCase())) {
      console.log(`Found keyword match: ${keyword}`);
      return true;
    }
  }
  
  // If no keyword match found, still allow the question
  console.log('No keyword match found, but allowing question');
  return true;
};

// Function to get relevant transcript content
const getRelevantTranscriptContent = (question) => {
  return transcriptManager.searchTranscripts(question);
};

// Handle chat messages
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get relevant transcript content
    const relevantContent = getRelevantTranscriptContent(message);
    
    // Create prompt with context
    let systemPrompt = 'You are a helpful course assistant that answers questions based on lecture transcripts. ';
    
    if (relevantContent.length > 0) {
      systemPrompt += 'Answer questions using the information from the provided transcript excerpts. ';
      systemPrompt += 'If the information needed is not in the excerpts, provide a general answer based on your knowledge. ';
    } else {
      systemPrompt += 'Answer questions related to the course topics. ';
      systemPrompt += 'For questions outside your knowledge, acknowledge the limitations of your information. ';
    }
    
    systemPrompt += 'Keep responses concise and informative.';
    
    // Add transcript context if available
    if (relevantContent.length > 0) {
      systemPrompt += '\n\nHere are the relevant lecture excerpts:\n\n';
      relevantContent.forEach((content, index) => {
        systemPrompt += `EXCERPT ${index + 1}:\n${content}\n\n`;
      });
    }
    
    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const response = completion.data.choices[0].message.content;
    
    res.json({
      response,
      status: 'success'
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      status: 'error'
    });
  }
});

module.exports = router; 