import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';

import de from './locales/de.json';
import en from './locales/en.json';

// Get device language
const getDeviceLanguage = (): string => {
  const deviceLanguage =
    Platform.OS === 'android'
      ? NativeModules.I18nManager?.localeIdentifier
      : NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0];

  // Extract language code (e.g., "de_DE" -> "de")
  const languageCode = deviceLanguage?.split('_')[0] || 'de';

  // Return supported language or fallback to German
  return ['de', 'en'].includes(languageCode) ? languageCode : 'de';
};

// Language detector that uses AsyncStorage
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const storedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LOCALE);
      if (storedLanguage) {
        callback(storedLanguage);
        return;
      }
    } catch (error) {
      console.warn('[i18n] Failed to get stored language:', error);
    }
    callback(getDeviceLanguage());
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCALE, lng);
    } catch (error) {
      console.warn('[i18n] Failed to cache language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
    },
    fallbackLng: 'de',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export const changeLanguage = async (language: 'de' | 'en'): Promise<void> => {
  await i18n.changeLanguage(language);
};

export const getCurrentLanguage = (): string => {
  return i18n.language;
};

export default i18n;
