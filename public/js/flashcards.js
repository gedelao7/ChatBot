document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const flashcardTopic = document.getElementById('flashcardTopic');
  const newFlashcardBtn = document.getElementById('newFlashcardBtn');
  const flashcardDeck = document.querySelector('.flashcard-deck');
  const prevCardBtn = document.getElementById('prevCardBtn');
  const nextCardBtn = document.getElementById('nextCardBtn');
  const cardCounter = document.getElementById('cardCounter');
  
  // State variables
  let flashcards = [];
  let currentCardIndex = 0;
  
  // Get the base URL for API endpoints
  const getApiBase = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? '/api' // Development
      : '/.netlify/functions/api'; // Production on Netlify
  };
  
  // Fetch topics
  const fetchTopics = async () => {
    try {
      const response = await fetch(`${getApiBase()}/topics`);
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      
      const data = await response.json();
      populateTopics(data.topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };
  
  // Populate topic dropdown
  const populateTopics = (topics) => {
    if (!flashcardTopic) return;
    
    // Clear existing options except the first one
    while (flashcardTopic.options.length > 1) {
      flashcardTopic.remove(1);
    }
    
    // Add new options
    topics.forEach(topic => {
      const option = document.createElement('option');
      option.value = topic.id;
      option.textContent = topic.name;
      flashcardTopic.appendChild(option);
    });
  };
  
  // Generate flashcards
  const generateFlashcards = async () => {
    if (!flashcardDeck) return;
    
    // Show loading state
    flashcardDeck.innerHTML = '<div class="loading-spinner"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    try {
      const topic = flashcardTopic ? flashcardTopic.value : '';
      
      const response = await fetch(`${getApiBase()}/flashcards`, {
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
      
      // Save flashcards
      flashcards = data.flashcards || [];
      
      // Reset current index
      currentCardIndex = 0;
      
      // Display flashcards
      displayCurrentCard();
      updateCardCounter();
    } catch (error) {
      console.error('Error generating flashcards:', error);
      flashcardDeck.innerHTML = '<div class="alert alert-danger">Failed to generate flashcards. Please try again.</div>';
    }
  };
  
  // Display current flashcard
  const displayCurrentCard = () => {
    if (!flashcardDeck || flashcards.length === 0) return;
    
    const card = flashcards[currentCardIndex];
    
    flashcardDeck.innerHTML = `
      <div class="flashcard">
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <p>${card.front || card.question}</p>
          </div>
          <div class="flashcard-back">
            <p>${card.back || card.answer}</p>
          </div>
        </div>
      </div>
    `;
    
    // Make flashcard flippable
    const flashcard = flashcardDeck.querySelector('.flashcard');
    if (flashcard) {
      flashcard.addEventListener('click', () => {
        flashcard.classList.toggle('flipped');
      });
    }
  };
  
  // Update card counter
  const updateCardCounter = () => {
    if (!cardCounter) return;
    
    if (flashcards.length === 0) {
      cardCounter.textContent = 'No cards available';
    } else {
      cardCounter.textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;
    }
  };
  
  // Previous card
  const showPreviousCard = () => {
    if (flashcards.length === 0) return;
    
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    displayCurrentCard();
    updateCardCounter();
  };
  
  // Next card
  const showNextCard = () => {
    if (flashcards.length === 0) return;
    
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    displayCurrentCard();
    updateCardCounter();
  };
  
  // Event listeners
  if (newFlashcardBtn) {
    newFlashcardBtn.addEventListener('click', generateFlashcards);
  }
  
  if (prevCardBtn) {
    prevCardBtn.addEventListener('click', showPreviousCard);
  }
  
  if (nextCardBtn) {
    nextCardBtn.addEventListener('click', showNextCard);
  }
  
  // Initialize
  fetchTopics();
}); 