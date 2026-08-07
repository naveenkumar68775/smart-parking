import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const statusColor = {
  Pending: 'bg-gray-100 text-gray-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Active: 'bg-amber-100 text-amber-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  const load = async (status) => {
    try {
      const { data } = await api.get('/bookings', { params: status ? { status } : {} });
      setBookings(data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    }
  };

  useEffect(() => { load(); }, []);

  const onFilterChange = (e) => {
    setStatusFilter(e.target.value);
    load(e.target.value);
  };

  const approve = async (id) => {
    await api.put(`/bookings/${id}/approve`);
    load(statusFilter);
  };

  const cancel = async (id) => {
    await api.put(`/bookings/${id}/cancel`);
    load(statusFilter);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Manage Bookings</h2>
        <select className="input w-auto" value={statusFilter} onChange={onFilterChange}>
          <option value="">All Statuses</option>
          <option>Pending</option><option>Confirmed</option><option>Active</option>
          <option>Completed</option><option>Cancelled</option>
        </select>
      </div>
      {error && <div className="text-red-600">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Booking ID</th><th>User</th><th>Slot</th><th>Vehicle</th>
              <th>Status</th><th>Payment</th><th>Amount</th><th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-b last:border-0">
                <td className="py-2">{b.bookingId}</td>
                <td>{b.user?.name}</td>
                <td>{b.slot?.slotNumber}</td>
                <td>{b.vehicle?.vehicleNumber}</td>
                <td><span className={`badge ${statusColor[b.status]}`}>{b.status}</span></td>
                <td>{b.paymentStatus}</td>
                <td>₹{b.finalAmount ?? b.amount}</td>
                <td className="space-x-2 whitespace-nowrap">
                  {b.status === 'Pending' && (
                    <button onClick={() => approve(b._id)} className="text-green-600 text-xs">Approve</button>
                  )}
                  {['Pending', 'Confirmed'].includes(b.status) && (
                    <button onClick={() => cancel(b._id)} className="text-red-500 text-xs">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="text-gray-500 mt-3">No bookings found.</p>}
      </div>
    </div>
  );
};

export default ManageBookings;
