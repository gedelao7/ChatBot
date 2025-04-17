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

1. Supervised Learning: Here, we train models on labeled data. The algorithm learns to map inputs to the correct outputs based on example pairs.
2. Unsupervised Learning: In this approach, we use unlabeled data and let the algorithm find structure on its own.
3. Reinforcement Learning: This involves training agents to make sequences of decisions by receiving rewards or penalties.

The significance of machine learning in today's world cannot be overstated. It powers numerous applications that we interact with daily, from recommendation systems to virtual assistants, email spam filters, fraud detection, medical diagnosis, self-driving cars, and natural language processing.`
  };
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
    const { topic, difficulty = 'medium' } = body;
    
    // Get sample transcript
    const transcript = getSampleTranscript();
    
    // Create prompt with context
    let prompt = `Generate 5 multiple-choice quiz questions based on the following lecture content: ${transcript.content}`;
    
    if (topic) {
      prompt += `\nFocus on the topic: ${topic}.`;
    }
    
    prompt += `\nMake the questions ${difficulty} difficulty.`;
    
    // Add instructions to format as JSON
    prompt += `\n\nReturn the questions as a JSON array in the following format:
    {
      "questions": [
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 0
        },
        etc.
      ]
    }`;
    
    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that generates educational quizzes. Format each question with 4 options and indicate the correct answer with correctIndex (0-3).' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });
    
    // Parse response
    const content = completion.data.choices[0].message.content.trim();
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (e) {
      // If parsing fails, try to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    }
    
    // Format questions if needed
    const questions = parsedResponse.questions || [];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ questions })
    };
  } catch (error) {
    console.error('Quiz generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate quiz' })
    };
  }
}; 