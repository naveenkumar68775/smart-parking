import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      Swal.fire({ icon: 'success', title: 'Account created!', timer: 1200, showConfirmButton: false });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      Swal.fire({ icon: 'error', title: 'Registration failed', text: msg });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-1">Create your account</h2>
        <p className="text-gray-500 text-sm mb-4">Join Smart Parking in seconds</p>
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-2">{error}</div>}

        <label className="label">Full Name</label>
        <input className="input" name="name" value={form.name} onChange={onChange} required />

        <label className="label">Email</label>
        <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />

        <label className="label">Phone</label>
        <input className="input" name="phone" value={form.phone} onChange={onChange} />

        <label className="label">Password</label>
        <input className="input" type="password" name="password" value={form.password} onChange={onChange} minLength={6} required />

        <button className="btn-primary w-full mt-4" disabled={loading} type="submit">
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-primary-600 font-semibold">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
