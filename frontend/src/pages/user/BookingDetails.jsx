import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [extendTime, setExtendTime] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      setBooking(data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking');
    }
  };

  useEffect(() => { load(); }, [id]);

  const extend = async () => {
    if (!extendTime) return;
    try {
      await api.put(`/bookings/${id}/extend`, { newExpectedExitTime: new Date(extendTime).toISOString() });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Extend failed');
    }
  };

  if (error) return <div className="text-red-600">{error}</div>;
  if (!booking) return <div>Loading...</div>;

  return (
    <div className="max-w-lg space-y-4">
      <Link to="/my-bookings" className="text-primary-600 text-sm">&larr; Back to bookings</Link>
      <h2 className="text-2xl font-bold">Booking {booking.bookingId}</h2>

      <div className="card space-y-2 text-sm">
        <p><strong>Slot:</strong> {booking.slot?.slotNumber} ({booking.slot?.floor} floor, section {booking.slot?.section})</p>
        <p><strong>Vehicle:</strong> {booking.vehicle?.vehicleNumber}</p>
        <p><strong>Status:</strong> {booking.status}</p>
        <p><strong>Payment:</strong> {booking.paymentStatus}</p>
        <p><strong>Amount:</strong> ₹{booking.finalAmount ?? booking.amount}</p>
        <p><strong>Expected Exit:</strong> {new Date(booking.expectedExitTime).toLocaleString()}</p>
        {booking.entryTime && <p><strong>Entry Time:</strong> {new Date(booking.entryTime).toLocaleString()}</p>}
        {booking.actualExitTime && <p><strong>Actual Exit:</strong> {new Date(booking.actualExitTime).toLocaleString()}</p>}
      </div>

      {booking.qrCode && ['Confirmed', 'Active'].includes(booking.status) && (
        <div className="card text-center">
          <p className="font-semibold mb-2">Entry/Exit QR Code</p>
          <img src={booking.qrCode} alt="Booking QR" className="w-52 h-52 mx-auto border rounded-lg" />
          <a href={booking.qrCode} download={`${booking.bookingId}-qr.png`} className="btn-secondary inline-block mt-3">
            Download QR
          </a>
        </div>
      )}

      {['Confirmed', 'Active'].includes(booking.status) && (
        <div className="card">
          <p className="font-semibold mb-2">Extend Parking Time</p>
          <input
            type="datetime-local"
            className="input"
            value={extendTime}
            onChange={(e) => setExtendTime(e.target.value)}
          />
          <button className="btn-primary mt-3" onClick={extend}>Extend</button>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
