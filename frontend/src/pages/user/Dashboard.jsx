import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const monthName = (m) => ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard/user');
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      }
    };
    load();
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div>Loading dashboard...</div>;

  const { cards, charts } = data;

  const chartData = {
    labels: charts.monthlySpending.map((m) => `${monthName(m._id.month)} ${m._id.year}`),
    datasets: [
      {
        label: 'Monthly Spending (₹)',
        data: charts.monthlySpending.map((m) => m.total),
        borderColor: '#2563eb',
        backgroundColor: '#93c5fd',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500">Current Booking</div>
          <div className="text-lg font-bold">{cards.currentBooking ? cards.currentBooking.slot?.slotNumber : 'None'}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Completed Bookings</div>
          <div className="text-2xl font-bold">{cards.completedBooking}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Total Paid</div>
          <div className="text-2xl font-bold">₹{cards.totalPayment}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Saved Vehicles</div>
          <div className="text-2xl font-bold">{cards.savedVehicles}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Monthly Spending</h3>
        <Line data={chartData} />
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Recent Booking History</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Booking ID</th>
              <th>Slot</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {charts.bookingHistory.map((b) => (
              <tr key={b._id} className="border-b last:border-0">
                <td className="py-2">{b.bookingId}</td>
                <td>{b.slot?.slotNumber}</td>
                <td><span className="badge bg-gray-100">{b.status}</span></td>
                <td>₹{b.finalAmount ?? b.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
