document.addEventListener('DOMContentLoaded', function() {
    const quizTopic = document.getElementById('quizTopic');
    const quizDifficulty = document.getElementById('quizDifficulty');
    const generateQuizBtn = document.getElementById('generateQuizBtn');
    const quizContainer = document.getElementById('quizContainer');
    
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    
    // Function to fetch topics
    async function fetchTopics() {
        try {
            const response = await fetch('/.netlify/functions/api/topics');
            if (!response.ok) {
                throw new Error('Failed to fetch topics');
            }
            
            const data = await response.json();
            
            // Populate topics dropdown
            data.topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic.id;
                option.textContent = topic.name;
                quizTopic.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching topics:', error);
        }
    }
    
    // Function to generate quiz
    async function generateQuiz() {
        try {
            // Show loading state
            quizContainer.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Generating quiz...</p>
                </div>
            `;
            
            const topic = quizTopic.value;
            const difficulty = quizDifficulty.value;
            
            const response = await fetch('/.netlify/functions/api/quiz', {
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
            questions = data.questions || [];
            
            if (questions.length === 0) {
                quizContainer.innerHTML = `
                    <div class="alert alert-info">
                        No questions were generated. Try a different topic or difficulty.
                    </div>
                `;
                return;
            }
            
            // Reset quiz state
            currentQuestionIndex = 0;
            userAnswers = Array(questions.length).fill(null);
            
            // Display the first question
            displayQuestion(0);
        } catch (error) {
            console.error('Error generating quiz:', error);
            quizContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error generating quiz. Please try again later.
                </div>
            `;
        }
    }
    
    // Function to display a question
    function displayQuestion(index) {
        if (!questions.length) return;
        
        currentQuestionIndex = index;
        const question = questions[index];
        
        let optionsHTML = '';
        question.options.forEach((option, i) => {
            optionsHTML += `
                <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" name="quizOption" id="option${i}" value="${i}" ${userAnswers[index] === i ? 'checked' : ''}>
                    <label class="form-check-label" for="option${i}">${option}</label>
                </div>
            `;
        });
        
        const html = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>Question ${index + 1} of ${questions.length}</span>
                    <span class="badge bg-${userAnswers[index] !== null ? (userAnswers[index] === question.correctIndex ? 'success' : 'danger') : 'secondary'}">
                        ${userAnswers[index] !== null ? (userAnswers[index] === question.correctIndex ? 'Correct' : 'Incorrect') : 'Unanswered'}
                    </span>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${question.question}</h5>
                    <div class="options-container">
                        ${optionsHTML}
                    </div>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-primary prev-question-btn" ${index === 0 ? 'disabled' : ''}>Previous</button>
                    <button class="btn btn-success check-answer-btn" ${userAnswers[index] !== null ? 'disabled' : ''}>Check Answer</button>
                    <button class="btn btn-primary next-question-btn" ${index === questions.length - 1 ? 'disabled' : ''}>Next</button>
                </div>
            </div>
            ${index === questions.length - 1 && userAnswers.every(a => a !== null) ? 
                `<div class="text-center mt-3">
                    <button class="btn btn-lg btn-primary show-results-btn">Show Results</button>
                </div>` : ''}
        `;
        
        quizContainer.innerHTML = html;
        
        // Add event listeners
        const prevBtn = quizContainer.querySelector('.prev-question-btn');
        const nextBtn = quizContainer.querySelector('.next-question-btn');
        const checkBtn = quizContainer.querySelector('.check-answer-btn');
        const showResultsBtn = quizContainer.querySelector('.show-results-btn');
        const optionInputs = quizContainer.querySelectorAll('input[name="quizOption"]');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentQuestionIndex > 0) {
                    displayQuestion(currentQuestionIndex - 1);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentQuestionIndex < questions.length - 1) {
                    displayQuestion(currentQuestionIndex + 1);
                }
            });
        }
        
        if (checkBtn) {
            checkBtn.addEventListener('click', () => {
                const selectedOption = quizContainer.querySelector('input[name="quizOption"]:checked');
                if (selectedOption) {
                    userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
                    displayQuestion(currentQuestionIndex);
                }
            });
        }
        
        if (showResultsBtn) {
            showResultsBtn.addEventListener('click', showResults);
        }
        
        optionInputs.forEach(input => {
            input.addEventListener('change', () => {
                const checkBtn = quizContainer.querySelector('.check-answer-btn');
                if (checkBtn) {
                    checkBtn.disabled = false;
                }
            });
        });
    }
    
    // Function to show quiz results
    function showResults() {
        const correctAnswers = userAnswers.filter((answer, index) => answer === questions[index].correctIndex).length;
        const totalQuestions = questions.length;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        
        let resultClass = 'bg-danger';
        if (percentage >= 80) {
            resultClass = 'bg-success';
        } else if (percentage >= 60) {
            resultClass = 'bg-warning';
        }
        
        let questionsHTML = '';
        questions.forEach((question, index) => {
            const isCorrect = userAnswers[index] === question.correctIndex;
            
            questionsHTML += `
                <div class="card mb-3 ${isCorrect ? 'border-success' : 'border-danger'}">
                    <div class="card-header ${isCorrect ? 'bg-success' : 'bg-danger'} text-white">
                        Question ${index + 1}: ${isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${question.question}</h5>
                        <div class="options-container">
                            ${question.options.map((option, i) => {
                                let optionClass = '';
                                if (i === question.correctIndex) {
                                    optionClass = 'text-success fw-bold';
                                } else if (i === userAnswers[index] && i !== question.correctIndex) {
                                    optionClass = 'text-danger text-decoration-line-through';
                                }
                                return `<p class="${optionClass}">${option}</p>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
        
        const html = `
            <div class="results-container">
                <div class="card mb-4">
                    <div class="card-body text-center">
                        <h4 class="card-title">Quiz Results</h4>
                        <div class="display-1 ${resultClass} text-white rounded p-3 mb-3">${percentage}%</div>
                        <p class="card-text lead">You got ${correctAnswers} out of ${totalQuestions} questions correct.</p>
                        <button class="btn btn-primary retry-quiz-btn">Retry Quiz</button>
                    </div>
                </div>
                <h4>Question Breakdown</h4>
                ${questionsHTML}
            </div>
        `;
        
        quizContainer.innerHTML = html;
        
        // Add event listener for retry button
        const retryBtn = quizContainer.querySelector('.retry-quiz-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', generateQuiz);
        }
    }
    
    // Add event listener to the generate button
    if (generateQuizBtn) {
        generateQuizBtn.addEventListener('click', generateQuiz);
    }
    
    // Fetch topics on page load
    fetchTopics();
}); 