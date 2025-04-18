// Study Tools Module
const StudyTools = (() => {
  // State
  let currentFlashcardIndex = 0;
  let flashcards = [];
  let quizQuestions = [];
  let currentQuizQuestion = 0;
  let quizScore = 0;
  
  // DOM Elements
  const elements = {
    tabs: document.querySelectorAll('.tab-button'),
    chatContainer: document.getElementById('chatMessages'),
    flashcardsContainer: document.getElementById('flashcardsContainer'),
    quizContainer: document.getElementById('quizContainer'),
    flashcardQuestion: document.getElementById('flashcardQuestion'),
    flashcardAnswer: document.getElementById('flashcardAnswer'),
    prevCard: document.getElementById('prevCard'),
    nextCard: document.getElementById('nextCard'),
    shuffleCards: document.getElementById('shuffleCards'),
    quizQuestion: document.getElementById('quizQuestion'),
    quizOptions: document.getElementById('quizOptions'),
    quizFeedback: document.getElementById('quizFeedback'),
    progressBar: document.querySelector('.progress-bar'),
    progressText: document.querySelector('.progress-text')
  };
  
  // Initialize
  function init() {
    setupEventListeners();
    loadStudyContent();
  }
  
  // Event Listeners
  function setupEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
      });
    });
    
    // Flashcard controls
    elements.prevCard.addEventListener('click', showPreviousCard);
    elements.nextCard.addEventListener('click', showNextCard);
    elements.shuffleCards.addEventListener('click', shuffleFlashcards);
  }
  
  // Tab switching
  function switchTab(tabName) {
    // Update active tab
    elements.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Show/hide containers
    elements.chatContainer.style.display = tabName === 'chat' ? 'block' : 'none';
    elements.flashcardsContainer.style.display = tabName === 'flashcards' ? 'block' : 'none';
    elements.quizContainer.style.display = tabName === 'quiz' ? 'block' : 'none';
  }
  
  // Load study content from API
  async function loadStudyContent() {
    try {
      const response = await fetch(`${API_BASE_URL}/study-content`);
      const data = await response.json();
      
      if (data.flashcards) {
        flashcards = data.flashcards;
        showCurrentFlashcard();
      }
      
      if (data.quizQuestions) {
        quizQuestions = data.quizQuestions;
        showCurrentQuizQuestion();
      }
    } catch (error) {
      console.error('Error loading study content:', error);
    }
  }
  
  // Flashcard functions
  function showCurrentFlashcard() {
    if (flashcards.length === 0) return;
    
    const card = flashcards[currentFlashcardIndex];
    elements.flashcardQuestion.textContent = card.question;
    elements.flashcardAnswer.textContent = card.answer;
  }
  
  function showPreviousCard() {
    currentFlashcardIndex = (currentFlashcardIndex - 1 + flashcards.length) % flashcards.length;
    showCurrentFlashcard();
  }
  
  function showNextCard() {
    currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcards.length;
    showCurrentFlashcard();
  }
  
  function shuffleFlashcards() {
    flashcards = flashcards.sort(() => Math.random() - 0.5);
    currentFlashcardIndex = 0;
    showCurrentFlashcard();
  }
  
  // Quiz functions
  function showCurrentQuizQuestion() {
    if (quizQuestions.length === 0) return;
    
    const question = quizQuestions[currentQuizQuestion];
    elements.quizQuestion.textContent = question.question;
    
    // Clear previous options
    elements.quizOptions.innerHTML = '';
    
    // Add new options
    question.options.forEach((option, index) => {
      const optionElement = document.createElement('button');
      optionElement.className = 'quiz-option';
      optionElement.textContent = option;
      optionElement.addEventListener('click', () => checkAnswer(index));
      elements.quizOptions.appendChild(optionElement);
    });
    
    // Update progress
    updateQuizProgress();
  }
  
  function checkAnswer(selectedIndex) {
    const question = quizQuestions[currentQuizQuestion];
    const isCorrect = selectedIndex === question.correctAnswer;
    
    // Update score
    if (isCorrect) quizScore++;
    
    // Show feedback
    elements.quizFeedback.style.display = 'block';
    elements.quizFeedback.textContent = isCorrect ? 'Correct!' : 'Incorrect!';
    elements.quizFeedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    
    // Disable options
    const options = elements.quizOptions.querySelectorAll('.quiz-option');
    options.forEach((option, index) => {
      option.disabled = true;
      if (index === question.correctAnswer) {
        option.classList.add('correct');
      } else if (index === selectedIndex && !isCorrect) {
        option.classList.add('incorrect');
      }
    });
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuizQuestion < quizQuestions.length - 1) {
        currentQuizQuestion++;
        showCurrentQuizQuestion();
      } else {
        showQuizResults();
      }
    }, 2000);
  }
  
  function updateQuizProgress() {
    const progress = ((currentQuizQuestion + 1) / quizQuestions.length) * 100;
    elements.progressBar.style.width = `${progress}%`;
    elements.progressText.textContent = `${currentQuizQuestion + 1}/${quizQuestions.length}`;
  }
  
  function showQuizResults() {
    elements.quizQuestion.textContent = `Quiz Complete!`;
    elements.quizOptions.innerHTML = `
      <div class="quiz-results">
        <p>Your score: ${quizScore}/${quizQuestions.length}</p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }
  
  // Public API
  return {
    init,
    switchTab
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', StudyTools.init); 