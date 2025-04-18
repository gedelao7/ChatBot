const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Sample data
const topics = [
  { id: 'cardiopulmonary', name: 'Cardiopulmonary Practice' },
  { id: 'machine-learning', name: 'Machine Learning' }
];

const videos = [
  {
    id: 'cardio-1',
    title: 'Introduction to Cardiopulmonary Practice',
    url: 'https://www.youtube.com/watch?v=example1',
    description: 'Overview of cardiopulmonary physical therapy practice'
  },
  {
    id: 'ml-1',
    title: 'Machine Learning Fundamentals',
    url: 'https://www.youtube.com/watch?v=example2',
    description: 'Introduction to machine learning concepts'
  }
];

// Get topics
router.get('/topics', (req, res) => {
  res.json({ topics });
});

// Get videos
router.get('/videos', (req, res) => {
  res.json({ videos });
});

// Handle all data requests
router.get('/', (req, res) => {
  const { type } = req.query;
  
  switch (type) {
    case 'topics':
      res.json({ topics });
      break;
    case 'videos':
      res.json({ videos });
      break;
    default:
      res.status(400).json({ error: 'Invalid data type requested' });
  }
});

module.exports = router; 