import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import { FocusableButton, TVText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useDeviceStore } from '@/stores';
import { TV_SIZES } from '@/constants';
import type { RootStackParamList } from '@/types';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DeviceRegister'
>;

export const DeviceRegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { register, isRegistering, error } = useDeviceStore();

  const [deviceName, setDeviceName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');

  const { ref: containerRef, focusKey } = useFocusable({
    focusable: false,
    saveLastFocusedChild: true,
    trackChildren: true,
  });

  const handleRegister = useCallback(async () => {
    if (!deviceName.trim() || !organizationSlug.trim()) {
      return;
    }

    const success = await register(deviceName.trim(), organizationSlug.trim());
    if (success) {
      navigation.navigate('DeviceVerification');
    }
  }, [deviceName, organizationSlug, register, navigation]);

  const { ref: nameInputRef, focused: nameInputFocused } = useFocusable({
    focusKey: 'device-name-input',
  });

  const { ref: slugInputRef, focused: slugInputFocused } = useFocusable({
    focusKey: 'organization-slug-input',
  });

  return (
    <FocusContext.Provider value={focusKey}>
      <View
        ref={containerRef}
        style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TVText variant="h2" center>
              {t('registration.title')}
            </TVText>
            <TVText variant="body" color="secondary" center>
              {t('registration.subtitle')}
            </TVText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <TVText variant="label" color="secondary">
                {t('registration.deviceName')}
              </TVText>
              <TextInput
                ref={nameInputRef}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: nameInputFocused
                      ? colors.focusBorder
                      : colors.border,
                    borderWidth: nameInputFocused
                      ? TV_SIZES.focusBorderWidth
                      : 2,
                    color: colors.text,
                  },
                ]}
                value={deviceName}
                onChangeText={setDeviceName}
                placeholder={t('registration.deviceNamePlaceholder')}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <TVText variant="label" color="secondary">
                {t('registration.organizationSlug')}
              </TVText>
              <TextInput
                ref={slugInputRef}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: slugInputFocused
                      ? colors.focusBorder
                      : colors.border,
                    borderWidth: slugInputFocused
                      ? TV_SIZES.focusBorderWidth
                      : 2,
                    color: colors.text,
                  },
                ]}
                value={organizationSlug}
                onChangeText={setOrganizationSlug}
                placeholder={t('registration.organizationSlugPlaceholder')}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {error && (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: colors.errorLight },
                ]}>
                <TVText variant="body" color="error">
                  {error}
                </TVText>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <FocusableButton
                onPress={handleRegister}
                disabled={
                  isRegistering ||
                  !deviceName.trim() ||
                  !organizationSlug.trim()
                }
                focusKey="register-button"
                size="lg">
                {isRegistering ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  t('registration.register')
                )}
              </FocusableButton>
            </View>
          </View>

          <View style={styles.footer}>
            <TVText variant="caption" color="muted" center>
              {t('navigation.pressSelectToChoose')}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 600,
    padding: TV_SIZES.spacingXl,
  },
  header: {
    marginBottom: TV_SIZES.spacing2xl,
    gap: TV_SIZES.spacingSm,
  },
  form: {
    gap: TV_SIZES.spacingLg,
  },
  inputGroup: {
    gap: TV_SIZES.spacingXs,
  },
  input: {
    fontSize: TV_SIZES.fontMd,
    padding: TV_SIZES.spacingMd,
    borderRadius: TV_SIZES.radiusMd,
  },
  errorContainer: {
    padding: TV_SIZES.spacingMd,
    borderRadius: TV_SIZES.radiusMd,
  },
  buttonContainer: {
    marginTop: TV_SIZES.spacingMd,
  },
  footer: {
    marginTop: TV_SIZES.spacing2xl,
  },
});
