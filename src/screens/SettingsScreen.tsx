import React, { useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  useFocusable,
  FocusContext,
} from '@noriginmedia/norigin-spatial-navigation';
import { Header } from '@/components/common';
import { FocusableButton, FocusableCard, TVText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { changeLanguage, getCurrentLanguage } from '@/i18n';
import { useDeviceStore, useDisplayStore } from '@/stores';
import { TV_SIZES } from '@/constants';
import type { RootStackParamList, DisplayMode } from '@/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, themeMode, setThemeMode, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { deviceName, organizationName, clearDevice } = useDeviceStore();
  const { displayMode, soundEnabled, setSoundEnabled, isConnected, lastSync } =
    useDisplayStore();

  const { ref: containerRef, focusKey } = useFocusable({
    focusable: false,
    saveLastFocusedChild: true,
    trackChildren: true,
  });

  const currentLanguage = getCurrentLanguage();

  const handleChangeLanguage = useCallback(async () => {
    const newLanguage = currentLanguage === 'de' ? 'en' : 'de';
    await changeLanguage(newLanguage);
  }, [currentLanguage]);

  const handleChangeTheme = useCallback(async () => {
    const nextMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    await setThemeMode(nextMode);
  }, [themeMode, setThemeMode]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled, setSoundEnabled]);

  const handleChangeMode = useCallback(() => {
    navigation.navigate('DisplayModeSelect');
  }, [navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert(t('settings.logout'), t('settings.logoutConfirm'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('settings.logout'),
        style: 'destructive',
        onPress: () => {
          clearDevice();
          navigation.reset({
            index: 0,
            routes: [{ name: 'DeviceRegister' }],
          });
        },
      },
    ]);
  }, [t, clearDevice, navigation]);

  const getDisplayModeLabel = (mode: DisplayMode | null): string => {
    if (!mode) return '-';
    return t(`displayModes.${mode}.label`);
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <FocusContext.Provider value={focusKey}>
      <View
        ref={containerRef}
        style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title={t('settings.title')} showClock={false} />

        <View style={styles.content}>
          {/* Device Info */}
          <FocusableCard style={styles.section}>
            <TVText variant="label" color="muted">
              {t('settings.device')}
            </TVText>
            <View style={styles.row}>
              <TVText variant="body" color="secondary">
                {t('settings.deviceName')}:
              </TVText>
              <TVText variant="body" bold>
                {deviceName || '-'}
              </TVText>
            </View>
            <View style={styles.row}>
              <TVText variant="body" color="secondary">
                {t('settings.organization')}:
              </TVText>
              <TVText variant="body" bold>
                {organizationName || '-'}
              </TVText>
            </View>
            <View style={styles.row}>
              <TVText variant="body" color="secondary">
                {t('settings.displayMode')}:
              </TVText>
              <TVText variant="body" bold>
                {getDisplayModeLabel(displayMode)}
              </TVText>
            </View>
          </FocusableCard>

          {/* Settings Grid */}
          <View style={styles.grid}>
            {/* Display Mode */}
            <FocusableCard
              focusKey="change-mode"
              onPress={handleChangeMode}
              style={styles.settingCard}>
              <TVText variant="label" color="muted">
                {t('settings.displayMode')}
              </TVText>
              <TVText variant="bodyLarge" bold>
                {getDisplayModeLabel(displayMode)}
              </TVText>
              <TVText variant="caption" color="primary">
                {t('settings.changeMode')}
              </TVText>
            </FocusableCard>

            {/* Language */}
            <FocusableCard
              focusKey="language"
              onPress={handleChangeLanguage}
              style={styles.settingCard}>
              <TVText variant="label" color="muted">
                {t('settings.language')}
              </TVText>
              <TVText variant="bodyLarge" bold>
                {currentLanguage === 'de'
                  ? t('settings.german')
                  : t('settings.english')}
              </TVText>
            </FocusableCard>

            {/* Theme */}
            <FocusableCard
              focusKey="theme"
              onPress={handleChangeTheme}
              style={styles.settingCard}>
              <TVText variant="label" color="muted">
                {t('settings.theme')}
              </TVText>
              <TVText variant="bodyLarge" bold>
                {themeMode === 'light'
                  ? t('settings.lightMode')
                  : themeMode === 'dark'
                  ? t('settings.darkMode')
                  : 'System'}
              </TVText>
            </FocusableCard>

            {/* Sound */}
            <FocusableCard
              focusKey="sound"
              onPress={handleToggleSound}
              style={styles.settingCard}>
              <TVText variant="label" color="muted">
                {t('settings.sound')}
              </TVText>
              <TVText variant="bodyLarge" bold>
                {soundEnabled
                  ? t('settings.soundEnabled')
                  : t('settings.soundDisabled')}
              </TVText>
            </FocusableCard>
          </View>

          {/* Connection Status */}
          <FocusableCard style={styles.section}>
            <TVText variant="label" color="muted">
              {t('settings.connection')}
            </TVText>
            <View style={styles.row}>
              <TVText variant="body" color="secondary">
                {t('settings.serverStatus')}:
              </TVText>
              <TVText
                variant="body"
                bold
                color={isConnected ? 'success' : 'error'}>
                {isConnected ? t('common.connected') : t('common.disconnected')}
              </TVText>
            </View>
            <View style={styles.row}>
              <TVText variant="body" color="secondary">
                {t('settings.lastSync')}:
              </TVText>
              <TVText variant="body" bold>
                {formatLastSync(lastSync)}
              </TVText>
            </View>
          </FocusableCard>

          {/* Logout */}
          <View style={styles.footer}>
            <FocusableButton
              onPress={handleLogout}
              variant="outline"
              size="md"
              focusKey="logout">
              {t('settings.logout')}
            </FocusableButton>
            <TVText variant="caption" color="muted">
              {t('settings.version')}: 1.0.0
            </TVText>
          </View>
        </View>
      </View>
    </FocusContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: TV_SIZES.spacingXl,
    gap: TV_SIZES.spacingLg,
  },
  section: {
    gap: TV_SIZES.spacingSm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TV_SIZES.gridGap,
  },
  settingCard: {
    width: 280,
    gap: TV_SIZES.spacingXs,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: TV_SIZES.spacingMd,
  },
});
