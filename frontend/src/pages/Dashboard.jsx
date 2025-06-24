import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('all');
  const [chartData, setChartData] = useState([]);

  // 🔹 Fetch product list for dropdown
  useEffect(() => {
    fetch(`${BACKEND_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  // 🔹 Fetch feedback data based on selected product
  useEffect(() => {
    const url =
      selectedProductId === 'all'
        ? `${BACKEND_URL}/dashboard/analytics`
        : `${BACKEND_URL}/dashboard/analytics/${selectedProductId}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.feedback_counts) {
          const label =
            selectedProductId === 'all'
              ? 'All Products'
              : `Product ${selectedProductId}`;
          const transformed = [
            {
              product_id: label,
              like: data.feedback_counts.like,
              neutral: data.feedback_counts.neutral,
              dislike: data.feedback_counts.dislike,
              reports: data.total_reports,
            },
          ];
          setChartData(transformed);
        }
      })
      .catch(err => console.error("Error fetching analytics:", err));
  }, [selectedProductId]);

  return (
    <div className="min-h-screen bg-[#111a22] text-white font-['Manrope','Noto Sans',sans-serif]">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10 py-4 gap-4 border-b border-[#233648]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 text-white">
            <svg viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight">Store Manager Dashboard</h1>
        </div>
        <nav className="flex gap-8 text-sm font-medium">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/scan" className="hover:underline">Scan</Link>
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        </nav>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-10 py-6 sm:py-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">📊 Feedback Overview</h2>

        {/* 🔽 Filter */}
        <div className="mb-6 flex justify-center px-2">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full sm:w-auto bg-[#1a2633] text-white border border-[#233648] px-4 py-2 rounded-md"
          >
            <option value="all">All Products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (ID: {product.id})
              </option>
            ))}
          </select>
        </div>

        {/* Chart */}
       <div className="bg-[#1a2633] p-4 sm:p-6 rounded-xl shadow-lg border border-[#233648]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <XAxis dataKey="product_id" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: '#233648', color: '#fff' }} />
                <Legend />
                <Bar dataKey="like" fill="#22c55e" name="😀 Likes" />
                <Bar dataKey="neutral" fill="#eab308" name="😐 Neutral" />
                <Bar dataKey="dislike" fill="#ef4444" name="😠 Dislikes" />
                <Bar dataKey="reports" fill="#6366f1" name="🚩 Reports" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400">Loading dashboard data...</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
