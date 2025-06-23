import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

const ScanPage = () => {
  const [scannedData, setScannedData] = useState("");
  const scannerRef = useRef(null);
  const qrCodeRegionId = "html5qr-code-region";

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: 250 };

    const startScanner = async () => {
      try {
        const state = html5QrCode.getState();
        if (state !== Html5QrcodeScannerState.SCANNING) {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            async (decodedText) => {
              if (decodedText !== scannedData) {
                setScannedData(decodedText);
                console.log("✅ RAW SCANNED TEXT:", decodedText);

                const currentState = html5QrCode.getState();
                if (currentState === Html5QrcodeScannerState.SCANNING) {
                  await html5QrCode.stop();
                  console.log("📴 QR scanning stopped.");
                }

                if (decodedText.startsWith("http")) {
                  window.location.href = decodedText;
                  return;
                }

                const match = decodedText.match(/product\/(\d+)|ID_(\d+)_/);
                const productId = match ? (match[1] || match[2]) : null;

                if (!productId) {
                  alert(`❌ Invalid QR code: No product ID found in "${decodedText}"`);
                  return;
                }

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
      const qr = scannerRef.current;
      if (qr && qr.getState() === Html5QrcodeScannerState.SCANNING) {
        qr.stop()
          .then(() => qr.clear())
          .catch((err) => console.warn("⚠️ Error during cleanup stop:", err));
      }
    };
  }, [scannedData]);

  return (
    <div className="min-h-screen bg-[#111a22] text-white" style={{ fontFamily: "'Manrope', 'Noto Sans', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#233648] px-10 py-3">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 text-white">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-lg font-bold tracking-tight">Retail Assistant</h2>
        </div>
        <nav className="flex items-center gap-10 text-sm font-medium">
          <a href="/" className="hover:underline">Home</a>
          
        </nav>
      </header>

      {/* Body */}
      <main className="flex justify-center px-6 py-10">
        <div className="w-full max-w-2xl bg-[#1c2b36] p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-2">📷 Scan QR Code</h2>
          <p className="text-center text-[#92adc9] text-sm mb-6">
            Position the QR code inside the box to auto-redirect to product details.
          </p>

          <div
            id={qrCodeRegionId}
            className="w-full aspect-square relative rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 border-4 border-dashed rounded-xl border-blue-500 animate-pulse z-10 pointer-events-none" />
            <div className="absolute inset-0 border-[6px] border-transparent rounded-xl z-20 pointer-events-none animate-scanner-glow" />
          </div>

          {scannedData ? (
            <p className="mt-4 text-center text-sm text-[#92adc9]">
              Scanned: <span className="font-mono">{scannedData}</span>
            </p>
          ) : (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔙 Go Back
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScanPage;
