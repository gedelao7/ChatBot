document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const flashcardTopic = document.getElementById('flashcardTopic');
  const generateFlashcardsBtn = document.getElementById('generateFlashcardsBtn');
  const flashcardsContainer = document.getElementById('flashcardsContainer');
  const prevCardBtn = document.getElementById('prevCardBtn');
  const nextCardBtn = document.getElementById('nextCardBtn');
  const cardCounter = document.getElementById('cardCounter');
  
  // Determine if we're running locally or on Netlify
  const isNetlify = window.location.hostname.includes('netlify.app');
  const apiBaseUrl = isNetlify ? '/.netlify/functions' : '/api';
  console.log('Flashcards API Base URL:', apiBaseUrl);
  
  // State variables
  let flashcards = [];
  let currentCardIndex = 0;
  
  // Function to fetch topics
  async function fetchTopics() {
    try {
      const response = await fetch(`${apiBaseUrl}/data?type=topics`);
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      
      const data = await response.json();
      
      // Populate topics dropdown
      data.topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.id;
        option.textContent = topic.name;
        flashcardTopic.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  }
  
  // Function to generate flashcards
  async function generateFlashcards() {
    try {
      // Show loading state
      flashcardsContainer.innerHTML = `
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>Generating flashcards...</p>
        </div>
      `;
      
      const topic = flashcardTopic.value;
      
      const response = await fetch(`${apiBaseUrl}/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }
      
      const data = await response.json();
      flashcards = data.flashcards || [];
      
      if (flashcards.length === 0) {
        flashcardsContainer.innerHTML = `
          <div class="alert alert-info">
            No flashcards were generated. Try a different topic.
          </div>
        `;
        return;
      }
      
      // Display the flashcards
      displayFlashcard(0);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      flashcardsContainer.innerHTML = `
        <div class="alert alert-danger">
          Error generating flashcards. Please try again later.
        </div>
      `;
    }
  }
  
  // Function to display a flashcard
  function displayFlashcard(index) {
    if (!flashcards.length) return;
    
    currentCardIndex = index;
    const card = flashcards[index];
    
    const html = `
      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Card ${index + 1} of ${flashcards.length}</span>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary flip-card-btn">Flip Card</button>
          </div>
        </div>
        <div class="card-body flashcard">
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <h5 class="card-title">Question</h5>
              <p class="card-text">${card.front || card.question}</p>
            </div>
            <div class="flashcard-back">
              <h5 class="card-title">Answer</h5>
              <p class="card-text">${card.back || card.answer}</p>
            </div>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-between">
          <button class="btn btn-primary prev-card-btn" ${index === 0 ? 'disabled' : ''}>Previous</button>
          <button class="btn btn-primary next-card-btn" ${index === flashcards.length - 1 ? 'disabled' : ''}>Next</button>
        </div>
      </div>
    `;
    
    flashcardsContainer.innerHTML = html;
    
    // Add event listeners
    const flipBtn = flashcardsContainer.querySelector('.flip-card-btn');
    const prevBtn = flashcardsContainer.querySelector('.prev-card-btn');
    const nextBtn = flashcardsContainer.querySelector('.next-card-btn');
    const flashcardEl = flashcardsContainer.querySelector('.flashcard');
    
    if (flipBtn) {
      flipBtn.addEventListener('click', () => {
        flashcardEl.classList.toggle('flipped');
      });
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentCardIndex > 0) {
          displayFlashcard(currentCardIndex - 1);
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentCardIndex < flashcards.length - 1) {
          displayFlashcard(currentCardIndex + 1);
        }
      });
    }
  }
  
  // Update card counter
  const updateCardCounter = () => {
    if (!cardCounter) return;
    
    if (flashcards.length === 0) {
      cardCounter.textContent = 'No cards available';
    } else {
      cardCounter.textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;
    }
  };
  
  // Event listeners
  if (generateFlashcardsBtn) {
    generateFlashcardsBtn.addEventListener('click', generateFlashcards);
  }
  
  if (prevCardBtn) {
    prevCardBtn.addEventListener('click', () => {
      if (currentCardIndex > 0) {
        displayFlashcard(currentCardIndex - 1);
      }
    });
  }
  
  if (nextCardBtn) {
    nextCardBtn.addEventListener('click', () => {
      if (currentCardIndex < flashcards.length - 1) {
        displayFlashcard(currentCardIndex + 1);
      }
    });
  }
  
  // Initialize
  fetchTopics();
}); 