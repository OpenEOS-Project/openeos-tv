import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG } from '@/constants';
import type {
  ApiResponse,
  DeviceRegistrationResponse,
  OrganizationInfo,
  Event,
  Category,
  Product,
  Order,
  DailyStats,
  DeviceStatus,
  DeviceClass,
} from '@/types';

// In-memory token storage (persisted via Zustand stores)
let deviceToken: string | null = null;

// Error class for API errors
export class ApiException extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth headers
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (deviceToken) {
        config.headers['X-Device-Token'] = deviceToken;
      }
      return config;
    },
    error => Promise.reject(error),
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    response => response,
    (error: AxiosError<{ code?: string; message?: string }>) => {
      if (error.response) {
        const { data, status } = error.response;
        throw new ApiException(
          data?.message || 'An error occurred',
          data?.code || 'UNKNOWN_ERROR',
          status,
        );
      } else if (error.request) {
        throw new ApiException('No response from server', 'NETWORK_ERROR', 0);
      } else {
        throw new ApiException(
          error.message || 'Request failed',
          'REQUEST_ERROR',
          0,
        );
      }
    },
  );

  return instance;
};

export const apiClient = createApiClient();

// Device Token Management
export const setDeviceToken = (token: string): void => {
  deviceToken = token;
};

export const clearDeviceToken = (): void => {
  deviceToken = null;
};

export const getDeviceToken = (): string | null => {
  return deviceToken;
};

// ==================== DEVICE API ====================

export const deviceApi = {
  // Register a new display device
  register: async (
    name: string,
    organizationSlug: string,
    deviceClass: DeviceClass = 'DISPLAY_MENU',
  ): Promise<DeviceRegistrationResponse> => {
    const response = await apiClient.post<DeviceRegistrationResponse>(
      '/devices/register',
      {
        name,
        organizationSlug,
        deviceClass,
      },
    );
    return response.data;
  },

  // Check device status
  checkStatus: async (): Promise<{
    status: DeviceStatus;
    organizationId: string;
    organizationName: string;
  }> => {
    const response = await apiClient.get('/devices/status');
    return response.data;
  },

  // Heartbeat to keep device online
  heartbeat: async (): Promise<void> => {
    await apiClient.post('/devices/heartbeat');
  },

  // Update device class (display mode)
  updateDeviceClass: async (deviceClass: DeviceClass): Promise<void> => {
    await apiClient.patch('/devices/me', { deviceClass });
  },

  // Get organization info for device
  getOrganization: async (): Promise<OrganizationInfo> => {
    const response =
      await apiClient.get<OrganizationInfo>('/devices/organization');
    return response.data;
  },

  // Get active events
  getEvents: async (): Promise<Event[]> => {
    const response = await apiClient.get<ApiResponse<Event[]>>(
      '/devices/events',
    );
    return response.data.data;
  },

  // Get categories for event
  getCategories: async (eventId: string): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>(
      `/devices/events/${eventId}/categories`,
    );
    return response.data.data;
  },

  // Get products for event
  getProducts: async (eventId: string): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/devices/events/${eventId}/products`,
    );
    return response.data.data;
  },
};

// ==================== DISPLAY API ====================

export const displayApi = {
  // Get orders for kitchen display (pending/preparing items)
  getKitchenOrders: async (eventId?: string): Promise<Order[]> => {
    const params = eventId ? { eventId } : {};
    const response = await apiClient.get<ApiResponse<Order[]>>(
      '/devices/orders/kitchen',
      { params },
    );
    return response.data.data;
  },

  // Get orders for delivery display (ready items)
  getReadyOrders: async (eventId?: string): Promise<Order[]> => {
    const params = eventId ? { eventId } : {};
    const response = await apiClient.get<ApiResponse<Order[]>>(
      '/devices/orders/ready',
      { params },
    );
    return response.data.data;
  },

  // Mark order item as ready (kitchen → delivery)
  markItemReady: async (orderId: string, itemId: string): Promise<void> => {
    await apiClient.post(`/devices/orders/${orderId}/items/${itemId}/ready`);
  },

  // Mark order item as delivered
  markItemDelivered: async (orderId: string, itemId: string): Promise<void> => {
    await apiClient.post(`/devices/orders/${orderId}/items/${itemId}/deliver`);
  },

  // Get daily stats for sales display
  getDailyStats: async (eventId?: string): Promise<DailyStats> => {
    const params = eventId ? { eventId } : {};
    const response = await apiClient.get<DailyStats>('/devices/stats/today', {
      params,
    });
    return response.data;
  },
};

export default apiClient;
