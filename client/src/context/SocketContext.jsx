import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from 'axios';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch total unread count from server
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get('/api/chat/unread-count');
      setUnreadCount(data.count || 0);
    } catch {}
  }, [token]);

  // Fetch on mount and when user changes
  useEffect(() => {
    if (user) fetchUnreadCount();
    else setUnreadCount(0);
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (!token) {
      if (socket) { socket.disconnect(); setSocket(null); }
      setUnreadCount(0);
      return;
    }

    const serverURL = import.meta.env.VITE_API_URL || '/';
    const s = io(serverURL, { auth: { token }, transports: ['websocket'] });

    s.on('connect', () => console.log('Socket connected'));
    s.on('connect_error', (err) => console.error('Socket error:', err.message));

    // New message received — bump unread count
    s.on('message_notification', () => {
      setUnreadCount(prev => prev + 1);
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, [token]);

  const clearUnread = () => setUnreadCount(0);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, clearUnread, fetchUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
