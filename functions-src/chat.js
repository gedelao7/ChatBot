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
const isQuestionAboutTranscript = (question, transcript) => {
  // List of keywords from the transcript
  const keywords = [
    'machine learning', 'artificial intelligence', 'data', 'patterns', 
    'supervised learning', 'unsupervised learning', 'reinforcement learning',
    'labeled data', 'unlabeled data', 'algorithm', 'models', 'training',
    'recommendation systems', 'virtual assistants', 'spam filters', 
    'fraud detection', 'medical diagnosis', 'self-driving cars', 
    'natural language processing'
  ];
  
  // Convert question to lowercase for case-insensitive matching
  const lowerQuestion = question.toLowerCase();
  
  // Check if any keyword is in the question
  return keywords.some(keyword => lowerQuestion.includes(keyword.toLowerCase()));
};

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
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
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Parse the body
    const body = JSON.parse(event.body);
    const { message, context } = body;
    
    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }
    
    // Get sample transcript
    const transcript = getSampleTranscript();
    
    // Check if the question is about the transcript
    const isRelevantQuestion = isQuestionAboutTranscript(message, transcript);
    
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
    
    // Create prompt with context
    let systemPrompt = 'You are a helpful course assistant that answers questions based on lecture transcripts. ';
    systemPrompt += 'ONLY answer questions related to the course content provided in the transcripts. ';
    systemPrompt += 'If asked about topics outside the transcripts, respond with: "I can only answer questions about the lecture transcripts." ';
    systemPrompt += 'Keep responses concise and informative.';
    
    // Add transcript context
    systemPrompt += '\n\nHere is the relevant course content: ' + transcript.content;

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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: completion.data.choices[0].message.content.trim(), status: 'success' })
    };
  } catch (error) {
    console.error('Chat API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get response', status: 'error' })
    };
  }
}; 