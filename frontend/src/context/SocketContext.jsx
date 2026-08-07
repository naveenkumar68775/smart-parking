import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { userInfo } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastParkingUpdate, setLastParkingUpdate] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('parking:update', (payload) => setLastParkingUpdate(payload));

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!socketRef.current || !userInfo?._id) return;
    const event = `notification:${userInfo._id}`;
    const handler = (n) => setNotifications((prev) => [n, ...prev]);
    socketRef.current.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, [userInfo?._id]);

  return (
    <SocketContext.Provider value={{ connected, lastParkingUpdate, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
