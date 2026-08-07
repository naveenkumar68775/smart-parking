import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-1">Reset Password</h2>
        {message && <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-2">{message}</div>}
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-2">{error}</div>}

        <label className="label">New Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />

        <button className="btn-primary w-full mt-4" disabled={loading} type="submit">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-primary-600 font-semibold">Back to login</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
