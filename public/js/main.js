document.addEventListener('DOMContentLoaded', function() {
  console.log('JavaScript is running!');
  
  // API Base URL - works for both local and Netlify environments
  const API_BASE_URL = window.location.hostname === 'localhost' ? '/api' : '/.netlify/functions';
  console.log('API Base URL:', API_BASE_URL);
  
  // Chat widget elements
  const chatWidgetButton = document.getElementById('chatWidgetButton');
  const chatWidgetClose = document.getElementById('chatWidgetClose');
  const chatWidget = document.getElementById('chatWidget');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const chatMessages = document.getElementById('chatMessages');
  const suggestionBubbles = document.querySelectorAll('.suggestion-bubble:not(.action-bubble)');
  
  console.log('Chat Widget Button:', chatWidgetButton);
  console.log('Chat Widget Close:', chatWidgetClose);
  console.log('Suggestion Bubbles:', suggestionBubbles.length);
  
  // Function to toggle chat widget visibility
  function toggleChatWidget(visible) {
    console.log('Toggle widget called, current state:', visible);
    if (visible) {
      chatWidget.style.display = 'flex';
      setTimeout(() => {
        chatWidget.style.opacity = '1';
        chatWidget.style.transform = 'translateY(0)';
      }, 50);
    } else {
      chatWidget.style.opacity = '0';
      chatWidget.style.transform = 'translateY(20px)';
      setTimeout(() => {
        chatWidget.style.display = 'none';
      }, 300);
    }
  }
  
  // Event listener for chat widget button
  if (chatWidgetButton) {
    chatWidgetButton.addEventListener('click', () => {
      console.log('Chat button clicked');
      toggleChatWidget(chatWidget.style.display !== 'flex');
    });
  }
  
  // Event listener for chat widget close button
  if (chatWidgetClose) {
    chatWidgetClose.addEventListener('click', () => {
      toggleChatWidget(false);
    });
  }
  
  // Function to handle message submission
  function handleMessageSubmit() {
    const message = messageInput.value.trim();
    if (message) {
      sendMessage(message);
      messageInput.value = '';
    }
  }
  
  // Event listener for send button
  if (sendButton) {
    sendButton.addEventListener('click', handleMessageSubmit);
  }
  
  // Event listener for Enter key in input field
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        console.log('Enter pressed');
        handleMessageSubmit();
      }
    });
  }
  
  // Event listeners for suggestion bubbles (not action bubbles)
  if (suggestionBubbles.length > 0) {
    suggestionBubbles.forEach(bubble => {
      bubble.addEventListener('click', () => {
        const message = bubble.textContent.trim();
        console.log('Suggestion clicked:', message);
        messageInput.value = message;
        handleMessageSubmit();
      });
    });
  }
  
  // Initialize action bubbles to open modals
  const actionBubbles = document.querySelectorAll('.action-bubble');
  console.log('Action Bubbles:', actionBubbles.length);
  
  // Handle suggestion bubbles
  document.querySelectorAll('.suggestion-bubble.action-bubble').forEach(bubble => {
    bubble.addEventListener('click', () => {
      const command = bubble.dataset.command;
      document.getElementById('messageInput').value = command;
      // Don't send automatically, let user edit if needed
    });
  });
  
  // Function to send message to the API
  async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    appendMessage(message, 'user');
    messageInput.value = '';
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'message loading';
    loadingIndicator.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    document.getElementById('chatMessages').appendChild(loadingIndicator);
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      
      // Remove loading indicator
      loadingIndicator.remove();
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.response) {
        if (message.toLowerCase().includes('create flashcards')) {
          displayFlashcards(data.response);
        } else if (message.toLowerCase().includes('create quiz')) {
          displayQuiz(data.response);
        } else {
          appendMessage(data.response, 'bot');
        }
      } else {
        throw new Error('No response from server');
      }
    } catch (error) {
      console.error('Error:', error);
      appendMessage('Sorry, I encountered an error. Please try again.', 'bot error');
    }
  }
  
  function displayFlashcards(response) {
    const flashcardsContainer = document.createElement('div');
    flashcardsContainer.className = 'flashcards-container';
    
    // Parse the response text into flashcards
    const flashcardText = response;
    const flashcards = flashcardText.split('\n\n').map(card => {
      const [front, back] = card.split('\nBack: ');
      return {
        question: front.replace('Front: ', ''),
        answer: back
      };
    });
    
    // Create navigation controls
    const navigation = document.createElement('div');
    navigation.className = 'flashcard-navigation';
    navigation.innerHTML = `
      <button class="btn btn-outline-secondary prev-btn" disabled>
        <i class="bi bi-chevron-left"></i>
      </button>
      <span class="flashcard-counter">1 / ${flashcards.length}</span>
      <button class="btn btn-outline-secondary next-btn">
        <i class="bi bi-chevron-right"></i>
      </button>
    `;
    
    // Create flashcard container
    const flashcardWrapper = document.createElement('div');
    flashcardWrapper.className = 'flashcard-wrapper';
    
    // Create single flashcard element
    const flashcard = document.createElement('div');
    flashcard.className = 'flashcard';
    flashcard.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="flashcard-content">
            <h4>Question 1</h4>
            <p>${flashcards[0].question}</p>
          </div>
        </div>
        <div class="flashcard-back">
          <div class="flashcard-content">
            <h4>Answer</h4>
            <p>${flashcards[0].answer}</p>
          </div>
        </div>
      </div>
    `;
    
    // Add click event to flip card
    flashcard.addEventListener('click', () => {
      flashcard.querySelector('.flashcard-inner').classList.toggle('flipped');
    });
    
    flashcardWrapper.appendChild(flashcard);
    flashcardsContainer.appendChild(flashcardWrapper);
    flashcardsContainer.appendChild(navigation);
    
    // Add event listeners for navigation
    let currentIndex = 0;
    const prevBtn = navigation.querySelector('.prev-btn');
    const nextBtn = navigation.querySelector('.next-btn');
    const counter = navigation.querySelector('.flashcard-counter');
    
    function updateFlashcard() {
      flashcard.innerHTML = `
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <div class="flashcard-content">
              <h4>Question ${currentIndex + 1}</h4>
              <p>${flashcards[currentIndex].question}</p>
            </div>
          </div>
          <div class="flashcard-back">
            <div class="flashcard-content">
              <h4>Answer</h4>
              <p>${flashcards[currentIndex].answer}</p>
            </div>
          </div>
        </div>
      `;
      
      // Add click event to new flashcard
      flashcard.addEventListener('click', () => {
        flashcard.querySelector('.flashcard-inner').classList.toggle('flipped');
      });
      
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === flashcards.length - 1;
      counter.textContent = `${currentIndex + 1} / ${flashcards.length}`;
    }
    
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateFlashcard();
      }
    });
    
    nextBtn.addEventListener('click', () => {
      if (currentIndex < flashcards.length - 1) {
        currentIndex++;
        updateFlashcard();
      }
    });
    
    appendMessage(flashcardsContainer, 'bot');
  }
  
  function displayQuiz(response) {
    const quizContainer = document.createElement('div');
    quizContainer.className = 'quiz-container';
    
    // Parse the response text into quiz questions
    const quizText = response;
    const questions = quizText.split('\n\n').map(q => {
      const lines = q.split('\n');
      const question = lines[0].replace(/^\d+\.\s*/, ''); // Remove question number
      const options = lines.slice(1).map(opt => {
        // Remove option letter and any duplicate letters
        return opt.replace(/^[a-z]\)\s*[A-Z]\.\s*/, '').trim();
      });
      const correctAnswer = 0; // Assuming first option is correct for now
      
      return {
        question,
        options,
        correctAnswer
      };
    });
    
    let currentQuestion = 0;
    let score = 0;
    let answeredQuestions = 0;
    
    function showQuestion(index) {
      const question = questions[index];
      quizContainer.innerHTML = `
        <div class="quiz-question">
          <h4>Question ${index + 1} of ${questions.length}</h4>
          <p>${question.question}</p>
          <div class="quiz-options">
            ${question.options.map((option, i) => `
              <button class="quiz-option" data-correct="${i === question.correctAnswer}">
                <span class="option-letter">${String.fromCharCode(97 + i)}</span>
                <span class="option-text">${option}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
      
      // Add event listeners to quiz options
      quizContainer.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
          const isCorrect = this.dataset.correct === 'true';
          if (isCorrect) score++;
          answeredQuestions++;
          
          this.classList.add(isCorrect ? 'correct' : 'incorrect');
          
          // Disable all options in this question
          this.parentElement.querySelectorAll('.quiz-option').forEach(opt => {
            opt.disabled = true;
            if (opt.dataset.correct === 'true') {
              opt.classList.add('correct');
            }
          });
          
          // Show next question or final score
          setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
              currentQuestion++;
              showQuestion(currentQuestion);
            } else {
              showFinalScore();
            }
          }, 1000);
        });
      });
    }
    
    function showFinalScore() {
      const percentage = Math.round((score / questions.length) * 100);
      quizContainer.innerHTML = `
        <div class="quiz-score">
          <h3>Quiz Complete!</h3>
          <div class="score-details">
            <p>You scored ${score} out of ${questions.length} questions correctly</p>
            <p>That's ${percentage}%</p>
          </div>
          <div class="score-message">
            ${getScoreMessage(percentage)}
          </div>
        </div>
      `;
    }
    
    function getScoreMessage(percentage) {
      if (percentage >= 90) return "Excellent work! You've mastered this topic!";
      if (percentage >= 70) return "Great job! You have a good understanding of the material.";
      if (percentage >= 50) return "Not bad! You're on your way to mastering this topic.";
      return "Keep practicing! You'll improve with more study.";
    }
    
    // Show first question
    showQuestion(currentQuestion);
    
    appendMessage(quizContainer, 'bot');
  }
  
  function appendMessage(content, type) {
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    
    if (typeof content === 'string') {
      messageElement.textContent = content;
    } else {
      messageElement.appendChild(content);
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Auto-open chat widget after a delay
  setTimeout(() => {
    console.log('Auto-opening chat widget');
    toggleChatWidget(true);
  }, 1000);
}); 