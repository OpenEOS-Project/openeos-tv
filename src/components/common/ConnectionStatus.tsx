import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TVText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useDisplayStore } from '@/stores';
import { TV_SIZES } from '@/constants';

export const ConnectionStatus: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isConnected = useDisplayStore(state => state.isConnected);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: isConnected ? colors.success : colors.error,
          },
        ]}
      />
      <TVText variant="caption" color={isConnected ? 'success' : 'error'}>
        {isConnected ? t('common.connected') : t('common.disconnected')}
      </TVText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TV_SIZES.spacingXs,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
