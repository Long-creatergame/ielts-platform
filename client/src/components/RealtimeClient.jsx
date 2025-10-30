import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

let socket;

export default function RealtimeClient({ onTestStarted, onTestCompleted }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Only connect in production or if explicitly enabled
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    const isProduction = API_BASE_URL.includes('render.com') || API_BASE_URL.includes('vercel.app');
    
    if (!isProduction) {
      // Skip WebSocket in development to avoid connection errors
      console.log('🔄 WebSocket disabled in development mode');
      return;
    }

    try {
      socket = io(API_BASE_URL, { 
        transports: ['websocket'],
        reconnection: false, // Don't spam console with retries
        timeout: 5000
      });

      socket.on('connect', () => {
        // Join user-specific room using user id
        socket.emit('join', String(user.id || user._id));
      });

      socket.on('connect_error', (error) => {
        console.log('🔌 WebSocket connection failed (expected in development)');
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
    } catch (error) {
      console.log('⚠️ WebSocket initialization skipped');
    }
  }, [user]);

  return null;
}


