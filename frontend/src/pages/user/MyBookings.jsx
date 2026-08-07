import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../services/api';
import { FaQrcode, FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaTimes, FaCheckCircle } from 'react-icons/fa';

const statusColor = {
  Pending: 'bg-gray-100 text-gray-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Active: 'bg-amber-100 text-amber-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI_QR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    }
  };

  useEffect(() => { load(); }, []);

  const handlePaySubmit = async () => {
    if (!selectedBooking) return;
    setIsSubmitting(true);
    try {
      await api.post('/payments', {
        bookingId: selectedBooking._id,
        paymentMethod: paymentMethod === 'UPI_QR' ? 'UPI / QR Code' : paymentMethod,
      });
      Swal.fire({
        icon: 'success',
        title: 'Payment Successful!',
        text: `Transaction completed for ${selectedBooking.bookingId}`,
        confirmButtonColor: '#2563eb',
      });
      setSelectedBooking(null);
      load();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: err.response?.data?.message || 'Could not complete payment',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancel = async (id) => {
    const confirm = await Swal.fire({
      title: 'Cancel this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel',
      confirmButtonColor: '#ef4444',
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Cancellation failed', text: err.response?.data?.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Bookings</h2>
          <p className="text-sm text-gray-500">Manage your active, completed, and upcoming parking reservations.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">{error}</div>}

      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b._id} className="card hover:shadow-md transition-shadow duration-150">
            <div className="flex justify-between items-start flex-wrap gap-2 border-b pb-3">
              <div>
                <div className="font-bold text-gray-900 text-lg">{b.bookingId}</div>
                <div className="text-sm text-gray-600 font-medium">
                  Slot <span className="text-blue-700 font-bold">{b.slot?.slotNumber}</span> ({b.slot?.floor} Floor) • Vehicle: <span className="font-semibold text-gray-800">{b.vehicle?.vehicleNumber}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`badge ${statusColor[b.status]}`}>{b.status}</span>
                <span className={`badge ${b.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 border border-green-200 font-bold' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                  {b.paymentStatus}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-600 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><span className="text-gray-400">Expected Exit:</span> <span className="font-medium">{new Date(b.expectedExitTime).toLocaleString()}</span></div>
              <div><span className="text-gray-400">Total Amount:</span> <span className="font-bold text-emerald-700 text-base">₹{b.finalAmount ?? b.amount}</span></div>
              {b.entryTime && <div><span className="text-gray-400">Entry Time:</span> <span className="font-medium">{new Date(b.entryTime).toLocaleString()}</span></div>}
              {b.actualExitTime && <div><span className="text-gray-400">Actual Exit:</span> <span className="font-medium">{new Date(b.actualExitTime).toLocaleString()}</span></div>}
            </div>

            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {b.paymentStatus !== 'Paid' && b.status !== 'Cancelled' && (
                  <button
                    className="btn-primary flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      setSelectedBooking(b);
                      setPaymentMethod('UPI_QR');
                    }}
                  >
                    <FaQrcode className="text-sm" /> Pay ₹{b.finalAmount ?? b.amount} Now
                  </button>
                )}
                {['Pending', 'Confirmed'].includes(b.status) && (
                  <button className="btn-danger" onClick={() => cancel(b._id)}>Cancel Booking</button>
                )}
              </div>
              <Link to={`/booking/${b._id}`} className="btn-secondary text-xs">View Pass Details &rarr;</Link>
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="card text-center py-10 space-y-3">
            <p className="text-gray-500">You don't have any parking bookings yet.</p>
            <Link to="/book-slot" className="btn-primary inline-block">Book a Parking Slot</Link>
          </div>
        )}
      </div>

      {/* Interactive Payment Modal featuring the Uploaded UPI QR Code */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <FaTimes className="text-lg" />
            </button>

            <div className="border-b pb-3">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaShieldAlt className="text-blue-600" /> Secure Payment
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Booking #{selectedBooking.bookingId} • Slot {selectedBooking.slot?.slotNumber}</p>
            </div>

            <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500">Amount Payable</div>
                <div className="text-2xl font-extrabold text-blue-900">₹{selectedBooking.finalAmount ?? selectedBooking.amount}</div>
              </div>
              <div className="text-right text-xs text-blue-700 font-semibold bg-blue-100 px-2.5 py-1 rounded-lg">
                Instant Confirmation
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI_QR')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-medium transition-all ${
                    paymentMethod === 'UPI_QR'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-400 font-bold'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  <FaQrcode className="text-lg text-emerald-600" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-medium transition-all ${
                    paymentMethod === 'Card'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-400 font-bold'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  <FaCreditCard className="text-lg text-blue-600" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-medium transition-all ${
                    paymentMethod === 'Cash'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-400 font-bold'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  <FaMoneyBillWave className="text-lg text-amber-600" />
                  <span>Cash</span>
                </button>
              </div>
            </div>

            {/* UPI QR Display Container */}
            {paymentMethod === 'UPI_QR' && (
              <div className="bg-gradient-to-b from-gray-50 to-emerald-50/30 border border-emerald-200 rounded-xl p-4 text-center space-y-3">
                <div className="text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5">
                  <FaQrcode className="text-emerald-600" /> Scan QR Code with any UPI App
                </div>

                <div className="bg-white p-2.5 rounded-xl inline-block shadow-md border border-gray-200">
                  <img
                    src="/payment-qr.png"
                    alt="Payment UPI QR Code"
                    className="w-48 h-48 object-contain mx-auto rounded-lg"
                    onError={(e) => {
                      // Fallback if image load has delay
                      e.target.onerror = null;
                      e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=smartparking@upi&pn=SmartParking&am=' + (selectedBooking.finalAmount ?? selectedBooking.amount);
                    }}
                  />
                </div>

                <div className="flex justify-center items-center gap-2 text-[11px] text-gray-500 font-medium">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">Google Pay</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">PhonePe</span>
                  <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-semibold">Paytm</span>
                  <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-semibold">BHIM</span>
                </div>

                <p className="text-[11px] text-emerald-700 bg-emerald-100/60 p-2 rounded-lg font-medium">
                  After completing the UPI transaction, click <strong>"Confirm Payment"</strong> below.
                </p>
              </div>
            )}

            {paymentMethod === 'Card' && (
              <div className="bg-gray-50 p-3 rounded-xl border space-y-2 text-xs">
                <div>
                  <label className="label text-[11px]">Card Number</label>
                  <input className="input text-xs" placeholder="4532 •••• •••• 8921" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-[11px]">Expiry</label>
                    <input className="input text-xs" placeholder="MM/YY" />
                  </div>
                  <div>
                    <label className="label text-[11px]">CVV</label>
                    <input className="input text-xs" type="password" placeholder="•••" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'Cash' && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800">
                Please pay <strong>₹{selectedBooking.finalAmount ?? selectedBooking.amount}</strong> in cash at the parking entry/exit counter.
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="btn-secondary flex-1 py-2 text-xs"
                onClick={() => setSelectedBooking(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                className="btn-primary flex-1 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1 font-bold"
                onClick={handlePaySubmit}
              >
                <FaCheckCircle /> {isSubmitting ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
