const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const cheerio = require('cheerio');

const TRANSCRIPT_DIR = path.join(__dirname, '../data/transcripts');

// Ensure transcript directory exists
if (!fs.existsSync(TRANSCRIPT_DIR)) {
  fs.mkdirSync(TRANSCRIPT_DIR, { recursive: true });
}

/**
 * Process and store a transcript file
 * @param {Object} file - File object from multer
 * @returns {Promise<Object>} - Processed transcript info
 */
async function processTranscript(file) {
  try {
    const fileExt = path.extname(file.originalname).toLowerCase();
    let content = '';
    
    // Extract text based on file type
    if (fileExt === '.pdf') {
      const pdfData = await pdfParse(file.buffer);
      content = pdfData.text;
    } else if (fileExt === '.docx') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      content = result.value;
    } else if (fileExt === '.html' || fileExt === '.htm') {
      const htmlContent = file.buffer.toString('utf-8');
      const $ = cheerio.load(htmlContent);
      // Remove scripts, styles, etc.
      $('script, style, meta, link').remove();
      content = $('body').text().trim();
    } else if (fileExt === '.txt') {
      content = file.buffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file format');
    }
    
    // Clean up content
    content = content.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    
    // Generate unique ID
    const id = Date.now().toString();
    const title = path.basename(file.originalname, fileExt);
    
    // Save transcript
    const transcriptData = {
      id,
      title,
      content,
      fileName: file.originalname,
      uploadDate: new Date().toISOString(),
      fileType: fileExt.substring(1)
    };
    
    const filePath = path.join(TRANSCRIPT_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(transcriptData, null, 2));
    
    return transcriptData;
  } catch (error) {
    console.error('Error processing transcript:', error);
    throw new Error('Failed to process transcript');
  }
}

/**
 * Get all transcripts
 * @returns {Array} - Array of transcript metadata
 */
function getAllTranscripts() {
  try {
    if (!fs.existsSync(TRANSCRIPT_DIR)) {
      return [];
    }
    
    const files = fs.readdirSync(TRANSCRIPT_DIR);
    const transcripts = [];
    
    files.forEach(file => {
      if (path.extname(file) === '.json') {
        const filePath = path.join(TRANSCRIPT_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Return metadata without full content
        transcripts.push({
          id: data.id,
          title: data.title,
          fileName: data.fileName,
          uploadDate: data.uploadDate,
          fileType: data.fileType
        });
      }
    });
    
    return transcripts;
  } catch (error) {
    console.error('Error getting transcripts:', error);
    return [];
  }
}

/**
 * Get a single transcript by ID
 * @param {string} id - Transcript ID
 * @returns {Object|null} - Transcript data or null if not found
 */
function getTranscriptById(id) {
  try {
    const filePath = path.join(TRANSCRIPT_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`Error getting transcript ${id}:`, error);
    return null;
  }
}

/**
 * Delete a transcript
 * @param {string} id - Transcript ID
 * @returns {boolean} - Success status
 */
function deleteTranscript(id) {
  try {
    const filePath = path.join(TRANSCRIPT_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting transcript ${id}:`, error);
    return false;
  }
}

/**
 * Simple keyword search across all transcripts
 * @param {string} query - Search query
 * @returns {Array} - Array of matching transcript excerpts with context
 */
function searchTranscripts(query) {
  try {
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    if (queryTerms.length === 0) {
      return [];
    }
    
    const results = [];
    const transcripts = getAllTranscripts().map(t => getTranscriptById(t.id));
    
    transcripts.forEach(transcript => {
      if (!transcript || !transcript.content) return;
      
      const content = transcript.content.toLowerCase();
      const paragraphs = transcript.content.split(/\n{2,}/);
      
      paragraphs.forEach((paragraph, idx) => {
        const paragraphLower = paragraph.toLowerCase();
        let matchCount = 0;
        
        queryTerms.forEach(term => {
          if (paragraphLower.includes(term)) {
            matchCount++;
          }
        });
        
        if (matchCount > 0) {
          results.push({
            title: transcript.title,
            id: transcript.id,
            content: paragraph,
            relevance: matchCount / queryTerms.length,
            context: [
              paragraphs[idx - 1] || '',
              paragraph,
              paragraphs[idx + 1] || ''
            ].filter(Boolean).join('\n\n')
          });
        }
      });
    });
    
    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  } catch (error) {
    console.error('Error searching transcripts:', error);
    return [];
  }
}

/**
 * Get relevant transcript content for a user query
 * @param {string} query - User query
 * @returns {Array} - Array of relevant transcript portions
 */
function getRelevantContent(query) {
  const results = searchTranscripts(query);
  
  // Return top matches with context
  return results.slice(0, 3).map(result => ({
    title: result.title,
    content: result.context
  }));
}

module.exports = {
  processTranscript,
  getAllTranscripts,
  getTranscriptById,
  deleteTranscript,
  searchTranscripts,
  getRelevantContent
}; 