import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

let socket;

export default function RealtimeClient({ onTestStarted, onTestCompleted }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    socket = io(API_BASE_URL, { transports: ['websocket'] });

    socket.on('connect', () => {
      // Join user-specific room using user id
      socket.emit('join', String(user.id || user._id));
    });

    socket.on('test:started', (payload) => {
      if (onTestStarted) onTestStarted(payload);
    });

    socket.on('test:completed', (payload) => {
      if (onTestCompleted) onTestCompleted(payload);
    });

    return () => {
      try {
        socket.disconnect();
      } catch (_) {}
    };
  }, [user]);

  return null;
}


