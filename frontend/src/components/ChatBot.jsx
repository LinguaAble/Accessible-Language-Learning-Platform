import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import './ChatBot.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChatBot = () => {
  const { user, preferences } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Namaste! 🙏 I\'m LinguaBot, your Hindi learning assistant. Ask me anything about Hindi — alphabet, grammar, vocabulary, or pronunciation!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Add user message
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history for context (skip the initial bot greeting)
      const history = messages
        .filter((_, i) => i > 0) // skip greeting
        .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));

      const res = await axios.post(`${API}/api/ai/chat`, {
        message: text,
        history,
        userProgress: {
          completedLessons: user.completedLessons || [],
          lessonScores: user.lessonScores || [],
          streak: user.streak || 0,
          todayProgress: parseInt(localStorage.getItem('todayProgress'), 10) || 0,
          dailyGoalMinutes: preferences?.dailyGoalMinutes || 5
        },
        userInfo: {
          fullName: user.fullName || '',
          username: user.username || '',
          age: user.age || '',
          gender: user.gender || '',
          bio: user.bio || ''
        }
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'bot', content: res.data.reply }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'Oops! Something went wrong. Please try again. 🙏'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className={`chatbot-fab ${isOpen ? 'chatbot-fab-hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat assistant"
        id="chatbot-open-btn"
      >
        <MessageCircle size={24} />
        <span className="chatbot-fab-label">Ask LinguaBot</span>
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'chatbot-open' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h4>LinguaBot</h4>
              <span className="chatbot-status">Hindi Learning Assistant</span>
            </div>
          </div>
          <button
            className="chatbot-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            id="chatbot-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chatbot-msg ${msg.role === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`}>
              <div className="chatbot-msg-icon">
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className="chatbot-msg-bubble">
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chatbot-msg chatbot-msg-bot">
              <div className="chatbot-msg-icon">
                <Bot size={14} />
              </div>
              <div className="chatbot-msg-bubble chatbot-typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chatbot-input-area">
          <input
            ref={inputRef}
            type="text"
            className="chatbot-input"
            placeholder="Ask about Hindi..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            id="chatbot-input"
          />
          <button
            className="chatbot-send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            id="chatbot-send-btn"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
