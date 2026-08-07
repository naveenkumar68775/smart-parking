import React, { useState } from 'react';
import api from '../../services/api';

const Reports = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const search = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.get('/reports/search', { params: { query } });
      setResults(data.results);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    }
  };

  const download = async (path, filename) => {
    const res = await api.get(path, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reports</h2>

      <div className="card">
        <h3 className="font-semibold mb-3">Search (Vehicle No. / Booking ID / Slot No. / User Name)</h3>
        <form onSubmit={search} className="flex gap-2">
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type to search..." />
          <button className="btn-primary" type="submit">Search</button>
        </form>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

        {results.length > 0 && (
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Booking ID</th><th>User</th><th>Slot</th><th>Vehicle</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((b) => (
                <tr key={b._id} className="border-b last:border-0">
                  <td className="py-2">{b.bookingId}</td>
                  <td>{b.user?.name}</td>
                  <td>{b.slot?.slotNumber}</td>
                  <td>{b.vehicle?.vehicleNumber}</td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Export Reports (CSV)</h3>
        <div className="flex gap-3 flex-wrap">
          <button className="btn-secondary" onClick={() => download('/reports/bookings/export', 'bookings-report.csv')}>
            Download Bookings CSV
          </button>
          <button className="btn-secondary" onClick={() => download('/reports/payments/export', 'payments-report.csv')}>
            Download Payments CSV
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          PDF/Excel formats can be produced by opening the CSV in Excel/Sheets and exporting, or by wiring in a library
          such as <code>exceljs</code> or <code>pdfkit</code> server-side if a native file format is required.
        </p>
      </div>
    </div>
  );
};

export default Reports;
