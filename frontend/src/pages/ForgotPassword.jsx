import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-1">Forgot Password</h2>
        <p className="text-gray-500 text-sm mb-4">We'll email you a reset link.</p>
        {message && <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-2">{message}</div>}
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-2">{error}</div>}

        <label className="label">Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <button className="btn-primary w-full mt-4" disabled={loading} type="submit">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-primary-600 font-semibold">Back to login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
