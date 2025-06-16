import React, { useState } from 'react';
import axios from 'axios';
import '../css/ChatBot.css'; // Correct import

function ChatbotPage() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
  
    try {
      const token = localStorage.getItem('token');
  
      const response = await axios.post(
        'http://localhost:5001/api/chat',
        { message: userInput },
        {
          headers: {
            Authorization: `Bearer ${token}`  // ✅ Important
          }
        }
      );
  
      const aiResponse = response.data.aiResponse;
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: userInput, ai: aiResponse }
      ]);
  
      setUserInput('');
  
    } catch (error) {
      console.error("❌ Error sending message:", error);
      alert("❌ Failed to communicate with chatbot.");
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-card">
        <h1 className="chatbot-title">💬 Chat with Your AI Diet Assistant</h1>

        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <div className="user-message">You: {msg.user}</div>
              <div className="ai-message">AI: {msg.ai}</div>
            </div>
          ))}
        </div>

        <div className="input-section">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button onClick={handleSendMessage} className="send-button">Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;
