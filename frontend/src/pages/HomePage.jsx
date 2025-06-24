import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const HomePage = () => {
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

    getQueueStatus();
    const interval = setInterval(getQueueStatus, 15000);
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
        setJoinTime(data.join_time);
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
    <div className="min-h-screen bg-[#111a22] text-white font-['Manrope','Noto Sans',sans-serif] overflow-x-hidden">
      <header className="flex items-center justify-between px-10 py-4 border-b border-[#233648]">
        <div className="text-lg font-bold tracking-tight">Retail Assistant</div>
        <nav className="flex gap-8 text-sm font-medium">
          <Link to="/scan" className="hover:text-[#137feb]">Scan</Link>
          <Link to="/dashboard" className="hover:text-[#137feb]">Dashboard</Link>
          <Link to="/feedback" className="hover:text-[#137feb]">Feedback</Link>
          <Link to="/whisprcart" className="hover:text-[#137feb]">WhisprCart</Link>
        </nav>
      </header>

      <main className="px-6 py-8 max-w-5xl mx-auto">
        <section className="bg-cover bg-center rounded-xl p-8 text-center mb-12" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.3),rgba(0,0,0,0.5)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDzpi-r7_4olMfofQdWtKspZEjQYfcQd-wZ2xOkWEn6m5AToLbQTrq4zyQG8vzFGNAFE8LWTT_QF-SAiXuJGvC4EFDqohhU1qCJaLK9G_R7dIxdiV0ipU738MqDdE5CRUkdTdOhZO95PNhhE_DH32VU1kXw8olDl77WxB7UWoi4Ujxh4a-EyABTblTvRwxlB4zW-hb_S_NIokwBllIvaxIdvzN1mFWQS3TKPKVWhaF-XBqNB64EzdIVeBv0dueU2uOruVQFOS-Tnyw')" }}>
          <h1 className="text-4xl font-black mb-2">Welcome to Our Store</h1>
          <p className="text-base font-normal mb-6">Join the queue, check your status, and explore our products.</p>
        </section>

        {/* Language Switcher */}
<div className="mb-6 flex items-center gap-2">
  <label className="font-medium text-white">{t('language')}:</label>
  <select
    value={i18n.language}
    onChange={(e) => i18n.changeLanguage(e.target.value)}
    className="bg-[#233648] text-white px-4 py-2 rounded-xl focus:outline-none"
  >
    <option value="en">English</option>
    <option value="hi">हिन्दी</option>
  </select>
</div>

{/* Queue Section */}
<section className="mb-12 p-6 bg-[#1e293b] rounded-xl shadow-md">
  <h2 className="text-2xl font-bold text-white mb-4">{t('joinQueue')}</h2>
  <div className="flex flex-wrap gap-4 mb-4">
    <input
      value={userName}
      onChange={e => setUserName(e.target.value)}
      placeholder={t('NamePlease')}
      className="flex-1 bg-[#233648] text-white px-4 py-2 rounded-xl w-full sm:w-auto"
    />
    <select
      value={selectedStore}
      onChange={e => setSelectedStore(e.target.value)}
      className="bg-[#233648] text-white px-4 py-2 rounded-xl w-full sm:w-auto"
    >
      <option>Walmart-U.S</option>
      <option>Walmart-Canada</option>
      <option>Walmart-China</option>
    </select>
    <button
      onClick={joinQueue}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl"
    >
      {t('joinQueue')}
    </button>
  </div>

  <p className="text-white font-medium">
    {t('liveQueueSize')} <b>{selectedStore}</b>: <span className="font-bold">{queueSize ?? '-'}</span>
  </p>

  {token && (
    <div className="mt-4 bg-[#233648] p-4 rounded-xl space-y-2">
      <p className="text-white font-medium">{t('yourToken')}: <span className="font-bold">{token}</span></p>
      <div className="flex gap-4 flex-wrap">
        <button onClick={checkMyStatus} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl">
          {t('checkStatus')}
        </button>
        <button onClick={leaveQueue} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl">
          {t('leaveQueue')}
        </button>
      </div>
      {tokenPosition !== null && (
        <p className="text-white">{tokenPosition + 1} — <b>{waitTime} mins</b></p>
      )}
    </div>
  )}
</section>

{/* Product Section */}
<section className="mb-12 p-6 bg-[#1e293b] rounded-xl shadow-md">
  <h2 className="text-2xl font-bold text-white mb-4">{t('EnterProductID')}</h2>
  <div className="flex flex-wrap gap-4 mb-4">
    <input
      value={productId}
      onChange={e => setProductId(e.target.value)}
      placeholder="ID please..."
      className="bg-[#233648] text-white px-4 py-2 rounded-xl flex-1"
    />
    <button
      onClick={handleFetch}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl"
    >
      {t('FetchInfo')}
    </button>
  </div>

  {error && <p className="text-red-500 font-medium">{error}</p>}

  {product && (
    <div className="mt-6 bg-[#233648] p-6 rounded-xl">
      <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
      <p className="text-white"><b>Brand:</b> {product.brand}</p>
      <p className="text-white"><b>Price:</b> ₹{product.price}</p>
      <p className="text-white"><b>Description:</b> {product.description}</p>
      {product.image_url && (
        <img src={product.image_url} alt={product.name} className="mt-4 rounded-xl max-w-xs" />
      )}

      {/* Feedback */}
      <div className="mt-6">
        <h4 className="text-white font-bold mb-2">{t('howYouFeel')}</h4>
        <div className="flex gap-3 text-xl">
          <button onClick={() => sendFeedback('like')} className="hover:scale-110">😀</button>
          <button onClick={() => sendFeedback('neutral')} className="hover:scale-110">😐</button>
          <button onClick={() => sendFeedback('dislike')} className="hover:scale-110">😠</button>
        </div>

        <h4 className="text-white font-bold mt-4 mb-1">{t('othersFeel')}</h4>
        <p className="text-white text-sm">😀 {t('liked')}: {feedbackStats.like}</p>
        <p className="text-white text-sm">😐 {t('neutral')}: {feedbackStats.neutral}</p>
        <p className="text-white text-sm">😠 {t('disliked')}: {feedbackStats.dislike}</p>
      </div>

      {/* Report */}
      <div className="mt-6">
        <h4 className="text-white font-bold mb-2">{t('reportProduct')}</h4>
        <div className="flex flex-wrap gap-3">
          <input
            value={reportReason}
            onChange={e => setReportReason(e.target.value)}
            placeholder="Your concern..."
            className="bg-[#111a22] text-white px-4 py-2 rounded-xl flex-1"
          />
          <button
            onClick={sendReport}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-6 py-2 rounded-xl"
          >
            {t('submitReport')}
          </button>
        </div>
      </div>
    </div>
  )}
</section>
      </main>

      <footer className="text-center text-sm text-[#92adc9] py-6 border-t border-[#233648]">
        &copy; {new Date().getFullYear()} Retail Assistant by RetailSphere
      </footer>
    </div>
  );
};

export default HomePage;
