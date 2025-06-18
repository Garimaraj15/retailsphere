import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WhisprCart = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("whisprMessages");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("whisprMessages", JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('https://retailsphere-4.onrender.com/chatbot/ask', {
        message: input
      });

      const botMessage = {
        text: res.data.response || "Sorry, I didn’t understand that.",
        sender: 'bot'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [...prev, {
        text: "Something went wrong while connecting to WhisprCart backend.",
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMic = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      setInput(speechText);
      setTimeout(() => handleSend(), 500);
    };

    recognition.start();
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded-xl shadow-md mt-8">
      <div className="flex justify-between mb-2">
        <h2 className="text-xl font-bold text-indigo-600">🛒 WhisprCart Assistant</h2>
        <button
          className="text-sm text-red-600 underline"
          onClick={() => {
            localStorage.removeItem("whisprMessages");
            setMessages([]);
          }}
        >
          Clear Chat
        </button>
      </div>
      <div className="h-64 overflow-y-auto border p-2 rounded mb-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 text-sm ${
              msg.sender === 'user' ? 'text-right text-blue-600' : 'text-left text-green-700'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          placeholder="Ask about a product or offer..."
          className="flex-1 border p-2 rounded-l"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white px-4 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
        <button
          onClick={handleMic}
          className="bg-gray-300 text-black px-3 rounded-r"
        >
          🎤
        </button>
      </div>
    </div>
  );
};

export default WhisprCart;
