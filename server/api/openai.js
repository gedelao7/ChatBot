const OpenAI = require('openai');

// Initialize OpenAI API with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a chat response based on user message and relevant content
 * @param {string} message - User's message
 * @param {Array<string>} relevantContent - Relevant transcript content as context
 * @returns {Promise<string>} Generated response
 */
async function getChatResponse(message, relevantContent) {
  try {
    // Create system prompt with context
    let systemPrompt = 'You are a helpful course assistant that answers questions based on lecture transcripts. ';
    systemPrompt += 'Only answer questions related to the course content in the transcripts. ';
    systemPrompt += 'Keep your responses concise and informative.';
    
    // Add transcript context if available
    if (relevantContent && relevantContent.length > 0) {
      systemPrompt += '\n\nHere is the relevant course content: ' + relevantContent.join('\n\n');
    } else {
      systemPrompt += '\n\nNo specific course content is available for this query. Provide a general educational response relevant to the query context.';
    }

    // Create chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    return "I'm having trouble connecting to my knowledge base. Please try again later.";
  }
}

/**
 * Generate flashcards based on a topic
 * @param {string} topic - The topic for flashcards
 * @param {number} count - Number of flashcards to generate (default: 5)
 * @returns {Promise<Array>} Array of flashcard objects
 */
async function generateFlashcards(topic, count = 5) {
  try {
    // Create system prompt for flashcard generation
    const systemPrompt = `Generate ${count} flashcards about ${topic || 'the course material'}. 
    Each flashcard should have a question on the front and answer on the back.
    Format as a JSON array of objects with 'front' and 'back' properties.`;

    // Create chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please create ${count} flashcards about ${topic || 'the course material'}.` }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content.trim();
    
    try {
      // Try to parse the response as JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback to manual parsing if needed
      const cards = [];
      const lines = response.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Front:') || lines[i].includes('Question:')) {
          const front = lines[i].replace(/^.*?(Front|Question):/, '').trim();
          let back = '';
          
          if (i + 1 < lines.length && (lines[i + 1].includes('Back:') || lines[i + 1].includes('Answer:'))) {
            back = lines[i + 1].replace(/^.*?(Back|Answer):/, '').trim();
            i++; // Skip the back line in the next iteration
          }
          
          if (front && back) {
            cards.push({ front, back });
          }
        }
      }
      
      return cards;
    } catch (error) {
      console.error('Error parsing flashcards:', error);
      // Return sample flashcards as fallback
      return [
        { front: "What is machine learning?", back: "A subset of AI that enables systems to learn from data." },
        { front: "What is supervised learning?", back: "Learning from labeled training data." },
        { front: "What is unsupervised learning?", back: "Learning patterns from unlabeled data." }
      ];
    }
  } catch (error) {
    console.error('OpenAI API error for flashcards:', error);
    // Return sample flashcards as fallback
    return [
      { front: "What is machine learning?", back: "A subset of AI that enables systems to learn from data." },
      { front: "What is supervised learning?", back: "Learning from labeled training data." },
      { front: "What is unsupervised learning?", back: "Learning patterns from unlabeled data." }
    ];
  }
}

/**
 * Generate quiz questions based on topic and difficulty
 * @param {string} topic - The topic for quiz questions
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @param {number} count - Number of questions to generate (default: 5)
 * @returns {Promise<Array>} Array of quiz question objects
 */
async function generateQuiz(topic, difficulty = 'medium', count = 5) {
  try {
    // Create system prompt for quiz generation
    const systemPrompt = `Generate ${count} multiple-choice questions about ${topic || 'the course material'} at ${difficulty} difficulty level.
    Each question should have 4 options with 1 correct answer.
    Format as a JSON array of objects with 'question', 'options' (array), and 'correctIndex' (0-based index) properties.`;

    // Create chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please create ${count} ${difficulty}-level multiple-choice questions about ${topic || 'the course material'}.` }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content.trim();
    
    try {
      // Try to parse the response as JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback to default questions if parsing fails
      console.error('Failed to parse quiz questions', response);
      throw new Error('Parsing failed');
    } catch (error) {
      console.error('Error parsing quiz questions:', error);
      // Return sample questions as fallback
      return [
        {
          question: "What is the main characteristic of supervised learning?",
          options: [
            "It requires labeled training data",
            "It works without any data",
            "It never uses validation datasets",
            "It can only be used for regression tasks"
          ],
          correctIndex: 0
        },
        {
          question: "Which algorithm is commonly used for classification tasks?",
          options: [
            "Linear regression",
            "K-means clustering",
            "Random forest",
            "Principal Component Analysis"
          ],
          correctIndex: 2
        }
      ];
    }
  } catch (error) {
    console.error('OpenAI API error for quiz:', error);
    // Return sample questions as fallback
    return [
      {
        question: "What is the main characteristic of supervised learning?",
        options: [
          "It requires labeled training data",
          "It works without any data",
          "It never uses validation datasets",
          "It can only be used for regression tasks"
        ],
        correctIndex: 0
      },
      {
        question: "Which algorithm is commonly used for classification tasks?",
        options: [
          "Linear regression",
          "K-means clustering", 
          "Random forest",
          "Principal Component Analysis"
        ],
        correctIndex: 2
      }
    ];
  }
}

module.exports = {
  getChatResponse,
  generateFlashcards,
  generateQuiz
}; 