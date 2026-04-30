'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Icons } from './icons';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (err) => {
        // Ignoring frequent scan errors (no code found)
        console.warn(err);
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-sm z-[500] flex items-center justify-center p-4">
      <div className="bg-bg-sec border border-bd2 rounded-[18px] w-full max-w-[400px] shadow-[0_16px_44px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-bd flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 text-tx"><Icons.cam className="w-4 h-4 text-[#3498db]" /> Scan Barcode / QR</h3>
          <button className="w-8 h-8 rounded-full bg-sf border-0 flex items-center justify-center text-t2 cursor-pointer hover:bg-bd" onClick={onClose}><Icons.x className="w-4 h-4" /></button>
        </div>
        <div className="p-4">
          <div id="reader" className="w-full bg-black rounded-lg overflow-hidden"></div>
          {error && <p className="text-[#ff5a65] text-xs text-center mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
