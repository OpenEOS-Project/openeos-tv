import { useEffect, useRef } from 'react';
import { deviceApi } from '@/lib/api-client';
import { useDeviceStore } from '@/stores';
import { HEARTBEAT_INTERVAL } from '@/constants';

export const useHeartbeat = (): void => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { status, deviceToken } = useDeviceStore();

  useEffect(() => {
    // Only send heartbeats if device is verified
    if (status !== 'verified' || !deviceToken) {
      return;
    }

    // Send initial heartbeat
    const sendHeartbeat = async () => {
      try {
        await deviceApi.heartbeat();
        console.log('[Heartbeat] Sent');
      } catch (error) {
        console.warn('[Heartbeat] Failed:', error);
      }
    };

    sendHeartbeat();

    // Set up interval
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, deviceToken]);
};
