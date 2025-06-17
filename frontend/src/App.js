import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import WhisprCart from './pages/WhisprCart'; // ✅
import { useTranslation } from 'react-i18next';

// ✅ Define backend URL once
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Dashboard Component
const Dashboard = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/dashboard/analytics`)
      .then(res => res.json())
      .then(data => {
        if (data.feedback_counts) {
          const transformed = [{
            product_id: 'All Products',
            like: data.feedback_counts.like,
            neutral: data.feedback_counts.neutral,
            dislike: data.feedback_counts.dislike,
            reports: data.total_reports
          }];
          setChartData(transformed);
        }
      })
      .catch(err => console.error("Error fetching analytics:", err));
  }, []);

  return (
    <div style={{ padding: 30, fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center' }}>📊 Store Manager Dashboard</h2>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <XAxis dataKey="product_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="like" fill="#82ca9d" name="😀 Likes" />
            <Bar dataKey="neutral" fill="#ffc658" name="😐 Neutral" />
            <Bar dataKey="dislike" fill="#ff7f7f" name="😠 Dislikes" />
            <Bar dataKey="reports" fill="#8884d8" name="🚩 Reports" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ textAlign: 'center' }}>Loading dashboard data...</p>
      )}
    </div>
  );
};

// MainApp (Home with Product + Queue Features)
const MainApp = () => {
  const [message, setMessage] = useState('');
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [feedbackStats, setFeedbackStats] = useState({ like: 0, neutral: 0, dislike: 0 });
  const [reportReason, setReportReason] = useState('');

  const [userName, setUserName] = useState('');
  const [selectedStore, setSelectedStore] = useState('Reliance Fresh');
  const [token, setToken] = useState(null);
  const [queueSize, setQueueSize] = useState(null);
  const [tokenPosition, setTokenPosition] = useState(null);
  const [joinTime, setJoinTime] = useState(null);
  const [waitTime, setWaitTime] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetch(`${BACKEND_URL}/`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage("Could not connect to Flask backend"));

    getQueueStatus(); // Initial load
    const interval = setInterval(getQueueStatus, 15000); // Refresh every 15 sec
    return () => clearInterval(interval);
  }, []);

  const handleFetch = () => {
    if (!productId.trim()) return;

    fetch(`${BACKEND_URL}/product/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setProduct(null);
          setError(data.error);
        } else {
          setProduct(data);
          setError('');
          fetch(`${BACKEND_URL}/product/${productId}/feedback-count`)
            .then(res => res.json())
            .then(stats => setFeedbackStats(stats));
        }
      })
      .catch(() => setError("Failed to fetch product"));
  };

  const sendFeedback = (type) => {
    if (!product) return;

    fetch(`${BACKEND_URL}/product/${product.id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback_type: type })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) alert(data.error);
        else {
          alert("Thanks for your feedback!");
          fetch(`${BACKEND_URL}/product/${product.id}/feedback-count`)
            .then(res => res.json())
            .then(stats => setFeedbackStats(stats));
        }
      });
  };

  const sendReport = () => {
    if (!product || !reportReason.trim()) {
      alert("Please enter a report reason");
      return;
    }

    fetch(`${BACKEND_URL}/product/${product.id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_reason: reportReason })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) alert(data.error);
        else {
          alert("Thanks for reporting!");
          setReportReason('');
        }
      });
  };

  const joinQueue = async () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/queue/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: userName, store_name: selectedStore })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token_number);
        setJoinTime(data.join_time); // optional
      } else {
        alert(data.error || "Join failed");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const checkMyStatus = async () => {
    if (!token || !selectedStore) return;

    try {
      const res = await fetch(`${BACKEND_URL}/queue/status/${selectedStore}/${token}`);
      const data = await res.json();
      if (res.ok) {
        setTokenPosition(data.position);
        setWaitTime(data.estimated_wait_time);
      } else {
        alert(data.error || "Failed to get token position");
      }
    } catch (err) {
      alert("Error connecting to backend");
    }
  };

  const leaveQueue = async () => {
    if (!token || !selectedStore) return;

    try {
      const res = await fetch(`${BACKEND_URL}/queue/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_number: token, store_name: selectedStore })
      });
      const data = await res.json();
      if (res.ok) {
        alert("You have left the queue");
        setToken(null);
        setTokenPosition(null);
        setWaitTime(null);
      } else {
        alert(data.error || "Failed to leave queue");
      }
    } catch (err) {
      alert("Error while trying to leave queue");
    }
  };

  const getQueueStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/queue/status/${selectedStore}`);
      const data = await res.json();
      if (res.ok) {
        setQueueSize(data.queue_size);
      } else {
        setQueueSize("Error");
      }
    } catch {
      setQueueSize("Server Down");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>{t('welcome')}</h1>
      <select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
      </select>

      <div style={{ marginTop: 20 }}>
        <h2>{t('joinQueue')}</h2>
        <input value={userName} onChange={e => setUserName(e.target.value)} placeholder={t('enterName')} />
        <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)}>
          <option>Reliance Fresh</option>
          <option>Big Bazaar</option>
          <option>D-Mart</option>
        </select>
        <button onClick={joinQueue}>{t('joinQueue')}</button>
        <p>{t('liveQueueSize')} <b>{selectedStore}</b>: {queueSize ?? '-'}</p>
        {token && <>
          <p>{t('yourToken')}: <b>{token}</b></p>
          <button onClick={checkMyStatus}>{t('checkStatus')}</button>
          <button onClick={leaveQueue}>{t('leaveQueue')}</button>
          {tokenPosition !== null && <p>#{tokenPosition + 1} — {waitTime} mins</p>}
        </>}
      </div>

      <div style={{ marginTop: 40 }}>
        <h2>{t('scanOrEnter')}</h2>
        <input value={productId} onChange={e => setProductId(e.target.value)} />
        <button onClick={handleFetch}>{t('fetchInfo')}</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {product && (
        <div style={{ marginTop: 20 }}>
          <h3>{product.name}</h3>
          <p><b>Brand:</b> {product.brand}</p>
          <p><b>Price:</b> ₹{product.price}</p>
          <p><b>Description:</b> {product.description}</p>

          <h4>{t('howYouFeel')}</h4>
          <button onClick={() => sendFeedback('like')}>😀</button>
          <button onClick={() => sendFeedback('neutral')}>😐</button>
          <button onClick={() => sendFeedback('dislike')}>😠</button>

          <h4>{t('othersFeel')}</h4>
          <p>😀 {t('liked')}: {feedbackStats.like}</p>
          <p>😐 {t('neutral')}: {feedbackStats.neutral}</p>
          <p>😠 {t('disliked')}: {feedbackStats.dislike}</p>

          <h4>{t('reportProduct')}</h4>
          <input value={reportReason} onChange={e => setReportReason(e.target.value)} />
          <button onClick={sendReport}>{t('submitReport')}</button>
        </div>
      )}
    </div>
  );
};

// App with Routing
const App = () => {
  return (
    <Router>
      <nav style={{ padding: 10, backgroundColor: '#f5f5f5' }}>
        <Link to="/" style={{ marginRight: 20 }}>🏠 Home</Link>
        <Link to="/dashboard" style={{ marginRight: 20 }}>📊 Dashboard</Link>
        <Link to="/whisprcart">🛒 WhisprCart</Link>
      </nav>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/whisprcart" element={<WhisprCart />} />
      </Routes>
    </Router>
  );
};

export default App;
