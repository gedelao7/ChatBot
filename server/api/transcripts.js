const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  processTranscript,
  getAllTranscripts,
  getTranscriptById,
  deleteTranscript,
  searchTranscripts
} = require('./transcriptManager');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Get all transcripts
router.get('/transcripts', (req, res) => {
  try {
    const transcripts = getAllTranscripts();
    res.json({ transcripts });
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    res.status(500).json({ error: 'Failed to fetch transcripts' });
  }
});

// Get single transcript
router.get('/transcript/:id', (req, res) => {
  try {
    const { id } = req.params;
    const transcript = getTranscriptById(id);
    
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' });
    }
    
    res.json(transcript);
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

// Upload new transcript
router.post('/transcripts', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const transcript = await processTranscript(req.file);
    res.status(201).json(transcript);
  } catch (error) {
    console.error('Error uploading transcript:', error);
    res.status(500).json({ error: 'Failed to process transcript' });
  }
});

// Delete transcript
router.delete('/transcript/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = deleteTranscript(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Transcript not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transcript:', error);
    res.status(500).json({ error: 'Failed to delete transcript' });
  }
});

// Search transcripts
router.get('/transcripts/search', (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = searchTranscripts(query);
    res.json({ results });
  } catch (error) {
    console.error('Error searching transcripts:', error);
    res.status(500).json({ error: 'Failed to search transcripts' });
  }
});

module.exports = router; 