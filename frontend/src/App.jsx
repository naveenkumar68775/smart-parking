import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

import Dashboard from './pages/user/Dashboard';
import LiveParking from './pages/user/LiveParking';
import BookSlot from './pages/user/BookSlot';
import MyBookings from './pages/user/MyBookings';
import BookingDetails from './pages/user/BookingDetails';
import Vehicles from './pages/user/Vehicles';
import Payments from './pages/user/Payments';
import Profile from './pages/user/Profile';
import History from './pages/user/History';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageSlots from './pages/admin/ManageSlots';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBookings from './pages/admin/ManageBookings';
import ScanQR from './pages/admin/ScanQR';
import Reports from './pages/admin/Reports';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Authenticated app shell */}
              <Route element={<MainLayout />}>
                {/* User routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/live-parking" element={<ProtectedRoute><LiveParking /></ProtectedRoute>} />
                <Route path="/book" element={<ProtectedRoute><BookSlot /></ProtectedRoute>} />
                <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                <Route path="/booking/:id" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
                <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/slots" element={<ProtectedRoute adminOnly><ManageSlots /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
                <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><ManageBookings /></ProtectedRoute>} />
                <Route path="/admin/scan" element={<ProtectedRoute adminOnly><ScanQR /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
