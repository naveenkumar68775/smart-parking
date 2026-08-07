import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/history/my');
        setHistory(data.history);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load history');
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Parking History</h2>
      {error && <div className="text-red-600">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Slot</th><th>Vehicle</th><th>Entry</th><th>Exit</th><th>Duration</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h._id} className="border-b last:border-0">
                <td className="py-2">{h.slot?.slotNumber}</td>
                <td>{h.vehicleNumber}</td>
                <td>{new Date(h.entryTime).toLocaleString()}</td>
                <td>{new Date(h.exitTime).toLocaleString()}</td>
                <td>{h.durationMinutes} min</td>
                <td>₹{h.amountPaid}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && !error && <p className="text-gray-500 mt-3">No parking history yet.</p>}
      </div>
    </div>
  );
};

export default History;
