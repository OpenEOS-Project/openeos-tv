import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/constants';
import { useDeviceStore, useDisplayStore } from '@/stores';
import type { Order, OrderItem, DailyStats, Product } from '@/types';

interface DisplaySocketEvents {
  // Kitchen display events
  onNewOrder?: (order: Order) => void;
  onOrderUpdated?: (order: Order) => void;
  onItemReady?: (orderId: string, itemId: string) => void;

  // Delivery display events
  onItemDelivered?: (orderId: string, itemId: string) => void;
  onOrderReady?: (order: Order) => void;

  // Sales display events
  onPaymentReceived?: (data: { orderId: string; amount: number }) => void;
  onStatsUpdated?: (stats: DailyStats) => void;

  // Menu display events
  onProductUpdated?: (product: Product) => void;
}

interface UseDisplaySocketReturn {
  isConnected: boolean;
  markItemReady: (orderId: string, itemId: string) => void;
  markItemDelivered: (orderId: string, itemId: string) => void;
}

export const useDisplaySocket = (
  events?: DisplaySocketEvents,
): UseDisplaySocketReturn => {
  const socketRef = useRef<Socket | null>(null);

  const { deviceToken, status, organizationId, selectedEventId, deviceClass } =
    useDeviceStore();
  const {
    displayMode,
    addOrder,
    updateOrder,
    removeOrder,
    addReadyOrder,
    removeReadyOrder,
    setDailyStats,
    setProducts,
    products,
    isConnected,
    setIsConnected,
  } = useDisplayStore();

  // Mark item as ready (kitchen → delivery)
  const markItemReady = useCallback(
    (orderId: string, itemId: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('display:item:ready', { orderId, itemId });
      }
    },
    [],
  );

  // Mark item as delivered
  const markItemDelivered = useCallback(
    (orderId: string, itemId: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('display:item:deliver', { orderId, itemId });
      }
    },
    [],
  );

  useEffect(() => {
    // Only connect if device is verified and has token
    if (!deviceToken || status !== 'verified' || !displayMode) {
      return;
    }

    // Create socket connection to display namespace
    const socket = io(`${API_CONFIG.SOCKET_URL}/display`, {
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
      console.log('[DisplaySocket] Connected');
      setIsConnected(true);

      // Join display room
      socket.emit('display:join', {
        organizationId,
        eventId: selectedEventId,
        type: displayMode,
      });
    });

    socket.on('disconnect', reason => {
      console.log('[DisplaySocket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', error => {
      console.log('[DisplaySocket] Connection error:', error.message);
      setIsConnected(false);
    });

    // Display events
    socket.on('display:order:new', (order: Order) => {
      console.log('[DisplaySocket] New order:', order.orderNumber);
      addOrder(order);
      events?.onNewOrder?.(order);
    });

    socket.on('display:order:updated', (order: Order) => {
      console.log('[DisplaySocket] Order updated:', order.orderNumber);
      updateOrder(order);
      events?.onOrderUpdated?.(order);
    });

    socket.on('display:order:cancelled', (data: { orderId: string }) => {
      console.log('[DisplaySocket] Order cancelled:', data.orderId);
      removeOrder(data.orderId);
    });

    socket.on(
      'display:item:ready',
      (data: { orderId: string; itemId: string; order?: Order }) => {
        console.log('[DisplaySocket] Item ready:', data.itemId);
        events?.onItemReady?.(data.orderId, data.itemId);
        // If full order is provided, update it
        if (data.order) {
          updateOrder(data.order);
        }
      },
    );

    socket.on(
      'display:item:delivered',
      (data: { orderId: string; itemId: string; order?: Order }) => {
        console.log('[DisplaySocket] Item delivered:', data.itemId);
        events?.onItemDelivered?.(data.orderId, data.itemId);
        if (data.order) {
          // Remove from ready orders if all delivered
          const allDelivered = data.order.items.every(
            item => item.status === 'delivered' || item.status === 'cancelled',
          );
          if (allDelivered) {
            removeReadyOrder(data.orderId);
          }
        }
      },
    );

    socket.on('display:order:ready', (order: Order) => {
      console.log('[DisplaySocket] Order ready:', order.orderNumber);
      addReadyOrder(order);
      removeOrder(order.id);
      events?.onOrderReady?.(order);
    });

    socket.on(
      'payment:received',
      (data: { orderId: string; amount: number }) => {
        console.log('[DisplaySocket] Payment received:', data.amount);
        events?.onPaymentReceived?.(data);
      },
    );

    socket.on('display:stats:updated', (stats: DailyStats) => {
      console.log('[DisplaySocket] Stats updated');
      setDailyStats(stats);
      events?.onStatsUpdated?.(stats);
    });

    socket.on('product:updated', (product: Product) => {
      console.log('[DisplaySocket] Product updated:', product.name);
      // Update product in list
      setProducts(products.map(p => (p.id === product.id ? product : p)));
      events?.onProductUpdated?.(product);
    });

    socket.on('display:refresh', () => {
      console.log('[DisplaySocket] Refresh requested');
      // This will trigger a full data reload
      // The screens should listen for this and refetch data
    });

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    deviceToken,
    status,
    organizationId,
    selectedEventId,
    displayMode,
    deviceClass,
    events,
    addOrder,
    updateOrder,
    removeOrder,
    addReadyOrder,
    removeReadyOrder,
    setDailyStats,
    setProducts,
    products,
    setIsConnected,
  ]);

  return {
    isConnected,
    markItemReady,
    markItemDelivered,
  };
};
