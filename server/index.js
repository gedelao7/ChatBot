require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Import API routes
const chatRoutes = require('./api/chat');
const flashcardRoutes = require('./api/flashcards');
const quizRoutes = require('./api/quiz');
const videoRoutes = require('./api/videos');
const transcriptRoutes = require('./api/transcripts');
const dataRoutes = require('./api/data');

// Import transcript utilities
const { initializeWithSampleTranscript } = require('./api/transcriptUploader');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/data', dataRoutes);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize with sample transcript if needed
initializeWithSampleTranscript();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
}); 