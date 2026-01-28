// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://192.168.1.100:3001/api' // Use your dev machine IP for TV testing
    : 'https://api.openeos.de/api',
  SOCKET_URL: __DEV__
    ? 'http://192.168.1.100:3001'
    : 'https://api.openeos.de',
  TIMEOUT: 30000,
};

// Storage Keys
export const STORAGE_KEYS = {
  DEVICE_TOKEN: 'openeos-tv-device-token',
  DEVICE_DATA: 'openeos-tv-device-data',
  DISPLAY_MODE: 'openeos-tv-display-mode',
  THEME: 'openeos-tv-theme',
  LOCALE: 'openeos-tv-locale',
  SELECTED_EVENT: 'openeos-tv-selected-event',
} as const;

// Theme Colors (aligned with openeos-web Untitled UI)
export const COLORS = {
  light: {
    primary: '#7F56D9', // brand-600
    primaryLight: '#9E77ED', // brand-500
    primaryDark: '#6941C6', // brand-700
    secondary: '#717680', // gray-500
    background: '#FFFFFF', // white
    surface: '#FAFAFA', // gray-50
    surfaceVariant: '#F5F5F5', // gray-100
    text: '#181D27', // gray-900
    textSecondary: '#414651', // gray-700
    textMuted: '#535862', // gray-600
    border: '#D5D7DA', // gray-300
    borderLight: '#E9EAEB', // gray-200
    success: '#17B26A', // success-500
    successLight: '#DCFAE6', // success-100
    warning: '#F79009', // warning-500
    warningLight: '#FEF0C7', // warning-100
    error: '#F04438', // error-500
    errorLight: '#FEE4E2', // error-100
    info: '#2E90FA', // blue-500
    infoLight: '#D1E9FF', // blue-100
    // TV-specific focus colors
    focus: '#7F56D9',
    focusBorder: '#9E77ED',
  },
  dark: {
    primary: '#9E77ED', // brand-500
    primaryLight: '#B692F6', // brand-400
    primaryDark: '#7F56D9', // brand-600
    secondary: '#85888E', // gray-500
    background: '#0C0E12', // gray-950
    surface: '#13161B', // gray-900
    surfaceVariant: '#22262F', // gray-800
    text: '#F0F0F1', // gray-100
    textSecondary: '#CECFD2', // gray-300
    textMuted: '#61656C', // gray-600
    border: '#373A41', // gray-700
    borderLight: '#22262F', // gray-800
    success: '#17B26A', // success-500
    successLight: '#053321', // success-950
    warning: '#F79009', // warning-500
    warningLight: '#4E1D09', // warning-950
    error: '#F04438', // error-500
    errorLight: '#55160C', // error-950
    info: '#2E90FA', // blue-500
    infoLight: '#102A56', // blue-950
    // TV-specific focus colors
    focus: '#9E77ED',
    focusBorder: '#B692F6',
  },
} as const;

// TV-specific sizes (optimized for 10-foot UI)
export const TV_SIZES = {
  // Font sizes
  fontXs: 16,
  fontSm: 20,
  fontMd: 24,
  fontLg: 32,
  fontXl: 48,
  font2xl: 64,
  font3xl: 96,

  // Spacing
  spacingXs: 8,
  spacingSm: 16,
  spacingMd: 24,
  spacingLg: 32,
  spacingXl: 48,
  spacing2xl: 64,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,

  // Card sizes
  cardMinWidth: 280,
  cardMinHeight: 160,

  // Focus outline
  focusBorderWidth: 4,

  // Grid
  gridGap: 24,
  gridColumns: 4,
} as const;

// Polling & Refresh Intervals (ms)
export const DEVICE_POLLING_INTERVAL = 3000;
export const HEARTBEAT_INTERVAL = 60000;
export const DISPLAY_REFRESH_INTERVAL = 5000;
export const STATS_REFRESH_INTERVAL = 30000;

// Order Status Labels
export const ORDER_STATUS_LABELS: Record<string, { de: string; en: string }> = {
  open: { de: 'Offen', en: 'Open' },
  in_progress: { de: 'In Bearbeitung', en: 'In Progress' },
  ready: { de: 'Fertig', en: 'Ready' },
  completed: { de: 'Abgeschlossen', en: 'Completed' },
  cancelled: { de: 'Storniert', en: 'Cancelled' },
};

// Order Item Status Labels
export const ORDER_ITEM_STATUS_LABELS: Record<
  string,
  { de: string; en: string }
> = {
  pending: { de: 'Ausstehend', en: 'Pending' },
  preparing: { de: 'Wird zubereitet', en: 'Preparing' },
  ready: { de: 'Fertig', en: 'Ready' },
  delivered: { de: 'Ausgegeben', en: 'Delivered' },
  cancelled: { de: 'Storniert', en: 'Cancelled' },
};

// Priority Colors
export const PRIORITY_COLORS = {
  normal: {
    light: '#17B26A', // success
    dark: '#17B26A',
  },
  high: {
    light: '#F79009', // warning
    dark: '#F79009',
  },
  rush: {
    light: '#F04438', // error
    dark: '#F04438',
  },
} as const;

// D-Pad Key Codes
export const TV_KEY_CODES = {
  UP: 19,
  DOWN: 20,
  LEFT: 21,
  RIGHT: 22,
  SELECT: 23,
  BACK: 4,
  MENU: 82,
  PLAY_PAUSE: 85,
} as const;
