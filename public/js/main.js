document.addEventListener('DOMContentLoaded', function() {
  console.log('JavaScript is running!');
  
  // Chat widget elements
  const chatWidgetButton = document.getElementById('chatWidgetButton');
  const chatWidgetClose = document.getElementById('chatWidgetClose');
  const chatWidget = document.getElementById('chatWidget');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const chatMessages = document.getElementById('chatMessages');
  const suggestionBubbles = document.querySelectorAll('.suggestion-bubble');
  
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
  
  // Event listeners for suggestion bubbles
  if (suggestionBubbles) {
    suggestionBubbles.forEach(bubble => {
      bubble.addEventListener('click', () => {
        const message = bubble.textContent.trim();
        messageInput.value = message;
        handleMessageSubmit();
      });
    });
  }
  
  // Function to send message to backend
  async function sendMessage(message) {
    console.log('Sending message:', message);
    appendMessage(message, 'user');
    
    // Show loading indicator
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'chat-bubble bot loading';
    loadingBubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(loadingBubble);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Remove loading indicator
      chatMessages.removeChild(loadingBubble);
      
      // Display bot response
      appendMessage(data.response, 'bot');
    } catch (error) {
      console.error('Error:', error);
      
      // Remove loading indicator
      chatMessages.removeChild(loadingBubble);
      
      // Show error message
      appendMessage('Sorry, I encountered an error. Please try again later.', 'bot');
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