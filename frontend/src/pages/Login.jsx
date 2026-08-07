import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(email, password);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      Swal.fire({ icon: 'error', title: 'Login failed', text: msg });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
        <p className="text-gray-500 text-sm mb-4">Login to your Smart Parking account</p>
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-2">{error}</div>}

        <label className="label">Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="label">Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <div className="text-right mt-2">
          <Link to="/forgot-password" className="text-primary-600 text-sm">Forgot password?</Link>
        </div>

        <button className="btn-primary w-full mt-4" disabled={loading} type="submit">
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          No account? <Link to="/register" className="text-primary-600 font-semibold">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
