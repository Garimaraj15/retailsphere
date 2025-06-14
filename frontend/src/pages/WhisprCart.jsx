import React, { useState, useEffect } from 'react';
import { logicTree } from '../data/whisprTree'; // Adjust the path if needed

const WhisprCart = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("whisprMessages");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem("whisprMessages", JSON.stringify(messages));
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };

    // Smart keyword-based matching
    let responseText = "Sorry, I couldn't find that item.";
    const inputLower = input.toLowerCase();

    for (const keyword in logicTree) {
      if (inputLower.includes(keyword)) {
        responseText = logicTree[keyword];
        break;
      }
    }

    const botMessage = { text: responseText, sender: 'bot' };

    setMessages([...messages, userMessage, botMessage]);
    setInput('');
  };

  const handleMic = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Sorry, your browser doesn't support speech recognition.");
    return;
  }

  console.log("🎤 Starting speech recognition...");
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log("🎙️ Listening started...");
  };

  recognition.onspeechend = () => {
    console.log("🛑 Speech ended.");
    recognition.stop();
  };

  recognition.onresult = (event) => {
    const speechText = event.results[0][0].transcript;
    console.log("✅ You said:", speechText);
    setInput(speechText);
    setTimeout(() => handleSend(), 500);
  };

  recognition.onerror = (event) => {
    console.error("❌ Speech recognition error:", event.error);
  };

  recognition.start();
};


  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded-xl shadow-md mt-8">
      <h2 className="text-xl font-bold mb-4">🛒 WhisprCart Assistant</h2>
      <div className="h-64 overflow-y-auto border p-2 rounded mb-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 text-sm ${
              msg.sender === 'user'
                ? 'text-right text-blue-600'
                : 'text-left text-green-700'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          placeholder="Ask about an item (e.g., milk)"
          className="flex-1 border p-2 rounded-l"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4"
        >
          Send
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
