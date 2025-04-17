const { Configuration, OpenAIApi } = require('openai');
const transcriptManager = require('./data/transcripts');

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
    'pulmonary', 'respiratory', 'physical therapy', 'rehabilitation'
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
  
  // During testing, we'll still allow most questions
  console.log('No keyword match found, but treating as in-scope for testing');
  return true;
};

// Simple AI response when API is not available
const getFallbackResponse = (message) => {
  const responses = [
    "I'm a course assistant designed to help with machine learning topics.",
    "Machine learning involves training models to recognize patterns in data.",
    "The course covers supervised, unsupervised, and reinforcement learning.",
    "I can help answer questions about the machine learning lectures.",
    "The course material covers AI fundamentals and practical applications."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Function to get relevant transcript content for a question
const getRelevantTranscriptContent = (question) => {
  return transcriptManager.getRelevantContent(question);
};

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Debug info
  console.log('Chat function called');
  console.log('HTTP Method:', event.httpMethod);
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    // Make sure this is a POST request
    if (event.httpMethod !== 'POST') {
      console.log('Method not allowed:', event.httpMethod);
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ 
          error: 'Method not allowed', 
          method: event.httpMethod,
          status: 'error'
        })
      };
    }

    // Parse the body
    let body;
    try {
      console.log('Request body:', event.body);
      body = JSON.parse(event.body);
      console.log('Parsed body:', body);
    } catch (error) {
      console.error('Error parsing JSON body:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body',
          message: error.message,
          status: 'error'
        })
      };
    }
    
    const { message, context } = body;
    
    if (!message) {
      console.log('Message is required');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Message is required',
          status: 'error'
        })
      };
    }
    
    console.log('Processing message:', message);
    console.log('Context:', context);
    
    // Check if the question is about the transcript
    const isRelevantQuestion = isQuestionAboutTranscript(message);
    console.log('Is relevant question:', isRelevantQuestion);
    
    // If the context is specifically about transcripts and the question is not relevant
    if (context === 'transcripts' && !isRelevantQuestion) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          response: "I'm sorry, I can only answer questions about the lecture transcripts. Please ask something related to the course content.",
          outsideScope: true,
          status: 'success'
        })
      };
    }
    
    try {
      // Get relevant transcript content
      const relevantContent = getRelevantTranscriptContent(message);
      console.log('Relevant content found:', relevantContent.length > 0);
      
      // Create prompt with context
      let systemPrompt = 'You are a helpful course assistant that answers questions based on lecture transcripts. ';
      
      if (relevantContent.length > 0) {
        systemPrompt += 'Answer questions using ONLY the information from the provided transcript excerpts. ';
        systemPrompt += 'If the information needed is not in the excerpts, say "I don\'t see that information in the lecture notes." ';
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
      } else {
        // Add general transcript summaries
        systemPrompt += '\n\nHere are the course topics:\n\n';
        transcriptManager.getAllTranscripts().forEach(transcript => {
          const fullTranscript = transcriptManager.getTranscriptById(transcript.id);
          systemPrompt += `${fullTranscript.title}:\n`;
          
          // Add first paragraph of each transcript as a summary
          const firstParagraph = fullTranscript.content.split('\n\n')[0];
          systemPrompt += `${firstParagraph}\n\n`;
        });
      }

      console.log('Calling OpenAI API');
      
      // Call OpenAI API
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      
      console.log('OpenAI response received');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          response: completion.data.choices[0].message.content.trim(),
          status: 'success'
        })
      };
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      
      // Provide fallback response if API call fails
      const fallbackResponse = getFallbackResponse(message);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          response: fallbackResponse + " (Note: OpenAI API currently unavailable. This is a fallback response.)",
          fallback: true,
          status: 'error'
        })
      };
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get response',
        message: error.message,
        status: 'error'
      })
    };
  }
}; 