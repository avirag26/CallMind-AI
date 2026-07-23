import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = () => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

    socket.current.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  return socket.current;
};
