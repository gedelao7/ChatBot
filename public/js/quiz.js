document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const quizTopic = document.getElementById('quizTopic');
  const quizDifficulty = document.getElementById('quizDifficulty');
  const newQuizBtn = document.getElementById('newQuizBtn');
  const quizContent = document.querySelector('.quiz-content');
  const submitQuizBtn = document.getElementById('submitQuizBtn');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');
  
  // State variables
  let quizQuestions = [];
  let currentQuestionIndex = 0;
  let userAnswers = [];
  
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
    if (!quizTopic) return;
    
    // Clear existing options except the first one
    while (quizTopic.options.length > 1) {
      quizTopic.remove(1);
    }
    
    // Add new options
    topics.forEach(topic => {
      const option = document.createElement('option');
      option.value = topic.id;
      option.textContent = topic.name;
      quizTopic.appendChild(option);
    });
  };
  
  // Generate quiz
  const generateQuiz = async () => {
    if (!quizContent) return;
    
    // Show loading state
    quizContent.innerHTML = '<div class="loading-spinner"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    try {
      const topic = quizTopic ? quizTopic.value : '';
      const difficulty = quizDifficulty ? quizDifficulty.value : 'medium';
      
      const response = await fetch(`${getApiBase()}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic, difficulty })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }
      
      const data = await response.json();
      
      // Save questions
      quizQuestions = data.questions || [];
      
      // Reset state
      currentQuestionIndex = 0;
      userAnswers = new Array(quizQuestions.length).fill(null);
      
      // Display first question
      displayCurrentQuestion();
      updateSubmitButton();
    } catch (error) {
      console.error('Error generating quiz:', error);
      quizContent.innerHTML = '<div class="alert alert-danger">Failed to generate quiz. Please try again.</div>';
    }
  };
  
  // Display current question
  const displayCurrentQuestion = () => {
    if (!quizContent || quizQuestions.length === 0) return;
    
    const question = quizQuestions[currentQuestionIndex];
    
    quizContent.innerHTML = `
      <div class="quiz-question">
        <h4>Question ${currentQuestionIndex + 1} of ${quizQuestions.length}</h4>
        <p>${question.question}</p>
        <div class="quiz-options">
          ${question.options.map((option, index) => `
            <div class="form-check">
              <input class="form-check-input" type="radio" name="quiz${currentQuestionIndex}" 
                id="q${currentQuestionIndex}o${index}" value="${index}" 
                ${userAnswers[currentQuestionIndex] === index ? 'checked' : ''}>
              <label class="form-check-label" for="q${currentQuestionIndex}o${index}">
                ${option}
              </label>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="quiz-navigation mt-3">
        <button id="submitQuizBtn" class="btn btn-success">Submit Answer</button>
        <button id="nextQuestionBtn" class="btn btn-primary ms-2" ${currentQuestionIndex >= quizQuestions.length - 1 ? 'disabled' : ''}>
          Next Question
        </button>
      </div>
    `;
    
    // Re-attach event listeners
    document.getElementById('submitQuizBtn').addEventListener('click', submitAnswer);
    document.getElementById('nextQuestionBtn').addEventListener('click', nextQuestion);
    
    // Attach radio button listeners
    document.querySelectorAll(`input[name="quiz${currentQuestionIndex}"]`).forEach(radio => {
      radio.addEventListener('change', () => {
        userAnswers[currentQuestionIndex] = parseInt(radio.value);
        updateSubmitButton();
      });
    });
  };
  
  // Update submit button state
  const updateSubmitButton = () => {
    const submitBtn = document.getElementById('submitQuizBtn');
    if (!submitBtn) return;
    
    if (userAnswers[currentQuestionIndex] !== null) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
    }
  };
  
  // Submit answer
  const submitAnswer = () => {
    if (quizQuestions.length === 0) return;
    
    const question = quizQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    
    if (userAnswer === null) return;
    
    // Get all option labels
    const optionLabels = document.querySelectorAll(`label[for^="q${currentQuestionIndex}o"]`);
    
    // Highlight correct and incorrect answers
    optionLabels.forEach((label, index) => {
      const optionInput = document.getElementById(`q${currentQuestionIndex}o${index}`);
      
      if (index === question.correctIndex) {
        // Correct answer
        label.classList.add('text-success', 'fw-bold');
        optionInput.disabled = true;
      } else if (index === userAnswer) {
        // Incorrect answer selected by user
        label.classList.add('text-danger', 'text-decoration-line-through');
        optionInput.disabled = true;
      } else {
        // Other incorrect answers
        optionInput.disabled = true;
      }
    });
    
    // Disable submit button
    const submitBtn = document.getElementById('submitQuizBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
    }
    
    // Enable next button if not the last question
    const nextBtn = document.getElementById('nextQuestionBtn');
    if (nextBtn && currentQuestionIndex < quizQuestions.length - 1) {
      nextBtn.disabled = false;
    }
  };
  
  // Next question
  const nextQuestion = () => {
    if (quizQuestions.length === 0 || currentQuestionIndex >= quizQuestions.length - 1) return;
    
    currentQuestionIndex++;
    displayCurrentQuestion();
    updateSubmitButton();
  };
  
  // Event listeners
  if (newQuizBtn) {
    newQuizBtn.addEventListener('click', generateQuiz);
  }
  
  if (submitQuizBtn) {
    submitQuizBtn.addEventListener('click', submitAnswer);
  }
  
  if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener('click', nextQuestion);
  }
  
  // Initialize
  fetchTopics();
}); 