import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, COLORS } from '@/constants';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  focus: string;
  focusBorder: string;
}

interface UseThemeReturn {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

export const useTheme = (): UseThemeReturn => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.warn('[Theme] Failed to load theme:', error);
      }
      setIsLoaded(true);
    };
    loadTheme();
  }, []);

  // Determine actual theme based on mode and system preference
  const theme: 'light' | 'dark' =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : themeMode;

  // Get colors for current theme
  const colors = COLORS[theme];

  // Save theme preference
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, mode);
    } catch (error) {
      console.warn('[Theme] Failed to save theme:', error);
    }
  }, []);

  return {
    theme,
    themeMode,
    colors,
    setThemeMode,
    isDark: theme === 'dark',
  };
};
