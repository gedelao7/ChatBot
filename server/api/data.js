const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Data endpoint to handle different data types
router.get('/data', (req, res) => {
  const { type } = req.query;
  
  if (!type) {
    return res.status(400).json({ error: 'Type parameter is required' });
  }
  
  try {
    switch (type) {
      case 'topics':
        // Return sample topics
        return res.json({
          topics: [
            { id: 'machine-learning', name: 'Machine Learning' },
            { id: 'supervised-learning', name: 'Supervised Learning' },
            { id: 'unsupervised-learning', name: 'Unsupervised Learning' },
            { id: 'reinforcement-learning', name: 'Reinforcement Learning' },
            { id: 'neural-networks', name: 'Neural Networks' }
          ]
        });
        
      case 'videos':
        // Return sample videos/resources
        return res.json({
          videos: [
            {
              id: 'intro-ml',
              title: 'Introduction to Machine Learning',
              videoUrl: 'https://www.youtube.com/embed/HcqpanDadyQ',
              resourceType: 'video',
              transcript: 'Overview of machine learning concepts and applications.',
              dateAdded: new Date().toISOString()
            },
            {
              id: 'supervised',
              title: 'Supervised Learning Explained',
              videoUrl: 'https://www.youtube.com/embed/bQI5uDxrFfA',
              resourceType: 'video',
              transcript: 'Detailed explanation of supervised learning approaches.',
              dateAdded: new Date().toISOString()
            },
            {
              id: 'reinforcement',
              title: 'Reinforcement Learning',
              videoUrl: 'https://www.youtube.com/embed/JgvyzIkgxF0',
              resourceType: 'video',
              transcript: 'Introduction to reinforcement learning methods.',
              dateAdded: new Date().toISOString()
            },
            {
              id: 'ml-resources',
              title: 'Machine Learning Resources',
              videoUrl: 'https://www.kaggle.com',
              resourceType: 'website',
              transcript: 'Collection of practical machine learning resources and datasets.',
              dateAdded: new Date().toISOString()
            }
          ]
        });
        
      default:
        return res.status(400).json({ error: `Unsupported data type: ${type}` });
    }
  } catch (error) {
    console.error('Data API error:', error);
    res.status(500).json({ error: 'Failed to get data' });
  }
});

module.exports = router; 