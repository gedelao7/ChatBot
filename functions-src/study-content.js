const { OpenAI } = require('openai');
const transcripts = require('./data/transcripts');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event, context) => {
  try {
    // Get the current transcript content
    const transcriptContent = transcripts.getCurrentTranscript();
    
    // Generate flashcards
    const flashcards = await generateFlashcards(transcriptContent);
    
    // Generate quiz questions
    const quizQuestions = await generateQuizQuestions(transcriptContent);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        flashcards,
        quizQuestions
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to generate study content'
      })
    };
  }
};

async function generateFlashcards(content) {
  const prompt = `
    Based on the following lecture transcript, create 5 flashcards that cover key concepts.
    Each flashcard should have a clear question and a concise answer.
    Format the response as a JSON array of objects with 'question' and 'answer' properties.
    
    Transcript:
    ${content}
    
    Response format:
    [
      {
        "question": "What is...",
        "answer": "The answer is..."
      }
    ]
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that creates educational flashcards from lecture transcripts."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7
  });
  
  return JSON.parse(response.choices[0].message.content);
}

async function generateQuizQuestions(content) {
  const prompt = `
    Based on the following lecture transcript, create 5 multiple-choice quiz questions.
    Each question should have 4 options and one correct answer.
    Format the response as a JSON array of objects with 'question', 'options', and 'correctAnswer' properties.
    
    Transcript:
    ${content}
    
    Response format:
    [
      {
        "question": "What is...",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": 0
      }
    ]
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that creates educational quiz questions from lecture transcripts."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7
  });
  
  return JSON.parse(response.choices[0].message.content);
} 