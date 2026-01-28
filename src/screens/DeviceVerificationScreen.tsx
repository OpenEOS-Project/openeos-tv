import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { QRCodeDisplay } from '@/components/registration';
import { TVText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useDeviceStore } from '@/stores';
import { TV_SIZES, API_CONFIG } from '@/constants';
import type { RootStackParamList } from '@/types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DeviceVerification'
>;

export const DeviceVerificationScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const {
    verificationCode,
    organizationName,
    deviceName,
    status,
    startPolling,
    stopPolling,
  } = useDeviceStore();

  // Start polling on mount
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  // Navigate when verified
  useEffect(() => {
    if (status === 'verified') {
      navigation.replace('DisplayModeSelect');
    }
  }, [status, navigation]);

  // Generate QR code URL
  const qrCodeUrl = `${API_CONFIG.BASE_URL.replace('/api', '')}/verify/${verificationCode}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TVText variant="h2" center>
            {t('registration.waitingForVerification')}
          </TVText>
          <TVText variant="body" color="secondary" center>
            {t('registration.verificationHint')}
          </TVText>
        </View>

        {verificationCode && (
          <QRCodeDisplay url={qrCodeUrl} verificationCode={verificationCode} />
        )}

        <View style={styles.info}>
          <View style={styles.infoRow}>
            <TVText variant="label" color="muted">
              {t('settings.device')}:
            </TVText>
            <TVText variant="body">{deviceName}</TVText>
          </View>
          {organizationName && (
            <View style={styles.infoRow}>
              <TVText variant="label" color="muted">
                {t('settings.organization')}:
              </TVText>
              <TVText variant="body">{organizationName}</TVText>
            </View>
          )}
        </View>

        <View style={styles.statusContainer}>
          {status === 'pending' && (
            <View style={styles.statusRow}>
              <ActivityIndicator color={colors.primary} size="large" />
              <TVText variant="body" color="muted">
                {t('registration.waitingForVerification')}
              </TVText>
            </View>
          )}
          {status === 'blocked' && (
            <View
              style={[
                styles.statusBox,
                { backgroundColor: colors.errorLight },
              ]}>
              <TVText variant="body" color="error" center>
                {t('registration.blocked')}
              </TVText>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: TV_SIZES.spacingXl,
    gap: TV_SIZES.spacingXl,
  },
  header: {
    gap: TV_SIZES.spacingSm,
    maxWidth: 600,
  },
  info: {
    gap: TV_SIZES.spacingSm,
  },
  infoRow: {
    flexDirection: 'row',
    gap: TV_SIZES.spacingSm,
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TV_SIZES.spacingMd,
  },
  statusBox: {
    padding: TV_SIZES.spacingMd,
    borderRadius: TV_SIZES.radiusMd,
    minWidth: 300,
  },
});
