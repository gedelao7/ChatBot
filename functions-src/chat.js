const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Load sample transcript data
const getSampleTranscript = () => {
  return {
    id: 'sample-transcript',
    title: 'Introduction to Machine Learning',
    content: `INTRODUCTION TO MACHINE LEARNING
LECTURE 1: FOUNDATIONS AND PRINCIPLES

Machine learning is a subset of artificial intelligence that focuses on building systems that can learn from data, identify patterns, and make decisions with minimal human intervention. Unlike traditional programming where we explicitly code rules, in machine learning, we train models on data and let them discover patterns on their own.

Machine learning is often categorized into three main types:

1. Supervised Learning: Here, we train models on labeled data. The algorithm learns to map inputs to correct outputs based on example pairs.
2. Unsupervised Learning: In this approach, we use unlabeled data and let the algorithm find structure on its own.
3. Reinforcement Learning: This involves training agents to make sequences of decisions by receiving rewards or penalties.

The significance of machine learning in today's world cannot be overstated. It powers numerous applications that we interact with daily, from recommendation systems to virtual assistants, email spam filters, fraud detection, medical diagnosis, self-driving cars, and natural language processing.`
  };
};

// Function to check if a question is related to the transcript
const isQuestionAboutTranscript = (question) => {
  // List of keywords from the transcript
  const keywords = [
    'machine learning', 'artificial intelligence', 'ai', 'data', 'patterns', 
    'supervised learning', 'unsupervised learning', 'reinforcement learning',
    'labeled data', 'unlabeled data', 'algorithm', 'models', 'training',
    'recommendation systems', 'virtual assistants', 'spam filters', 
    'fraud detection', 'medical diagnosis', 'self-driving cars', 
    'natural language processing', 'nlp', 'ml', 'deep learning',
    'neural networks', 'algorithms', 'data science', 'course'
  ];
  
  // Convert question to lowercase for case-insensitive matching
  const lowerQuestion = question.toLowerCase();
  
  // Check if any keyword is in the question
  for (const keyword of keywords) {
    if (lowerQuestion.includes(keyword.toLowerCase())) {
      console.log(`Found keyword match: ${keyword}`);
      return true;
    }
  }
  
  // Treat almost anything as related for now as we're in early testing
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

    // Get sample transcript
    const transcript = getSampleTranscript();
    
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
      // Create prompt with context
      let systemPrompt = 'You are a helpful course assistant that answers questions based on lecture transcripts. ';
      systemPrompt += 'Answer questions related to the course content provided in the transcripts. ';
      systemPrompt += 'If asked about topics outside the transcripts, still try to be helpful with general knowledge about machine learning. ';
      systemPrompt += 'Keep responses concise and informative.';
      
      // Add transcript context
      systemPrompt += '\n\nHere is the relevant course content: ' + transcript.content;

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
          status: 'success'
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