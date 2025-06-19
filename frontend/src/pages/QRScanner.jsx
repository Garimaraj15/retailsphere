import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ For navigation

const QRScanner = () => {
  const [scannedData, setScannedData] = useState('');
  const scannerRef = useRef(null);
  const qrCodeRegionId = "html5qr-code-region";
  const navigate = useNavigate(); // ✅ Init navigator

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
            // Optional: check if product exists first
            await axios.get(`https://retailsphere-4.onrender.com/product/${productId}`);
            navigate(`/product/${productId}`); // ✅ Redirect to product details page
          } catch (err) {
            alert("Scanned QR code is invalid or product not found.");
          }
        }
      },
      (error) => {
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
  }, [scannedData, navigate]);

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">📷 Scan Product QR</h2>
      <div id={qrCodeRegionId} className="w-full" />
      {scannedData && <p className="mt-3 text-sm text-gray-600">Scanned: {scannedData}</p>}
    </div>
  );
};

export default QRScanner;
