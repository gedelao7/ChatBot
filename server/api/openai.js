const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateChatResponse(message, context = '') {
  try {
    const systemPrompt = `You are a helpful course assistant that answers questions based on lecture transcripts. 
    Only answer questions related to the course content provided. 
    If asked about topics outside the content, politely explain that you can only answer questions about the course material. 
    Keep responses concise and informative.
    
    Course content: ${context}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return {
      status: 'success',
      response: completion.choices[0].message.content.trim()
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate response');
  }
}

async function generateFlashcards(topic, content) {
  try {
    const prompt = `Generate 5 flashcards based on the following lecture content: ${content}
    ${topic ? `\nFocus on the topic: ${topic}.` : ''}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that generates educational flashcards based on course content." 
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate flashcards');
  }
}

async function generateQuiz(topic, content, difficulty = 'medium') {
  try {
    const prompt = `Generate 5 multiple-choice quiz questions based on the following lecture content: ${content}
    ${topic ? `\nFocus on the topic: ${topic}.` : ''}
    Make the questions ${difficulty} difficulty.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that generates educational quizzes. Format each question with 4 options and indicate the correct answer with correctIndex (0-3)." 
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate quiz');
  }
}

module.exports = {
  generateChatResponse,
  generateFlashcards,
  generateQuiz
}; 