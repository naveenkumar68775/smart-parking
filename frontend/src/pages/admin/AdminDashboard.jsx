import React, { useEffect, useState } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend,
} from 'chart.js';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const monthName = (m) => ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard/admin');
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

  const revenueData = {
    labels: charts.monthlyRevenue.map((m) => `${monthName(m._id.month)} ${m._id.year}`),
    datasets: [{ label: 'Revenue (₹)', data: charts.monthlyRevenue.map((m) => m.total), borderColor: '#2563eb', backgroundColor: '#93c5fd', tension: 0.3 }],
  };

  const bookingData = {
    labels: charts.monthlyBookings.map((m) => `${monthName(m._id.month)} ${m._id.year}`),
    datasets: [{ label: 'Bookings', data: charts.monthlyBookings.map((m) => m.count), backgroundColor: '#60a5fa' }],
  };

  const vehicleData = {
    labels: charts.vehicleDistribution.map((v) => v._id),
    datasets: [{ data: charts.vehicleDistribution.map((v) => v.count), backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e', '#a855f7'] }],
  };

  const peakData = {
    labels: charts.peakHours.map((h) => `${h._id}:00`),
    datasets: [{ label: 'Entries', data: charts.peakHours.map((h) => h.count), backgroundColor: '#f87171' }],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card"><div className="text-sm text-gray-500">Today's Revenue</div><div className="text-2xl font-bold">₹{cards.todaysRevenue}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Today's Bookings</div><div className="text-2xl font-bold">{cards.todaysBookings}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Available Slots</div><div className="text-2xl font-bold text-green-600">{cards.availableSlots}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Occupied Slots</div><div className="text-2xl font-bold text-red-500">{cards.occupiedSlots}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Registered Users</div><div className="text-2xl font-bold">{cards.registeredUsers}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Completed Parking</div><div className="text-2xl font-bold">{cards.completedParking}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Total Slots</div><div className="text-2xl font-bold">{cards.totalSlots}</div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card"><h3 className="font-semibold mb-3">Monthly Revenue</h3><Line data={revenueData} /></div>
        <div className="card"><h3 className="font-semibold mb-3">Monthly Bookings</h3><Bar data={bookingData} /></div>
        <div className="card"><h3 className="font-semibold mb-3">Vehicle Distribution</h3><Doughnut data={vehicleData} /></div>
        <div className="card"><h3 className="font-semibold mb-3">Peak Hours (Entry Time)</h3><Bar data={peakData} /></div>
      </div>
    </div>
  );
};

export default AdminDashboard;
