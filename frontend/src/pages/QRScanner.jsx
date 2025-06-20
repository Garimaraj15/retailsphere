import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = () => {
  const [scannedData, setScannedData] = useState('');
  const scannerRef = useRef(null);
  const qrCodeRegionId = "html5qr-code-region";

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: 250 };

    const startScanner = async () => {
      try {
        if (!html5QrCode._isScanning) {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            async (decodedText) => {
              if (decodedText !== scannedData) {
                setScannedData(decodedText);
                console.log("✅ RAW SCANNED TEXT:", decodedText);

                if (html5QrCode._isScanning) {
                  await html5QrCode.stop();
                  console.log("📴 QR scanning stopped.");
                }

                // ✅ Use the full scanned URL if it's valid
                if (decodedText.startsWith("http")) {
                  window.location.href = decodedText;
                  return;
                }

                // ✅ Otherwise, extract product ID from known patterns
                const match = decodedText.match(/product\/(\d+)|ID_(\d+)_/);
                const productId = match ? (match[1] || match[2]) : null;

                if (!productId) {
                  alert(`❌ Invalid QR code: No product ID found in "${decodedText}"`);
                  return;
                }

                // Redirect to product page on your backend
                window.location.href = `https://retailsphere-4.onrender.com/product/${productId}`;
              }
            },
            (error) => console.warn("⚠️ QR Scan Error:", error)
          );
        }
      } catch (err) {
        console.error("❌ Unable to start QR scanner:", err);
        alert("Failed to start camera. Make sure you allow camera access and use HTTPS.");
      }
    };

    const timeoutId = setTimeout(startScanner, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
      }
    };
  }, [scannedData]);

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">📷 Scan Product QR</h2>
      <div id={qrCodeRegionId} className="w-full aspect-square bg-gray-100" />

      {scannedData ? (
        <p className="mt-3 text-sm text-gray-600">
          Scanned: <span className="font-mono">{scannedData}</span>
        </p>
      ) : (
        <button
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔙 Go Back
        </button>
      )}
    </div>
  );
};

export default QRScanner;
