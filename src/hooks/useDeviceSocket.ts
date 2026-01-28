import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/constants';
import { useDeviceStore, useDisplayStore } from '@/stores';
import type { BroadcastMessage } from '@/types';

interface UseDeviceSocketReturn {
  isConnected: boolean;
  lastMessage: BroadcastMessage | null;
  clearLastMessage: () => void;
}

export const useDeviceSocket = (): UseDeviceSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<BroadcastMessage | null>(null);

  const { deviceToken, status, organizationId } = useDeviceStore();
  const setStoreConnected = useDisplayStore(state => state.setIsConnected);

  const clearLastMessage = useCallback(() => {
    setLastMessage(null);
  }, []);

  useEffect(() => {
    // Only connect if device is verified and has token
    if (!deviceToken || status !== 'verified') {
      return;
    }

    // Create socket connection
    const socket = io(API_CONFIG.SOCKET_URL, {
      auth: {
        deviceToken,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[Socket] Connected');
      setIsConnected(true);
      setStoreConnected(true);
    });

    socket.on('disconnect', reason => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
      setStoreConnected(false);
    });

    socket.on('connect_error', error => {
      console.log('[Socket] Connection error:', error.message);
      setIsConnected(false);
      setStoreConnected(false);
    });

    // Broadcast message event
    socket.on('broadcastMessage', (message: BroadcastMessage) => {
      console.log('[Socket] Broadcast message:', message);
      setLastMessage(message);

      // Auto-clear after duration (default 5 seconds)
      if (message.duration !== 0) {
        setTimeout(() => {
          setLastMessage(current =>
            current?.id === message.id ? null : current,
          );
        }, message.duration || 5000);
      }
    });

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [deviceToken, status, organizationId, setStoreConnected]);

  return {
    isConnected,
    lastMessage,
    clearLastMessage,
  };
};
