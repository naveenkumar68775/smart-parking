import React from 'react';
import { Link } from 'react-router-dom';
import { FaParking, FaQrcode, FaCreditCard, FaChartLine } from 'react-icons/fa';

const Landing = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 text-white">
    <div className="max-w-6xl mx-auto px-6 py-24 text-center">
      <FaParking className="text-6xl mx-auto mb-6" />
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Smart Parking Management System</h1>
      <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
        Book slots in real time, scan QR codes for entry/exit, and manage payments — all in one place.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/register" className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100">
          Get Started
        </Link>
        <Link to="/login" className="border border-white px-6 py-3 rounded-lg hover:bg-white/10">
          Login
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
        <div className="bg-white/10 rounded-xl p-6">
          <FaParking className="text-3xl mb-3" />
          <h3 className="font-bold text-lg mb-1">Live Availability</h3>
          <p className="text-primary-100 text-sm">Real-time slot status updated instantly via Socket.IO.</p>
        </div>
        <div className="bg-white/10 rounded-xl p-6">
          <FaQrcode className="text-3xl mb-3" />
          <h3 className="font-bold text-lg mb-1">QR Entry/Exit</h3>
          <p className="text-primary-100 text-sm">Frictionless gate access with auto-generated QR codes.</p>
        </div>
        <div className="bg-white/10 rounded-xl p-6">
          <FaCreditCard className="text-3xl mb-3" />
          <h3 className="font-bold text-lg mb-1">Payments & Invoices</h3>
          <p className="text-primary-100 text-sm">UPI, Card, or Cash — with downloadable invoices.</p>
        </div>
      </div>
    </div>
  </div>
);

export default Landing;
