import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaParking,
  FaCarSide,
  FaHistory,
  FaCreditCard,
  FaUser,
  FaUsersCog,
  FaQrcode,
  FaChartBar,
  FaClipboardList,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const linkClasses = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
  }`;

const Sidebar = () => {
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.role === 'admin';

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] p-4 hidden md:block">
      <nav className="space-y-1">
        {!isAdmin && (
          <>
            <NavLink to="/dashboard" className={linkClasses}>
              <FaTachometerAlt /> Dashboard
            </NavLink>
            <NavLink to="/live-parking" className={linkClasses}>
              <FaParking /> Live Parking
            </NavLink>
            <NavLink to="/book" className={linkClasses}>
              <FaParking /> Book Slot
            </NavLink>
            <NavLink to="/my-bookings" className={linkClasses}>
              <FaClipboardList /> My Bookings
            </NavLink>
            <NavLink to="/history" className={linkClasses}>
              <FaHistory /> Parking History
            </NavLink>
            <NavLink to="/vehicles" className={linkClasses}>
              <FaCarSide /> Vehicles
            </NavLink>
            <NavLink to="/payments" className={linkClasses}>
              <FaCreditCard /> Payments
            </NavLink>
            <NavLink to="/profile" className={linkClasses}>
              <FaUser /> Profile
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink to="/admin" className={linkClasses} end>
              <FaTachometerAlt /> Admin Dashboard
            </NavLink>
            <NavLink to="/admin/slots" className={linkClasses}>
              <FaParking /> Manage Slots
            </NavLink>
            <NavLink to="/admin/users" className={linkClasses}>
              <FaUsersCog /> Manage Users
            </NavLink>
            <NavLink to="/admin/bookings" className={linkClasses}>
              <FaClipboardList /> Manage Bookings
            </NavLink>
            <NavLink to="/admin/scan" className={linkClasses}>
              <FaQrcode /> Scan QR
            </NavLink>
            <NavLink to="/admin/reports" className={linkClasses}>
              <FaChartBar /> Reports
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
