const serverless = require('serverless-http');
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get sample transcript as context
    const transcript = getSampleTranscript();
    const transcriptContext = [{
      title: transcript.title,
      content: transcript.content
    }];
    
    // Create prompt with context
    let systemPrompt = 'You are a helpful course assistant that answers questions based on lecture transcripts. ';
    systemPrompt += 'Only answer questions related to the course content provided in the transcripts. ';
    systemPrompt += 'If asked about topics outside the transcripts, politely explain that you can only answer questions about the course material. ';
    systemPrompt += 'Keep responses concise and informative.';
    
    // Add transcript context
    systemPrompt += '\n\nHere is the relevant course content: ' + transcriptContext[0].content;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    res.json({ response: response.choices[0].message.content.trim(), status: 'success' });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to get response', status: 'error' });
  }
});

// Flashcards endpoint
app.post('/flashcards', async (req, res) => {
  try {
    const { topic } = req.body;
    
    // Get sample transcript
    const transcript = getSampleTranscript();
    
    // Create prompt with context
    let prompt = `Generate 5 flashcards based on the following lecture content: ${transcript.content}`;
    
    if (topic) {
      prompt += `\nFocus on the topic: ${topic}.`;
    }
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that generates educational flashcards based on course content.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    
    // Parse response
    const content = response.choices[0].message.content.trim();
    const parsedResponse = JSON.parse(content);
    
    // Format flashcards if needed
    const flashcards = parsedResponse.flashcards || [];
    
    res.json({ flashcards });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

// Quiz endpoint
app.post('/quiz', async (req, res) => {
  try {
    const { topic, difficulty = 'medium' } = req.body;
    
    // Get sample transcript
    const transcript = getSampleTranscript();
    
    // Create prompt with context
    let prompt = `Generate 5 multiple-choice quiz questions based on the following lecture content: ${transcript.content}`;
    
    if (topic) {
      prompt += `\nFocus on the topic: ${topic}.`;
    }
    
    prompt += `\nMake the questions ${difficulty} difficulty.`;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that generates educational quizzes. Format each question with 4 options and indicate the correct answer with correctIndex (0-3).' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    
    // Parse response
    const content = response.choices[0].message.content.trim();
    const parsedResponse = JSON.parse(content);
    
    // Format questions if needed
    const questions = parsedResponse.questions || [];
    
    res.json({ questions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Topics endpoint
app.get('/topics', (req, res) => {
  const topics = [
    { id: 'intro', name: 'Introduction to the Course' },
    { id: 'basics', name: 'Machine Learning Basics' },
    { id: 'supervised', name: 'Supervised Learning' },
    { id: 'unsupervised', name: 'Unsupervised Learning' }
  ];
  
  res.json({ topics });
});

// Videos/Resources endpoint
app.get('/videos', (req, res) => {
  const resources = {
    videos: [
      {
        id: "youtube1",
        title: "Introduction to Machine Learning",
        videoUrl: "https://www.youtube.com/embed/mJeNghZXtMo",
        transcript: "This video provides an introduction to machine learning concepts, supervised and unsupervised learning, and practical applications.",
        resourceType: "video",
        dateAdded: new Date().toISOString()
      },
      {
        id: "website1",
        title: "Machine Learning Documentation",
        videoUrl: "https://scikit-learn.org/stable/getting_started.html",
        transcript: "Official documentation for scikit-learn, a popular machine learning library that implements various algorithms.",
        resourceType: "website",
        dateAdded: new Date().toISOString()
      }
    ]
  };
  
  res.json(resources);
});

// Get single resource
app.get('/video/:id', (req, res) => {
  const { id } = req.params;
  
  const resources = {
    videos: [
      {
        id: "youtube1",
        title: "Introduction to Machine Learning",
        videoUrl: "https://www.youtube.com/embed/mJeNghZXtMo",
        transcript: "This video provides an introduction to machine learning concepts, supervised and unsupervised learning, and practical applications.",
        resourceType: "video",
        dateAdded: new Date().toISOString()
      },
      {
        id: "website1",
        title: "Machine Learning Documentation",
        videoUrl: "https://scikit-learn.org/stable/getting_started.html",
        transcript: "Official documentation for scikit-learn, a popular machine learning library that implements various algorithms.",
        resourceType: "website",
        dateAdded: new Date().toISOString()
      }
    ]
  };
  
  const resource = resources.videos.find(v => v.id === id);
  
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  
  res.json(resource);
});

module.exports.handler = serverless(app); 