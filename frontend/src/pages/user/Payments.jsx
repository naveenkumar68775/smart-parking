import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/payments/my');
        setPayments(data.payments);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load payments');
      }
    };
    load();
  }, []);

  const viewInvoice = async (id) => {
    const { data: html } = await api.get(`/payments/${id}/invoice`, { responseType: 'text' });
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payment History</h2>
      {error && <div className="text-red-600">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Invoice</th>
              <th>Booking</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b last:border-0">
                <td className="py-2">{p.invoiceNumber}</td>
                <td>{p.booking?.bookingId}</td>
                <td>₹{p.amount}</td>
                <td>{p.paymentMethod}</td>
                <td>
                  <span className={`badge ${p.paymentStatus === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.paymentStatus}
                  </span>
                </td>
                <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => viewInvoice(p._id)} className="text-primary-600 text-sm">Invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p className="text-gray-500 mt-3">No payments yet.</p>}
      </div>
    </div>
  );
};

export default Payments;
