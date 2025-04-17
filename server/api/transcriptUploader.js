const fs = require('fs');
const path = require('path');
const { processTranscript } = require('./transcriptManager');

/**
 * Process a text file from the filesystem directly
 * This is a convenience function for initial setup
 * @param {string} filePath - Path to the transcript text file
 * @param {string} title - Title for the transcript (optional)
 * @returns {Promise<Object>} - Processed transcript data
 */
async function processTranscriptFile(filePath, title = null) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    
    // Create a mock file object similar to what multer would provide
    const mockFile = {
      originalname: title ? `${title}${path.extname(fileName)}` : fileName,
      buffer: Buffer.from(content, 'utf-8')
    };
    
    // Process the file using the standard transcript manager
    const result = await processTranscript(mockFile);
    
    console.log(`Successfully processed transcript: ${result.title}`);
    return result;
  } catch (error) {
    console.error('Error processing transcript file:', error);
    throw error;
  }
}

/**
 * Initialize the system with a default transcript if none exists
 * @param {string} sampleTranscriptPath - Path to the sample transcript
 */
async function initializeWithSampleTranscript(sampleTranscriptPath) {
  try {
    const transcriptsDir = path.join(__dirname, '../data/transcripts');
    
    // Check if transcripts directory exists and create it if needed
    if (!fs.existsSync(transcriptsDir)) {
      fs.mkdirSync(transcriptsDir, { recursive: true });
    }
    
    // Check if any transcripts exist
    const existingTranscripts = fs.readdirSync(transcriptsDir);
    
    if (existingTranscripts.length === 0 && fs.existsSync(sampleTranscriptPath)) {
      console.log('No transcripts found. Initializing with sample transcript...');
      await processTranscriptFile(sampleTranscriptPath);
      console.log('Sample transcript initialized successfully.');
    }
  } catch (error) {
    console.error('Error initializing with sample transcript:', error);
  }
}

module.exports = {
  processTranscriptFile,
  initializeWithSampleTranscript
}; 