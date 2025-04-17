document.addEventListener('DOMContentLoaded', function() {
  console.log('JavaScript is running!');
  
  // Determine if we're running locally or on Netlify
  const isNetlify = window.location.hostname.includes('netlify.app');
  const apiBaseUrl = isNetlify ? '/.netlify/functions' : '/api';
  console.log('API Base URL:', apiBaseUrl);
  
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
  
  // Function to send message to backend
  async function sendMessage(message) {
    console.log('Sending message:', message);
    appendMessage(message, 'user');
    
    // Show loading indicator
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'chat-bubble bot loading';
    loadingBubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(loadingBubble);
    
    // Retry logic
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${apiBaseUrl}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            message: message,
            context: 'transcripts'
          })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        // Remove loading indicator
        if (chatMessages.contains(loadingBubble)) {
          chatMessages.removeChild(loadingBubble);
        }
        
        // If the response indicates it's outside the transcript scope
        if (data.outsideScope) {
          appendMessage("I'm sorry, I can only answer questions about the lecture transcripts. Please ask something related to the course content.", 'bot');
        } else {
          // Display bot response
          const botResponse = data.response || data.message || "Sorry, I don't have an answer for that.";
          appendMessage(botResponse, 'bot');
        }
        
        // Break out of retry loop if successful
        break;
      } catch (error) {
        console.error(`Attempt ${attempts + 1} error:`, error);
        attempts++;
        
        // On final attempt, show error message
        if (attempts >= maxAttempts) {
          console.error('All attempts failed:', error);
          
          // Remove loading indicator
          if (chatMessages.contains(loadingBubble)) {
            chatMessages.removeChild(loadingBubble);
          }
          
          // Show error message
          appendMessage('Sorry, I encountered an error communicating with the server. Please try again later.', 'bot');
        } else {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }
  
  // Function to append message to chat
  function appendMessage(message, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = message;
    chatMessages.appendChild(bubble);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Auto-open chat widget after a delay
  setTimeout(() => {
    console.log('Auto-opening chat widget');
    toggleChatWidget(true);
  }, 1000);
}); 