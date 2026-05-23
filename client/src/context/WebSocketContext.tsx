import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WSContextValue {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, cb: (...args: any[]) => void) => void;
  off: (event: string, cb?: (...args: any[]) => void) => void;
}

const WebSocketContext = createContext<WSContextValue>({
  socket: null,
  isConnected: false,
  emit: () => {},
  on: () => {},
  off: () => {},
});

export const WebSocketProvider: React.FC<{ isAuthenticated: boolean; children: React.ReactNode }> = ({
  isAuthenticated,
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket(prev => { prev?.disconnect(); return null; });
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    const url = import.meta.env.VITE_SOCKETIO_URL || 'http://localhost:3001';
    const s = io(url, {
      query: { token, userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    s.on('connect', () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));
    s.on('connect_error', (err) => console.error('WS error:', err));

    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [isAuthenticated]);

  const emit = useCallback((event: string, data?: any) => {
    socket?.emit(event, data);
  }, [socket]);

  const on = useCallback((event: string, cb: (...args: any[]) => void) => {
    socket?.on(event, cb);
  }, [socket]);

  const off = useCallback((event: string, cb?: (...args: any[]) => void) => {
    socket?.off(event, cb);
  }, [socket]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, emit, on, off }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
