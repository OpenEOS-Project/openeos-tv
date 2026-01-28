// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Device Types
export type DeviceClass =
  | 'DISPLAY_MENU'
  | 'DISPLAY_KITCHEN'
  | 'DISPLAY_DELIVERY'
  | 'DISPLAY_PICKUP'
  | 'DISPLAY_SALES';

export type DeviceStatus = 'pending' | 'verified' | 'blocked';

export interface Device {
  id: string;
  organizationId: string;
  name: string;
  deviceClass: DeviceClass;
  status: DeviceStatus;
  verificationCode?: string;
  token?: string;
  settings: DeviceSettings;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceSettings {
  soundEnabled?: boolean;
  autoRefreshInterval?: number;
  displayMode?: DisplayMode;
  [key: string]: unknown;
}

export interface DeviceRegistrationResponse {
  deviceId: string;
  deviceToken: string;
  verificationCode: string;
  organizationId: string;
  organizationName: string;
  deviceName: string;
  deviceClass: DeviceClass;
  status: DeviceStatus;
}

// Display Mode Types
export type DisplayMode = 'menu' | 'kitchen' | 'delivery' | 'pickup' | 'sales';

export interface DisplayModeConfig {
  id: DisplayMode;
  labelKey: string;
  descriptionKey: string;
  icon: string;
  deviceClass: DeviceClass;
  isInteractive: boolean;
}

export const DISPLAY_MODES: DisplayModeConfig[] = [
  {
    id: 'menu',
    labelKey: 'displayModes.menu.label',
    descriptionKey: 'displayModes.menu.description',
    icon: 'menu',
    deviceClass: 'DISPLAY_MENU',
    isInteractive: false,
  },
  {
    id: 'kitchen',
    labelKey: 'displayModes.kitchen.label',
    descriptionKey: 'displayModes.kitchen.description',
    icon: 'chef',
    deviceClass: 'DISPLAY_KITCHEN',
    isInteractive: true,
  },
  {
    id: 'delivery',
    labelKey: 'displayModes.delivery.label',
    descriptionKey: 'displayModes.delivery.description',
    icon: 'delivery',
    deviceClass: 'DISPLAY_DELIVERY',
    isInteractive: true,
  },
  {
    id: 'pickup',
    labelKey: 'displayModes.pickup.label',
    descriptionKey: 'displayModes.pickup.description',
    icon: 'pickup',
    deviceClass: 'DISPLAY_PICKUP',
    isInteractive: false,
  },
  {
    id: 'sales',
    labelKey: 'displayModes.sales.label',
    descriptionKey: 'displayModes.sales.description',
    icon: 'chart',
    deviceClass: 'DISPLAY_SALES',
    isInteractive: false,
  },
];

// Event Types
export interface Event {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  settings: EventSettings;
  createdAt: string;
  updatedAt: string;
}

export interface EventSettings {
  allowOnlineOrders?: boolean;
  allowQrOrders?: boolean;
  tableRequired?: boolean;
  [key: string]: unknown;
}

// Category Types
export interface Category {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  eventId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  taxRate: number;
  imageUrl?: string;
  options?: ProductOptions;
  isActive: boolean;
  isAvailable: boolean;
  trackInventory: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOptions {
  groups: ProductOptionGroup[];
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  minSelect?: number;
  maxSelect?: number;
  options: ProductOption[];
}

export interface ProductOption {
  id: string;
  name: string;
  priceModifier: number;
  isDefault?: boolean;
}

// Order Types
export type OrderStatus =
  | 'open'
  | 'in_progress'
  | 'ready'
  | 'completed'
  | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partly_paid' | 'paid' | 'refunded';
export type OrderSource = 'pos' | 'online' | 'qr_order';
export type OrderPriority = 'normal' | 'high' | 'rush';

export interface Order {
  id: string;
  organizationId: string;
  eventId: string;
  orderNumber: string;
  dailyNumber: number;
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  source: OrderSource;
  priority: OrderPriority;
  subtotal: number;
  taxTotal: number;
  total: number;
  paidAmount: number;
  tipAmount: number;
  discountAmount: number;
  notes?: string;
  kitchenNotes?: string;
  items: OrderItem[];
  estimatedReadyAt?: string;
  readyAt?: string;
  completedAt?: string;
  createdByUserId?: string;
  createdByDeviceId?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderItemStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  paidQuantity: number;
  unitPrice: number;
  optionsPrice: number;
  totalPrice: number;
  taxRate: number;
  status: OrderItemStatus;
  options?: SelectedOptions;
  notes?: string;
  kitchenNotes?: string;
  preparedAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SelectedOptions {
  selected: SelectedOption[];
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceModifier: number;
}

// Display-specific Order (grouped by category for kitchen/delivery)
export interface DisplayOrder extends Order {
  itemsByCategory: {
    categoryId: string;
    categoryName: string;
    items: OrderItem[];
  }[];
  waitTime: number; // seconds since creation
}

// Stats for Sales Display
export interface DailyStats {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  hourlyRevenue: {
    hour: number;
    revenue: number;
    orderCount: number;
  }[];
  paymentMethods: {
    method: string;
    count: number;
    total: number;
  }[];
  openOrders: number;
  pendingItems: number;
}

// Organization Info
export interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  currency: string;
  locale: string;
  timezone: string;
  taxIncluded: boolean;
  [key: string]: unknown;
}

// WebSocket Message Types
export interface BroadcastMessage {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  duration?: number;
}

// Navigation Types
export type RootStackParamList = {
  DeviceRegister: undefined;
  DeviceVerification: undefined;
  DisplayModeSelect: undefined;
  Menu: undefined;
  Kitchen: undefined;
  Delivery: undefined;
  Pickup: undefined;
  Sales: undefined;
  Settings: undefined;
};
