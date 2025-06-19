import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import axios from 'axios';

const QRScanner = () => {
  const [result, setResult] = useState('');
  const [product, setProduct] = useState(null);

  const handleScan = async (data) => {
    if (data) {
      const scanned = data?.text || data;
      setResult(scanned);

      // Assuming the QR code contains just the product ID
      const productId = scanned.replace(/\D/g, ''); // Keep only digits

      try {
        const res = await axios.get(`https://retailsphere-4.onrender.com/product/${productId}`);
        setProduct(res.data);
      } catch (err) {
        setProduct({ error: "Product not found or error occurred." });
      }
    }
  };

  const handleError = (err) => {
    console.error("QR Scan Error:", err);
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">📷 Scan Product QR</h2>

      <QrScanner
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%' }}
      />

      {result && <p className="mt-3 text-sm text-gray-600">QR Result: {result}</p>}

      {product && !product.error && (
        <div className="mt-4 p-3 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Price:</strong> ₹{product.price}</p>
          <p><strong>Description:</strong> {product.description}</p>
          <p><strong>Tags:</strong> {product.ethical_tags}</p>
          <p><strong>Carbon Footprint:</strong> {product.carbon_footprint} kg CO₂</p>
          <p><strong>Trust Score:</strong> {product.trust_score}/100</p>
          {product.image_url && (
            <img
              src={product.image_url}
              alt="Product"
              className="mt-3 w-32 rounded shadow"
            />
          )}
        </div>
      )}

      {product?.error && (
        <p className="text-red-500 mt-4">{product.error}</p>
      )}
    </div>
  );
};

export default QRScanner;
