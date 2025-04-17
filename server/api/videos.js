const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const RESOURCES_FILE = path.join(__dirname, '../data/resources.json');

// Get all resources
router.get('/videos', (req, res) => {
  try {
    // Check if resources file exists, if not create empty one
    if (!fs.existsSync(RESOURCES_FILE)) {
      fs.writeFileSync(RESOURCES_FILE, JSON.stringify({ 
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
      }, null, 2));
    }
    
    // Read resources data
    const resourceData = JSON.parse(fs.readFileSync(RESOURCES_FILE, 'utf-8'));
    
    res.json(resourceData);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Get single resource
router.get('/video/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if resources file exists
    if (!fs.existsSync(RESOURCES_FILE)) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Read resources data
    const resourceData = JSON.parse(fs.readFileSync(RESOURCES_FILE, 'utf-8'));
    const resource = resourceData.videos.find(v => v.id === id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// Add new resource
router.post('/videos', (req, res) => {
  try {
    const { title, videoUrl, transcript, resourceType = "video" } = req.body;
    
    if (!title || !videoUrl) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }
    
    // Check if resources file exists, if not create empty one
    if (!fs.existsSync(RESOURCES_FILE)) {
      fs.writeFileSync(RESOURCES_FILE, JSON.stringify({ videos: [] }, null, 2));
    }
    
    // Read resources data
    const resourceData = JSON.parse(fs.readFileSync(RESOURCES_FILE, 'utf-8'));
    
    // Add new resource
    const newResource = {
      id: Date.now().toString(),
      title,
      videoUrl,
      transcript: transcript || '',
      resourceType,
      dateAdded: new Date().toISOString()
    };
    
    resourceData.videos.push(newResource);
    
    // Save updated data
    fs.writeFileSync(RESOURCES_FILE, JSON.stringify(resourceData, null, 2));
    
    res.status(201).json(newResource);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ error: 'Failed to add resource' });
  }
});

// Get course topics
router.get('/topics', (req, res) => {
  try {
    // This would normally be fetched from a database
    // For this demo, we'll return some sample topics
    const topics = [
      { id: 'intro', name: 'Introduction to the Course' },
      { id: 'basics', name: 'Course Fundamentals' },
      { id: 'advanced', name: 'Advanced Topics' },
      { id: 'projects', name: 'Course Projects' }
    ];
    
    res.json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

module.exports = router; 