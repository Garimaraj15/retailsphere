import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import robotListeningAnimation from "../assets/lottie/robot-listening.json"; // Ensure the file exists at this path

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
    <div className="min-h-screen bg-[#111a22] text-white flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-[#1a2633] rounded-3xl shadow-xl p-6 relative">

        {/* Top Home Link */}
        <div className="absolute top-4 left-4">
          <Link to="/" className="hover:underline">Home</Link>
        </div>

        {/* Floating Robot */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex justify-center -mt-20 mb-6"
        >
          <Lottie
            animationData={robotListeningAnimation}
            loop
            className="w-72 h-72" // Larger size
          />
        </motion.div>

        {/* Header and Clear */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-400">🤖 WhisprCart Bot</h2>
          <button
            onClick={() => {
              localStorage.removeItem("whisprMessages");
              setMessages([]);
            }}
            className="text-sm text-purple-300 underline"
          >
            Clear
          </button>
        </div>

        {/* Chat Display */}
        <div className="h-80 overflow-y-auto mb-4 px-2">
          {messages.map((msg, index) => (
            <div key={index} className={`flex mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none'
                    : 'bg-[#2b3d52] text-white rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#233648] text-white border border-purple-600 rounded-full px-4 py-2 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm disabled:opacity-50"
          >
            {loading ? "..." : "OK"}
          </button>
          <button
            onClick={handleMic}
            className="bg-[#2b3d52] px-3 py-2 rounded-full text-lg text-white"
          >
            🎤
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhisprCart;
