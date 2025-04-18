const { OpenAI } = require('openai');
const transcripts = require('./data/transcripts');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to check if a question is related to the transcript
const isQuestionAboutTranscript = (question) => {
  // Get transcript-specific keywords
  const transcriptKeywords = [];
  transcripts.getAllTranscripts().forEach(transcript => {
    const fullTranscript = transcripts.getTranscriptById(transcript.id);
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
  // This is for testing purposes and to be more lenient with user questions
  console.log('No keyword match found, but allowing question');
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
  return transcripts.getRelevantContent(question);
};

exports.handler = async (event, context) => {
  try {
    const { message } = JSON.parse(event.body);
    
    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }
    
    let response;
    
    if (message.toLowerCase().includes('create flashcards')) {
      response = await generateFlashcards(message);
    } else if (message.toLowerCase().includes('create quiz')) {
      response = await generateQuiz(message);
    } else {
      response = await generateChatResponse(message);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        response: response,
        status: 'success'
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
        error: 'Failed to process request'
      })
    };
  }
};

async function generateFlashcards(message) {
  const prompt = `
    Create 5 flashcards about the heart based on the lecture transcript.
    Format each flashcard as:
    Front: [Question]
    Back: [Answer]
    
    Separate each flashcard with a blank line.
    Keep questions and answers concise and clear.
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that creates educational flashcards."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7
  });
  
  return response.choices[0].message.content;
}

async function generateQuiz(message) {
  const prompt = `
    Create 5 multiple-choice questions about the heart based on the lecture transcript.
    Format each question as:
    [Question]
    a) [Option 1]
    b) [Option 2]
    c) [Option 3]
    d) [Option 4]
    
    Separate each question with a blank line.
    Make sure the first option (a) is always the correct answer.
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that creates educational quiz questions."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7
  });
  
  return response.choices[0].message.content;
}

async function generateChatResponse(message) {
  const prompt = `
    Answer the following question based on the lecture transcript about the heart.
    If the question is not related to the transcript, say so politely.
    
    Question: ${message}
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that answers questions about the lecture content."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7
  });
  
  return response.choices[0].message.content;
} 