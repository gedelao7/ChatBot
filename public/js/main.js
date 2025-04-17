document.addEventListener('DOMContentLoaded', () => {
  console.log('JavaScript is running!');
  
  // DOM Elements
  const chatWidgetButton = document.getElementById('chatWidgetButton');
  const chatWidgetClose = document.getElementById('chatWidgetClose');
  const chatWidgetWindow = document.getElementById('chatWidgetWindow');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatMessages = document.getElementById('chatMessages');
  
  // Get all suggestion bubbles
  const suggestionBubbles = document.querySelectorAll('.suggestion-bubble');
  
  // Log found elements
  console.log('Chat Widget Button:', chatWidgetButton);
  console.log('Chat Widget Close:', chatWidgetClose);
  console.log('Suggestion Bubbles:', suggestionBubbles.length);
  
  // Track if widget is open
  let isWidgetOpen = false;
  
  // Toggle chat widget
  function toggleChatWidget() {
    console.log('Toggle widget called, current state:', isWidgetOpen);
    if (isWidgetOpen) {
      chatWidgetWindow.classList.remove('open');
      setTimeout(() => {
        chatWidgetWindow.style.display = 'none';
      }, 300);
    } else {
      chatWidgetWindow.style.display = 'flex';
      setTimeout(() => {
        chatWidgetWindow.classList.add('open');
      }, 10);
    }
    isWidgetOpen = !isWidgetOpen;
  }
  
  // Add event listeners
  if (chatWidgetButton) {
    chatWidgetButton.addEventListener('click', () => {
      console.log('Chat button clicked');
      toggleChatWidget();
    });
  }
  
  if (chatWidgetClose) {
    chatWidgetClose.addEventListener('click', () => {
      console.log('Close button clicked');
      toggleChatWidget();
    });
  }
  
  // Set up suggestion bubble clicks
  suggestionBubbles.forEach(bubble => {
    bubble.addEventListener('click', () => {
      const action = bubble.dataset.action;
      console.log('Suggestion clicked:', action);
      alert('You clicked: ' + action);
    });
  });
  
  // Chat send functionality
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      console.log('Send button clicked');
      sendMessage();
    });
  }
  
  if (userInput) {
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        console.log('Enter pressed');
        sendMessage();
      }
    });
  }
  
  async function sendMessage() {
    const message = userInput ? userInput.value.trim() : '';
    if (!message) return;
    
    console.log('Sending message:', message);
    
    // Add user message to chat
    appendMessage(message, 'user');
    
    // Clear input
    if (userInput) userInput.value = '';
    
    // Show loading indicator
    appendMessage('Thinking...', 'system');
    
    try {
      // Get the base URL for API endpoints
      const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? '/api' // Development
        : '/.netlify/functions/api'; // Production on Netlify
      
      // Send request to backend
      const response = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Remove last message (loading indicator)
      if (chatMessages) {
        const lastMessage = chatMessages.lastChild;
        if (lastMessage) {
          chatMessages.removeChild(lastMessage);
        }
      }
      
      // Add bot response to chat
      appendMessage(data.message, 'system');
    } catch (error) {
      console.error('Error:', error);
      
      // Remove last message (loading indicator)
      if (chatMessages) {
        const lastMessage = chatMessages.lastChild;
        if (lastMessage) {
          chatMessages.removeChild(lastMessage);
        }
      }
      
      // Show error message
      appendMessage('Sorry, I encountered an error. Please try again.', 'system');
    }
  }
  
  function appendMessage(message, sender) {
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    
    contentDiv.appendChild(paragraph);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Show the chat widget by default
  setTimeout(() => {
    console.log('Auto-opening chat widget');
    toggleChatWidget();
  }, 1000);
}); 