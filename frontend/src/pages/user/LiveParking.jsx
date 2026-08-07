import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import SlotCard from '../../components/SlotCard';
import { useSocket } from '../../context/SocketContext';

const LiveParking = () => {
  const [summary, setSummary] = useState(null);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');
  const { lastParkingUpdate } = useSocket();

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/slots');
      setSummary(data.summary);
      setSlots(data.slots);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load slots');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Re-fetch whenever a real-time update comes in via Socket.IO
  useEffect(() => {
    if (lastParkingUpdate) load();
  }, [lastParkingUpdate, load]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Live Parking Availability</h2>
      {error && <div className="text-red-600">{error}</div>}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card text-center"><div className="text-2xl font-bold">{summary.total}</div><div className="text-xs text-gray-500">Total</div></div>
          <div className="card text-center"><div className="text-2xl font-bold text-green-600">{summary.available}</div><div className="text-xs text-gray-500">Available</div></div>
          <div className="card text-center"><div className="text-2xl font-bold text-amber-500">{summary.reserved}</div><div className="text-xs text-gray-500">Reserved</div></div>
          <div className="card text-center"><div className="text-2xl font-bold text-red-500">{summary.occupied}</div><div className="text-xs text-gray-500">Occupied</div></div>
          <div className="card text-center"><div className="text-2xl font-bold text-gray-400">{summary.maintenance}</div><div className="text-xs text-gray-500">Maintenance</div></div>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {slots.map((slot) => <SlotCard key={slot._id} slot={slot} />)}
      </div>
      {slots.length === 0 && !error && <p className="text-gray-500">No slots found yet.</p>}
    </div>
  );
};

export default LiveParking;
