import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Swal from 'sweetalert2';
import api from '../../services/api';

const SCANNER_ID = 'admin-qr-reader';

const ScanQR = () => {
  const [mode, setMode] = useState('entry');
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const submitQr = async (qrData) => {
    setError('');
    try {
      const endpoint = mode === 'entry' ? '/qr/scan-entry' : '/qr/scan-exit';
      const { data } = await api.post(endpoint, { qrData });
      setResult(data);
      Swal.fire({ icon: 'success', title: data.message, timer: 1800, showConfirmButton: false });
    } catch (err) {
      const msg = err.response?.data?.message || 'Scan failed';
      setError(msg);
      Swal.fire({ icon: 'error', title: 'Scan failed', text: msg });
    }
  };

  const startScanner = async () => {
    setError('');
    setResult(null);
    setScanning(true);
    try {
      const html5Qr = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = html5Qr;
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await stopScanner();
          await submitQr(decodedText);
        },
        () => {}
      );
    } catch {
      setError('Camera access failed. Use manual entry below.');
      setScanning(false);
    }
  };

  const submitManual = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await submitQr(JSON.stringify({ bookingId: manualCode.trim() }));
  };

  useEffect(() => () => { stopScanner(); }, []);

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-2xl font-bold">Scan QR — Entry / Exit</h2>

      <div className="flex gap-2">
        <button className={mode === 'entry' ? 'btn-primary' : 'btn-secondary'} onClick={() => setMode('entry')}>Entry</button>
        <button className={mode === 'exit' ? 'btn-primary' : 'btn-secondary'} onClick={() => setMode('exit')}>Exit</button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

      <div id={SCANNER_ID} className="w-80 max-w-full" />

      <div className="flex gap-2">
        {!scanning ? (
          <button className="btn-primary" onClick={startScanner}>Start Camera Scan</button>
        ) : (
          <button className="btn-danger" onClick={stopScanner}>Stop Scan</button>
        )}
      </div>

      <form onSubmit={submitManual} className="card">
        <label className="label">Or enter Booking ID manually</label>
        <input className="input" value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="e.g. BK-A1B2C3D4" />
        <button className="btn-secondary mt-3" type="submit">Submit</button>
      </form>

      {result && (
        <div className="card bg-green-50">
          <p className="font-semibold">{result.message}</p>
          {result.durationMinutes && <p className="text-sm">Duration: {result.durationMinutes} min</p>}
          {result.finalAmount && <p className="text-sm">Final Amount: ₹{result.finalAmount}</p>}
        </div>
      )}
    </div>
  );
};

export default ScanQR;
