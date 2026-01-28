import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import {
  deviceApi,
  setDeviceToken,
  clearDeviceToken,
} from '@/lib/api-client';
import { STORAGE_KEYS, DEVICE_POLLING_INTERVAL } from '@/constants';
import type { DeviceClass, DeviceStatus, DisplayMode } from '@/types';

interface DeviceState {
  // Device info
  deviceId: string | null;
  deviceToken: string | null;
  verificationCode: string | null;
  organizationId: string | null;
  organizationName: string | null;
  deviceName: string | null;
  deviceClass: DeviceClass | null;
  status: DeviceStatus;

  // Selected event
  selectedEventId: string | null;

  // Polling state
  isPolling: boolean;
  pollingInterval: ReturnType<typeof setInterval> | null;

  // Loading states
  isRegistering: boolean;
  isCheckingStatus: boolean;
  error: string | null;

  // Actions
  register: (
    name: string,
    organizationSlug: string,
    deviceClass?: DeviceClass,
  ) => Promise<boolean>;
  checkStatus: () => Promise<DeviceStatus>;
  startPolling: () => void;
  stopPolling: () => void;
  updateDeviceClass: (deviceClass: DeviceClass) => Promise<boolean>;
  setSelectedEventId: (eventId: string | null) => void;
  logout: () => void;
  clearDevice: () => void;
  restoreToken: () => void;
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      // Initial state
      deviceId: null,
      deviceToken: null,
      verificationCode: null,
      organizationId: null,
      organizationName: null,
      deviceName: null,
      deviceClass: null,
      status: 'pending',
      selectedEventId: null,
      isPolling: false,
      pollingInterval: null,
      isRegistering: false,
      isCheckingStatus: false,
      error: null,

      // Register device
      register: async (
        name: string,
        organizationSlug: string,
        deviceClass: DeviceClass = 'DISPLAY_MENU',
      ): Promise<boolean> => {
        set({ isRegistering: true, error: null });
        try {
          const response = await deviceApi.register(
            name,
            organizationSlug,
            deviceClass,
          );

          // Store token
          setDeviceToken(response.deviceToken);

          set({
            deviceId: response.deviceId,
            deviceToken: response.deviceToken,
            verificationCode: response.verificationCode,
            organizationId: response.organizationId,
            organizationName: response.organizationName,
            deviceName: response.deviceName,
            deviceClass: response.deviceClass,
            status: response.status,
            isRegistering: false,
          });

          // Start polling for verification
          get().startPolling();

          return true;
        } catch (error: any) {
          set({
            isRegistering: false,
            error: error.message || 'Registration failed',
          });
          return false;
        }
      },

      // Check device status
      checkStatus: async (): Promise<DeviceStatus> => {
        const { deviceToken } = get();
        if (!deviceToken) {
          return 'pending';
        }

        set({ isCheckingStatus: true });
        try {
          const response = await deviceApi.checkStatus();
          set({
            status: response.status,
            organizationId: response.organizationId,
            organizationName: response.organizationName,
            isCheckingStatus: false,
          });

          // Stop polling if verified
          if (response.status === 'verified') {
            get().stopPolling();
          }

          return response.status;
        } catch (error: any) {
          set({ isCheckingStatus: false });
          // If 401, clear device
          if (error.statusCode === 401) {
            get().clearDevice();
          }
          return 'pending';
        }
      },

      // Start polling for verification
      startPolling: () => {
        const { isPolling, pollingInterval } = get();
        if (isPolling || pollingInterval) return;

        const interval = setInterval(async () => {
          const status = await get().checkStatus();
          if (status === 'verified' || status === 'blocked') {
            get().stopPolling();
          }
        }, DEVICE_POLLING_INTERVAL);

        set({ isPolling: true, pollingInterval: interval });
      },

      // Stop polling
      stopPolling: () => {
        const { pollingInterval } = get();
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        set({ isPolling: false, pollingInterval: null });
      },

      // Update device class (display mode)
      updateDeviceClass: async (
        deviceClass: DeviceClass,
      ): Promise<boolean> => {
        try {
          await deviceApi.updateDeviceClass(deviceClass);
          set({ deviceClass });
          return true;
        } catch (error: any) {
          set({ error: error.message || 'Failed to update device class' });
          return false;
        }
      },

      // Set selected event
      setSelectedEventId: (eventId: string | null) => {
        set({ selectedEventId: eventId });
      },

      // Logout (clear session but keep device)
      logout: () => {
        get().stopPolling();
        set({ selectedEventId: null });
      },

      // Clear device completely
      clearDevice: () => {
        get().stopPolling();
        clearDeviceToken();
        set({
          deviceId: null,
          deviceToken: null,
          verificationCode: null,
          organizationId: null,
          organizationName: null,
          deviceName: null,
          deviceClass: null,
          status: 'pending',
          selectedEventId: null,
          error: null,
        });
      },

      // Restore token after rehydration
      restoreToken: () => {
        const { deviceToken } = get();
        if (deviceToken) {
          setDeviceToken(deviceToken);
        }
      },
    }),
    {
      name: STORAGE_KEYS.DEVICE_DATA,
      storage: createJSONStorage(() => zustandStorage),
      partialize: state => ({
        deviceId: state.deviceId,
        deviceToken: state.deviceToken,
        organizationId: state.organizationId,
        organizationName: state.organizationName,
        deviceName: state.deviceName,
        deviceClass: state.deviceClass,
        status: state.status,
        selectedEventId: state.selectedEventId,
      }),
      onRehydrateStorage: () => state => {
        // Restore token to API client after rehydration
        if (state?.deviceToken) {
          setDeviceToken(state.deviceToken);
        }
      },
    },
  ),
);
