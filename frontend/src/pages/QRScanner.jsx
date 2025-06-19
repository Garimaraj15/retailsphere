import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QRScanner = () => {
  const [scannedData, setScannedData] = useState('');
  const scannerRef = useRef(null);
  const qrCodeRegionId = "html5qr-code-region";
  const navigate = useNavigate();

  useEffect(() => {
  const html5QrCode = new Html5Qrcode(qrCodeRegionId);
  scannerRef.current = html5QrCode;

  const config = { fps: 10, qrbox: 250 };

  const startScanner = () => {
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      async (decodedText) => {
        if (decodedText !== scannedData) {
          setScannedData(decodedText);
          console.log("✅ RAW SCANNED TEXT:", decodedText);

          html5QrCode.stop().then(() => {
            console.log("QR scanning stopped after successful read.");
          });

          // Support both /product/5 and Cloudinary filenames like ID_5_abc.png
          const match = decodedText.match(/\/product\/(\d+)|ID_(\d+)_/);
          const productId = match ? (match[1] || match[2]) : null;

          if (!productId) {
            alert("Invalid QR code: No product ID found.");
            return;
          }

          try {
            await axios.get(`https://retailsphere-frontend.onrender.com/product/${productId}`);
            navigate(`/product/${productId}`);
          } catch (err) {
            alert("Product not found.");
          }
        }
      },
      (error) => console.warn("QR Scan Error:", error)
    ).catch(err => console.error("Unable to start QR scanner:", err));
  };

  // ✅ Add delay to ensure camera element is mounted
  const timeoutId = setTimeout(startScanner, 500);

  return () => {
    clearTimeout(timeoutId);
    html5QrCode.stop().then(() => html5QrCode.clear());
  };
}, [scannedData, navigate]);

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">📷 Scan Product QR</h2>
      <div id={qrCodeRegionId} className="w-full" />
      {scannedData && (
        <p className="mt-3 text-sm text-gray-600">
          Scanned: <span className="font-mono">{scannedData}</span>
        </p>
      )}
    </div>
  );
};

export default QRScanner;
