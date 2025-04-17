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

// Import transcript utilities
const { initializeWithSampleTranscript } = require('./api/transcriptUploader');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', chatRoutes);
app.use('/api', flashcardRoutes);
app.use('/api', quizRoutes);
app.use('/api', videoRoutes);
app.use('/api', transcriptRoutes);

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  
  // Initialize with sample transcript if none exists
  const sampleTranscriptPath = path.join(__dirname, 'data/sample-transcript.txt');
  await initializeWithSampleTranscript(sampleTranscriptPath);
}); 