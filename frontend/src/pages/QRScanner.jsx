import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';

const QRScanner = () => {
  const [scannedData, setScannedData] = useState('');
  const [product, setProduct] = useState(null);
  const scannerRef = useRef(null);
  const qrCodeRegionId = "html5qr-code-region";

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: 250 };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      async (decodedText) => {
        if (decodedText !== scannedData) {
          setScannedData(decodedText);
          html5QrCode.stop().then(() => {
            console.log("QR scanning stopped after first successful read.");
          });

          const productId = decodedText.replace(/\D/g, '');
          try {
            const res = await axios.get(`https://retailsphere-4.onrender.com/product/${productId}`);
            setProduct(res.data);
          } catch (err) {
            setProduct({ error: "Product not found or error occurred." });
          }
        }
      },
      (error) => {
        // You can log scan errors here if needed
        console.warn("QR Scan Error:", error);
      }
    ).catch(err => {
      console.error("Unable to start QR scanner:", err);
    });

    return () => {
      html5QrCode.stop().then(() => {
        html5QrCode.clear();
      }).catch(err => console.error("Failed to stop scanner:", err));
    };
  }, [scannedData]);

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">📷 Scan Product QR</h2>
      <div id={qrCodeRegionId} className="w-full" />

      {scannedData && <p className="mt-3 text-sm text-gray-600">Scanned: {scannedData}</p>}

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
