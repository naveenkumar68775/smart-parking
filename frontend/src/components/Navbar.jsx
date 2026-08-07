import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaParking, FaBolt, FaBell, FaSignOutAlt, FaMoon, FaSun, FaCheckDouble, FaEnvelopeOpenText, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const Navbar = () => {
  const { userInfo, logout } = useAuth();
  const { notifications: socketNotifications } = useSocket();
  const { dark, toggleTheme } = useTheme();
  const [dbNotifications, setDbNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!userInfo) return;
    try {
      const { data } = await api.get('/notifications');
      setDbNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userInfo]);

  // Merge socket notifications with DB notifications
  const allNotifications = [...socketNotifications, ...dbNotifications].reduce((acc, current) => {
    const x = acc.find(item => item._id === current._id || (item.title === current.title && item.message === current.message));
    if (!x) return acc.concat([current]);
    return acc;
  }, []);

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setDbNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setDbNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all read failed:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 border-b border-gray-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary-600 dark:text-primary-400 text-lg group">
          <span className="p-1.5 bg-amber-400 text-gray-900 rounded-lg shadow-sm text-sm group-hover:scale-110 transition-transform">
            <FaBolt />
          </span>
          <span className="flex items-center gap-1">
            <FaParking className="text-primary-600 dark:text-primary-400" /> Smart Parking
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white p-1" title="Toggle dark mode">
            {dark ? <FaSun className="text-amber-400" /> : <FaMoon />}
          </button>

          {userInfo && (
            <>
              {/* Notification & Messages Access Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="relative p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Messages & Notifications"
                >
                  <FaBell className="text-lg" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-3 z-50 animate-fade-in">
                    <div className="px-4 pb-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-100 text-sm">
                        <FaEnvelopeOpenText className="text-blue-600" /> Messages & Alerts
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <FaCheckDouble /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                      {allNotifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-xs">
                          No messages or notifications right now.
                        </div>
                      ) : (
                        allNotifications.map((n) => (
                          <div
                            key={n._id || n.id || Math.random()}
                            onClick={() => {
                              setSelectedMsg(selectedMsg?._id === n._id ? null : n);
                              if (!n.isRead && n._id) handleMarkAsRead(n._id);
                            }}
                            className={`p-3.5 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/60 ${
                              !n.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-start gap-2">
                                <span className="mt-0.5 text-blue-600 dark:text-blue-400">
                                  {n.type === 'booking' ? <FaCheckCircle className="text-emerald-500" /> : n.type === 'payment' ? <FaInfoCircle className="text-blue-500" /> : <FaExclamationTriangle className="text-amber-500" />}
                                </span>
                                <div>
                                  <div className={`text-xs font-semibold ${!n.isRead ? 'text-gray-900 dark:text-gray-100 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {n.title || n.type || 'Notification'}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                                    {n.message}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                              </span>
                            </div>

                            {selectedMsg?._id === n._id && (
                              <div className="mt-2 text-xs bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 space-y-1">
                                <div className="font-semibold text-blue-600 dark:text-blue-400">Full Details:</div>
                                <div>{n.message}</div>
                                {n.createdAt && <div className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
                {userInfo.name} ({userInfo.role})
              </span>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm font-medium">
                <FaSignOutAlt /> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
