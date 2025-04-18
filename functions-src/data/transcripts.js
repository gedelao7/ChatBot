// This file contains transcript data for use in the Netlify serverless functions
// In a production application, this would be replaced with a proper database or storage solution

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Define the path to the transcripts directory
const transcriptsDir = path.join(__dirname, '../../server/data/transcripts');

// Define default transcripts to use when no files are found
const defaultTranscripts = [
  {
    id: 'cardiopulmonary-practice',
    title: 'Cardiopulmonary Practice',
    content: `CARDIOPULMONARY PRACTICE
LECTURE SERIES: DPT 6470

This lecture series covers essential aspects of cardiopulmonary physical therapy practice, including assessment techniques, treatment interventions, and clinical decision-making for patients with cardiovascular and pulmonary conditions.

KEY TOPICS:

1. Cardiovascular Anatomy and Physiology
   - Structure and function of the heart
   - Cardiac cycle and hemodynamics
   - Blood pressure regulation
   - Vascular system overview

2. Pulmonary Anatomy and Physiology
   - Respiratory system structure
   - Mechanics of breathing
   - Gas exchange principles
   - Pulmonary circulation

3. Cardiopulmonary Assessment
   - Vital signs monitoring
   - Auscultation techniques
   - Exercise testing protocols
   - Functional capacity assessment

4. Common Cardiopulmonary Pathologies
   - Chronic obstructive pulmonary disease (COPD)
   - Coronary artery disease
   - Heart failure
   - Pulmonary fibrosis
   - Asthma

5. Physical Therapy Interventions
   - Breathing exercises and techniques
   - Airway clearance methods
   - Cardiac rehabilitation principles
   - Pulmonary rehabilitation components
   - Exercise prescription guidelines`,
    uploadDate: '2024-03-20T10:00:00Z',
    fileType: 'txt'
  },
  {
    id: 'machine-learning-intro',
    title: 'Introduction to Machine Learning',
    content: `INTRODUCTION TO MACHINE LEARNING
LECTURE 1: FOUNDATIONS AND PRINCIPLES

Machine learning is a subset of artificial intelligence that focuses on building systems that can learn from data, identify patterns, and make decisions with minimal human intervention. Unlike traditional programming where we explicitly code rules, in machine learning, we train models on data and let them discover patterns on their own.

Machine learning is often categorized into three main types:

1. Supervised Learning: Here, we train models on labeled data. The algorithm learns to map inputs to correct outputs based on example pairs.
2. Unsupervised Learning: In this approach, we use unlabeled data and let the algorithm find structure on its own.
3. Reinforcement Learning: This involves training agents to make sequences of decisions by receiving rewards or penalties.

The significance of machine learning in today's world cannot be overstated. It powers numerous applications that we interact with daily, from recommendation systems to virtual assistants, email spam filters, fraud detection, medical diagnosis, self-driving cars, and natural language processing.`,
    uploadDate: '2024-03-20T10:00:00Z',
    fileType: 'txt'
  }
];

// Function to load all transcripts
function loadTranscripts() {
  try {
    const files = fs.readdirSync(transcriptsDir);
    const transcripts = [];
    
    files.forEach(file => {
      if (file.endsWith('.zip')) {
        const filePath = path.join(transcriptsDir, file);
        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();
        
        zipEntries.forEach(entry => {
          if (entry.entryName.endsWith('.txt')) {
            const content = zip.readAsText(entry);
            const title = entry.entryName.replace('.txt', '').replace(/_/g, ' ');
            
            transcripts.push({
              id: entry.entryName.replace('.txt', ''),
              title: title,
              content: content,
              uploadDate: new Date().toISOString(),
              fileType: 'txt'
            });
          }
        });
      }
    });
    
    // If no transcripts were loaded from files, use the default transcripts
    if (transcripts.length === 0) {
      console.log('No transcripts found in directory, using default transcripts');
      return defaultTranscripts;
    }
    
    return transcripts;
  } catch (error) {
    console.error('Error loading transcripts:', error);
    console.log('Using default transcripts due to error');
    return defaultTranscripts;
  }
}

// Load transcripts on startup
const transcripts = loadTranscripts();

/**
 * Get all transcripts
 * @returns {Array} - Array of transcript metadata
 */
function getAllTranscripts() {
  return transcripts.map(t => ({
    id: t.id,
    title: t.title,
    uploadDate: t.uploadDate,
    fileType: t.fileType
  }));
}

/**
 * Get a single transcript by ID
 * @param {string} id - Transcript ID
 * @returns {Object|null} - Transcript data or null if not found
 */
function getTranscriptById(id) {
  return transcripts.find(t => t.id === id) || null;
}

/**
 * Simple keyword search across all transcripts
 * @param {string} query - Search query
 * @returns {Array} - Array of matching transcript excerpts with context
 */
function searchTranscripts(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  if (queryTerms.length === 0) {
    return [];
  }
  
  const results = [];
  
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
            idx > 0 ? paragraphs[idx - 1] : '',
            paragraph,
            idx < paragraphs.length - 1 ? paragraphs[idx + 1] : ''
          ].filter(Boolean).join('\n\n')
        });
      }
    });
  });
  
  // Sort by relevance
  return results.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Get relevant transcript content for a user query
 * @param {string} query - User query
 * @returns {Array<string>} - Array of relevant transcript content strings
 */
function getRelevantContent(query) {
  const results = searchTranscripts(query);
  
  // No results found
  if (results.length === 0) {
    return [];
  }
  
  // Return top matches with context as plain strings
  return results.slice(0, 3).map(result => result.context);
}

// Export functions
module.exports = {
  getAllTranscripts,
  getTranscriptById,
  searchTranscripts,
  getRelevantContent
}; 