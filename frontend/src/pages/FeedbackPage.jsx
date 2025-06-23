import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const FeedbackPage = () => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);

  const fetchFeedback = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/feedback`);
      setFeedbackList(res.data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) return;

    try {
      await axios.post(`${BACKEND_URL}/feedback`, {
        message: feedbackText,
        timestamp: new Date().toISOString(),
      });
      setFeedbackText('');
      fetchFeedback(); // refresh list
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#111a22] text-white font-['Manrope'] px-8 py-10">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 border-b border-[#233648] pb-4">
        <h1 className="text-xl font-bold">📝 Store Feedback</h1>
        <nav className="flex gap-6 text-sm">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/scan" className="hover:underline">Scan</Link>
          
        </nav>
      </header>

      {/* Feedback Input */}
      <div className="bg-[#1a2633] p-6 rounded-xl mb-8">
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Share your thoughts about the store..."
          rows={4}
          className="w-full p-3 rounded-md bg-[#0e1822] text-white border border-[#233648] focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-white font-semibold"
        >
          Submit Feedback
        </button>
      </div>

      {/* Submitted Feedback List */}
      <div className="space-y-4">
        {feedbackList.length === 0 ? (
          <p className="text-gray-400 text-sm">No feedback submitted yet.</p>
        ) : (
          feedbackList.map((fb, idx) => (
            <div
              key={idx}
              className="bg-[#1a2633] p-4 rounded-md border border-[#233648]"
            >
              <p className="text-sm text-white">{fb.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(fb.timestamp).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
