import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/constants';
import type {
  DisplayMode,
  Order,
  Category,
  Product,
  DailyStats,
  Event,
} from '@/types';

interface DisplayState {
  // Current display mode
  displayMode: DisplayMode | null;

  // Available events
  events: Event[];
  selectedEvent: Event | null;

  // Menu data (for menu display)
  categories: Category[];
  products: Product[];

  // Order data (for kitchen/delivery/pickup displays)
  orders: Order[];
  readyOrders: Order[];

  // Stats data (for sales display)
  dailyStats: DailyStats | null;

  // Connection status
  isConnected: boolean;
  lastSync: Date | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Sound settings
  soundEnabled: boolean;

  // Actions
  setDisplayMode: (mode: DisplayMode) => void;
  setEvents: (events: Event[]) => void;
  setSelectedEvent: (event: Event | null) => void;
  setCategories: (categories: Category[]) => void;
  setProducts: (products: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  removeOrder: (orderId: string) => void;
  setReadyOrders: (orders: Order[]) => void;
  addReadyOrder: (order: Order) => void;
  removeReadyOrder: (orderId: string) => void;
  setDailyStats: (stats: DailyStats) => void;
  setIsConnected: (connected: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  reset: () => void;
}

const initialState = {
  displayMode: null as DisplayMode | null,
  events: [] as Event[],
  selectedEvent: null as Event | null,
  categories: [] as Category[],
  products: [] as Product[],
  orders: [] as Order[],
  readyOrders: [] as Order[],
  dailyStats: null as DailyStats | null,
  isConnected: false,
  lastSync: null as Date | null,
  isLoading: false,
  error: null as string | null,
  soundEnabled: true,
};

export const useDisplayStore = create<DisplayState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Set display mode
      setDisplayMode: (mode: DisplayMode) => {
        set({ displayMode: mode, error: null });
      },

      // Set events
      setEvents: (events: Event[]) => {
        set({ events });
        // Auto-select first active event if none selected
        const { selectedEvent } = get();
        if (!selectedEvent && events.length > 0) {
          const activeEvent = events.find(e => e.isActive) || events[0];
          set({ selectedEvent: activeEvent });
        }
      },

      // Set selected event
      setSelectedEvent: (event: Event | null) => {
        set({ selectedEvent: event });
      },

      // Set categories
      setCategories: (categories: Category[]) => {
        set({ categories, lastSync: new Date() });
      },

      // Set products
      setProducts: (products: Product[]) => {
        set({ products, lastSync: new Date() });
      },

      // Set orders (kitchen display - pending/preparing)
      setOrders: (orders: Order[]) => {
        set({ orders, lastSync: new Date() });
      },

      // Add new order
      addOrder: (order: Order) => {
        set(state => ({
          orders: [order, ...state.orders],
          lastSync: new Date(),
        }));
      },

      // Update existing order
      updateOrder: (order: Order) => {
        set(state => ({
          orders: state.orders.map(o => (o.id === order.id ? order : o)),
          lastSync: new Date(),
        }));
      },

      // Remove order (when completed or cancelled)
      removeOrder: (orderId: string) => {
        set(state => ({
          orders: state.orders.filter(o => o.id !== orderId),
          lastSync: new Date(),
        }));
      },

      // Set ready orders (delivery/pickup display)
      setReadyOrders: (orders: Order[]) => {
        set({ readyOrders: orders, lastSync: new Date() });
      },

      // Add order to ready list
      addReadyOrder: (order: Order) => {
        set(state => ({
          readyOrders: [order, ...state.readyOrders],
          lastSync: new Date(),
        }));
      },

      // Remove order from ready list (when delivered)
      removeReadyOrder: (orderId: string) => {
        set(state => ({
          readyOrders: state.readyOrders.filter(o => o.id !== orderId),
          lastSync: new Date(),
        }));
      },

      // Set daily stats
      setDailyStats: (stats: DailyStats) => {
        set({ dailyStats: stats, lastSync: new Date() });
      },

      // Set connection status
      setIsConnected: (connected: boolean) => {
        set({ isConnected: connected });
      },

      // Set loading state
      setIsLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Toggle sound
      setSoundEnabled: (enabled: boolean) => {
        set({ soundEnabled: enabled });
      },

      // Reset all data (except settings)
      reset: () => {
        const { soundEnabled, displayMode } = get();
        set({
          ...initialState,
          soundEnabled,
          displayMode,
        });
      },
    }),
    {
      name: STORAGE_KEYS.DISPLAY_MODE,
      storage: createJSONStorage(() => zustandStorage),
      partialize: state => ({
        displayMode: state.displayMode,
        soundEnabled: state.soundEnabled,
      }),
    },
  ),
);

// Selectors
export const selectOrdersCount = (state: DisplayState) => state.orders.length;

export const selectReadyOrdersCount = (state: DisplayState) =>
  state.readyOrders.length;

export const selectPendingItemsCount = (state: DisplayState) =>
  state.orders.reduce(
    (total, order) =>
      total +
      order.items.filter(
        item => item.status === 'pending' || item.status === 'preparing',
      ).length,
    0,
  );

export const selectProductsByCategory = (state: DisplayState) => {
  const { categories, products } = state;
  return categories
    .filter(c => c.isActive)
    .map(category => ({
      category,
      products: products.filter(
        p => p.categoryId === category.id && p.isActive && p.isAvailable,
      ),
    }))
    .filter(group => group.products.length > 0);
};
